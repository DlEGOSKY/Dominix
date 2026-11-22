import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],label=process.argv[5]??'before',checks=[],errors=[],shopStages=new Map();
const fixture=process.argv[6]??'profile',bossScenario=fixture==='boss',mapScenario=fixture==='map';
const saved=await readFile(`${output}/${fixture}-checkpoint.json`,'utf8');
const read=page=>page.evaluate(()=>{
 if(!window.dispatchEvent(new Event('dominix-save-before-reload',{cancelable:true})))throw Error('Checkpoint rejected');
 const data=JSON.parse(JSON.parse(localStorage.getItem('dominix_active_run_v1')).body);
 delete data.savedAt;for(const entry of data.states.roundPatternLog)delete entry.id;
 return data;
});
try {
 const pages=[];
 for(const port of [5176,5180]) {
  const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:'reduce'});
  await context.addInitScript(saved=>{
   if(sessionStorage.getItem('replay-init'))return;
   localStorage.setItem('dominix_lang','es');localStorage.setItem('dominix_tutorial_done','1');
   localStorage.setItem('dominix_settings_v1',JSON.stringify({muted:true,reduceMotion:true,fastAnimations:true}));
   localStorage.setItem('dominix_active_run_v1',saved);sessionStorage.setItem('replay-init','1');
  },saved);
  const page=await context.newPage();page.on('pageerror',e=>errors.push({port,message:String(e)}));
  await page.goto(`http://127.0.0.1:${port}/`,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:/^Continuar partida/}).click();
  if(fixture==='profile')await page.locator('.hand-panel').waitFor();else await page.waitForTimeout(400);
  pages.push(page);
 }
 for(let step=0;step<130;step++) {
  const [a,b]=await Promise.all(pages.map(read));
  await writeFile(`${output}/replay-${label}-last.json`,JSON.stringify({step,production:a,strict:b},null,2));
  assert.deepEqual(b,a,`Production/StrictMode diverged at step ${step}`);
  checks.push({step,round:a.states.game.round,result:a.states.game.result,rng:a.rng});
  if(bossScenario&&a.states.game.result==='boss_reward') {
   assert.equal(a.states.game.stats.bossesDefeated,1);assert.equal(a.states.game.stats.roundsCompleted,1);
   assert.equal(a.states.game.stats.roundScores[0],a.states.game.score+a.states.game.phaseScore);
   for(const page of pages){await page.reload({waitUntil:'networkidle'});await page.getByRole('button',{name:/^Continuar partida/}).click();await page.waitForTimeout(200);assert.deepEqual(await read(page),a);}
   break;
  }
  if(!bossScenario&&a.states.game.round>= (mapScenario?6:13))break;
  const state=a.states;
  let action;
  switch(state.game.result) {
   case 'playing':
    if(state.game.chain.placed.length)action=page=>page.getByRole('button',{name:'Cerrar cadena',exact:true}).click();
    else action=page=>page.locator('.hand-panel button[data-tile-id]:enabled').first().click();
    break;
   case 'win':action=page=>page.getByRole('button',{name:/^(Elegir recompensa|Continuar fase)/}).click();break;
   case 'reward':action=state.rewardOptions.some(o=>o.reward.type==='relic')
    ? page=>page.locator('button[data-reward-type="relic"]').first().click()
    : page=>page.getByRole('button',{name:'Saltar recompensa',exact:true}).click();break;
   case 'event': action=state.currentEvent.effect.type==='choice'
    ? page=>page.getByRole('button',{name:new RegExp('^'+state.currentEvent.effect.options[0].label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).click()
    : page=>page.getByRole('button',{name:'Continuar',exact:true}).click();break;
   case 'shop': {
    const stage=shopStages.get(state.game.round)??0;shopStages.set(state.game.round,stage+1);
    if(stage===0)action=async page=>{const reroll=page.getByRole('button',{name:/^Reroll/});if(await reroll.isEnabled())await reroll.click();};
    else if(stage===1&&state.shopItems.some(item=>item.cost<=state.gold))action=page=>page.locator('.shop-card:enabled').first().click();
    else action=page=>page.getByRole('button',{name:/^(Continuar sin comprar|Continuar)$/}).click();
    break;
   }
   case 'boss_intro': action=page=>page.getByRole('button',{name:/^(Enfrentar|Comenzar|Luchar)/}).click();break;
   case 'boss_reward':action=page=>page.getByRole('button',{name:/Continuar/}).first().click();break;
   case 'map_select':action=page=>page.getByRole('button',{name:/disponible$/}).first().click();break;
   case 'sanctuary':action=page=>page.getByRole('button').first().click();break;
   default:throw Error(`Unhandled replay state ${state.game.result}`);
  }
  for(const page of pages) {
   if(state.game.round>=5)await page.screenshot({path:`${output}/replay-debug-${new URL(page.url()).port}.png`,fullPage:true});
   try{await action(page);}catch(error){
    await writeFile(`${output}/replay-failed-dom.json`,JSON.stringify(await page.evaluate(()=>({text:document.body.innerText,tiles:[...document.querySelectorAll('.hand-panel [data-tile-id]')].map(e=>({tag:e.tagName,id:e.dataset.tileId,disabled:e.disabled,html:e.outerHTML.slice(0,220)}))})),null,2));
    throw error;
   }
  }
  await Promise.all(pages.map(page=>page.waitForTimeout(350)));
  if(bossScenario||mapScenario||step%4===3) {
   // Reopen each mode at the same state; compare against the pre-reload state.
   for(const page of pages){const before=await read(page);await page.reload({waitUntil:'networkidle'});await page.getByRole('button',{name:/^Continuar partida/}).click();await page.waitForTimeout(200);assert.deepEqual(await read(page),before,'Reload changed state or RNG');}
  }
 }
 if(bossScenario)assert.equal(checks.at(-1).result,'boss_reward');else assert.equal(checks.at(-1).round,mapScenario?6:13);
 assert.deepEqual(errors,[]);
 console.log({checks:checks.length,errors});
}finally {await browser.close();await writeFile(`${output}/replay-${label}.json`,JSON.stringify({checks,errors},null,2));}

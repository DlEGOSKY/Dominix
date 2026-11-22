import {openHomeMode,waitForHome} from "./homeNavigation.mjs";
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],errors=[],checks=[];
const saved=page=>page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('dominix_active_run_v1')).body));
try{
  const context=await browser.newContext({viewport:{width:1280,height:1200},reducedMotion:'no-preference'});
  await context.addInitScript(()=>{if(!sessionStorage.getItem('placement-initialized')){localStorage.setItem('dominix_lang','es');localStorage.setItem('dominix_active_skin','among_us');localStorage.setItem('dominix_tutorial_done','1');localStorage.setItem('dominix_settings_v1',JSON.stringify({muted:true,reduceMotion:false}));sessionStorage.setItem('placement-initialized','1');}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('http://127.0.0.1:5176/',{waitUntil:'networkidle'});await openHomeMode(page,'Endless');await page.locator('.hand-panel').waitFor();const intro=page.getByText(/toca para continuar/i);if(await intro.count())await intro.click();await page.waitForTimeout(750);
  const before=await saved(page);await page.keyboard.press('1');
  const flight=await page.locator('[data-tile-flight]').evaluate(el=>{const animation=el.getAnimations().find(a=>a.id==='dominix-placement');animation.pause();animation.currentTime=animation.effect.getTiming().duration*.45;return {id:el.dataset.tileFlight,skin:el.dataset.skin,duration:animation.effect.getTiming().duration,parentIsBody:el.parentElement===document.body};});
  assert.equal(await page.locator('.chain-flow [data-chain-position]').count(),1);
  await page.waitForFunction(()=>{const raw=localStorage.getItem('dominix_active_run_v1');return raw&&JSON.parse(JSON.parse(raw).body).states.game.chain.placed.length===1;});
  const played=await saved(page);assert.equal(played.states.game.chain.placed.length,1);assert.equal(played.states.game.hand.length,before.states.game.hand.length-1);assert.equal(played.states.game.stats.tilesPlayed,before.states.game.stats.tilesPlayed+1);assert.equal(played.states.game.chain.placed[0].tile.id,flight.id);assert.equal(flight.skin,'among_us');assert(flight.parentIsBody);assert.equal(flight.duration,380);
  await page.screenshot({path:`${output}/colocacion-partida-real-trayecto.jpg`,type:'jpeg',quality:92,fullPage:true});
  await page.locator('[data-tile-flight]').evaluate(el=>el.getAnimations().find(a=>a.id==='dominix-placement').finish());await page.waitForFunction(()=>!document.querySelector('[data-tile-flight]'));await page.waitForTimeout(500);await page.screenshot({path:`${output}/among-us-placa-partida-real.jpg`,type:'jpeg',quality:92,fullPage:true});checks.push({case:'production-keyboard-play',flight,score:played.states.game.score,stateCommittedDuringFlight:true});
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});await context.setOffline(true);
  await page.getByRole('button',{name:'Guardar y salir',exact:true}).click();await page.reload({waitUntil:'networkidle'});await page.getByRole('button',{name:/^Continuar partida/}).click();await page.locator('.hand-panel').waitFor();await page.waitForTimeout(450);
  const resumed=await saved(page);assert.deepEqual(resumed.states.game,played.states.game);assert.deepEqual(resumed.rng,played.rng);assert.equal(resumed.states.activeSkin,'among_us');assert.equal(await page.locator('[data-tile-flight]').count(),0);checks.push({case:'offline-resume',gameAndRngPreserved:true,noReplayOfFlight:true});
  assert.deepEqual(errors,[]);await writeFile(`${output}/colocacion-partida-verificacion.json`,JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));await context.close();
}finally{await browser.close();}

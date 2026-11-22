import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],checks=[],errors=[];
try{
 const context=await browser.newContext({viewport:{width:1000,height:1000},reducedMotion:'no-preference'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 for(const skin of ['ivory','emerald','diamond','obsidian','ruby','imperium','midnight_express'])for(const count of [7,15,30]){
  await page.goto(`http://127.0.0.1:5178/qa/tileFlight.html?skin=${skin}&prepared=${count-2}`,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Cadena larga QA',exact:true}).click();await page.waitForTimeout(400);
  await page.evaluate(()=>{window.materialProfile={longTasks:[],maxEffects:0,maxClones:0};window.materialObserver=new PerformanceObserver(list=>window.materialProfile.longTasks.push(...list.getEntries().map(e=>e.duration)));window.materialObserver.observe({type:'longtask',buffered:false});const native=Element.prototype.animate;Element.prototype.animate=function(...args){const animation=native.apply(this,args);queueMicrotask(()=>{window.materialProfile.maxEffects=Math.max(window.materialProfile.maxEffects,document.getAnimations().filter(a=>a.id.startsWith('dominix-')).length);window.materialProfile.maxClones=Math.max(window.materialProfile.maxClones,document.querySelectorAll('[data-tile-flight]').length);});return animation;};});
  for(const id of ["left'[]",'right']){
   const left=page.getByRole('button',{name:/^Jugar 0 \| 4 a la izquierda/});
   if(id==="left'[]"&&await left.count())await left.evaluate(el=>el.click());
   else await page.locator('.hand-panel button[data-tile-id]').evaluateAll((els,id)=>els.find(el=>el.dataset.tileId===id).click(),id);
   await page.waitForFunction(()=>!document.querySelector('[data-tile-flight]')&&!document.getAnimations().some(a=>a.id.startsWith('dominix-')));
  }
  assert.equal(await page.locator('[data-chain-tile]').count(),count);assert.equal(await page.locator('[data-contact]').count(),0);
  assert(await page.locator('[data-chain-tile] [data-tile-id]').evaluateAll(els=>els.every(el=>getComputedStyle(el).visibility==='visible')));
  assert(await page.locator('[data-material-reflection]').evaluateAll(els=>els.every(el=>getComputedStyle(el).opacity==='0')));
  const metrics=await page.evaluate(()=>{window.materialObserver.disconnect();return {...window.materialProfile,contacts:window.contacts.length};});assert(metrics.maxClones<=1);assert(metrics.maxEffects<=3);assert.equal(metrics.contacts,2);
  checks.push({skin,tiles:count,cpuThrottle:4,...metrics,noLingeringEffects:true});
  if(skin==='midnight_express'&&count===30)await page.screenshot({path:`${output}/expreso-cadena-30-qa.png`,fullPage:true});
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks:checks.length,largestLongTaskMs:Math.max(0,...checks.flatMap(c=>c.longTasks)),errors}));
}finally{await browser.close();await writeFile(`${output}/material-chains-verificacion.json`,JSON.stringify({scope:'Prepared QA chains, real Hand/Chain/placement, CPU x4. Diagnostic long tasks; not a before/after resolution benchmark or physical mobile test.',checks,errors},null,2));}

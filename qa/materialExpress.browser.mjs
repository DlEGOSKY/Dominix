import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],checks=[],errors=[];
const watch=page=>{page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});};
const url='http://127.0.0.1:5178/qa/materialExpress.html';
const history=[{id:'qa-copy',date:'17 nov 2026',timestamp:1794902400000,rounds:4,totalScore:5730,tilesPlayed:24,patternsActivated:8,relicsCollected:2,bossesDefeated:1,shopPurchases:2,bestCombo:3,goldEarned:36,highestRoundScore:2100,relicIds:[],isDaily:false,roundScores:[900,1230,1500,2100]}];
try {
 for(const lang of ['es','en']){
  const context=await browser.newContext({viewport:{width:1280,height:1100},reducedMotion:'no-preference'});
  await context.addInitScript(history=>{localStorage.setItem('dominix_muted','1');localStorage.setItem('dominix_run_history',JSON.stringify(history));window.bossSignals=0;window.addEventListener('dominix-qa-boss-celebration',()=>window.bossSignals++);},history);
  const page=await context.newPage();watch(page);await page.goto(`${url}?lang=${lang}`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  for(const [width,height] of [[1280,1100],[390,844],[320,568],[844,390]]){
   await page.setViewportSize({width,height});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
   const faces=await page.locator('[data-express-gallery] [data-world-face]').evaluateAll(f=>f.map(el=>({value:Number(el.dataset.worldValue),count:el.querySelectorAll('[data-express-window]').length,empty:el.querySelectorAll('[data-empty-cavity]').length})));
   assert.equal(faces.length,14);assert(faces.every(f=>f.count===f.value&&f.empty===(f.value===0?1:0)));
   assert.equal(await page.locator('[data-craft-material]').count(),6);
   assert.equal(await page.locator('[data-express-specials] [data-tile-badge]').count(),4);
   assert.equal(await page.locator('[data-express-specials] [data-pact-badge]').count(),6);
   assert(await page.locator('[data-material-reflection]').evaluateAll(els=>els.every(el=>Number(getComputedStyle(el).opacity)===0)));
   if(lang==='es'&&[1280,390].includes(width))await page.screenshot({path:`${output}/acabados-expreso-${width}.png`,fullPage:true});
   checks.push({case:'art-layout',lang,width,height,countedValues:true,noOverflow:true,materials:6,specialsPreserved:true});
  }
  await page.setViewportSize({width:1280,height:1100});
  await page.evaluate(()=>{window.effects=[];const native=Element.prototype.animate;Element.prototype.animate=function(...args){const animation=native.apply(this,args);window.effects.push({animation,options:args[1],frames:args[0],element:this});return animation;};});
  for(const skin of ['ivory','emerald','diamond','obsidian','ruby','imperium']){
   const sample=page.locator(`[data-craft-material="${skin}"]`);
   await page.evaluate(()=>{window.effects=[];});await sample.getByRole('button').evaluate(el=>el.click());
   const effects=await page.evaluate(()=>window.effects.filter(e=>e.animation.id.startsWith('dominix-')).map(e=>({id:e.animation.id,duration:e.options.duration,first:e.frames[0]})));
   assert.deepEqual(effects.map(e=>e.id),['dominix-contact','dominix-reflection']);assert(effects.every(e=>e.duration<=300));
   await page.waitForFunction(()=>!document.getAnimations().some(a=>['dominix-contact','dominix-reflection'].includes(a.id)));assert.equal(await page.locator('[data-contact]').count(),0);
   assert(await sample.locator('[data-material-reflection]').evaluateAll(els=>els.every(el=>Number(getComputedStyle(el).opacity)===0)));
   checks.push({case:'bounded-contact',lang,skin,effects});
  }
  await page.getByRole('button',{name:'Rápido false',exact:true}).click();await page.evaluate(()=>{window.effects=[];});await page.locator('[data-craft-material="diamond"] button').evaluate(el=>el.click());
  assert(await page.evaluate(()=>window.effects.filter(e=>e.animation.id.startsWith('dominix-')).every(e=>e.options.duration<=120)));checks.push({case:'fast-contact',lang});
  await page.getByRole('button',{name:'Rápido true',exact:true}).click();
  await page.getByRole('button',{name:'Victoria de jefe QA',exact:true}).click();await page.getByRole('dialog').waitFor();
  assert.equal(await page.evaluate(()=>window.bossSignals),1);
  // Real parent render during the cinematic, without remounting it.
  await page.getByRole('button',{name:/^Actualizar QA/}).evaluate(el=>el.click());
  assert.equal(await page.evaluate(()=>window.bossSignals),1);
  await page.waitForTimeout(1150);if(lang==='es')await page.screenshot({path:`${output}/jefe-una-celebracion.png`});
  await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('[data-boss-completed]').textContent==='Cierres: 1');
  await page.waitForTimeout(1200);assert.equal(await page.locator('[data-boss-completed]').innerText(),'Cierres: 1');checks.push({case:'boss-strict-mode-manual-once',lang,celebrations:1});
  await page.getByRole('button',{name:'Rápido false',exact:true}).click();const start=Date.now();await page.getByRole('button',{name:'Victoria de jefe QA',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-boss-completed]').textContent==='Cierres: 2');assert(Date.now()-start<2000);assert.equal(await page.evaluate(()=>window.bossSignals),2);checks.push({case:'boss-fast-auto-once',lang});
  await page.getByRole('button',{name:'Reducido false',exact:true}).click();await page.evaluate(()=>{window.effects=[];});await page.locator('[data-craft-material="ivory"] button').evaluate(el=>el.click());
  assert.equal(await page.evaluate(()=>window.effects.filter(e=>e.animation.id.startsWith('dominix-')).length),0);
  await page.getByRole('button',{name:'Victoria de jefe QA',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-boss-completed]').textContent==='Cierres: 3');assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await page.evaluate(()=>window.bossSignals),3);checks.push({case:'app-reduced-contact-and-boss',lang,noSpatialContact:true,noCinematic:true});
  await page.getByRole('button',{name:'stats',exact:true}).click();await page.getByRole('button',{name:lang==='es'?'Historial':'History',exact:true}).click();await page.getByRole('button',{name:/17 nov 2026/}).click();
  const share=()=>page.getByRole('button',{name:lang==='es'?'Compartir':'Share',exact:true});
  await page.evaluate(()=>{window.writes=[];Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText(text){window.writes.push(text);return new Promise((resolve,reject)=>{window.resolveCopy=resolve;window.rejectCopy=reject;});}}});});
  await share().click();assert(await page.getByRole('button',{name:lang==='es'?'Copiando…':'Copying…',exact:true}).isDisabled());assert.equal(await page.getByRole('button',{name:/Copiado|Copied/,exact:true}).count(),0);
  await page.evaluate(()=>window.resolveCopy());await page.getByRole('button',{name:lang==='es'?'Copiado!':'Copied!',exact:true}).waitFor();assert.equal(await page.evaluate(()=>window.writes.length),1);assert((await page.evaluate(()=>window.writes[0])).includes('5'));checks.push({case:'copy-waits-for-acknowledgement',lang});
  await page.waitForTimeout(1900);await share().click();await page.evaluate(()=>window.rejectCopy(new DOMException('QA denied','NotAllowedError')));
  const manual=page.getByRole('textbox',{name:lang==='es'?'Resumen para copiar manualmente':'Summary for manual copying'});await manual.waitFor();assert((await manual.inputValue()).startsWith('Dominix · R4'));assert.equal(await page.getByRole('button',{name:lang==='es'?'Copiado!':'Copied!',exact:true}).count(),0);
  if(lang==='es'){await manual.scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/copia-fallo-controlado.png`,fullPage:true});}
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));await share().click();assert(await manual.isVisible());checks.push({case:'copy-rejection-and-missing-api',lang,manualFallback:true,controlledStub:true});
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{}}}));await share().click();await page.getByRole('button',{name:lang==='es'?'Copiado!':'Copied!',exact:true}).waitFor();assert.equal(await manual.count(),0);checks.push({case:'copy-retry-recovers',lang});
  await context.close();
 }
 const system=await browser.newContext({reducedMotion:'reduce'});const page=await system.newPage();watch(page);await page.goto(url,{waitUntil:'networkidle'});await page.getByRole('button',{name:'Victoria de jefe QA',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-boss-completed]').textContent==='Cierres: 1');assert.equal(await page.getByRole('dialog').count(),0);checks.push({case:'system-reduced-boss',noCinematic:true});await system.close();
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks:checks.length,errors},null,2));
} finally {await browser.close();await writeFile(`${output}/material-express-verificacion.json`,JSON.stringify({checks,errors},null,2));}

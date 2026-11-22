import assert from "node:assert/strict";
import {writeFile} from "node:fs/promises";
import {openHomeMode} from "./homeNavigation.mjs";
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],checks=[],errors=[];
const snapshot=page=>page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).sort().map(key=>[key,localStorage.getItem(key)])));
const run=page=>page.evaluate(()=>{window.dispatchEvent(new Event("dominix-save-before-reload"));const raw=localStorage.getItem("dominix_active_run_v1");if(!raw)return null;const checkpoint=JSON.parse(JSON.parse(raw).body);delete checkpoint.savedAt;return checkpoint;});
const configs=[{lang:"es",name:"normal",reduce:false,fast:false,system:"no-preference"},{lang:"en",name:"fast",reduce:false,fast:true,system:"no-preference"},{lang:"es",name:"app-reduced",reduce:true,fast:false,system:"no-preference"},{lang:"en",name:"system-reduced",reduce:false,fast:false,system:"reduce"}];
const phase=async(page,value)=>page.waitForFunction(value=>document.querySelector('[data-training-phase]')?.dataset.trainingPhase===value,value);
async function exercise(page,lang,capture="primera-vez"){
 const dialog=page.getByRole("dialog");await phase(page,"welcome");
 await dialog.getByRole("button",{name:lang==="es"?"Empezar práctica":"Start practice",exact:true}).click();await phase(page,"open");
 await dialog.locator('button[data-tile-id="learn-35"]').click();await phase(page,"connect");
 assert.equal(await dialog.locator('[data-training-score]').innerText(),"10");
 await page.screenshot({path:`${output}/practica-conectar-${capture}.jpg`,type:'jpeg',quality:93});
 await dialog.locator('button[data-tile-id="learn-11"]').click();assert((await dialog.locator('.training-hint').innerText()).includes(lang==="es"?"no conecta":"does not connect"));
 assert.equal(await dialog.locator('[data-training-score]').innerText(),"10");
 await dialog.locator('button[data-tile-id="learn-52"]').click();await phase(page,"pattern");
 await dialog.locator('button[data-tile-id="learn-26"]').click();await phase(page,"draw");assert((await dialog.locator('.training-patterns').innerText()).includes(lang==="es"?"Cadena Simple":"Simple Chain"));
 await dialog.getByRole("button",{name:lang==="es"?"Robar (1)":"Draw (1)",exact:false}).click();await phase(page,"discard");
 await dialog.locator('.training-piece:has([data-tile-id="learn-11"])').getByRole("button",{name:lang==="es"?"Descartar":"Discard",exact:true}).click();await phase(page,"extend");
 await dialog.locator('button[data-tile-id="learn-66"]').click();await phase(page,"close");const score=Number(await dialog.locator('[data-training-score]').innerText());assert(score>=60);
 await dialog.getByRole("button",{name:lang==="es"?"Cerrar cadena":"Close chain",exact:true}).click();await phase(page,"reward");
 await dialog.getByRole("button",{name:lang==="es"?"Elegir Impulso Inicial":"Choose Initial Boost",exact:true}).click();await phase(page,"done");assert.equal(Number(await dialog.locator('[data-training-score]').innerText()),score);
}
try{
 for(const config of configs){
  const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:config.system});
  await context.addInitScript(config=>{if(!sessionStorage.getItem('training-ready')){
   localStorage.setItem("dominix_lang",config.lang);localStorage.setItem("dominix_tutorial_done","1");localStorage.setItem("dominix_active_skin","among_us");localStorage.setItem("dominix_progression",JSON.stringify({xp:493,level:3,unlockedRewards:["lv2_gold","lv3_skin_obsidian"]}));localStorage.setItem("dominix_settings_v1",JSON.stringify({muted:true,reduceMotion:config.reduce,fastAnimations:config.fast}));sessionStorage.setItem('training-ready','1');}},config);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto("http://127.0.0.1:5176/",{waitUntil:"networkidle"});await openHomeMode(page,"Endless");await page.locator('.hand-panel').waitFor();const intro=page.getByText(/toca para continuar|tap to continue/i);if(await intro.count())await intro.click();
  await page.getByRole("button",{name:config.lang==="es"?"Guardar y salir":"Save and exit",exact:true}).click();
  await page.getByRole("button",{name:config.lang==="es"?"Cómo jugar":"How to play",exact:true}).click();
  const before=await snapshot(page);const opener=page.getByRole("button",{name:config.lang==="es"?"Práctica guiada":"Guided practice",exact:true});await opener.click();
  const dialog=page.getByRole('dialog');
  for(const [width,height] of [[1280,1000],[390,844],[320,568],[844,390]]){
   await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth===document.documentElement.clientWidth));assert(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   await page.keyboard.press("Tab");assert(await dialog.evaluate(el=>el.contains(document.activeElement)));checks.push({case:"layout",config:config.name,width,height});
  }
  await page.setViewportSize(config.name==='fast'?{width:320,height:568}:config.name==='system-reduced'?{width:844,height:390}:{width:390,height:844});
  const demoScore=await page.locator('[data-demo-score]').innerText();await exercise(page,config.lang,config.name);
  assert.equal(await page.locator('[data-demo-score]').innerText(),demoScore);assert(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  await page.screenshot({path:`${output}/practica-completada-${config.name}.jpg`,type:"jpeg",quality:93});assert.deepEqual(await snapshot(page),before);
  await dialog.getByRole("button",{name:config.lang==="es"?"Terminar práctica":"Finish practice",exact:true}).click();assert(await opener.evaluate(el=>document.activeElement===el));
  await opener.click();await phase(page,"welcome");await page.keyboard.press("Escape");assert.deepEqual(await snapshot(page),before);
  checks.push({case:"manual-practice",config:config.name,allStepsCompleted:true,invalidMovePreservedScore:true,playerStorageUnchanged:true,replayStartsFresh:true,focusReturned:true});
  await context.close();
 }
 // First-time tutorial appears on its own; no inputs leak into the real run.
 const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:"reduce"});await context.addInitScript(()=>{localStorage.setItem('dominix_lang','es');localStorage.setItem('dominix_settings_v1',JSON.stringify({muted:true,reduceMotion:true}));});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));await page.goto('http://127.0.0.1:5176/',{waitUntil:'networkidle'});await openHomeMode(page,'Endless');await page.locator('.hand-panel').waitFor();const intro=page.getByText(/toca para continuar/i);if(await intro.count())await intro.click();await phase(page,'welcome');
 const before=await run(page);for(const key of ['r','u','1'])await page.keyboard.press(key);assert.deepEqual(await run(page),before);
 await exercise(page,'es');assert.deepEqual((await run(page)).states.game,before.states.game);assert.deepEqual((await run(page)).rng,before.rng);
 await page.getByRole('dialog').getByRole('button',{name:'Terminar práctica',exact:true}).click();assert.equal(await page.evaluate(()=>localStorage.getItem('dominix_tutorial_done')),'1');assert.equal((await run(page)).states.tutorialStep,-1);assert.deepEqual((await run(page)).states.game,before.states.game);
 await page.keyboard.press('1');await page.waitForFunction(()=>document.querySelector('[data-chain-tile]'));checks.push({case:'first-time',automaticallyOpened:true,noGameOrRngChanges:true,completionPersisted:true,realPlayWorksAfterwards:true});
 await context.close();assert.deepEqual(errors,[]);console.log(JSON.stringify({checks:checks.length,errors}));
}finally{await browser.close();await writeFile(`${output}/tutorial-verificacion.json`,JSON.stringify({checks,errors},null,2));}

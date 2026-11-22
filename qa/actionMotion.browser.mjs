import assert from "node:assert/strict";
import {writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {openHomeMode} from "./homeNavigation.mjs";
process.env.PLAYWRIGHT_BROWSERS_PATH=process.argv[5] ? resolve(process.argv[5]) : resolve(process.argv[4],"../qa-tools/browsers");
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],checks=[],errors=[];
// Flush the existing 150ms save debounce, then ignore its wall-clock timestamp.
const read=page=>page.evaluate(()=>{window.dispatchEvent(new Event("dominix-save-before-reload"));const checkpoint=JSON.parse(JSON.parse(localStorage.getItem("dominix_active_run_v1")).body);delete checkpoint.savedAt;return checkpoint;});
const configs=[
 {name:"normal",lang:"es",system:"no-preference",reduce:false,fast:false,skin:"midnight_express"},
 {name:"fast",lang:"en",system:"no-preference",reduce:false,fast:true,skin:"ruby"},
 {name:"app-reduced",lang:"es",system:"no-preference",reduce:true,fast:false,skin:"obsidian"},
 {name:"system-reduced",lang:"en",system:"reduce",reduce:false,fast:false,skin:"imperium"},
];
try {
 for(const config of configs){
  const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:config.system,
   ...(config.name==="normal"?{recordVideo:{dir:resolve(output,"video"),size:{width:1280,height:1000}}}:{})});
  await context.addInitScript(config=>{
   if(!sessionStorage.getItem("action-motion-initialized")){
    localStorage.setItem("dominix_lang",config.lang);localStorage.setItem("dominix_tutorial_done","1");localStorage.setItem("dominix_active_skin",config.skin);
    localStorage.setItem("dominix_settings_v1",JSON.stringify({muted:true,reduceMotion:config.reduce,fastAnimations:config.fast}));sessionStorage.setItem("action-motion-initialized","1");
   }
   window.qaActionAnimations=[];
   const animate=Element.prototype.animate;
   Element.prototype.animate=function(...args){const result=animate.apply(this,args);window.qaActionAnimations.push(result);return result;};
  },config);
  const page=await context.newPage();const video=page.video();
  page.on("pageerror",e=>errors.push(String(e)));page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
  await page.goto("http://127.0.0.1:5176/",{waitUntil:"networkidle"});await openHomeMode(page,"Endless");await page.locator(".hand-panel").waitFor();const intro=page.getByText(/toca para continuar|tap to continue/i);if(await intro.count())await intro.click();await page.waitForTimeout(500);
  for(const [width,height] of [[1280,1000],[390,844],[320,568],[844,390]]){
   await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.clientWidth===document.documentElement.scrollWidth));
   checks.push({case:"viewport",config:config.name,width,height,noHorizontalOverflow:true});
  }
  await page.setViewportSize({width:1280,height:1000});
  const beforeModal=await read(page);
  await page.getByRole("button",{name:/^(Explicar puntuación|Explain score)/}).first().click();
  for(const key of ["r","u","1","9"])await page.keyboard.press(key);
  assert(await page.getByRole("dialog").isVisible());assert.deepEqual(await read(page),beforeModal);
  await page.keyboard.press("Escape");
  await page.dispatchEvent("body","keydown",{key:"1",code:"Digit1",repeat:true});assert.deepEqual(await read(page),beforeModal);
  await page.evaluate(()=>{const field=document.createElement('div');field.contentEditable='true';field.id='qa-editable';document.body.appendChild(field);field.focus();});await page.keyboard.press("r");assert.deepEqual(await read(page),beforeModal);await page.evaluate(()=>document.getElementById('qa-editable').remove());
  checks.push({case:"keyboard-guard",config:config.name,modalPreservedEntireCheckpoint:true,repeatedKeyBlocked:true,editingBlocked:true});
  // Undo during the existing hand-to-table flight must cancel its clone immediately.
  const beforePlay=await read(page);await page.keyboard.press("1");await page.waitForFunction(()=>document.querySelector('[data-action-feedback="play"]'));
  const placed=await read(page);assert.equal(placed.states.game.chain.placed.length,1);
  await page.keyboard.press("u");await page.waitForFunction(()=>document.querySelector('[data-action-feedback="undo"]'));
  const undone=await read(page);assert.deepEqual(undone.states.game,beforePlay.states.game);assert.equal(undone.states.undoUsesLeft,0);assert.equal(await page.locator('[data-tile-flight]').count(),0);
  assert.equal(await page.locator('[data-hand-arrival="undo"]').count(),1);
  await page.waitForTimeout(320);checks.push({case:"undo",config:config.name,restoredWholeGame:true,noFlightClone:true,returnedTile:true});
  const beforeDraw=await read(page);await page.keyboard.press("r");await page.waitForFunction(()=>document.querySelector('[data-action-feedback="draw"]'));
  const drawn=await read(page);const drawnId=beforeDraw.states.game.tilePool[0].id;
  assert.equal(drawn.states.game.hand.length,beforeDraw.states.game.hand.length+1);assert.equal(drawn.states.game.tilePool.length,beforeDraw.states.game.tilePool.length-1);
  assert.equal(drawn.states.game.stats.tilesDrawn,beforeDraw.states.game.stats.tilesDrawn+1);
  assert.equal(await page.locator(`[data-hand-piece="${drawnId}"]`).getAttribute("data-hand-arrival"),"draw");
  await page.waitForTimeout(320);
  await page.locator('.tactical-actions').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/robo-${config.name}.jpg`,fullPage:true,type:"jpeg",quality:92});
  await page.keyboard.press("r");assert.deepEqual(await read(page),drawn);
  checks.push({case:"draw",config:config.name,correctTile:true,costAppliedOnce:true,poolDecreased:true,noDrawAfterBudget:true});
  const discard=page.locator(`[data-hand-piece="${drawnId}"] .hand-discard`);await page.locator(`[data-hand-piece="${drawnId}"]`).hover();await discard.click();
  await page.waitForFunction(()=>document.querySelector('[data-action-feedback="discard"]'));
  const discarded=await read(page);assert(!discarded.states.game.hand.some(tile=>tile.id===drawnId));assert.equal(discarded.states.game.stats.tilesDiscarded,drawn.states.game.stats.tilesDiscarded+1);
  await page.locator(`[data-hand-piece="${drawnId}"]`).waitFor({state:"detached",timeout:1200});
  await page.setViewportSize({width:390,height:844});await page.locator('[data-action-feedback]').scrollIntoViewIfNeeded();
  const noResizeOverflow=await page.evaluate(()=>document.documentElement.clientWidth===document.documentElement.scrollWidth);
  if(!noResizeOverflow){
    await writeFile(`${output}/resize-overflow.json`,JSON.stringify(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,class:e.getAttribute('class'),x:e.getBoundingClientRect().x,right:e.getBoundingClientRect().right})).filter(e=>e.x<0||e.right>innerWidth).slice(0,35)})),null,2));
    await page.screenshot({path:`${output}/resize-overflow.png`,fullPage:true});
  }
  assert(noResizeOverflow);await page.screenshot({path:`${output}/descarte-${config.name}-390.jpg`,fullPage:true,type:"jpeg",quality:92});
  await page.setViewportSize({width:1280,height:1000});checks.push({case:"discard",config:config.name,realTileRemoved:true,exitCompleted:true});
  await page.keyboard.press("1");await page.waitForFunction(()=>document.querySelector('[data-action-feedback="play"]'));await page.waitForTimeout(450);
  await page.getByRole("button",{name:config.lang==="es"?"Cerrar cadena":"Close chain",exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-action-feedback="close"]'));
  const closed=await read(page);assert.equal(closed.states.game.result,"win");
  assert((await page.locator('[data-action-feedback]').innerText()).includes(config.lang==="es"?"Ronda superada":"Round cleared"));
  const animations=await page.evaluate(()=>window.qaActionAnimations.filter(animation=>/^dominix-(budget|reserve|discard-budget|resolution)$/.test(animation.id)).map(animation=>({id:animation.id,duration:animation.effect.getTiming().duration})));
  if(config.reduce||config.system==="reduce")assert.deepEqual(animations,[]);
  else {assert(animations.some(animation=>animation.id==="dominix-reserve"));assert(animations.some(animation=>animation.id==="dominix-discard-budget"));assert(animations.some(animation=>animation.id==="dominix-resolution"));assert(animations.every(animation=>animation.duration===(animation.id==="dominix-resolution"?(config.fast?150:320):(config.fast?90:170))));}
  await page.waitForTimeout(650);checks.push({case:"resolution",config:config.name,outcomeMatchesGame:true,animations});
  await page.getByRole("button",{name:config.lang==="es"?"Guardar y salir":"Save and exit",exact:true}).click();
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});
  await context.setOffline(true);await page.reload({waitUntil:"networkidle"});await page.getByRole("button",{name:/^(Continuar partida|Continue run)/}).click();await page.locator('.tactical-board').waitFor();
  const resumed=await read(page);assert.deepEqual(resumed.states.game,closed.states.game);assert.deepEqual(resumed.rng,closed.rng);assert.equal(await page.locator('[data-action-feedback]').count(),0);assert.equal(await page.locator('[data-tile-flight]').count(),0);
  checks.push({case:"offline-resume",config:config.name,gameAndRngPreserved:true,noActionReplay:true});
  await context.close();if(video)await video.saveAs(resolve(output,'acciones-reales.webm'));
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks:checks.length,errors}));
} finally {await browser.close();await writeFile(`${output}/verificacion.json`,JSON.stringify({checks,errors},null,2));}

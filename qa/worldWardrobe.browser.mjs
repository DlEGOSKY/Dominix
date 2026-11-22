import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { openHomeMode } from "./homeNavigation.mjs";
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4], results=[], errors=[];
const worlds=[
  {id:"eclipse_glass",es:"Vitrales del eclipse",en:"Eclipse Stained Glass"},
  {id:"orbital_reactor",es:"Reactor orbital",en:"Orbital Reactor"},
  {id:"sunken_temple",es:"Templo sumergido",en:"Sunken Temple"},
  {id:"dragon_forge",es:"Forja del dragón",en:"Dragon Forge"},
  {id:"alchemist_cabinet",es:"Gabinete de alquimia",en:"Alchemist's Cabinet"},
  {id:"midnight_express",es:"Expreso de medianoche",en:"Midnight Express"},
];
const persisted=page=>page.evaluate(()=>Object.fromEntries(["dominix_active_skin","dominix_progression","dominix_active_run_v1","dominix_editions_discovered_v1"].map(key=>[key,localStorage.getItem(key)])));
const checkpoint=page=>page.evaluate(()=>{const raw=localStorage.getItem("dominix_active_run_v1");return raw?JSON.parse(JSON.parse(raw).body):null;});
try {
 for(const lang of ["es","en"]){
  const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:"reduce"});
  await context.addInitScript(lang=>{if(!sessionStorage.getItem("wardrobe-initialized")){
   localStorage.setItem("dominix_lang",lang);localStorage.setItem("dominix_active_skin","among_us");localStorage.setItem("dominix_muted","1");localStorage.setItem("dominix_tutorial_done","1");
   localStorage.setItem("dominix_progression",JSON.stringify({xp:493,level:3,unlockedRewards:["lv2_gold","lv3_skin_obsidian"]}));sessionStorage.setItem("wardrobe-initialized","1");
  }},lang);
  const page=await context.newPage();page.on("pageerror",e=>errors.push(String(e)));page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});page.on("dialog",d=>d.accept());
  await page.goto("http://127.0.0.1:5176/",{waitUntil:"networkidle"});
  const open=async()=>{await page.getByRole("button",{name:/^(Apariencia|Appearance)/}).click();await page.locator(".skin-wardrobe").waitFor();};
  const close=async()=>{await page.getByRole("dialog").getByRole("button",{name:lang==="es"?"Cerrar":"Close",exact:true}).click();};
  const back=async()=>{await page.getByRole("button",{name:lang==="es"?"Volver":"Back",exact:true}).click();await page.getByRole("heading",{name:"DOMINIX",exact:true}).waitFor();};
  const intro=async()=>{await page.locator(".hand-panel").waitFor();const msg=page.getByText(/toca para continuar|tap to continue/i);if(await msg.count())await msg.click();};
  await openHomeMode(page,"Endless");await intro();await page.getByRole("button",{name:lang==="es"?"Guardar y salir":"Save and exit",exact:true}).click();
  await open();
  const activeWidth=await page.locator('.skin-current>[data-skin]').evaluate(el=>el.getBoundingClientRect().width);assert(Math.abs(activeWidth-50)<1);
  const original=await persisted(page);
  const family=page.getByLabel(lang==="es"?"Familias de skins":"Skin families",{exact:true});
  await family.selectOption("worlds");assert.equal(await page.locator("[data-catalog-skin]").count(),worlds.length);
  for(const world of worlds){
   const opener=page.getByRole("button",{name:`${lang==="es"?"Probar":"Try"} ${world[lang]}`,exact:true});
   await opener.click();const dialog=page.getByRole("dialog");
   for(const [width,height] of [[1280,1000],[390,844],[320,568],[844,390]]){
    await page.setViewportSize({width,height});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth===document.documentElement.clientWidth));
    assert(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
    assert.equal(await dialog.locator("[data-trial-chain] [role=img]").count(),6);
    assert.equal(await dialog.locator("[data-trial-hand] [role=img]").count(),7);
    assert(await dialog.locator("[data-world-face]").evaluateAll(faces=>faces.every(face=>face.querySelectorAll("[data-counted-inlay]").length===Number(face.dataset.worldValue))));
    const keyboard=await dialog.evaluate(el=>el.contains(document.activeElement));assert(keyboard);
    await page.keyboard.press("Tab");await page.keyboard.press("Shift+Tab");assert(await dialog.evaluate(el=>el.contains(document.activeElement)));
    assert(!(await dialog.innerText()).includes("collection.reading."));
    for(const label of [lang==="es"?"Mano":"Hand",lang==="es"?"Mesa":"Table"]){
      await dialog.getByRole("group",{name:lang==="es"?"Tamaño de las fichas":"Tile size",exact:true}).getByRole("button",{name:label,exact:true}).click();
      assert(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
      const expectedWidth=label==="Mano"||label==="Hand"?68:50;
      assert(await dialog.locator('[data-trial-hand] [data-skin]').evaluateAll((pieces,width)=>pieces.every(el=>Math.abs(el.getBoundingClientRect().width-width)<1),expectedWidth));
    }
    if(lang==="es" && [1280,390].includes(width)){
      await dialog.evaluate(el=>{el.scrollTop=el.querySelector('.skin-table').offsetTop-el.querySelector('header').offsetHeight-12;});
      await page.screenshot({path:`${output}/${world.id}-mesa-${width}.jpg`,type:"jpeg",quality:94});
    }
    results.push({kind:"layout",lang,world:world.id,width,height,countedValues:true,validChain:6,hand:7,noOverflow:true});
   }
   await page.setViewportSize({width:1280,height:1000});
   await dialog.getByLabel(lang==="es"?"Comparar tipos especiales en la mano":"Compare special types in the hand").check();
   assert.equal(await dialog.locator('[data-trial-hand] [data-tile-badge="wild"]').count(),1);
   assert.equal(await dialog.locator('[data-trial-hand] [data-tile-badge="golden"]').count(),1);
   const finishes=dialog.locator("details");await finishes.locator("summary").click();
   await finishes.getByRole("combobox").nth(0).selectOption("mirror");await finishes.getByRole("combobox").nth(1).selectOption("negative");await finishes.getByRole("checkbox").check();
   await page.waitForFunction(()=>document.querySelectorAll('dialog [data-trial-chain] [data-pact-badge]').length===6);
   assert.equal(await dialog.locator('[data-trial-hand] [role="img"][aria-label*="negative"]').count(),7);
   assert.equal(await dialog.locator('[data-trial-chain] [data-pact-badge]').count(),6);
   await dialog.getByLabel(lang==="es"?"Comparar tipos especiales en la mano":"Compare special types in the hand").uncheck();
   assert.equal(await dialog.locator('[data-trial-hand] [data-tile-badge="mirror"]').count(),7);
   assert.deepEqual(await persisted(page),original);
   await page.keyboard.press("Escape");await dialog.waitFor({state:"hidden"});assert(await opener.evaluate(el=>document.activeElement===el));
   results.push({kind:"sample",lang,world:world.id,finishAppliedToWholeHand:true,browsingPreservedRun:true,focusRestored:true});
  }
  await page.locator('[data-catalog-skin="eclipse_glass"] .skin-favorite').click();
  await page.getByLabel(lang==="es"?"Solo favoritas":"Favorites only",{exact:true}).check();assert.equal(await page.locator("[data-catalog-skin]").count(),1);
  await page.reload({waitUntil:"networkidle"});await open();await page.getByLabel(lang==="es"?"Solo favoritas":"Favorites only",{exact:true}).check();assert.equal(await page.locator("[data-catalog-skin]").count(),1);
  assert.equal(await page.locator('[data-catalog-skin="eclipse_glass"] .skin-favorite').getAttribute("aria-pressed"),"true");
  await page.getByLabel(lang==="es"?"Buscar skin":"Search skins",{exact:true}).fill("no-such-skin");assert.equal(await page.locator("[data-catalog-skin]").count(),0);
  await page.getByRole("button",{name:lang==="es"?"Restablecer filtros":"Reset filters",exact:true}).click();assert.equal(await page.locator("[data-catalog-skin]").count(),31);
  await page.getByLabel(lang==="es"?"Familias de skins":"Skin families",{exact:true}).selectOption("materials");
  const ivory=page.getByRole("button",{name:lang==="es"?"Probar Marfil":"Try Ivory",exact:true});await ivory.click();assert(await page.getByRole("dialog").getByRole("button",{name:/nivel 12|level 12/}).isDisabled());await close();
  assert.deepEqual(await persisted(page),original);
  await family.selectOption("worlds");
  await page.screenshot({path:`${output}/armario-${lang}-1280.jpg`,fullPage:true,type:"jpeg",quality:93});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:`${output}/armario-${lang}-390.jpg`,fullPage:true,type:"jpeg",quality:93});await page.setViewportSize({width:1280,height:1000});
  results.push({kind:"catalog",lang,favoritesSurviveReload:true,emptyStateRecovers:true,lockedPreviewCannotEquip:true,allSkins:31});
  if(lang==="es"){
   for(const world of worlds){
    await page.getByRole("button",{name:`Probar ${world.es}`,exact:true}).click();await page.getByRole("dialog").getByRole("button",{name:`Equipar ${world.es}`,exact:true}).click();await close();
    assert.equal(await page.evaluate(()=>localStorage.getItem("dominix_active_skin")),world.id);await back();
    await openHomeMode(page,"Endless");await intro();
    const tile=page.locator(`.hand-panel button[data-skin="${world.id}"]:enabled`).first();const id=await tile.getAttribute("data-tile-id");
    const wrapper=tile.locator("xpath=../..");
    const inspect=wrapper.getByRole("button",{name:/^Explicar puntuación/});await inspect.click();
    const score=page.getByRole("dialog");const beforeInspect=await checkpoint(page);
    const scoreText=await score.locator("p").first().innerText();const projected=Number(scoreText.match(/→\s*(\d+)/)[1]);
    await score.locator("details summary").click();assert(!(await score.innerText()).includes("explain."));
    assert.deepEqual(await checkpoint(page),beforeInspect);
    if(world.id==="eclipse_glass")await score.screenshot({path:`${output}/puntuacion-fuentes.jpg`,type:"jpeg",quality:93});
    await page.keyboard.press("Escape");await page.locator(`.hand-panel button[data-tile-id="${id}"]`).click();
    await page.waitForFunction(()=>{const raw=localStorage.getItem("dominix_active_run_v1");return raw&&JSON.parse(JSON.parse(raw).body).states.game.chain.placed.length===1;});
    const before=await checkpoint(page);assert.equal(before.states.game.score,projected);await page.waitForTimeout(500);
    await page.screenshot({path:`${output}/${world.id}-partida.jpg`,type:"jpeg",quality:93,fullPage:true});
    await page.getByRole("button",{name:"Guardar y salir",exact:true}).click();
    await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener("controllerchange",resolve,{once:true}));});
    await context.setOffline(true);await page.reload({waitUntil:"networkidle"});await page.getByRole("button",{name:/^Continuar partida/}).click();await intro();
    const after=await checkpoint(page);assert.deepEqual(after.states.game,before.states.game);assert.deepEqual(after.rng,before.rng);assert.equal(after.states.activeSkin,world.id);
    await page.getByRole("button",{name:"Guardar y salir",exact:true}).click();await context.setOffline(false);await open();await family.selectOption("worlds");
    results.push({kind:"run",world:world.id,played:true,scoreMatchesExplanation:true,equippedPersisted:true,offlineResumed:true,sameRng:true});
   }
  }
  await context.close();
 }
 const gallery=await browser.newPage({viewport:{width:1280,height:1100},reducedMotion:"reduce"});await gallery.goto("http://127.0.0.1:5178/qa/worlds.html",{waitUntil:"networkidle"});await gallery.screenshot({path:`${output}/mundos-originales.jpg`,type:"jpeg",quality:94,fullPage:true});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks:results.length,errors}));
} finally {await browser.close();await writeFile(`${output}/verificacion.json`,JSON.stringify({results,errors},null,2));}

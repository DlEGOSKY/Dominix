import {openHomeMode,waitForHome} from "./homeNavigation.mjs";
import assert from "node:assert/strict";
import {writeFile} from "node:fs/promises";
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],results=[],errors=[];
const packs=[
  {id:"among_us",es:"Among Us · Tripulación",en:"Among Us · Crew"},
  {id:"hollow_knight",es:"Hollow Knight · Hallownest",en:"Hollow Knight · Hallownest"},
  {id:"one_piece",es:"One Piece · Sombrero de Paja",en:"One Piece · Straw Hats"},
  {id:"roma_eterna",es:"Roma Eterna",en:"Eternal Rome"},
];
const saved=async page=>page.evaluate(()=>{const raw=localStorage.getItem("dominix_active_run_v1");return raw?JSON.parse(JSON.parse(raw).body):null;});
try{
  for(const lang of ["es","en"]){
    const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:"reduce"});
    await context.addInitScript(lang=>{if(!sessionStorage.getItem("collection-test-initialized")){localStorage.setItem("dominix_lang",lang);localStorage.setItem("dominix_active_skin","obsidian");localStorage.setItem("dominix_tutorial_done","1");sessionStorage.setItem("collection-test-initialized","1");}},lang);
    const page=await context.newPage();page.on("pageerror",e=>errors.push(String(e)));page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
    page.on("dialog",d=>d.accept());
    await page.goto("http://127.0.0.1:5176/",{waitUntil:"networkidle"});
    async function openCollection(){await page.getByRole("button",{name:/^(Colecci[oó]n|Collection)$/}).click();await page.getByRole("button",{name:/^Skins/}).click();}
    await openCollection();
    for(const pack of packs){
      await page.getByRole("button",{name:`${lang==="es"?"Probar":"Try"} ${pack[lang]}`,exact:true}).click();
      const section=page.locator('section[aria-labelledby="skin-showcase-title"]');
      const originalSkin=await page.evaluate(()=>localStorage.getItem("dominix_active_skin"));
      const frames=await section.locator("span[data-portrait-pack]").first().evaluate(async el=>{
        const source=getComputedStyle(el).backgroundImage.slice(5,-2),image=new Image();image.src=source;await image.decode();
        const canvas=document.createElement("canvas");canvas.width=canvas.height=128;const ctx=canvas.getContext("2d"),hashes=[];
        for(let i=0;i<7;i++){ctx.clearRect(0,0,128,128);ctx.drawImage(image,i*128,0,128,128,0,0,128,128);const data=ctx.getImageData(0,0,128,128).data;let hash=2166136261;for(const byte of data)hash=Math.imul(hash^byte,16777619);hashes.push(hash>>>0);}
        return {width:image.width,height:image.height,distinct:new Set(hashes).size};
      });
      assert.deepEqual(frames,{width:896,height:128,distinct:7});
      for(const width of [1280,390]){
        await page.setViewportSize({width,height:1000});
        const faces=section.locator(`[aria-label="${lang==="es"?"Las siete caras":"All seven faces"}"] button`);assert.equal(await faces.count(),7);
        for(let n=0;n<7;n++){await faces.nth(n).click();assert.equal(await faces.nth(n).getAttribute("aria-pressed"),"true");}
        assert(await faces.evaluateAll(buttons=>buttons.every(button=>{
          const face=button.querySelector('[data-numeric-face]').getBoundingClientRect(),label=button.querySelector('[data-face-selector-label]').getBoundingClientRect();
          return label.top>=face.bottom-.1;
        })));
        const finishes=section.locator("details");if(!await finishes.getAttribute("open"))await finishes.locator("summary").click();
        const selects=finishes.getByRole("combobox");await selects.nth(0).selectOption("mirror");await selects.nth(1).selectOption("negative");await finishes.getByRole("checkbox").check();
        const examples=finishes.locator(`[data-skin="${pack.id}"]`);assert.equal(await examples.count(),2);
        for(const sample of await examples.all()){const label=await sample.getAttribute("aria-label");assert(label.includes("6 0"));assert(label.includes("negative"));assert(label.includes(lang==="es"?"Pacto Sagrado":"Sacred Pact"));}
        await selects.nth(0).selectOption("normal");await selects.nth(1).selectOption("");await finishes.getByRole("checkbox").uncheck();await finishes.locator("summary").click();
        assert(await page.evaluate(()=>document.documentElement.clientWidth===document.documentElement.scrollWidth));
        assert.equal(await page.evaluate(()=>localStorage.getItem("dominix_active_skin")),originalSkin);
        await section.screenshot({path:`${output}/skin-${pack.id}-${lang}-${width}-2026-11-14.jpg`,type:"jpeg",quality:92});
        results.push({pack:pack.id,lang,width,frames:7,distinctFrames:frames.distinct,previewPreservedSelection:true,specialAndEdition:true});
      }
      if(lang==="es"){
        await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener("controllerchange",resolve,{once:true}));});
        await context.setOffline(true);
        await page.setViewportSize({width:1280,height:1000});
        await section.getByRole("button",{name:`Equipar ${pack.es}`,exact:true}).click();assert.equal(await page.evaluate(()=>localStorage.getItem("dominix_active_skin")),pack.id);await page.getByRole("dialog").getByRole("button",{name:"Cerrar",exact:true}).click();
        await page.getByRole("button",{name:"Volver",exact:true}).click();await openHomeMode(page,"Endless");await page.locator(".hand-panel").waitFor();
        const intro=page.getByText(/toca para continuar/i);if(await intro.count())await intro.click();
        assert((await page.locator(`.hand-panel button[data-skin="${pack.id}"]`).count())>=7);
        await page.locator(`.hand-panel button[data-skin="${pack.id}"]:enabled`).first().click();
        await page.waitForFunction(id=>{const raw=localStorage.getItem("dominix_active_run_v1");if(!raw)return false;const data=JSON.parse(JSON.parse(raw).body);return data.states.activeSkin===id&&data.states.game.chain.placed.length===1;},pack.id);
        const before=await saved(page);await page.waitForTimeout(600);
        await page.screenshot({path:`${output}/skin-${pack.id}-partida-2026-11-14.jpg`,type:"jpeg",quality:92,fullPage:true});
        await page.getByRole("button",{name:"Guardar y salir",exact:true}).click();await page.reload({waitUntil:"networkidle"});await page.getByRole("button",{name:/^Continuar partida/}).click();await page.locator(".hand-panel").waitFor();await page.waitForTimeout(300);
        const resumed=await saved(page);assert.equal(resumed.states.activeSkin,pack.id);assert.deepEqual(resumed.states.game,before.states.game);assert.deepEqual(resumed.rng,before.rng);
        await page.getByRole("button",{name:"Guardar y salir",exact:true}).click();await openCollection();
        results.push({pack:pack.id,realPlay:true,equipPersisted:true,resumePreservedGame:true,offlineReload:true});
      }else{await page.getByRole("dialog").getByRole("button",{name:"Close",exact:true}).click();}
    }
    await context.close();
  }
  const gallery=await browser.newPage({viewport:{width:1440,height:1200},reducedMotion:"reduce"});
  await gallery.goto("http://127.0.0.1:5178/qa/collections.html",{waitUntil:"networkidle"});await gallery.evaluate(()=>document.fonts.ready);await gallery.screenshot({path:`${output}/colecciones-completas-2026-11-14.jpg`,type:"jpeg",quality:94,fullPage:true});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({results,errors},null,2));await writeFile(`${output}/colecciones-verificacion-2026-11-14.json`,JSON.stringify({results,errors},null,2));
}finally{await browser.close();}

import {openHomeMode,waitForHome} from "./homeNavigation.mjs";
import assert from "node:assert/strict";
import {writeFile} from "node:fs/promises";
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const checks=[];
try{for(const lang of ["es","en"]){
  const context=await browser.newContext({viewport:{width:320,height:844},reducedMotion:"reduce"});
  await context.addInitScript(lang=>{
    localStorage.setItem("dominix_lang",lang);
    const manager=navigator.locks;window.lockDisabled=true;
    Object.defineProperty(navigator,"locks",{get:()=>window.lockDisabled?undefined:manager});
  },lang);
  const page=await context.newPage(),errors=[];page.on("pageerror",e=>errors.push(String(e)));
  await page.goto("http://127.0.0.1:5176/",{waitUntil:"networkidle"});
  await page.getByText(lang==="es"?"No se pudo proteger el guardado":"Could not protect your save",{exact:true}).waitFor();
  assert.equal(await page.getByRole("button",{name:"Endless",exact:true}).count(),0);
  assert.equal(await page.evaluate(()=>localStorage.getItem("dominix_active_run_v1")),null);
  assert(await page.evaluate(()=>document.documentElement.clientWidth===document.documentElement.scrollWidth));
  await page.evaluate(()=>{window.lockDisabled=false;});
  await page.getByRole("button",{name:lang==="es"?"Reintentar":"Retry",exact:true}).click();
  await waitForHome(page);assert.deepEqual(errors,[]);
  checks.push({lang,unsupportedDoesNotOpenGame:true,retryAcquiredLock:true,errors});await context.close();
}}finally{await browser.close();}
console.log(JSON.stringify(checks,null,2));await writeFile(`${process.argv[4]}/pwa-acceso-verificacion-2026-11-14.json`,JSON.stringify(checks,null,2));

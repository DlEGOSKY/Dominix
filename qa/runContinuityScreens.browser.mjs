import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4];
try{
  const base=JSON.parse(await readFile(`${output}/continuidad-fixture-2026-11-14.json`,"utf8"));
  const body=JSON.stringify(base);let hash=2166136261;for(let i=0;i<body.length;i++)hash=Math.imul(hash^body.charCodeAt(i),16777619);
  const raw=JSON.stringify({version:1,body,checksum:(hash>>>0).toString(16)});
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:"reduce"});
  await page.addInitScript(raw=>{localStorage.setItem("dominix_active_run_v1",raw);localStorage.setItem("dominix_lang","es");localStorage.setItem("dominix_tutorial_done","1");},raw);
  await page.goto("http://127.0.0.1:5176/",{waitUntil:"networkidle"});await page.waitForTimeout(1200);
  await page.screenshot({path:`${output}/continuar-portada-es-2026-11-14.jpg`,type:"jpeg",quality:90});
  await page.getByRole("button",{name:/^Continuar partida/}).click();await page.getByRole("button",{name:"Guardar y salir",exact:true}).waitFor();await page.waitForTimeout(900);
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:width===1440?1000:844});await page.waitForTimeout(300);
    assert(await page.evaluate(()=>document.documentElement.clientWidth===document.documentElement.scrollWidth));
    await page.screenshot({path:`${output}/continuidad-es-${width}-2026-11-14.jpg`,type:"jpeg",quality:90,fullPage:true});
  }
  console.log("Spanish continue/save controls rendered; no horizontal overflow at 1440, 390 or 320 px.");
}finally{await browser.close();}

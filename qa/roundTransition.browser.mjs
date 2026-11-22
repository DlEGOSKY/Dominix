import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const checks=[];
try{for(const mode of ["normal","boss","unmount","reduced"]){
  const page=await browser.newPage({reducedMotion:mode==="reduced"?"reduce":"no-preference"});
  const errors=[];page.on("pageerror",e=>errors.push(String(e)));
  await page.goto(`http://127.0.0.1:5178/qa/roundTransition.html?mode=${mode}`,{waitUntil:"domcontentloaded"});
  if(mode==="unmount"){await page.waitForTimeout(2500);assert.equal(await page.getByLabel("completed").innerText(),"0");}
  else {await page.getByLabel("completed").filter({hasText:"1"}).waitFor({timeout:mode==="reduced"?1000:3500});}
  assert.deepEqual(errors,[]);checks.push({mode,completed:Number(await page.getByLabel("completed").innerText()),ticks:Number(await page.getByLabel("ticks").innerText()),errors});await page.close();
}}finally{await browser.close();}
console.log(JSON.stringify(checks,null,2));if(process.argv[4])await writeFile(`${process.argv[4]}/transiciones-verificacion-2026-11-14.json`,JSON.stringify(checks,null,2));

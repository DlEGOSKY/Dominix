import assert from "node:assert/strict";
import {readFile,writeFile} from "node:fs/promises";
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],checks=[];
try{
  const base=JSON.parse(await readFile(`${output}/continuidad-fixture-2026-11-14.json`,"utf8"));
  const generator=await browser.newPage();await generator.goto("http://127.0.0.1:5178/qa/roundTransition.html?mode=reduced");
  const fixtures=await generator.evaluate(async base=>{const {buildCheckpointFixtures}=await import("/qa/runCheckpointFixtures.ts");return buildCheckpointFixtures(base);},base);await generator.close();
  for(const [index,fixture] of fixtures.entries()){
    const width=index%2===0?390:1280;
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:"reduce"});
    await context.addInitScript(raw=>{localStorage.setItem("dominix_active_run_v1",raw);localStorage.setItem("dominix_tutorial_done","1");localStorage.setItem("dominix_lang","en");},fixture.raw);
    const page=await context.newPage(),errors=[];page.on("pageerror",e=>errors.push(String(e)));
    await page.goto("http://127.0.0.1:5176/",{waitUntil:"networkidle"});
    await page.getByRole("button",{name:/^Continue run/}).click();
    await page.waitForFunction(before=>{const raw=localStorage.getItem("dominix_active_run_v1");return raw&&JSON.parse(JSON.parse(raw).body).savedAt>before;},fixture.data.savedAt,{timeout:5000});
    await page.waitForTimeout(500);
    const actual=await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem("dominix_active_run_v1")).body));
    assert.deepEqual(actual.states,fixture.data.states,fixture.name);assert.deepEqual(actual.rng,fixture.data.rng,fixture.name);
    assert.equal(await page.getByRole("alert").count(),0,fixture.name);
    assert.equal(await page.getByRole("button",{name:/^Continue run/}).count(),0,fixture.name);
    assert.deepEqual(errors,[],fixture.name);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
    checks.push({fixture:fixture.name,width,statePreserved:true,rngPreserved:true,overflow,errors});
    if(["prepared-effects","boss-phase","event-choice"].includes(fixture.name))await page.screenshot({path:`${output}/continuidad-${fixture.name}-2026-11-14.jpg`,type:"jpeg",quality:90,fullPage:true});
    await context.close();
  }
}finally{await browser.close();}
console.log(JSON.stringify(checks,null,2));await writeFile(`${output}/continuidad-fixtures-verificacion-2026-11-14.json`,JSON.stringify(checks,null,2));

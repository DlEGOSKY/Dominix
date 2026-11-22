import assert from "node:assert/strict";
import {writeFile} from "node:fs/promises";
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],checks=[],errors=[];
const configs=[{name:"normal",lang:"es",fast:false,reduce:false,system:"no-preference"},{name:"fast",lang:"en",fast:true,reduce:false,system:"no-preference"},{name:"app-reduced",lang:"es",fast:false,reduce:true,system:"no-preference"},{name:"system-reduced",lang:"en",fast:false,reduce:false,system:"reduce"}];
try{
 for(const config of configs){
  const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:config.system});await context.addInitScript(config=>localStorage.setItem("dominix_settings_v1",JSON.stringify({reduceMotion:config.reduce,fastAnimations:config.fast,muted:true})),config);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',response=>{if(response.status()>=400)errors.push(`HTTP ${response.status()} ${response.url()}`);});
  await page.goto(`http://127.0.0.1:5178/qa/resolution.html?lang=${config.lang}`,{waitUntil:'networkidle'});
  const total=await page.locator('[data-score-reveal-total]').innerText();assert(total.includes('80'));assert.equal(await page.locator('[data-score-breakdown]').getAttribute('open'),null);
  for(const width of [1280,390,320]){
   await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.clientWidth===document.documentElement.scrollWidth));
   await page.locator('[data-score-breakdown] summary').click();assert(await page.locator('[data-score-breakdown]').getAttribute('open')!==null);assert(await page.evaluate(()=>document.documentElement.clientWidth===document.documentElement.scrollWidth));
   await page.screenshot({path:`${output}/desglose-${config.name}-${width}.jpg`,type:'jpeg',quality:92,fullPage:true});await page.locator('[data-score-breakdown] summary').click();checks.push({case:'large-score-breakdown',config:config.name,width,totalAlwaysPresent:true});
  }
  const start=Date.now();await page.getByRole('button',{name:'Mostrar transición QA',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[role=status]')?.textContent==='Cierres: 1');const elapsed=Date.now()-start;
  assert.equal(await page.locator('[data-round-transition]').count(),0);assert(elapsed<1600);await page.waitForTimeout(250);assert.equal(await page.getByRole('status').innerText(),'Cierres: 1');
  checks.push({case:'transition-strict-mode',config:config.name,elapsed,completionExactlyOnce:true});
  if(!config.reduce&&config.system!=='reduce'){
   await page.getByRole('button',{name:'Mostrar transición QA',exact:true}).click();await page.locator('[data-round-transition]').click();await page.waitForTimeout(650);assert.equal(await page.getByRole('status').innerText(),'Cierres: 2');checks.push({case:'transition-skip',config:config.name,noDuplicateTimer:true});
  }
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks:checks.length,errors}));
}finally{await browser.close();await writeFile(`${output}/resolucion-verificacion.json`,JSON.stringify({checks,errors},null,2));}

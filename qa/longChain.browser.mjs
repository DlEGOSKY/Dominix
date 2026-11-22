import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import(process.argv[2] || 'playwright');
const output=process.argv[4];
if(!output) throw new Error('Pass an output directory as the third argument');
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const results=[];
try {for(const reduced of [false,true]) {
 const ctx=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:reduced?'reduce':'no-preference'});
 const page=await ctx.newPage(); const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5178/qa/longChain.html',{waitUntil:'networkidle'});
 await page.waitForTimeout(650);
 const initial=await page.getByRole('status').innerText();
 assert.equal(await page.locator('[data-chain-position]').count(),28);
 const sample=()=>page.locator('.chain-flow > div').evaluateAll(els=>els.map(el=>({scale:new DOMMatrixReadOnly(getComputedStyle(el).transform).a,filter:getComputedStyle(el).filter})));
 const pulses=[];
 for(let n=0;n<2;n++) {
  await page.getByRole('button',{name:'Patrón QA',exact:true}).click(); await page.waitForTimeout(110);
  pulses.push(await sample()); await page.waitForTimeout(600);
  assert((await sample()).every(v=>Math.abs(v.scale-1)<.002));
 }
 assert(pulses.every(p=>reduced ? p.every(v=>Math.abs(v.scale-1)<.002) : p.some(v=>v.scale>1.01)));
 results.push({reduced,pulses,errors});
 await page.getByRole('button',{name:'Añadir izquierda',exact:true}).click();
 await page.getByText(/^Fichas 29/).waitFor();
 assert.equal(await page.locator('[data-chain-end="left"]').innerText(),'← 6');
 await page.getByRole('button',{name:'Añadir derecha',exact:true}).click();
 await page.getByText(/^Fichas 30/).waitFor();
 assert.equal(await page.locator('[data-chain-end="right"]').innerText(),'6 →');
 await page.getByRole('button',{name:'Deshacer QA',exact:true}).click();await page.getByRole('button',{name:'Deshacer QA',exact:true}).click();
 assert.equal(await page.getByRole('status').innerText(),initial);
 if(!reduced) {
  await page.screenshot({path:`${output}/cadena-larga-escritorio-2026-11-14.jpg`,type:'jpeg',quality:90,fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.locator('[data-chain-position="28"]').scrollIntoViewIfNeeded();await page.waitForTimeout(600);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth===document.documentElement.clientWidth));
  await page.screenshot({path:`${output}/cadena-larga-movil-2026-11-14.jpg`,type:'jpeg',quality:90,fullPage:true});
 }
 await ctx.close();
}}finally{await browser.close();await writeFile(`${output}/cadena-larga-verificacion-2026-11-14.json`,JSON.stringify(results,null,2));}
console.log(JSON.stringify(results.map(r=>({reduced:r.reduced,peak:r.pulses.map(p=>Math.max(...p.map(x=>x.scale))),errors:r.errors})),null,2));

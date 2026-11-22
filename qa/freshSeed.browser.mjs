import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {openHomeMode} from './homeNavigation.mjs';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],label=process.argv[5]??'before',results=[];
try {
 for(const mode of ['Endless','Nueva Run','Reto Diario']) {
  const snapshots=[];
  for(const port of [5176,5180]) {
   const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:'reduce'});
   await context.addInitScript(()=>{
    Math.random=()=>.4021;localStorage.setItem('dominix_lang','es');localStorage.setItem('dominix_tutorial_done','1');
    localStorage.setItem('dominix_settings_v1',JSON.stringify({muted:true,reduceMotion:true,fastAnimations:true}));
   });
   const page=await context.newPage();
   await page.goto(`http://127.0.0.1:${port}/`,{waitUntil:'networkidle'});
   if(mode==='Nueva Run'){await page.getByRole('button',{name:mode,exact:true}).click();await page.getByRole('button',{name:'Iniciar Run',exact:true}).click();await page.getByRole('button',{name:/^Iniciar run con/}).click();}
   else await openHomeMode(page,mode);
   await page.getByRole('button',{name:/Guardar y salir|disponible$/}).first().waitFor();
   await page.waitForTimeout(500);
   const snapshot=await page.evaluate(()=>{window.dispatchEvent(new Event('dominix-save-before-reload'));const raw=localStorage.getItem('dominix_active_run_v1');if(!raw)throw Error(document.body.innerText);const data=JSON.parse(JSON.parse(raw).body);delete data.savedAt;return data;});
   snapshots.push(snapshot);await context.close();
  }
  results.push({mode,equal:JSON.stringify(snapshots[0])===JSON.stringify(snapshots[1]),production:snapshots[0],strict:snapshots[1]});
 }
 await writeFile(`${output}/fresh-seeds-${label}.json`,JSON.stringify(results,null,2));
 for(const result of results)assert.deepEqual(result.strict,result.production,`${result.mode}: fresh initial state/RNG differs`);
 console.log(results.map(({mode,equal})=>({mode,equal})));
}finally{await browser.close();}

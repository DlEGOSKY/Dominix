import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],saved=await readFile(`${output}/profile-checkpoint.json`,'utf8'),errors=[];
try {
 const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:'reduce'});
 await context.addInitScript(saved=>{
  localStorage.setItem('dominix_lang','es');localStorage.setItem('dominix_tutorial_done','1');
  localStorage.setItem('dominix_settings_v1',JSON.stringify({muted:true,reduceMotion:true}));localStorage.setItem('dominix_active_run_v1',saved);
 },saved);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(process.argv[5]??'http://127.0.0.1:5176/',{waitUntil:'networkidle'});await page.getByRole('button',{name:/^Continuar partida/}).click();await page.locator('.hand-panel').waitFor();
 await page.getByRole('button',{name:'Cerrar cadena',exact:true}).click();await page.locator('[data-round-outcome="win"]').waitFor();await page.waitForTimeout(300);
 const before=await page.evaluate(()=>{
  window.dispatchEvent(new Event('dominix-save-before-reload'));
  const raw=localStorage.getItem('dominix_active_run_v1');localStorage.setItem('dominix_active_run_backup_v1',raw);
  const profile=Object.fromEntries(Object.keys(localStorage).filter(key=>key.startsWith('dominix_')&&!key.startsWith('dominix_active_run')).map(key=>[key,localStorage.getItem(key)]));
  let index=0,exception;
  for(let size=65536;size>=1;size=Math.floor(size/2))for(;;){try{localStorage.setItem(`qa-terminal-${index}`,'x'.repeat(size));index++;}catch(e){exception=e.name;break;}}
  return {profile,checkpoint:JSON.parse(JSON.parse(raw).body),exception};
 });assert.equal(before.exception,'QuotaExceededError');
 await page.getByRole('button',{name:'Terminar run',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'No se pudo guardar'}).waitFor();
 assert(await page.locator('[data-round-outcome="win"]').isVisible());
 const failed=await page.evaluate(()=>({profile:Object.fromEntries(Object.keys(localStorage).filter(key=>key.startsWith('dominix_')&&!key.startsWith('dominix_active_run')).map(key=>[key,localStorage.getItem(key)])),checkpoint:JSON.parse(JSON.parse(localStorage.getItem('dominix_active_run_v1')).body)}));
 delete before.checkpoint.savedAt;delete failed.checkpoint.savedAt;
 assert.deepEqual(failed.profile,before.profile);assert.deepEqual(failed.checkpoint,before.checkpoint);
 await page.screenshot({path:`${output}/terminal-quota.png`,fullPage:true});
 await page.evaluate(()=>{for(const key of Object.keys(localStorage))if(key.startsWith('qa-terminal-'))localStorage.removeItem(key);});
 await page.getByRole('button',{name:'Terminar run',exact:true}).click();await page.waitForTimeout(650);
 const after=await page.evaluate(()=>({save:JSON.parse(localStorage.getItem('dominix_save')),progress:JSON.parse(localStorage.getItem('dominix_progression')),history:JSON.parse(localStorage.getItem('dominix_run_history')),mastery:JSON.parse(localStorage.getItem('dominix_character_mastery_v1')),active:localStorage.getItem('dominix_active_run_v1'),backup:localStorage.getItem('dominix_active_run_backup_v1')}));
 assert.equal(after.save.totalRuns,1);assert.equal(after.history.length,1);assert(after.progress.xp>0);assert(after.mastery.architect>0);
 assert.equal(after.active,null);assert.equal(after.backup,null);assert.deepEqual(errors,[]);
 await page.screenshot({path:`${output}/terminal-retry-success.png`,fullPage:true});
 await writeFile(`${output}/terminal-quota.json`,JSON.stringify({actualQuotaError:before.exception,failedFinishPreservesEntireProfileAndCheckpoint:true,retryCountsRunAndHistoryOnce:true,xpGrantedOnSuccessfulRetry:after.progress.xp,masteryGrantedOnSuccessfulRetry:after.mastery.architect,activeRemovedOnlyAfterSuccess:true,errors},null,2));
 console.log('Terminal quota: profile/checkpoint preserved; successful retry credits one run and one history entry.');
}finally{await browser.close();}

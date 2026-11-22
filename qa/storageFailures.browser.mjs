import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const {chromium}=await import(process.argv[2]);
const executablePath=process.argv[3],output=process.argv[4],checks=[],errors=[];
const saved=await readFile(`${output}/profile-checkpoint.json`,'utf8');
const browser=await chromium.launch({executablePath,headless:true});
try {
 const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:'reduce'});
 await context.addInitScript(saved=>{
  localStorage.setItem('dominix_lang','es');localStorage.setItem('dominix_tutorial_done','1');
  localStorage.setItem('dominix_settings_v1',JSON.stringify({muted:true,reduceMotion:true}));
  localStorage.setItem('dominix_active_run_v1',saved);
 },saved);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5176/',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:/^Continuar partida/}).click();await page.locator('.hand-panel').waitFor();await page.waitForTimeout(350);
 // The baseline hand is blocked at 1|1. Undo that real placement first so the
 // next accepted placement grows the checkpoint while quota is exhausted.
 await page.keyboard.press('u');await page.waitForTimeout(250);
 const previous=await page.evaluate(()=>{
  window.dispatchEvent(new Event('dominix-save-before-reload'));
  // Reserve a valid backup before genuinely exhausting this isolated origin.
  const primary=localStorage.getItem('dominix_active_run_v1');localStorage.setItem('dominix_active_run_backup_v1',primary);
  let index=0,quota='';
  for(let size=65536;size>=1;size=Math.floor(size/2)) {
   for(;;){try{localStorage.setItem(`qa-pressure-${index}`,'x'.repeat(size));index++;}catch(e){quota=e.name;break;}}
  }
  return {primary,backup:localStorage.getItem('dominix_active_run_backup_v1'),quota,keys:index};
 });
 assert.equal(previous.quota,'QuotaExceededError');
 await page.locator('.hand-panel button[data-tile-id]:enabled').first().click();await page.waitForTimeout(400);
 await page.getByRole('alert').filter({hasText:'No se pudo guardar'}).waitFor();
 const retained=await page.evaluate(()=>({primary:localStorage.getItem('dominix_active_run_v1'),backup:localStorage.getItem('dominix_active_run_backup_v1'),tiles:document.querySelectorAll('.tactical-board [data-chain-tile]').length}));
 assert.equal(retained.primary,previous.primary);assert.equal(retained.backup,previous.backup);
 await page.getByRole('button',{name:'Guardar y salir',exact:true}).click();assert(await page.locator('.hand-panel').isVisible());
 await page.screenshot({path:`${output}/quota-real.png`,fullPage:true});
 checks.push({case:'real-quota',exception:previous.quota,primaryPreserved:true,backupPreserved:true,failedExitKeepsRun:true});
 await page.evaluate(()=>{for(const key of Object.keys(localStorage))if(key.startsWith('qa-pressure-'))localStorage.removeItem(key);});
 await page.getByRole('button',{name:'Guardar y salir',exact:true}).click();await page.getByRole('button',{name:/^Continuar partida/}).waitFor();
 const recovered=await page.evaluate(()=>JSON.parse(JSON.parse(localStorage.getItem('dominix_active_run_v1')).body));
 const old=JSON.parse(JSON.parse(previous.primary).body);assert.equal(recovered.states.game.chain.placed.length,old.states.game.chain.placed.length+1);
 checks.push({case:'free-space-and-retry',latestLiveActionSaved:true});
 await context.close();

 // Real Chromium content setting, no mocked Storage methods. It applies to an
 // isolated profile created solely for this check; personal Chrome is untouched.
 const profile=resolve(output,'blocked-storage-profile');await mkdir(resolve(profile,'Default'),{recursive:true});
 await writeFile(resolve(profile,'Default/Preferences'),JSON.stringify({profile:{default_content_setting_values:{cookies:2}}}));
 const blocked=await chromium.launchPersistentContext(profile,{executablePath,headless:true,locale:'es-ES',viewport:{width:1280,height:1000}});
 try {
  const page=blocked.pages()[0];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:5176/',{waitUntil:'networkidle'});
  const failure=await page.evaluate(()=>{try{localStorage.setItem('qa-probe','1');return null;}catch(e){return e.name;}});
  assert.equal(failure,'SecurityError');
  await page.waitForTimeout(600);
  await page.screenshot({path:`${output}/storage-blocked.png`,fullPage:true});
  await writeFile(`${output}/storage-blocked-diagnostic.json`,JSON.stringify(await page.evaluate(()=>({text:document.body.innerText,language:navigator.language,read:(()=>{try{return localStorage.getItem('qa-probe');}catch(e){return e.name;}})()})),null,2));
  await page.getByText('El navegador bloquea los datos de Dominix',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Reintentar',exact:true}).click();
  assert(await page.getByText('El navegador bloquea los datos de Dominix',{exact:true}).isVisible());
  await page.screenshot({path:`${output}/storage-blocked.png`,fullPage:true});
  checks.push({case:'blocked-storage',exception:failure,actionableGateRendered:true,retryRemainsSafe:true});
 }finally{await blocked.close();}
 assert.deepEqual(errors,[]);console.log({checks,errors});
}finally{await browser.close();await writeFile(`${output}/storage-failures.json`,JSON.stringify({checks,errors},null,2));}

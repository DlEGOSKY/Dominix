import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const {chromium}=await import(process.argv[2]);
const executablePath=process.argv[3],output=process.argv[4];
const profile=await mkdtemp(resolve(output,'crash-profile-'));
const saved=await readFile(`${output}/profile-checkpoint.json`,'utf8');
let child,browser;
async function launch(){
 child=spawn(executablePath,[`--user-data-dir=${profile}`,'--remote-debugging-port=0','--headless=new','--no-first-run','--no-default-browser-check','about:blank'],{windowsHide:true,stdio:'ignore'});
 assert(Number.isInteger(child.pid));
 let port;
 for(let i=0;i<100;i++){
  try{port=Number((await readFile(resolve(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`);break;}catch{await new Promise(resolve=>setTimeout(resolve,100));}
 }
 assert(browser,'Isolated Chrome did not start');
 const context=browser.contexts()[0];return {context,page:context.pages()[0]??await context.newPage()};
}
function forceStop(){
 // This exact PID was returned by spawn above, using the explicitly supplied
 // Chrome binary and a newly created QA profile. Never enumerate/kill Chrome.
 assert(child.spawnfile===executablePath&&Number.isInteger(child.pid));
 execFileSync('C:/Windows/System32/taskkill.exe',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});
}
try {
 let {page}=await launch();
 await page.goto('http://127.0.0.1:5176/',{waitUntil:'networkidle'});
 await page.evaluate(saved=>{
  localStorage.setItem('dominix_lang','es');localStorage.setItem('dominix_tutorial_done','1');
  localStorage.setItem('dominix_settings_v1',JSON.stringify({muted:true,reduceMotion:true}));localStorage.setItem('dominix_active_run_v1',saved);
 },saved);
 await page.reload({waitUntil:'networkidle'});await page.getByRole('button',{name:/^Continuar partida/}).click();await page.locator('.hand-panel').waitFor();
 await page.keyboard.press('u');await page.waitForTimeout(250);
 await page.locator('.hand-panel button[data-tile-id]:enabled').first().click();
 // Allow the real autosave to run, without pagehide or an explicit flush.
 await page.waitForTimeout(650);
 const before=await page.evaluate(()=>localStorage.getItem('dominix_active_run_v1'));
 assert.equal(JSON.parse(JSON.parse(before).body).states.game.chain.placed.length,1);
 const disconnected=new Promise(resolve=>browser.once('disconnected',resolve));forceStop();await disconnected;
 await new Promise(resolve=>setTimeout(resolve,200));browser=undefined;
 ({page}=await launch());
 await page.goto('http://127.0.0.1:5176/',{waitUntil:'networkidle'});
 const after=await page.evaluate(()=>localStorage.getItem('dominix_active_run_v1')??localStorage.getItem('dominix_active_run_backup_v1'));
 assert.equal(after,before,'Forced process closure lost the completed autosave');
 await page.getByRole('button',{name:/^(Continuar partida|Continue run)/}).click();await page.locator('.hand-panel').waitFor();
 const resumed=await page.evaluate(()=>{window.dispatchEvent(new Event('dominix-save-before-reload'));return JSON.parse(JSON.parse(localStorage.getItem('dominix_active_run_v1')).body);});
 const expected=JSON.parse(JSON.parse(before).body);delete resumed.savedAt;delete expected.savedAt;assert.deepEqual(resumed,expected);
 assert.equal(await page.locator('[data-tile-flight],[data-action-feedback]').count(),0);
 await page.screenshot({path:`${output}/crash-resumed.png`,fullPage:true});
 await writeFile(`${output}/crash-recovery.json`,JSON.stringify({processTreeForceClosed:true,automaticSaveWaitMs:650,diskCheckpointPreserved:true,entireResumedStateAndRngEqual:true,noActionReplay:true,scope:'isolated QA profile; completed autosave, not an immediate crash during the debounce'},null,2));
 console.log('Forced process closure: checkpoint, entire resumed state and RNG preserved.');
}finally {if(browser)await browser.close();if(child?.exitCode===null){try{forceStop();}catch{/* Already closed by CDP. */}}}

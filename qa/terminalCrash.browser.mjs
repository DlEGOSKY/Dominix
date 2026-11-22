import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {openHomeMode} from './homeNavigation.mjs';
const {chromium}=await import(process.argv[2]);
const executablePath=process.argv[3],output=process.argv[4],phase=process.argv[5]??'before';
const cut=process.argv[6]??'xp',suffix=cut==='xp'?phase:`${phase}-${cut}`;
// Browser lock files must stay out of OneDrive's synchronization directory.
const profile=await mkdtemp(resolve(tmpdir(),`dominix-terminal-${suffix}-`));
let child,browser;const errors=[];let report;
async function launch(){
 let diagnostic='';child=spawn(executablePath,[`--user-data-dir=${profile}`,'--remote-debugging-port=0','--headless=new','--no-first-run','--no-default-browser-check','about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
 child.stderr.on('data',chunk=>{diagnostic=(diagnostic+chunk.toString()).slice(-6000);});
 for(let i=0;i<200;i++)try{const endpoint=diagnostic.match(/DevTools listening on (ws:\/\/[^\s]+)/)?.[1];if(!endpoint)throw Error('Waiting for owned browser endpoint');browser=await chromium.connectOverCDP(endpoint,{timeout:1000});break;}catch{await new Promise(r=>setTimeout(r,100));}
 assert(browser,`Isolated Chrome did not start (exit ${child.exitCode}): ${diagnostic}`);const context=browser.contexts()[0];const page=context.pages()[0]??await context.newPage();page.on('pageerror',e=>errors.push(String(e)));return {context,page};
}
const counts=page=>page.evaluate(()=>({runs:JSON.parse(localStorage.getItem('dominix_save')??'{}').totalRuns??0,history:JSON.parse(localStorage.getItem('dominix_run_history')??'[]').length,xp:JSON.parse(localStorage.getItem('dominix_progression')??'{}').xp??0,active:!!localStorage.getItem('dominix_active_run_v1')}));
const fullProfile=page=>page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).filter(key=>key.startsWith('dominix_')&&!key.startsWith('dominix_active_run_')&&key!=='dominix_profile_settlement_v1').sort().map(key=>[key,localStorage.getItem(key)])));
try{
 let {context,page}=await launch();await context.request.post('http://127.0.0.1:5184/__qa_mode',{data:'candidate'});
 await page.goto('http://127.0.0.1:5184/Dominix/',{waitUntil:'networkidle'});await page.evaluate(()=>{localStorage.setItem('dominix_lang','es');localStorage.setItem('dominix_tutorial_done','1');localStorage.setItem('dominix_settings_v1',JSON.stringify({muted:true,reduceMotion:true}));});await page.reload({waitUntil:'networkidle'});
 await openHomeMode(page,'Endless');await page.locator('.hand-panel').waitFor();const intro=page.getByText(/toca para continuar/i);if(await intro.count())await intro.click();await page.locator('.hand-panel button[data-tile-id]:enabled').first().click();await page.getByRole('button',{name:'Cerrar cadena',exact:true}).click();await page.locator('[data-round-outcome="win"]').waitFor();await page.waitForTimeout(400);
 const before=await counts(page),profileBefore=await fullProfile(page);assert.equal(before.runs,0);
 const cdp=await context.newCDPSession(page);await cdp.send('Debugger.enable');
 /* eslint-disable no-debugger -- Intentional crash-test pauses between real storage writes. */
 await page.evaluate(cut=>{
  const native=Storage.prototype.setItem,remove=Storage.prototype.removeItem;
  Storage.prototype.setItem=function(key,value){native.call(this,key,value);if(this===localStorage&&((cut==='xp'&&key==='dominix_progression')||(cut==='committed'&&key==='dominix_profile_settlement_v1'&&JSON.parse(value).phase==='settled'))){debugger;}};
  Storage.prototype.removeItem=function(key){remove.call(this,key);if(this===localStorage&&cut==='cleared'&&key==='dominix_active_run_backup_v1'){debugger;}};
 },cut);
 /* eslint-enable no-debugger */
 const paused=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Did not pause during terminal accounting')),30000);cdp.once('Debugger.paused',event=>{clearTimeout(timer);resolve(event);});});
 const finish=page.getByRole('button',{name:'Terminar run',exact:true}).click().catch(()=>{});await paused;
 // Leave the renderer paused while the browser's storage service flushes.
 // This tests process termination between writes, not a caught JS exception.
 await new Promise(r=>setTimeout(r,2000));const disconnected=new Promise(r=>browser.once('disconnected',r));void cdp.send('Browser.crash').catch(()=>{});await disconnected;await finish;browser=undefined;await new Promise(r=>setTimeout(r,250));
 ({page}=await launch());await page.goto('http://127.0.0.1:5184/Dominix/',{waitUntil:'networkidle'});await page.getByRole('heading',{name:'DOMINIX',exact:true}).waitFor();
 const recovered=await counts(page);if(phase==='after'&&cut!=='committed')assert.deepEqual(await fullProfile(page),profileBefore,'Recovery must restore every profile key, including mastery and unlocks');await page.screenshot({path:`${output}/terminal-crash-${suffix}-recovered.png`,fullPage:true});
 if(cut==='committed'){assert.equal(phase,'after');assert.equal(recovered.runs,1);assert.equal(recovered.history,1);assert(recovered.xp>0);assert.equal(recovered.active,false);await page.reload({waitUntil:'networkidle'});await page.getByRole('heading',{name:'DOMINIX',exact:true}).waitFor();}
 else{assert(recovered.active);await page.getByRole('button',{name:/^Continuar partida/}).click();await page.locator('[data-round-outcome="win"]').waitFor();await page.getByRole('button',{name:'Terminar run',exact:true}).click();await page.waitForFunction(()=>localStorage.getItem('dominix_active_run_v1')===null);await page.waitForTimeout(400);}
 const retried=await counts(page);assert.deepEqual(errors,[]);
 if(phase==='before'){assert.equal(recovered.runs,1);assert.equal(retried.runs,2);assert.equal(retried.history,2);assert.equal(retried.xp,recovered.xp*2);}
 else{if(cut!=='committed'){assert.equal(recovered.runs,0);assert.equal(recovered.history,0);assert.equal(recovered.xp,0);}assert.equal(retried.runs,1);assert.equal(retried.history,1);assert(retried.xp>0);assert.equal(retried.active,false);}
 report={scope:'Owned isolated Chrome browser process crashed with CDP Browser.crash while paused at the named real storage operation. Two-second storage flush opportunity. Not an OS/power failure test.',phase,cut,before,recovered,retried,entireProfileRestored:phase==='after'&&cut!=='committed',duplicateAccounting:retried.runs>1,errors};console.log(JSON.stringify(report));
}finally{if(browser)await browser.close();if(child?.exitCode===null)child.kill();await writeFile(`${output}/terminal-crash-${suffix}.json`,JSON.stringify(report??{phase,cut,incomplete:true,errors},null,2));}

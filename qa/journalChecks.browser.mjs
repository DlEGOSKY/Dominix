import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],saved=await readFile(`${output}/profile-checkpoint.json`,'utf8');
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5180/',{waitUntil:'networkidle'});
 const checks=await page.evaluate(async saved=>{
  const cp=await import('/src/engine/runCheckpoint.ts');
  const journal=await import('/src/engine/runJournal.ts');
  const sync=await import('/src/engine/saveSync.ts');
  const old=cp.decodeCheckpoint(saved),newer=structuredClone(old);newer.states.gold+=17;newer.savedAt+=100;
  const newRaw=cp.encodeCheckpoint(newer),results=[];
  const drop=()=>{localStorage.removeItem(cp.ACTIVE_RUN_KEY);localStorage.removeItem(cp.ACTIVE_RUN_BACKUP_KEY);};
  const ensure=(condition,message)=>{if(!condition)throw Error(message);};
  localStorage.setItem('qa-profile-sentinel','keep');
  await journal.queueRunJournal(saved);drop();await cp.recoverRunJournal();
  ensure(cp.loadRunCheckpoint().status==='recovered'&&JSON.stringify(cp.loadRunCheckpoint().data)===JSON.stringify(old),'Missing local save did not recover');results.push('recovers validated checkpoint when both local copies are absent');
  localStorage.setItem(cp.ACTIVE_RUN_KEY,saved);await journal.queueRunJournal(newRaw);await cp.recoverRunJournal();
  ensure(localStorage.getItem(cp.ACTIVE_RUN_KEY)===saved,'Overwrote authoritative existing save');results.push('preserves valid existing/imported saves, even with older timestamps');
  cp.saveRunCheckpoint(old);cp.saveRunCheckpoint(newer);cp.clearRunCheckpoint();
  ensure((await journal.readRunJournal()).raw===null,'Clear overtaken by older write');
  localStorage.setItem(cp.ACTIVE_RUN_KEY,newRaw);localStorage.setItem(cp.ACTIVE_RUN_BACKUP_KEY,saved);await cp.recoverRunJournal();
  ensure(cp.loadRunCheckpoint().status==='none','Resurrected cleared disk generation');results.push('ordered writes and clear cannot resurrect the cleared run');
  localStorage.setItem(cp.ACTIVE_RUN_KEY,saved);await cp.recoverRunJournal();
  // saved was one of the cleared generations; an unrelated future import is kept.
  const unrelated=structuredClone(old);unrelated.seed=unrelated.rng.seed=999;const unrelatedRaw=cp.encodeCheckpoint(unrelated);
  localStorage.setItem(cp.ACTIVE_RUN_KEY,unrelatedRaw);await cp.recoverRunJournal();
  ensure(localStorage.getItem(cp.ACTIVE_RUN_KEY)===unrelatedRaw,'Clear deleted an unrelated run');results.push('clear fingerprints preserve unrelated/new runs');
  await journal.queueRunJournal(newRaw);
  ensure(sync.importSave(JSON.stringify({magic:'dominix-save',version:3,data:{[cp.ACTIVE_RUN_KEY]:saved}})).ok,'Import failed');
  ensure((await journal.readRunJournal()).raw===saved,'Old journal survived import');drop();await cp.recoverRunJournal();
  ensure(JSON.stringify(cp.loadRunCheckpoint().data)===JSON.stringify(old),'Import restored wrong generation');results.push('older import replaces recovery journal and recovers the imported run');
  sync.resetAllSaveData();ensure((await journal.readRunJournal()).raw===null,'Reset retained recovery run');
  localStorage.setItem(cp.ACTIVE_RUN_KEY,saved);await cp.recoverRunJournal();ensure(cp.loadRunCheckpoint().data===null,'Reset resurrected run');results.push('full reset clears recovery without resurrection');
  drop();localStorage.setItem(cp.ACTIVE_RUN_KEY,'damaged');await journal.queueRunJournal('{damaged');await cp.recoverRunJournal();
  ensure(localStorage.getItem(cp.ACTIVE_RUN_KEY)==='damaged'&&cp.loadRunCheckpoint().status==='invalid','Invalid journal accepted');results.push('rejects corrupted journal while preserving damaged primary');
  ensure(localStorage.getItem('qa-profile-sentinel')==='keep','Touched unrelated profile data');
  return results;
 },saved);
 assert.equal(checks.length,7);assert.deepEqual(errors,[]);
 await writeFile(`${output}/journal-checks.json`,JSON.stringify({checks,errors},null,2));console.log({checks:checks.length,errors});
}finally{await browser.close();}

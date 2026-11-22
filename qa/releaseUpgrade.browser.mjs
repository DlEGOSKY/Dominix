import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {openHomeMode} from './homeNavigation.mjs';
const {chromium}=await import(process.argv[2]);
const output=process.argv[4],base='http://127.0.0.1:5184/Dominix/';
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const checks=[],errors=[],baselineErrors=[],failedResponses=[];let stage='public';
const profile={
 dominix_save:JSON.stringify({bestRound:8,bestScore:14200,totalRuns:7,totalRoundsPlayed:31}),
 dominix_progression:JSON.stringify({xp:350,level:3,unlockedRewards:['lv2_gold','lv3_skin_obsidian']}),
 dominix_active_skin:'obsidian',dominix_selected_character_v1:'architect',dominix_lang:'es',dominix_tutorial_done:'1',dominix_muted:'1',
 dominix_run_history:JSON.stringify([{id:'qa-legacy',date:'22 nov QA',timestamp:1795305600000,rounds:8,totalScore:14200,tilesPlayed:42,patternsActivated:17,relicsCollected:4,bossesDefeated:1,shopPurchases:3,bestCombo:4,goldEarned:88,highestRoundScore:3000,relicIds:[],isDaily:false,roundScores:[1000,1200,1500,1600,1800,2000,2100,3000]}]),
};
const snapshot=page=>page.evaluate(keys=>Object.fromEntries(keys.map(key=>[key,localStorage.getItem(key)])),Object.keys(profile));
const checkpoint=page=>page.evaluate(()=>{window.dispatchEvent(new Event('dominix-save-before-reload'));const raw=localStorage.getItem('dominix_active_run_v1');return raw?JSON.parse(JSON.parse(raw).body):null;});
try{
 const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:'reduce'});
 await context.request.post('http://127.0.0.1:5184/__qa_mode',{data:'public'});
 const page=await context.newPage();
 page.on('pageerror',e=>(stage==='public'?baselineErrors:errors).push(String(e)));
 page.on('console',m=>{if(m.type()==='error')(stage==='public'?baselineErrors:errors).push(m.text());});
 page.on('response',r=>{if(stage==='candidate'&&r.status()>=400)failedResponses.push({status:r.status(),url:r.url()});});
 await page.goto(base,{waitUntil:'networkidle'});await page.getByRole('heading',{name:'DOMINIX',exact:true}).waitFor();
 await page.evaluate(profile=>{for(const [key,value]of Object.entries(profile))localStorage.setItem(key,value);},profile);
 await page.reload({waitUntil:'networkidle'});await page.getByRole('heading',{name:'DOMINIX',exact:true}).waitFor();
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 const before=await snapshot(page);assert.deepEqual(before,profile);checks.push({case:'published-build-loads-with-prepared-legacy-profile',realPublishedAssets:true});
 await page.screenshot({path:`${output}/publicada-menu-1280.png`,fullPage:true});
 await context.request.post('http://127.0.0.1:5184/__qa_mode',{data:'candidate'});stage='candidate';
 await page.reload({waitUntil:'networkidle'});await page.getByRole('heading',{name:'DOMINIX',exact:true}).waitFor();assert.deepEqual(await snapshot(page),before);
 const worker=await readFile(`${output}/pages-dist/sw.js`,'utf8');const revision=worker.match(/CACHE_VERSION = "([^"]+)"/)[1];
 await page.evaluate(async()=>{await (await navigator.serviceWorker.ready).update();});
 await page.waitForFunction(async revision=>(await caches.keys()).includes(`dominix-/Dominix/-static-${revision}`),revision,{timeout:60000});
 assert.deepEqual(await snapshot(page),before);checks.push({case:'upgrade-preserves-existing-profile',version:revision,scopedAt:'/Dominix/'});
 const assets=await page.evaluate(async()=>{const registration=await navigator.serviceWorker.ready;const cacheNames=await caches.keys();const latest=cacheNames.filter(n=>n.startsWith('dominix-/Dominix/-static-v5-')).at(-1);const cache=await caches.open(latest);const keys=await cache.keys();return {scope:registration.scope,assets:keys.length,paths:keys.map(r=>new URL(r.url).pathname)};});
 assert(assets.paths.every(p=>p.startsWith('/Dominix/')));assert(assets.paths.some(p=>p.includes('CollectionScreen')));checks.push({case:'complete-scoped-offline-cache',...assets});
 await page.getByRole('button',{name:/^Apariencia/}).click();await page.locator('.skin-wardrobe').waitFor();assert.equal(await page.locator('[data-catalog-skin]').count(),31);await page.getByRole('button',{name:'Volver',exact:true}).click();
 await page.screenshot({path:`${output}/actualizacion-menu-1280.png`,fullPage:true});await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth===document.documentElement.clientWidth));await page.screenshot({path:`${output}/actualizacion-menu-390.png`,fullPage:true});
 await page.setViewportSize({width:1280,height:1000});await context.setOffline(true);await page.reload({waitUntil:'networkidle'});await page.getByRole('heading',{name:'DOMINIX',exact:true}).waitFor();assert.deepEqual(await snapshot(page),before);checks.push({case:'upgraded-app-reloads-offline-with-same-profile'});
 await openHomeMode(page,'Endless');await page.locator('.hand-panel').waitFor();const intro=page.getByText(/toca para continuar/i);if(await intro.count())await intro.click();await page.locator('.hand-panel button[data-tile-id]:enabled').first().click();await page.waitForTimeout(350);
 const played=await checkpoint(page);assert.equal(played.states.game.chain.placed.length,1);await page.getByRole('button',{name:'Guardar y salir',exact:true}).click();await page.reload({waitUntil:'networkidle'});await page.getByRole('button',{name:/^Continuar partida/}).click();await page.locator('.hand-panel').waitFor();const resumed=await checkpoint(page);assert.deepEqual(resumed.states.game,played.states.game);assert.deepEqual(resumed.rng,played.rng);assert.deepEqual(await snapshot(page),before);checks.push({case:'new-run-and-offline-resume-after-upgrade',sameGameAndRng:true});
 await context.setOffline(false);assert.deepEqual(failedResponses,[]);assert.deepEqual(errors,[]);console.log(JSON.stringify({checks:checks.length,errors,baselineErrors}));
}finally{await browser.close();await writeFile(`${output}/release-upgrade.json`,JSON.stringify({checks,errors,baselineErrors,failedResponses},null,2));}

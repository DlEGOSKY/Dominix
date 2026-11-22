import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {openHomeMode,waitForHome} from './homeNavigation.mjs';
const {chromium}=await import(process.argv[2]);const browser=await chromium.launch({executablePath:process.argv[3],headless:true});const output=process.argv[4],checks=[],errors=[];
const snapshot=page=>page.evaluate(()=>Object.fromEntries(['dominix_active_run_v1','dominix_progression','dominix_save','dominix_active_skin'].map(k=>[k,localStorage.getItem(k)])));
const viewports=[{width:1280,height:900},{width:390,height:844},{width:320,height:568},{width:844,height:390},{width:1920,height:1080}];
try{for(const lang of ['es','en']){
 const labels=lang==='es'?{menu:'Menú',modes:'Otros modos',progress:'Tu progreso',close:'Cerrar',newRun:'Nueva Run',saveExit:'Guardar y salir',daily:'Reto Diario',weekly:'Reto Semanal',chaos:'Caos',settings:'Opciones',characters:'Personajes',talents:'Talentos',stats:'Estadísticas',ranking:'Ranking',achievements:'Logros',collection:'Colección',codex:'Codex',help:'Cómo jugar'}:{menu:'Menu',modes:'Other modes',progress:'Your progress',close:'Close',newRun:'New Run',saveExit:'Save and exit',daily:'Daily Challenge',weekly:'Weekly Challenge',chaos:'Chaos',settings:'Settings',characters:'Characters',talents:'Talents',stats:'Stats',ranking:'Leaderboard',achievements:'Achievements',collection:'Collection',codex:'Codex',help:'How to play'};
 const context=await browser.newContext({viewport:viewports[0],reducedMotion:'reduce'});await context.addInitScript(lang=>{if(!sessionStorage.getItem('home-test-seeded')){localStorage.setItem('dominix_lang',lang);localStorage.setItem('dominix_tutorial_done','1');localStorage.setItem('dominix_settings_v1',JSON.stringify({muted:true}));sessionStorage.setItem('home-test-seeded','1');}},lang);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});let dialogDecision='dismiss';page.on('dialog',d=>dialogDecision==='accept'?d.accept():d.dismiss());
 await page.goto('http://127.0.0.1:5176/',{waitUntil:'networkidle'});await waitForHome(page);assert.equal(await page.getByRole('main').count(),1);
 for(const state of ['fresh','returning']){
  if(state==='returning'){
   await page.evaluate(()=>{localStorage.setItem('dominix_save',JSON.stringify({bestRound:6,bestScore:7364,totalRuns:2,totalRoundsPlayed:9}));localStorage.setItem('dominix_progression',JSON.stringify({xp:493,level:3,unlockedRewards:['lv2_gold','lv3_skin_obsidian']}));localStorage.setItem('dominix_active_skin','among_us');});await page.reload({waitUntil:'networkidle'});await waitForHome(page);await openHomeMode(page,'Endless');await page.locator('.hand-panel').waitFor();const intro=page.getByText(/(toca|tap).*continu/i);if(await intro.count())await intro.click();await page.getByRole('button',{name:labels.saveExit,exact:true}).click();await waitForHome(page);await page.waitForTimeout(500);
  }
  const before=await snapshot(page);
  for(const viewport of viewports){await page.setViewportSize(viewport);await page.evaluate(()=>window.scrollTo(0,0));
   const primary=page.locator('[data-home-primary]');assert.equal(await primary.getAttribute('data-home-primary'),state==='fresh'?'new':'continue');assert(await primary.isVisible());
   const bounds=await primary.boundingBox();assert(bounds.y>=0&&bounds.y+bounds.height<=viewport.height);assert(await page.evaluate(()=>document.documentElement.scrollWidth===document.documentElement.clientWidth));
   const hitboxes=await page.locator('.home-screen button').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().height));assert(hitboxes.every(height=>height>=44));
   await page.locator('.home-identity h1').click();await page.screenshot({path:`${output}/menu-${state}-${lang}-${viewport.width}x${viewport.height}.jpg`,type:'jpeg',quality:92,fullPage:true});checks.push({lang,state,...viewport,primaryVisible:true,noHorizontalOverflow:true,targetsAtLeast44px:true});
   for(const panel of ['menu','modes','progress']){
    const trigger=panel==='progress'?page.getByRole('button',{name:new RegExp('^'+labels.progress)}):page.getByRole('button',{name:labels[panel],exact:true});await trigger.click();const dialog=page.getByRole('dialog');await dialog.waitFor();
    assert(await dialog.evaluate(el=>el.open&&el.getAttribute('aria-modal')==='true'));for(let n=0;n<4;n++){await page.keyboard.press('Tab');assert(await dialog.evaluate(el=>el.contains(document.activeElement)),`${panel} Tab ${n}: ${await page.evaluate(()=>document.activeElement.outerHTML.slice(0,120))}`);}
    if(panel==='menu')for(const key of ['characters','talents','collection','codex','stats','ranking','achievements','settings'])assert.equal(await dialog.getByRole('button',{name:labels[key],exact:true}).count(),1);
    if(panel==='modes')for(const name of [labels.daily,labels.weekly,'Endless',labels.chaos])assert.equal(await dialog.getByRole('button',{name,exact:true}).count(),1);
    if(panel==='progress'){const bar=dialog.getByRole('progressbar');assert.equal(await bar.getAttribute('aria-valuenow'),state==='fresh'?'0':'193');if(state==='returning')assert.equal(await bar.getAttribute('aria-valuemax'),'200');}
    assert(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1));if(state==='returning'&&[1280,390].includes(viewport.width))await dialog.screenshot({path:`${output}/menu-panel-${panel}-${lang}-${viewport.width}.jpg`,type:'jpeg',quality:92});
    await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});assert(await trigger.evaluate(el=>el===document.activeElement));assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
   }
  }
  assert.deepEqual(await snapshot(page),before);checks.push({lang,state,panelsPreservedSave:true,keyboardContainedAndFocusRestored:true});
 }
 await page.setViewportSize(viewports[0]);
 async function back(){await page.locator('.home-screen').waitFor({state:'detached'});await page.getByRole('button',{name:/^(←\s*)?(Volver|Back)(\s|$)/}).first().click();await waitForHome(page);}
 // Cancel setup and both replacement paths; an existing checkpoint must survive.
 const checkpoint=await snapshot(page);await page.getByRole('button',{name:labels.newRun,exact:true}).click();await page.getByRole('button',{name:lang==='es'?'Cancelar':'Cancel',exact:true}).click();assert.deepEqual(await snapshot(page),checkpoint);
 await page.getByRole('button',{name:labels.newRun,exact:true}).click();await page.getByRole('button',{name:lang==='es'?'Iniciar Run':'Start Run',exact:true}).click();await page.locator('.home-screen').waitFor({state:'detached'});await page.getByRole('button',{name:/^(Iniciar run con|Start run with)/}).click();assert.deepEqual(await snapshot(page),checkpoint);await back();
 await openHomeMode(page,'Endless');await waitForHome(page);assert.deepEqual(await snapshot(page),checkpoint);checks.push({lang,canceledSetupAndReplacementPreserveCheckpoint:true});
 for(const key of ['characters','talents','stats','ranking','achievements','codex','settings']){await page.getByRole('button',{name:labels.menu,exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:labels[key],exact:true}).click();await back();}
 for(const key of ['collection','help']){await page.getByRole('button',{name:labels[key],exact:true}).click();await back();}
 for(const key of ['weekly','chaos']){await openHomeMode(page,labels[key]);await back();}checks.push({lang,allElevenDestinationsOpenAndReturn:true});
 await page.getByRole('button',{name:/^(Apariencia|Appearance)/}).click();await page.locator('.skin-wardrobe').waitFor();await back();checks.push({lang,appearanceOpensSkinsDirectly:true});
 // A completed daily challenge stays disabled after moving into the mode sheet.
 await page.evaluate(()=>{const now=new Date();localStorage.setItem('dominix_daily',JSON.stringify({seed:now.getFullYear()*10000+now.getMonth()*100+now.getDate(),completed:true,bestRound:6}));});await page.getByRole('button',{name:labels.modes,exact:true}).click();assert(await page.getByRole('dialog').getByRole('button',{name:lang==='es'?'Diario completado':'Daily complete',exact:true}).isDisabled());await page.keyboard.press('Escape');checks.push({lang,completedDailyStillDisabled:true});
 // Resume the genuine checkpoint through the new primary, offline.
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});await context.setOffline(true);await page.reload({waitUntil:'networkidle'});await waitForHome(page);await page.locator('[data-home-primary="continue"]').click();await page.locator('.hand-panel').waitFor();assert.equal(await page.locator('dialog[open]').count(),0);checks.push({lang,primaryContinuesOffline:true});await context.close();
 }assert.deepEqual(errors,[]);await writeFile(`${output}/menu-verificacion.json`,JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks:checks.length,errors},null,2));
}catch(error){console.log(JSON.stringify({checks:checks.length,errors},null,2));throw error;}finally{await browser.close();}

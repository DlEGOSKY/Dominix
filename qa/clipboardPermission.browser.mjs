import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {openHomeMode} from './homeNavigation.mjs';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],checks=[],errors=[];
try{
 const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:'reduce'});
 await context.addInitScript(()=>{localStorage.setItem('dominix_lang','es');localStorage.setItem('dominix_tutorial_done','1');localStorage.setItem('dominix_muted','1');});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const origin='http://127.0.0.1:5176';await page.goto(origin,{waitUntil:'networkidle'});await openHomeMode(page,'Endless');await page.locator('.hand-panel').waitFor();const intro=page.getByText(/toca para continuar/i);if(await intro.count())await intro.click();
 const seed=page.getByRole('button',{name:/^Semilla .+Copiar al portapapeles/});
 await context.grantPermissions(['clipboard-read','clipboard-write'],{origin});await seed.click();await page.getByText(/^Semilla copiada:/).waitFor();
 const expected=(await seed.getAttribute('aria-label')).match(/^Semilla (.+)\. Copiar/)[1];assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),expected);checks.push({case:'real-browser-seed-copy',value:expected});
 const cdp=await context.newCDPSession(page);await context.clearPermissions();
 const {targetInfo:{browserContextId}}=await cdp.send('Target.getTargetInfo');
 for(const allowWithoutSanitization of [true,false])await cdp.send('Browser.setPermission',{permission:{name:'clipboard-write',allowWithoutSanitization},setting:'denied',origin,browserContextId});
 const permission=await page.evaluate(async()=>(await navigator.permissions.query({name:'clipboard-write'})).state);assert.equal(permission,'denied');
 await seed.click();await page.getByText(/^No se pudo copiar\. Semilla:/).waitFor();checks.push({case:'real-browser-denied-write',apiStub:false,permission,valueRemainsVisible:true});
 await page.screenshot({path:`${output}/semilla-permiso-denegado.png`,fullPage:true});
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));await seed.click();await page.getByText(/^No se pudo copiar\. Semilla:/).waitFor();checks.push({case:'seed-api-absent',apiStub:true});
  await page.getByRole('button',{name:'Guardar y salir',exact:true}).click();
  await page.evaluate(()=>localStorage.setItem('dominix_run_history',JSON.stringify([{id:'qa-denied',date:'17 nov QA',timestamp:Date.now(),rounds:3,totalScore:500,tilesPlayed:12,patternsActivated:2,relicsCollected:1,bossesDefeated:0,shopPurchases:0,bestCombo:2,goldEarned:10,highestRoundScore:250,relicIds:[],isDaily:false,roundScores:[100,150,250]}])));
  // Reload restores the native API; Chromium's denied permission remains set.
  await page.reload({waitUntil:'networkidle'});await page.getByRole('button',{name:'Menú',exact:true}).click();await page.getByRole('button',{name:'Estadísticas',exact:true}).click();await page.getByRole('button',{name:'Historial',exact:true}).click();await page.getByRole('button',{name:/17 nov QA/}).click();await page.getByRole('button',{name:'Compartir',exact:true}).click();await page.getByRole('textbox',{name:'Resumen para copiar manualmente'}).waitFor();assert.equal(await page.getByRole('button',{name:'Copiado!',exact:true}).count(),0);checks.push({case:'real-browser-denied-history-summary',apiStub:false,preparedHistory:true,manualFallback:true});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,errors}));
}finally{await browser.close();await writeFile(`${output}/clipboard-permission-verificacion.json`,JSON.stringify({checks,errors},null,2));}

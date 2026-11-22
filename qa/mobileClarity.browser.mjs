import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],saved=await readFile(`${output}/profile-checkpoint.json`,'utf8'),checks=[],errors=[];
try {
 for(const lang of ['es','en']) {
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  await context.addInitScript(({saved,lang})=>{
   localStorage.setItem('dominix_lang',lang);localStorage.setItem('dominix_tutorial_done','1');
   localStorage.setItem('dominix_settings_v1',JSON.stringify({muted:true,reduceMotion:true}));localStorage.setItem('dominix_active_run_v1',saved);
  },{saved,lang});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:5176/',{waitUntil:'networkidle'});await page.getByRole('button',{name:/^(Continuar partida|Continue run)/}).click();await page.locator('.hand-panel').waitFor();
  await page.keyboard.press('u');await page.waitForTimeout(250);
  assert(await page.getByText(lang==='es'?'Juega al menos una ficha para avanzar':'Play at least one tile to advance',{exact:true}).isVisible());
  for(const [width,height] of [[390,844],[320,568],[844,390]]) {
   await page.setViewportSize({width,height});await page.locator('.hand-panel').scrollIntoViewIfNeeded();
   const geometry=await page.evaluate(()=>[...document.querySelectorAll('[data-hand-piece]')].map(piece=>{
    const tile=piece.querySelector('[data-tile-id]').getBoundingClientRect(),discard=piece.querySelector('.hand-discard').getBoundingClientRect();
    return {width:discard.width,height:discard.height,belowTile:discard.top>=tile.bottom};
   }));
   assert(geometry.length>0&&geometry.every(g=>g.width>=44&&g.height>=44&&g.belowTile));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth===document.documentElement.clientWidth));
   await page.screenshot({path:`${output}/hand-${lang}-${width}.png`});checks.push({case:'touch-discard',lang,width,height,minimum44px:true,noTileOverlap:true,noHorizontalOverflow:true});
  }
  await page.setViewportSize({width:390,height:844});await page.locator('.hand-panel button[data-tile-id]:enabled').first().click();
  await page.getByText(lang==='es'?'Puedes cerrar para avanzar':'Close the chain to advance',{exact:true}).waitFor();
  assert.equal(await page.getByText(lang==='es'?'Faltan 45':'45 to go',{exact:true}).count(),0);
  await page.getByRole('button',{name:lang==='es'?'Cerrar cadena':'Close chain',exact:true}).click();
  const card=page.locator('[data-round-outcome="win"]');await card.waitFor();
  await card.scrollIntoViewIfNeeded();assert((await card.innerText()).includes(lang==='es'?'referencia':'reference'));
  assert((await card.innerText()).includes(lang==='es'?'referencia es opcional':'reference is optional'));
  assert.equal(await page.locator('[data-score-breakdown] > div').count(),0);
  await page.screenshot({path:`${output}/endless-${lang}-390.png`});
  await page.locator('[data-score-breakdown] summary').click();await page.locator('[data-score-breakdown] > div').waitFor();
  checks.push({case:'endless-and-lazy-breakdown',lang,optionalReferenceClear:true,realWinningClose:true,detailsMountedOnDemand:true});
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log({checks:checks.length,errors});
}finally{await browser.close();await writeFile(`${output}/mobile-clarity.json`,JSON.stringify({checks,errors},null,2));}

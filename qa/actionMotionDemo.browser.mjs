import {resolve} from "node:path";
import {openHomeMode} from "./homeNavigation.mjs";
process.env.PLAYWRIGHT_BROWSERS_PATH=resolve(process.argv[4],"../qa-tools/browsers");
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4];
try {
 const context=await browser.newContext({viewport:{width:1100,height:1050},reducedMotion:"no-preference",recordVideo:{dir:resolve(output,"demo-video"),size:{width:1100,height:1050}}});
 await context.addInitScript(()=>{localStorage.setItem("dominix_lang","es");localStorage.setItem("dominix_tutorial_done","1");localStorage.setItem("dominix_active_skin","eclipse_glass");localStorage.setItem("dominix_settings_v1",JSON.stringify({muted:true,reduceMotion:false,fastAnimations:false}));});
 const page=await context.newPage();const video=page.video();
 await page.goto("http://127.0.0.1:5176/",{waitUntil:"networkidle"});await openHomeMode(page,"Endless");await page.locator('.hand-panel').waitFor();const intro=page.getByText(/toca para continuar/i);if(await intro.count())await intro.click();
 await page.locator('.tactical-actions').scrollIntoViewIfNeeded();await page.waitForTimeout(900);
 await page.keyboard.press("1");await page.waitForTimeout(1000);
 await page.keyboard.press("u");await page.waitForTimeout(1000);
 await page.keyboard.press("r");await page.waitForTimeout(1000);
 const discard=page.locator('.hand-discard').last();await discard.locator('xpath=..').hover();await discard.click();await page.waitForTimeout(1000);
 await page.keyboard.press("1");await page.waitForTimeout(1000);
 await page.getByRole("button",{name:"Cerrar cadena",exact:true}).click();await page.waitForTimeout(1300);
 await context.close();await video.saveAs(resolve(output,"acciones-mesa-demo.webm"));console.log("Demo real: colocar, deshacer, robar, descartar y cerrar.");
} finally {await browser.close();}

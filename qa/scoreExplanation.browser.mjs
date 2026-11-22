import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const {chromium}=await import(process.argv[2] || "playwright");
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4];
const results=[];
try { for(const lang of ["es","en"]) {
  const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:"reduce"});
  const page=await context.newPage();const errors=[];page.on("pageerror",e=>errors.push(String(e)));
  await page.goto("http://127.0.0.1:5178/qa/ui.html?scene=tactical",{waitUntil:"networkidle"});
  await page.getByRole("combobox",{name:"Idioma de vista QA"}).selectOption(lang);
  for(const width of [1280,390]) {
    await page.setViewportSize({width,height:900});
    const inspect=page.getByRole("button",{name:lang==="es"?"Explicar puntuación de 1 | 4":"Explain score for 1 | 4",exact:true});
    await inspect.click();
    const dialog=page.getByRole("dialog",{name:lang==="es"?"Puntuación de 1 | 4":"Score for 1 | 4",exact:true});
    await dialog.waitFor();
    assert((await dialog.innerText()).includes("20 → 501"));
    assert.equal(await dialog.locator("tbody tr").last().locator("td").last().innerText(),"501");
    await dialog.getByRole("button",{name:lang==="es"?"Extremo derecho":"Right end",exact:true}).click();
    assert((await dialog.innerText()).includes("(+481)"));
    assert(!(await dialog.innerText()).includes("explain.stage."));
    await dialog.locator('[data-score-sources] summary').click();
    assert((await dialog.innerText()).includes(lang==="es"?"Reliquias equipadas":"Equipped relics"));
    assert((await dialog.innerText()).includes(lang==="es"?"factor de partida":"pattern bonus factor"));
    assert(await page.evaluate(()=>document.documentElement.clientWidth===document.documentElement.scrollWidth));
    if(output)await page.screenshot({path:`${output}/explicacion-${lang}-${width}-2026-11-14.jpg`,type:"jpeg",quality:90});
    await page.keyboard.press("Escape");await dialog.waitFor({state:"hidden"});
    assert(await inspect.evaluate(el=>document.activeElement===el));
    assert((await page.getByRole("status").first().innerText()).includes("Score 20"));
    results.push({lang,width,preview:481,total:501,sourcesExpanded:true,inspectingDidNotPlay:true,errors});
  }
  await context.close();
}}finally{await browser.close();if(output)await writeFile(`${output}/explicacion-verificacion-2026-11-14.json`,JSON.stringify(results,null,2));}
console.log(JSON.stringify(results,null,2));

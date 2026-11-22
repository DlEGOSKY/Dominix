import assert from "node:assert/strict";
import {mkdir,writeFile,readFile} from "node:fs/promises";
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],ids=["among_us","hollow_knight","one_piece","roma_eterna"],faces=[];
const version=Number(process.argv[5]??2),romanBaseline=process.argv[6];let unchangedRomanFaces=0;
try{
  const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:"reduce"});
  await page.goto("http://127.0.0.1:5178/qa/numericFaces.html",{waitUntil:"networkidle"});await page.evaluate(()=>document.fonts.ready);
  if(version>=4){await page.getByRole('checkbox',{name:'Mostrar números auxiliares',exact:true}).check();await page.locator('[data-collection="among_us"]').screenshot({path:`${output}/among-us-placa-tamanos-reales.jpg`,type:'jpeg',quality:94});await page.getByRole('checkbox',{name:'Mostrar números auxiliares',exact:true}).uncheck();}
  const metadata=await page.evaluate(async ids=>{const {getSkinCharacters,getCollectionCast}=await import("/src/engine/skinCharacters.ts");return ids.map(id=>({id,es:getSkinCharacters(id,"es"),en:getSkinCharacters(id,"en"),cast:getCollectionCast(id,"es")}));},ids);
  for(const id of ids){await mkdir(`${output}/numeric-skins-v${version}/${id}`,{recursive:true});for(let value=0;value<7;value++){
    const frame=page.locator(`[data-collection="${id}"] [data-export-face="${value}"]`);
    await frame.evaluate(el=>{el.style.width="128px";el.style.height="128px";el.style.borderWidth="0";el.style.position="fixed";el.style.left="0px";el.style.top="0px";el.style.zIndex="1000";});
    const png=await frame.locator("[data-numeric-face]").screenshot();assert.equal(png.readUInt32BE(16),128);assert.equal(png.readUInt32BE(20),128);
    if(id==="roma_eterna"&&romanBaseline){assert(png.equals(await readFile(`${romanBaseline}/${value}.png`)),`Approved Roman face ${value} changed`);unchangedRomanFaces++;}
    await writeFile(`${output}/numeric-skins-v${version}/${id}/${value}.png`,png);const info=metadata.find(m=>m.id===id);
    faces.push({collection:id,value,name_es:info.es[value].name,name_en:info.en[value].name,detail_es:info.es[value].detail,detail_en:info.en[value].detail,file:`${id}/${value}.png`,width:128,height:128,bytes:png.length});
    await frame.evaluate(el=>{el.removeAttribute("style");});
  }}
  await page.addStyleTag({content:"[data-face-samples], section details, header label, [data-stress-fixtures] { display:none !important; }"});
  await page.screenshot({path:`${output}/identidad-numerica-resumen-v${version}-2026-11-14.jpg`,type:"jpeg",quality:94,fullPage:true});
  const result={files:faces.length,size:128,bytes:faces.reduce((sum,f)=>sum+f.bytes,0),unchangedRomanFaces};
  await writeFile(`${output}/numeric-skins-v${version}/manifest.json`,JSON.stringify({version,generatedBy:"Rendered from the real numeric face component; no AI regeneration",helperNumbers:false,...result,faces,cast:metadata.map(m=>({collection:m.id,characters:m.cast}))},null,2));
  console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}

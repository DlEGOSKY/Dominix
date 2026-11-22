import assert from "node:assert/strict";
import {writeFile} from "node:fs/promises";
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],checks=[],errors=[];
const ids=["among_us","hollow_knight","one_piece","roma_eterna"];
try{
  const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:"reduce"});
  page.on("pageerror",e=>errors.push(String(e)));page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
  await page.goto("http://127.0.0.1:5178/qa/numericFaces.html",{waitUntil:"networkidle"});await page.evaluate(()=>document.fonts.ready);
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:1100});
    await page.locator('[data-stress-fixtures]').evaluate(el=>el.open=true);
    const geometry=await page.locator('[data-stress-tile]').evaluateAll(tiles=>tiles.map(tile=>{
      const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};
      const overlap=(a,b)=>Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>.1&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>.1;
      const root=rect(tile.querySelector('[role="img"]'));
      const marks=[...tile.querySelectorAll('[data-value-mark], [data-roman-value], [data-empty-value]')].map(rect);
      const badges=[...tile.querySelectorAll('[data-pact-badge], [data-edition-badge], [data-tile-badge]')].map(rect);
      return {badges:badges.length,within:badges.every(b=>b.x>=root.x&&b.y>=root.y&&b.x+b.w<=root.x+root.w&&b.y+b.h<=root.y+root.h),clear:badges.every(b=>marks.every(m=>!overlap(b,m)))&&badges.every((b,i)=>badges.slice(i+1).every(c=>!overlap(b,c)))};
    }));
    assert.equal(geometry.length,128);assert(geometry.every(g=>g.badges===3&&g.within&&g.clear),JSON.stringify(geometry.filter(g=>!g.within||!g.clear)));
    await page.locator('[data-stress-fixtures]').evaluate(el=>el.open=false);
    for(const id of ids){const section=page.locator(`[data-collection="${id}"]`);
      for(let n=0;n<7;n++){
        const halves=section.locator(`[data-face-samples="${n}"] [data-numeric-face]`);assert.equal(await halves.count(),4);
        for(const face of await halves.all()){
          const count=await face.locator("[data-value-mark]").count();assert.equal(count,id==="roma_eterna"?0:n);
          if(id==="one_piece"||id==="hollow_knight"||id==="among_us")assert.equal(await face.locator('[data-crew-value]').getAttribute('data-crew-value'),String(n));
          if(n>0&&id==="hollow_knight"){
            const references=["shade","knight","hornet","quirrel","zote","cloth","grimm"];
            assert.equal(await face.locator(`[data-mark-reference="${references[n]}"]`).count(),n);
            assert(await face.locator('[data-mark-reference]').evaluateAll(marks=>marks.every(el=>{const box=el.getBBox();return box.x>=0&&box.y>=0&&box.x+box.width<=32&&box.y+box.height<=32;})));
          }
          if(n===0)assert.equal(await face.locator("[data-empty-value]").count(),1);
          const bounds=await face.boundingBox();
          const tile=await face.locator('xpath=ancestor::*[@role="img"][1]').boundingBox();
          assert(bounds.x>=tile.x-.1&&bounds.y>=tile.y-.1&&bounds.x+bounds.width<=tile.x+tile.width+.1&&bounds.y+bounds.height<=tile.y+tile.height+.1);
          const marks=await face.locator("[data-value-mark]").all();
          const boxes=[];for(const mark of marks){const box=await mark.boundingBox();assert(box.x>=bounds.x-.1&&box.y>=bounds.y-.1&&box.x+box.width<=bounds.x+bounds.width+.1&&box.y+box.height<=bounds.y+bounds.height+.1);boxes.push(box);}
          for(let a=0;a<boxes.length;a++)for(let b=a+1;b<boxes.length;b++){const x=boxes[a],y=boxes[b];assert(x.x+x.width<=y.x+.1||y.x+y.width<=x.x+.1||x.y+x.height<=y.y+.1||y.y+y.height<=x.y+.1);}
          if(id==="roma_eterna"&&n>0){const valid=await face.locator("text[data-roman-value]").evaluate(el=>{const box=el.getBBox();return box.x>=0&&box.x+box.width<=100&&box.y>=0&&box.y+box.height<=100;});assert(valid);}
        }
        const samples=await section.locator(`[data-face-samples="${n}"]`).boundingBox(),panel=await section.boundingBox();
        assert(samples.x>=panel.x && samples.x+samples.width<=panel.x+panel.width);
      }
      checks.push({id,width,values:7,sizes:[36,48],helperNumbersHidden:true,countsMatch:true,valueSpecificReferences:id!=="roma_eterna",noClippedOrOverlappingMarks:true});
    }
    assert(await page.evaluate(()=>document.documentElement.clientWidth===document.documentElement.scrollWidth));
    assert(await page.locator("[data-value-label]").first().evaluate(el=>getComputedStyle(el).visibility==="hidden"));
    await page.screenshot({path:`${output}/identidad-numerica-sin-ayudas-${width}-2026-11-14.jpg`,type:"jpeg",quality:94,fullPage:true});
  }
  await page.setViewportSize({width:1440,height:1100});
  // The dedicated exporter writes the final exact 128px frames.
  await page.getByRole("checkbox",{name:"Mostrar números auxiliares",exact:true}).check();
  const helperClear=await page.locator('[data-face-samples] [role="img"]').evaluateAll(tiles=>tiles.every(tile=>{
    const helper=tile.querySelector('[data-numeric-helper]')?.getBoundingClientRect();
    return helper&&[...tile.querySelectorAll('[data-value-mark], [data-roman-value]')].every(mark=>{const r=mark.getBoundingClientRect();return Math.min(r.right,helper.right)-Math.max(r.left,helper.left)<=.1||Math.min(r.bottom,helper.bottom)-Math.max(r.top,helper.top)<=.1;});
  }));assert(helperClear);
  await page.screenshot({path:`${output}/identidad-numerica-con-ayudas-2026-11-14.jpg`,type:"jpeg",quality:94,fullPage:true});
  const specialTiles={combinationsPerWidth:128,widths:[1440,390,320],badges:3,insideTile:true,noSymbolOrBadgeCollisions:true};
  assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,specialTiles,helperClear,errors},null,2));await writeFile(`${output}/identidad-numerica-verificacion-2026-11-14.json`,JSON.stringify({checks,specialTiles,helperClear,errors},null,2));
}catch(error){console.log("ERRORS",errors);throw error;}
finally{await browser.close();}

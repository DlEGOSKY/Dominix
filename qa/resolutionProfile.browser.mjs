import {readFile,writeFile} from "node:fs/promises";
import {openHomeMode} from "./homeNavigation.mjs";
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],phase=process.argv[5]??"before";
try{
 const context=await browser.newContext({viewport:{width:1280,height:1000},reducedMotion:"no-preference"});
 const saved=phase==="before"?null:await readFile(`${output}/profile-checkpoint.json`,"utf8");
 await context.addInitScript(saved=>{localStorage.setItem("dominix_lang","es");localStorage.setItem("dominix_tutorial_done","1");localStorage.setItem("dominix_settings_v1",JSON.stringify({muted:true,reduceMotion:false,fastAnimations:false}));if(saved)localStorage.setItem("dominix_active_run_v1",saved);},saved);
 const page=await context.newPage();await page.goto("http://127.0.0.1:5176/",{waitUntil:"networkidle"});
 if(saved)await page.getByRole("button",{name:/^Continuar partida/}).click();else await openHomeMode(page,"Endless");
 await page.locator('.hand-panel').waitFor();const intro=page.getByText(/toca para continuar/i);if(await intro.count())await intro.click();
 if(!saved){for(let i=0;i<5;i++){const tile=page.locator('.hand-panel button[data-tile-id]:enabled').first();if(!await tile.count())break;await tile.click();await page.waitForTimeout(400);}await page.evaluate(()=>window.dispatchEvent(new Event("dominix-save-before-reload")));await writeFile(`${output}/profile-checkpoint.json`,await page.evaluate(()=>localStorage.getItem("dominix_active_run_v1")));}
 await page.waitForTimeout(600);const cdp=await context.newCDPSession(page);await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
 await page.evaluate(()=>{
  const start=performance.now(),frames=[],longTasks=[];window.roundProfile={start,frames,longTasks,ctaMs:null,totalMs:null};let previous=start;
  new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(e=>e.duration))).observe({type:"longtask",buffered:false});
  function visible(el){for(let node=el;node instanceof HTMLElement;node=node.parentElement){if(Number(getComputedStyle(node).opacity)<.95)return false;}return true;}
  function tick(now){frames.push(now-previous);previous=now;const cta=[...document.querySelectorAll('button')].find(el=>el.textContent.trim()==="Elegir recompensa");if(cta){const card=cta.closest('[data-round-outcome]')??cta.parentElement.parentElement;const score=card.querySelector('[data-score-reveal-total]')??card.querySelector('.font-black.tabular-nums');if(window.roundProfile.ctaMs===null&&visible(cta))window.roundProfile.ctaMs=performance.now()-start;if(score&&window.roundProfile.totalMs===null&&visible(score))window.roundProfile.totalMs=performance.now()-start;}if(performance.now()-start<2600)requestAnimationFrame(tick);}
  requestAnimationFrame(tick);
 });
 await page.getByRole("button",{name:"Cerrar cadena",exact:true}).click();await page.waitForTimeout(2800);
 const metrics=await page.evaluate(()=>{const p=window.roundProfile,frames=p.frames.slice(1).sort((a,b)=>a-b);return {ctaMs:p.ctaMs,totalMs:p.totalMs,frames:frames.length,p95FrameMs:frames[Math.floor(frames.length*.95)],longTasks:p.longTasks};});
 await page.screenshot({path:`${output}/cierre-${phase}.jpg`,type:"jpeg",quality:92,fullPage:true});await writeFile(`${output}/perfil-${phase}.json`,JSON.stringify({phase,cpuThrottle:4,...metrics},null,2));console.log(metrics);
}finally{await browser.close();}

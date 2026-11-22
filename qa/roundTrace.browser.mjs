import {readFile,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.argv[2]);
const output=process.argv[4],label=process.argv[5]??'baseline';
const fixture=process.argv[6]??'profile';
const saved=await readFile(`${output}/${fixture}-checkpoint.json`,'utf8');
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const samples=[];
try {
 for(let sample=0;sample<3;sample++) {
  const context=await browser.newContext({viewport:{width:1280,height:1000}});
  await context.addInitScript(saved=>{
   localStorage.setItem('dominix_lang','es');localStorage.setItem('dominix_tutorial_done','1');
   localStorage.setItem('dominix_settings_v1',JSON.stringify({muted:true,reduceMotion:false,fastAnimations:false}));
   localStorage.setItem('dominix_active_run_v1',saved);
  },saved);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:5176/',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:/^Continuar partida/}).click();await page.locator('.hand-panel').waitFor();
  await page.waitForTimeout(600);
  const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await cdp.send('Tracing.start',{categories:'devtools.timeline,v8,blink.user_timing,disabled-by-default-devtools.timeline.stack',transferMode:'ReturnAsStream'});
  await page.evaluate(()=>{
   window.roundMetrics={start:performance.now(),longTasks:[],frames:[],cta:null};let previous=performance.now();
   new PerformanceObserver(list=>window.roundMetrics.longTasks.push(...list.getEntries().map(e=>({start:e.startTime-window.roundMetrics.start,duration:e.duration})))).observe({type:'longtask'});
   function tick(t){const m=window.roundMetrics;m.frames.push(t-previous);previous=t;
    const cta=[...document.querySelectorAll('button')].find(el=>el.textContent.trim()==='Elegir recompensa');
    // rAF's supplied timestamp can predate a long task in the same frame.
    // Measure when this callback actually observes the mounted action instead.
    if(cta&&m.cta===null)m.cta=performance.now()-m.start;if(performance.now()-m.start<2000)requestAnimationFrame(tick);
   }requestAnimationFrame(tick);performance.mark('round-close-start');
  });
  await page.getByRole('button',{name:'Cerrar cadena',exact:true}).click();await page.waitForTimeout(2200);
  const metrics=await page.evaluate(()=>{const m=window.roundMetrics,frames=m.frames.slice(1).sort((a,b)=>a-b);return {cta:m.cta,p95:frames[Math.floor(frames.length*.95)],longTasks:m.longTasks};});
  const complete=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');const {stream}=await complete;
  let trace='';for(;;){const part=await cdp.send('IO.read',{handle:stream});trace+=part.base64Encoded?Buffer.from(part.data,'base64').toString():part.data;if(part.eof)break;}await cdp.send('IO.close',{handle:stream});
  const events=JSON.parse(trace).traceEvents;
  const click=events.find(e=>e.name==='EventDispatch'&&e.args?.data?.type==='click');
  const paint=click&&events.find(e=>e.name==='Paint'&&e.tid===click.tid&&e.ts>=click.ts+click.dur);
  const tasks=events.filter(e=>e.ph==='X'&&e.dur>=2000).sort((a,b)=>b.dur-a.dur).slice(0,25).map(e=>({name:e.name,ms:e.dur/1000,args:e.args,ts:e.ts,tid:e.tid}));
  samples.push({sample,fixture,...metrics,clickTaskMs:click?.dur/1000,firstPaintAfterClickMs:paint?(paint.ts-click.ts)/1000:null,errors,tasks});
  await writeFile(`${output}/trace-${label}-${sample}.json`,trace);
  if(sample===0)await page.screenshot({path:`${output}/round-${label}.png`,fullPage:true});
  await context.close();
 }
 await writeFile(`${output}/trace-summary-${label}.json`,JSON.stringify(samples,null,2));
 console.log(JSON.stringify(samples.map(({sample,cta,p95,longTasks,clickTaskMs,firstPaintAfterClickMs})=>({sample,cta,p95,longTasks,clickTaskMs,firstPaintAfterClickMs}))));
}finally{await browser.close();}

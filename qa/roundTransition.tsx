import { StrictMode, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import RoundTransition from "../src/components/RoundTransition";
import "../src/index.css";
function Scenario(){
  const mode=new URLSearchParams(location.search).get("mode");
  const [ticks,setTicks]=useState(0);
  const [done,setDone]=useState(0);
  const [mounted,setMounted]=useState(true);
  const stable=useCallback(()=>setDone(n=>n+1),[]);
  useEffect(()=>{
    const interval=setInterval(()=>setTicks(n=>n+1),50);
    const timeout=mode==="unmount"?setTimeout(()=>setMounted(false),1250):undefined;
    return()=>{clearInterval(interval);clearTimeout(timeout);};
  },[mode]);
  return <main><h1>RoundTransition · QA</h1><p>Solo componente aislado; callback cambiante cada 50 ms. No acredita una partida.</p>
    <output aria-label="ticks">{ticks}</output><output aria-label="completed">{done}</output>
    {mounted && done===0 && <RoundTransition round={mode==="boss"?5:2} isBoss={mode==="boss"} onComplete={mode==="unmount"?stable:()=>setDone(n=>n+1)}/>}
  </main>;
}
createRoot(document.getElementById("root")!).render(<StrictMode><Scenario/></StrictMode>);

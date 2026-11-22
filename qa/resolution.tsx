import {StrictMode,useState} from "react";
import {createRoot} from "react-dom/client";
import ScoreReveal from "../src/components/ScoreReveal";
import RoundTransition from "../src/components/RoundTransition";
import {createEmptyChain,placeTile} from "../src/engine/chain";
import {calculateScore} from "../src/engine/score";
import {setLanguage} from "../src/engine/i18n";
import {loadSettings} from "../src/engine/settings";
import "../src/index.css";
loadSettings();setLanguage(new URLSearchParams(location.search).get('lang')==='en'?'en':'es');
let chain=createEmptyChain();for(let i=0;i<30;i++)chain=placeTile(chain,{id:`qa-${i}`,top:i%7,bottom:(i+1)%7},'right');const breakdown=calculateScore(chain);
function Fixture(){const [show,setShow]=useState(false);const [count,setCount]=useState(0);return <main className="max-w-lg mx-auto p-4 text-accent-silver">
 <p className="mb-4">Escenario QA: 30 fichas, motor real, sin progresión.</p><ScoreReveal breakdown={breakdown} finalScore={breakdown.total} target={80} won/>
 <button className="p-3 border rounded mt-3" onClick={()=>setShow(true)}>Mostrar transición QA</button><p role="status">Cierres: {count}</p>
 {show&&<RoundTransition round={2} onComplete={()=>{setShow(false);setCount(n=>n+1);}}/>}
 </main>;}
createRoot(document.getElementById('root')!).render(<StrictMode><Fixture/></StrictMode>);

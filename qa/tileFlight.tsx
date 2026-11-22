import { useState } from "react";
import { createRoot } from "react-dom/client";
import Hand from "../src/components/Hand";
import Chain from "../src/components/Chain";
import { useTileFlight } from "../src/hooks/useTileFlight";
import { useSettings } from "../src/hooks/useSettings";
import { createEmptyChain, placeTile, getValidPlacements } from "../src/engine/chain";
import { setLanguage } from "../src/engine/i18n";
import { audio } from "../src/engine/audio";
import type { ChainState, Tile, PlacementSide } from "../src/types/domino";
import type { TileSkin } from "../src/components/TileView";
import "../src/index.css";
setLanguage("es");
const query = new URLSearchParams(location.search);
const requestedSkin = query.get("skin") as TileSkin;
const fixtureSkin: TileSkin = ["ivory","emerald","diamond","obsidian","ruby","imperium","midnight_express"].includes(requestedSkin) ? requestedSkin : "roma_eterna";
const preparedCount = Math.max(1, Math.min(28, Number(query.get("prepared")) || 28));
declare global { interface Window { contacts: Array<{material:string;inFlight:boolean}>; legacyContacts: string[] } }
window.contacts=[];window.legacyContacts=[];
const qaContact=audio.playTileContact.bind(audio),qaPlay=audio.play.bind(audio);
audio.playTileContact=material=>{window.contacts.push({material:material??"stone",inFlight:!!document.querySelector("[data-tile-flight]")});qaContact(material);};
audio.play=name=>{if(name==="tile_place")window.legacyContacts.push(name);qaPlay(name);};
interface Snapshot { chain: ChainState; hand: Tile[] }
const opening = (): Snapshot => ({ chain: createEmptyChain(), hand: [
  {id:"first",top:1,bottom:1},{id:"second",top:1,bottom:2},{id:"third",top:2,bottom:3},
  {id:"fourth",top:0,bottom:1,type:"golden",edition:"negative",pact:true},{id:"fifth",top:3,bottom:1},
] });
function prepared(): Snapshot {
  let chain = createEmptyChain();
  for(let n=0;n<preparedCount;n++)chain=placeTile(chain,{id:`prepared-${n}`,top:n%7,bottom:(n+1)%7},"right");
  return {chain,hand:[{id:"left'[]",top:0,bottom:4},{id:"right",top:preparedCount%7,bottom:5}]};
}
function Board(){
  const [history,setHistory]=useState<Snapshot[]>(()=>[opening()]);
  const current=history[history.length-1]!;
  const {boardRef,captureTile}=useTileFlight(current.chain,"playing",1,fixtureSkin);
  const play=(tile:Tile,side:PlacementSide)=>{
    if(!current.hand.some(t=>t.id===tile.id)||!getValidPlacements(current.chain,tile).includes(side))return;
    captureTile(tile.id,side);
    setHistory(all=>[...all,{chain:placeTile(current.chain,tile,side),hand:current.hand.filter(t=>t.id!==tile.id)}]);
  };
  return <main ref={boardRef} className="max-w-3xl mx-auto px-3 py-5 text-white" data-flight-board>
    <h1 className="text-xl font-bold text-accent-gold">DOMINIX · Colocación</h1>
    <p className="text-xs text-accent-silver mt-2">Escenario QA · Mano, cadena y recorrido reales; sin progresión o recompensas.</p>
    <nav className="flex flex-wrap gap-2 my-4 text-xs" aria-label="Escenarios QA">
      <button className="border rounded p-2" onClick={()=>setHistory([opening()])}>Reiniciar QA</button>
      <button className="border rounded p-2" onClick={()=>setHistory([prepared()])}>Cadena larga QA</button>
      <button className="border rounded p-2" disabled={history.length<2} onClick={()=>setHistory(all=>all.slice(0,-1))}>Deshacer QA</button>
    </nav>
    <p role="status" className="mb-3 text-xs">Mesa {current.chain.placed.length} · Mano {current.hand.length}</p>
    <div className="chain-surface overflow-hidden rounded-xl p-4 mb-8"><Chain chain={current.chain} skin={fixtureSkin}/></div>
    <Hand tiles={current.hand} chain={current.chain} onPlay={play} disabled={false} skin={fixtureSkin}/>
  </main>;
}
function Fixture(){const [show,setShow]=useState(true);const [settings,update]=useSettings();return <>
  <div className="flex flex-wrap gap-3 justify-center text-xs text-accent-silver p-2">
    <button onClick={()=>setShow(v=>!v)}>{show?"Ocultar tablero QA":"Mostrar tablero QA"}</button>
    <label><input type="checkbox" checked={settings.reduceMotion} onChange={e=>update({reduceMotion:e.target.checked})}/>Movimiento reducido QA</label>
    <label><input type="checkbox" checked={settings.fastAnimations} onChange={e=>update({fastAnimations:e.target.checked})}/>Animación rápida QA</label>
  </div>{show&&<Board/>}
</>;}
createRoot(document.getElementById("root")!).render(<Fixture/>);

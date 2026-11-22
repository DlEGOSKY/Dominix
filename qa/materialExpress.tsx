import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import TileView, { type TileSkin } from "../src/components/TileView";
import BossDefeatedOverlay from "../src/components/BossDefeatedOverlay";
import StatsScreen from "../src/components/StatsScreen";
import { ALL_BOSSES } from "../src/engine/boss";
import { localizeSkin } from "../src/engine/i18nContent";
import { getTileSkin } from "../src/engine/tileSkins";
import { playTileArrival } from "../src/engine/tileArrival";
import { loadSettings } from "../src/engine/settings";
import { setLanguage, useTranslation } from "../src/engine/i18n";
import { useReduceMotion, useSettings } from "../src/hooks/useSettings";
import "../src/index.css";
loadSettings();
setLanguage(new URLSearchParams(location.search).get("lang") === "en" ? "en" : "es");
function Fixture() {
  const {lang}=useTranslation(); const reduced=useReduceMotion(); const [settings,update]=useSettings();
  const [boss,setBoss]=useState(false),[completed,setCompleted]=useState(0),[revision,setRevision]=useState(0);
  const [scene,setScene]=useState("art");
  const contacts = useRef<Map<string, () => void>>(new Map());
  useEffect(() => () => { contacts.current.forEach(cancel => cancel()); }, []);
  const materials: TileSkin[]=["ivory","emerald","diamond","obsidian","ruby","imperium"];
  return <MotionConfig reducedMotion={reduced?"always":"user"}>
    <main className="mx-auto max-w-5xl p-4 sm:p-8 text-accent-silver">
      <p className="text-xs text-amber-200 mb-4">QA · componentes de producción · datos preparados · sin progreso de jugador</p>
      <nav className="flex gap-3 flex-wrap mb-6">{["art","stats"].map(s=><button key={s} className="min-h-11 px-4 border rounded" onClick={()=>setScene(s)}>{s}</button>)}
        <button className="min-h-11 px-3 border rounded" onClick={()=>update({fastAnimations:!settings.fastAnimations})}>Rápido {String(settings.fastAnimations)}</button>
        <button className="min-h-11 px-3 border rounded" onClick={()=>update({reduceMotion:!settings.reduceMotion})}>Reducido {String(settings.reduceMotion)}</button>
        <button className="min-h-11 px-3 border rounded" onClick={()=>setBoss(true)}>Victoria de jefe QA</button>
        <button className="min-h-11 px-3 border rounded" onClick={()=>setRevision(n=>n+1)}>Actualizar QA {revision}</button>
      </nav>
      <p data-boss-completed className="mb-6">Cierres: {completed}</p>
      {scene==="art"?<>
        <h1 className="font-display font-black text-3xl text-white">{lang==="es"?"Expreso de medianoche":"Midnight Express"}</h1>
        <p className="text-sm mt-2 mb-6">{lang==="es"?"Madera, latón y ventanas encendidas. Cada ventana cuenta un punto; el compartimento vacío es cero.":"Wood, brass and lit windows. Each window counts as one pip; the empty compartment means zero."}</p>
        <div data-express-gallery className="flex flex-wrap justify-center gap-3 mb-7">
          {[0,1,2,3,4,5,6].map(n=><div key={n} className="flex flex-col items-center gap-2"><TileView staticView skin="midnight_express" tile={{id:`express-${n}`,top:n,bottom:6-n}}/><span className="text-xs font-mono">{n} | {6-n}</span></div>)}
        </div>
        <h2 className="text-lg font-bold mb-3 text-amber-100">{lang==="es"?"Materiales · mano y mesa":"Materials · hand and table"}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {materials.map(skin=><section data-craft-material={skin} key={skin} className="rounded-xl border border-surface-600 bg-surface-800/50 p-3 flex flex-col items-center gap-3">
            <h3 className="text-sm font-bold">{localizeSkin(getTileSkin(skin)).name}</h3>
            <div data-sample-tile className="flex gap-2 items-end"><TileView staticView skin={skin} tile={{id:`craft-${skin}`,top:3,bottom:5}}/><TileView staticView size="sm" skin={skin} tile={{id:`craft-${skin}`,top:3,bottom:5}}/></div>
            <button className="min-h-11 px-3 rounded border border-amber-300/30 text-xs" onClick={event=>{
              const target=event.currentTarget.parentElement!.querySelector<HTMLElement>('[data-tile-id]')!;
              contacts.current.get(skin)?.();
              contacts.current.set(skin,playTileArrival(target,{id:`craft-${skin}`,side:"right",animated:true},{skin,reduced,fast:settings.fastAnimations}));
            }}>{lang==="es"?"Probar contacto":"Try contact"}</button>
          </section>)}
        </div>
        <h2 className="text-lg font-bold my-4">{lang==="es"?"Expreso · estados tácticos":"Express · tactical states"}</h2>
        <div data-express-specials className="flex flex-wrap gap-3 justify-center">
          {(["normal","wild","golden","mirror","bomb","locked"] as const).map(type=><TileView key={type} staticView skin="midnight_express" size="sm" tile={{id:type,top:0,bottom:6,type,pact:true,edition:"foil"}}/>)}
        </div>
      </>:<StatsScreen onBack={()=>setScene("art")}/>}
      {boss&&<BossDefeatedOverlay boss={ALL_BOSSES[0]!} visible onContinue={()=>{setBoss(false);setCompleted(n=>n+1);}}/>}
    </main>
  </MotionConfig>;
}
createRoot(document.getElementById("root")!).render(<StrictMode><Fixture/></StrictMode>);

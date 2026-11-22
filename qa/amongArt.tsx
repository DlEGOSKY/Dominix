import { createRoot } from "react-dom/client";
import { CrewBadgeFace } from "../src/engine/crewBadgeFace";
import TileView from "../src/components/TileView";
import nano from "./assets/among-salvage-nano-v1.webp";
import "../src/index.css";
createRoot(document.getElementById("root")!).render(<main className="max-w-6xl mx-auto p-4 sm:p-7 text-white">
  <header className="mb-6"><p className="text-accent-gold tracking-widest text-xs font-bold">DOMINIX · ARTE DE FICHAS</p><h1 className="text-2xl font-bold mt-2">Among Us · Esmalte y visores</h1><p className="text-xs text-accent-silver mt-2">Dos propuestas reales · Misma composición de puntos en código · 80, 48 y 36 px</p></header>
  {[{id:"higgsfield",title:"Higgsfield · Nano Banana 2.1",detail:"Metal de nave · 2 créditos · Recurso de comparación",atlas:nano},{id:"integrated",title:"Generador integrado · Traje de esmalte",detail:"Ilustración a sangre · Variante integrada en la mesa",atlas:undefined}].map(candidate=><section key={candidate.id} data-art-candidate={candidate.id} className="rounded-xl border border-cyan-200/25 bg-surface-800/40 p-4 mb-5">
    <h2 className="text-lg font-bold">{candidate.title}</h2><p className="text-xs text-accent-silver mb-4">{candidate.detail}</p><div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
      {Array.from({length:7},(_,value)=><figure key={value} className="flex flex-col items-center gap-2"><div className="w-20 h-20 overflow-hidden rounded-md"><CrewBadgeFace value={value} comparisonAtlas={candidate.atlas}/></div><figcaption className="text-xs text-accent-silver">Valor {value}</figcaption><div className="flex gap-1 items-end">{[48,36].map(size=><div key={size} data-real-size={size} style={{width:size,height:size}}><CrewBadgeFace value={value} comparisonAtlas={candidate.atlas}/></div>)}</div></figure>)}
    </div></section>)}
  <section className="rounded-xl border border-accent-gold/25 p-4"><h2 className="text-base font-bold mb-3">Fichas de juego · Render real</h2><div className="flex flex-wrap justify-center gap-3">{Array.from({length:7},(_,n)=><TileView key={n} staticView skin="among_us" size="sm" animate={false} tile={{id:`art-${n}`,top:n,bottom:6-n}}/>)}</div></section>
</main>);

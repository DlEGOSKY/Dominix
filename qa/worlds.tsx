import { createRoot } from "react-dom/client";
import { WORLD_SKIN_IDS } from "../src/engine/worldSkinArt";
import { getTileSkin } from "../src/engine/tileSkins";
import { setLanguage } from "../src/engine/i18n";
import TileView from "../src/components/TileView";
import "../src/index.css";
setLanguage("es");
function Gallery() {
  return <main className="max-w-6xl mx-auto p-6 text-white">
    <header className="mb-6"><p className="text-accent-gold text-xs font-bold tracking-widest">DOMINIX · MUNDOS ORIGINALES</p><h1 className="text-3xl font-black mt-2">Seis mundos. El mismo dominó.</h1><p className="text-accent-silver text-sm mt-2">Fichas reales del juego · 0–6 contables · Arte vectorial original</p></header>
    {WORLD_SKIN_IDS.map(id => {
      const skin=getTileSkin(id);
      return <section key={id} className="rounded-xl border p-5 mb-4 bg-surface-800/50" style={{borderColor:`${skin.accent}55`}}>
        <h2 className="font-bold text-lg" style={{color:skin.accent}}>{skin.name}</h2><p className="text-xs text-accent-silver mt-1 mb-4">{skin.flavor}</p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">{Array.from({length:7},(_,n)=><figure key={n} className="flex flex-col items-center gap-2"><TileView staticView skin={id} tile={{id:`${id}-${n}`,top:n,bottom:6-n}} animate={false}/><figcaption className="text-xs text-accent-silver font-mono">{n} | {6-n}</figcaption></figure>)}</div>
      </section>;
    })}
  </main>;
}
createRoot(document.getElementById("root")!).render(<Gallery/>);

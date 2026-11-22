import { createRoot } from "react-dom/client";
import { getTileSkin } from "../src/engine/tileSkins";
import { getSkinCharacters, getCollectionCast } from "../src/engine/skinCharacters";
import { setLanguage } from "../src/engine/i18n";
import TileView, { type TileSkin } from "../src/components/TileView";
import { romanValue } from "../src/engine/materialArt";
import "../src/index.css";
setLanguage("es");
const ids:TileSkin[]=["among_us","hollow_knight","one_piece","roma_eterna"];
function Gallery(){return <main className="max-w-6xl mx-auto p-5 sm:p-8 text-white">
  <header className="mb-7"><p className="text-accent-gold font-bold text-xs tracking-widest uppercase">DOMINIX · Colecciones ilustradas</p><h1 className="text-3xl font-black mt-2">Cuatro mundos. Una mesa.</h1><p className="text-sm text-accent-silver mt-2">28 retratos · Valores 0–6 · Vistas de las fichas reales</p></header>
  {ids.map(id=>{const skin=getTileSkin(id);return <section key={id} aria-label={skin.name} className="mb-5 border rounded-xl p-4 sm:p-5 bg-surface-800/50" style={{borderColor:skin.accent+"66"}}>
    <div className="flex flex-wrap justify-between items-baseline gap-2 mb-4"><h2 className="font-bold text-lg" style={{color:skin.accent}}>{skin.name}</h2><p className="text-xs text-accent-silver">{skin.flavor}</p></div>
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
      {getSkinCharacters(id,"es").map(c=><figure key={c.value} className="flex flex-col items-center gap-2 min-w-0">
        <div className="w-20 h-20 rounded-lg overflow-hidden border border-surface-600" role="img" aria-label={`${c.value} · ${c.name}`}>{(skin.valueFace ?? skin.valueIcon)?.(c.value)}</div>
        <figcaption className="text-[11px] font-bold text-center min-h-7"><span className="text-accent-gold font-mono">{skin.portraitNumerals==="roman"&&c.value>0?romanValue(c.value):c.value}</span> · {c.name}</figcaption>
        <TileView staticView skin={id} tile={{id:`${id}-${c.value}`,top:c.value,bottom:(c.value+1)%7}} size="sm" animate={false}/>
      </figure>)}
    </div>
    <div className="flex gap-3 flex-wrap mt-4 border-t border-surface-600/40 pt-3" aria-label="Ilustraciones sin valor asignado">{getCollectionCast(id,"es").map(guest=><figure key={guest.frame} className="w-14 text-center"><div className="w-10 h-10 mx-auto">{skin.valueIcon?.(guest.frame)}</div><figcaption className="text-[9px] text-accent-silver">{guest.name}</figcaption></figure>)}</div>
  </section>;})}
</main>;}
createRoot(document.getElementById("root")!).render(<Gallery/>);

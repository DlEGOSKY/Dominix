import { useState } from "react";
import { createRoot } from "react-dom/client";
import { getTileSkin } from "../src/engine/tileSkins";
import { getSkinCharacters, getCollectionCast } from "../src/engine/skinCharacters";
import { setLanguage, t } from "../src/engine/i18n";
import TileView, { type TileSkin } from "../src/components/TileView";
import "../src/index.css";
setLanguage("es");
const ids:TileSkin[]=["among_us","hollow_knight","one_piece","roma_eterna"];
function Gallery(){
  const [helpers,setHelpers]=useState(false);
  return <main className="max-w-6xl mx-auto p-5 sm:p-8 text-white" data-numeric-gallery>
    {!helpers && <style>{"[data-value-label], [data-numeric-helper] { visibility: hidden !important; }"}</style>}
    <header className="mb-7"><p className="text-accent-gold font-bold text-xs tracking-widest uppercase">DOMINIX · Identidad numérica</p><h1 className="text-3xl font-black mt-2">Una referencia para cada valor.</h1><p className="text-sm text-accent-silver mt-2">Tripulantes, máscaras, monedas y numerales · 0–6</p>
      <label className="flex gap-2 items-center min-h-11 mt-3 text-xs"><input type="checkbox" checked={helpers} onChange={e=>setHelpers(e.target.checked)}/>Mostrar números auxiliares</label>
    </header>
    {ids.map(id=>{const skin=getTileSkin(id);return <section key={id} aria-label={skin.name} data-collection={id} className="mb-5 border rounded-xl p-4 sm:p-5 bg-surface-800/50" style={{borderColor:skin.accent+"66"}}>
      <h2 className="font-bold text-lg" style={{color:skin.accent}}>{skin.name}</h2><p className="text-xs text-accent-silver mt-1 mb-4">{t(`collection.reading.${id}`)}</p>
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
        {getSkinCharacters(id,"es").map(c=><figure key={c.value} className="flex flex-col items-center gap-2 min-w-0">
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-surface-600" role="img" aria-label={c.name} data-export-face={c.value}>{skin.valueFace?.(c.value)}</div>
          <figcaption className="text-[10px] font-bold text-center min-h-7">{c.name}</figcaption>
          <div className="flex items-end gap-1 shrink-0" data-face-samples={c.value}>
            <TileView staticView skin={id} tile={{id:`${id}-${c.value}`,top:c.value,bottom:c.value}} size="md" animate={false}/>
            <TileView staticView skin={id} tile={{id:`${id}-${c.value}-small`,top:c.value,bottom:c.value}} size="sm" animate={false}/>
          </div>
        </figure>)}
      </div>
      <details className="mt-4"><summary className="text-xs text-accent-silver cursor-pointer">Personajes de la colección · sin rango numérico</summary><div className="flex gap-3 mt-3 flex-wrap">
        {getCollectionCast(id,"es").map(guest=><figure key={guest.frame} className="w-16 text-center"><div className="w-12 h-12 mx-auto">{skin.valueIcon?.(guest.frame)}</div><figcaption className="text-[10px]">{guest.name}</figcaption></figure>)}
      </div></details>
    </section>;})}
    <details data-stress-fixtures><summary>Comprobación de indicadores</summary><div className="flex flex-wrap gap-3 mt-4">
      {ids.flatMap(id=>["sm","md"].flatMap(size=>["wild","golden","mirror","bomb"].flatMap(type=>["foil","holo","polychrome","negative"].map(edition=><div key={`${id}-${size}-${type}-${edition}`} data-stress-tile>
        <TileView staticView skin={id} size={size as "sm"|"md"} animate={false} tile={{id:`${id}-${size}-${type}-${edition}`,top:6,bottom:5,pact:true,type:type as "wild"|"golden"|"mirror"|"bomb",edition:edition as "foil"|"holo"|"polychrome"|"negative"}}/>
      </div>))))}
    </div></details>
  </main>;
}
createRoot(document.getElementById("root")!).render(<Gallery/>);

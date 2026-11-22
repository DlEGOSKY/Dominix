import type { CSSProperties } from "react";
import TileView, { type TileSkin } from "../src/components/TileView";
import type { TileMaterial } from "../src/engine/materialArt";
import ivoryB from "./assets/materials-b/ivory-v1.webp";
import emeraldB from "./assets/materials-b/emerald-v1.webp";
import rubyB from "./assets/materials-b/ruby-v1.webp";
import diamondB from "./assets/materials-b/diamond-v1.webp";
import obsidianB from "./assets/materials-b/obsidian-v1.webp";
import romanB from "./assets/materials-b/roman-v1.webp";

const materials: {skin:TileSkin;material:TileMaterial;name:string;b:string}[] = [
  {skin:"ivory",material:"ivory",name:"Marfil",b:ivoryB}, {skin:"emerald",material:"emerald",name:"Esmeralda",b:emeraldB},
  {skin:"ruby",material:"ruby",name:"Rubí",b:rubyB}, {skin:"diamond",material:"diamond",name:"Diamante",b:diamondB},
  {skin:"obsidian",material:"obsidian",name:"Obsidiana",b:obsidianB}, {skin:"imperium",material:"roman",name:"Imperium",b:romanB},
];

export default function MaterialComparison() {
  return <section className="max-w-4xl mx-auto p-4 text-accent-silver">
    <h1 tabIndex={-1} className="text-xl font-bold text-white mb-2">Materiales · comparación A/B</h1>
    <p className="text-xs mb-6">Mismo TileView, mismos valores y tamaños. Solo cambia la textura. A: GPT Image 2.6 alta (producto). B: Recraft Utility (QA).</p>
    <div className="grid grid-cols-2 gap-x-4 gap-y-8">
      {materials.map(item=><div key={item.skin} className="col-span-2 grid grid-cols-2 gap-4 border-t border-surface-600 pt-4">
        <h2 className="col-span-2 text-sm font-bold">{item.name}</h2>
        {(["A","B"] as const).map(source=><figure key={source} className="flex flex-col items-center gap-3" style={source==="B" ? {"--tile-material-preview":`url("${item.b}")`} as CSSProperties : undefined}>
          <div className="flex items-end gap-2"><TileView staticView tile={{id:`${item.skin}-${source}-md`,top:1,bottom:6}} skin={item.skin} animate={false} /><TileView staticView tile={{id:`${item.skin}-${source}-sm`,top:1,bottom:6}} skin={item.skin} size="sm" animate={false} /></div>
          <figcaption tabIndex={-1} className="text-[10px]">{item.name} · {source}</figcaption>
        </figure>)}
      </div>)}
    </div>
    <h2 tabIndex={-1} className="text-lg font-bold text-white mt-8 mb-4">Imperium · los siete valores</h2>
    <div className="flex flex-wrap gap-3">{Array.from({length:7},(_,n)=><TileView key={n} staticView skin="imperium" tile={{id:`roman-${n}`,top:n,bottom:6-n}} animate={false} />)}</div>
    <h2 className="text-sm font-bold text-white mt-8 mb-4">Imperium · tipos, ediciones y pacto</h2>
    <div className="flex flex-wrap gap-4">{(["normal","wild","golden","mirror","bomb","locked"] as const).map((type,n)=><figure key={type} className="flex flex-col gap-2 items-center">
      <div className="flex gap-2 items-end">{(["md","sm"] as const).map(size=><TileView key={size} staticView size={size} skin="imperium" tile={{id:`roman-${type}-${size}`,top:4,bottom:6,type,edition:(["foil","holo","polychrome","negative"] as const)[n%4],pact:true}} animate={false} />)}</div>
      <figcaption className="text-xs text-accent-silver">{type}</figcaption>
    </figure>)}</div>
  </section>;
}

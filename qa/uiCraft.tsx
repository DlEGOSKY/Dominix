import TileView from "../src/components/TileView";

export default function CraftPreview() {
  return <section className="max-w-4xl mx-auto p-4 text-accent-silver">
    <style>{`.craft-texture [data-material-detail] { visibility:hidden; }`}</style>
    <h1 className="text-xl font-bold text-white">Materiales · acabado de taller</h1>
    <p className="text-xs my-3">Comparación QA: misma textura, valores y tamaños. Izquierda sin grabado SVG; derecha con acabado. No es una comparación entre versiones completas del juego.</p>
    <div className="grid grid-cols-2 gap-4">
      {(["imperium", "ivory", "emerald", "diamond"] as const).map(skin=><div key={skin} className="col-span-2 grid grid-cols-2 gap-3 border-t border-surface-600 py-4">
        <h2 className="col-span-2 text-sm font-bold">{skin}</h2>
        {[false,true].map(detail=><figure key={String(detail)} className={`flex flex-col items-center gap-3 ${detail ? "" : "craft-texture"}`}>
          <div className="flex items-end gap-2">{(["md","sm"] as const).map(size=><TileView key={size} staticView size={size} skin={skin} tile={{id:`${skin}-${size}`,top:4,bottom:6}} animate={false} />)}</div>
          <figcaption className="text-xs">{detail ? "Acabado" : "Textura"}</figcaption>
        </figure>)}
      </div>)}
    </div>
    <h2 className="font-bold my-4">Imperium · estados de juego</h2>
    <div className="flex flex-wrap gap-3">{(["wild","golden","mirror","bomb","locked"] as const).map(type=><TileView key={type} staticView size="sm" skin="imperium" tile={{id:type,top:4,bottom:6,type,pact:true,edition:"foil"}} animate={false} />)}</div>
  </section>;
}

import RelicCard from "../src/components/RelicCard";
import TileView, { type TileSkin } from "../src/components/TileView";
import { ALL_RELICS } from "../src/engine/relics";
import type { Tile, TileType, TileEdition } from "../src/types/domino";
import { useState } from "react";
import SkinShowcase from "../src/components/SkinShowcase";

const newEmblems = ["ampolleta_maestra", "brazalete_tactico", "bolsa_infinita", "cuatro_cardinal", "cinco_vertice", "espiral_crescendo", "nudo_ouroboros", "ritmo_acelerado", "mano_ligera", "pureza_tactica", "colmillo_triple", "eco_impar", "simetria_perfecta", "cascada_dorada", "nucleo_cero", "furia_final", "bendicion_ancestral", "parejas_perfectas", "tres_lineas", "eternidad"];
export default function IdentityPreview() {
  const [previewActiveSkin, setPreviewActiveSkin] = useState<TileSkin>("default");
  const addedRelics = ["eco_par", "cadena_tensa", "precision", "dominio_total", "tres_magico", "cadena_maestra", "racha_imparable", "minimalista", "maestro_cadenas", "reflejo", "pureza_doble", "avalancha_total", "caida_prolongada", "coronacion", "hexagrama_sagrado", "eco_roto", "armonia_divina"];
  return <section className="max-w-5xl mx-auto px-4 py-8 text-accent-silver">
    <h1 className="text-2xl font-bold text-white mb-2">Emblemas propios de Dominix</h1>
    <p className="text-sm mb-6">QA visual: 37 emblemas propios; los 17 añadidos separan reliquias de patrones. Los colores y marcos siguen siendo los del juego.</p>
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6">
      {[...newEmblems, ...addedRelics].map(id => <figure key={id} className="flex flex-col items-center gap-2">
        <div className="flex items-end gap-2"><RelicCard relicId={id} size="xs" showName={false} /><RelicCard relicId={id} size="sm" showName={false} /><RelicCard relicId={id} size="md" showName={false} /></div>
        <figcaption tabIndex={-1} className="text-xs text-center">{ALL_RELICS.find(r => r.id === id)?.name}</figcaption>
      </figure>)}
    </div>
    <h2 tabIndex={-1} style={{ outline: "none" }} className="text-xl font-bold text-white mt-10 mb-2">La Banda del Doble · pack real</h2>
    <p className="text-sm mb-4">TileView real, atlas optimizado y números en HTML. Disponible en Colección y portada; estas muestras no ejecutan acciones de partida.</p>
    <div className="flex flex-wrap gap-4 mb-6">{Array.from({length:7},(_,n)=><figure key={n} className="flex items-end gap-2">
      <TileView staticView tile={{id:`crew-md-${n}`,top:n,bottom:6-n}} skin="banda_doble" animate={false} />
      <TileView staticView tile={{id:`crew-sm-${n}`,top:n,bottom:6-n}} skin="banda_doble" size="sm" animate={false} />
    </figure>)}</div>
    <h3 className="text-base font-bold text-white mb-3">Tipos y marcadores</h3>
    <div className="flex flex-wrap gap-4 mb-6">{(["normal", "wild", "golden", "mirror", "bomb", "locked"] as TileType[]).map(type=><figure key={type} className="flex flex-col gap-2 items-center">
      <TileView staticView tile={{id:`crew-${type}`,top:1,bottom:6,type}} skin="banda_doble" animate={false} />
      <figcaption className="text-xs">{type}</figcaption>
    </figure>)}</div>
    <h3 className="text-base font-bold text-white mb-3">Ediciones y pacto</h3>
    <div className="flex flex-wrap gap-4 mb-6">{(["foil", "holo", "polychrome", "negative"] as TileEdition[]).map((edition,n)=><figure key={edition} className="flex flex-col gap-2 items-center">
      <TileView staticView tile={{id:`crew-${edition}`,top:3,bottom:5,type:(["normal", "wild", "golden", "mirror"] as Tile["type"][])[n],edition,pact:true}} skin="banda_doble" animate={false} />
      <figcaption className="text-xs">{edition} · pacto</figcaption>
    </figure>)}</div>
    <h2 tabIndex={-1} className="text-xl font-bold text-white mt-10 mb-2">Chatarra de Lujo · pack real</h2>
    <div className="flex flex-wrap gap-4 mb-6">{Array.from({length:7},(_,n)=><figure key={n} className="flex items-end gap-2">
      <TileView staticView tile={{id:`scrap-md-${n}`,top:n,bottom:6-n}} skin="chatarra_lujo" animate={false} />
      <TileView staticView tile={{id:`scrap-sm-${n}`,top:n,bottom:6-n}} skin="chatarra_lujo" size="sm" animate={false} />
    </figure>)}</div>
    <div className="flex flex-wrap gap-4 mb-6">{(["normal", "wild", "golden", "mirror", "bomb", "locked"] as TileType[]).map((type,n)=><figure key={type} className="flex flex-col gap-2 items-center">
      <TileView staticView tile={{id:`scrap-${type}`,top:1,bottom:6,type,edition:(["foil", "holo", "polychrome", "negative"] as TileEdition[])[n%4],pact:true}} skin="chatarra_lujo" animate={false} />
      <figcaption className="text-xs">{type} · edición · pacto</figcaption>
    </figure>)}</div>
    <h2 tabIndex={-1} className="text-xl font-bold text-white mt-10 mb-2">Invitados del Umbral · pack real</h2>
    <div className="flex flex-wrap gap-4 mb-6">{Array.from({length:7},(_,n)=><figure key={n} className="flex items-end gap-2">
      <TileView staticView tile={{id:`guest-md-${n}`,top:n,bottom:6-n}} skin="invitados_umbral" animate={false} />
      <TileView staticView tile={{id:`guest-sm-${n}`,top:n,bottom:6-n}} skin="invitados_umbral" size="sm" animate={false} />
    </figure>)}</div>
    <SkinShowcase activeSkin={previewActiveSkin} unlockedSkins={new Set(["default", "banda_doble", "chatarra_lujo", "invitados_umbral"])} onEquip={setPreviewActiveSkin} />
    <p className="text-xs mt-2">Equipamiento de muestra QA: {previewActiveSkin}. No escribe guardados.</p>
    <h2 className="text-xl font-bold text-white mt-10 mb-2">Lectura de las skins actuales</h2>
    <p className="text-sm mb-6">Comparación de los packs anteriores, que conservan sus identificadores y disponibilidad.</p>
    {(["default", "bestiario", "mecanico", "tarot"] as TileSkin[]).map(skin => <div key={skin} className="mb-6">
      <h3 className="text-sm mb-2 capitalize">{skin}</h3>
      <div className="flex flex-wrap gap-2">{Array.from({length:7},(_,n)=><TileView key={n} tile={{id:`qa-skin-${skin}-${n}`,top:n,bottom:6-n}} skin={skin} size="sm" animate={false} />)}</div>
    </div>)}
  </section>;
}

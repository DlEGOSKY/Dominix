import { motion, AnimatePresence } from "framer-motion";
import type { ChainState, Tile } from "@/types/domino";
import TileView from "./TileView";
import type { TileSkin } from "./TileView";
import Tooltip, { TileTooltipContent } from "./Tooltip";

const TILE_TYPE_INFO: Record<string, { label: string; color: string; desc: string }> = {
  wild:   { label: "Comodin",   color: "text-purple-300", desc: "Conecta con cualquier numero" },
  golden: { label: "Dorada",    color: "text-amber-300",  desc: "Score base x2" },
  mirror: { label: "Espejo",    color: "text-cyan-300",   desc: "Refleja el extremo" },
  bomb:   { label: "Bomba",     color: "text-red-300",    desc: "Detona efectos al jugar" },
  locked: { label: "Bloqueada", color: "text-slate-400",  desc: "Se desbloquea mas adelante" },
};

const EDITION_INFO: Record<string, { label: string; desc: string; color: string }> = {
  foil:        { label: "Foil",        desc: "+30 score plano",            color: "text-blue-300" },
  holo:        { label: "Holo",        desc: "x1.15 multiplicador",        color: "text-purple-300" },
  polychrome:  { label: "Polychrome",  desc: "x1.30 multiplicador (1 max)", color: "text-pink-300" },
  negative:    { label: "Negative",    desc: "+1 accion esta ronda",       color: "text-slate-200" },
};

function buildTileTooltip(tile: Tile) {
  const t = tile.type ?? "normal";
  const isDouble = tile.top === tile.bottom;
  const typeInfo = TILE_TYPE_INFO[t] ?? (
    isDouble
      ? { label: "Doble",  color: "text-accent-gold",       desc: "Ambos extremos iguales" }
      : { label: "Normal", color: "text-accent-silver/70",  desc: "Ficha estandar" }
  );
  const edInfo = tile.edition ? EDITION_INFO[tile.edition] : null;
  return (
    <TileTooltipContent
      type={t}
      typeLabel={typeInfo.label}
      typeColor={typeInfo.color}
      typeDesc={typeInfo.desc}
      edition={tile.edition}
      editionLabel={edInfo?.label}
      editionDesc={edInfo?.desc}
      editionColor={edInfo?.color}
      sum={tile.top + tile.bottom}
    />
  );
}

function isSpecialTile(tile: Tile): boolean {
  return (tile.type !== undefined && tile.type !== "normal") || tile.edition !== undefined;
}

interface ChainProps {
  chain: ChainState;
  skin?: TileSkin;
  patternFlash?: number;
}

export default function Chain({ chain, skin, patternFlash = 0 }: ChainProps) {

  if (chain.placed.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-32 text-accent-silver/30 text-sm tracking-wide"
      >
        Juega una ficha para iniciar la cadena
      </motion.div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 min-h-[8rem] py-4">
      <AnimatePresence mode="popLayout">
        {chain.placed.map((p, i) => (
          <motion.div
            key={`${p.tile.id}-${i}`}
            layout
            initial={{ opacity: 0, scale: 0.5, x: i === 0 ? 0 : -20 }}
            animate={
              patternFlash > 0
                ? {
                    opacity: 1,
                    scale: [1, 1.15, 1.05, 1],
                    filter: ["brightness(1)", "brightness(2.2)", "brightness(1.4)", "brightness(1)"],
                  }
                : { opacity: 1, scale: 1, x: 0 }
            }
            transition={
              patternFlash > 0
                ? { delay: i * 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }
                : { type: "spring", stiffness: 400, damping: 30 }
            }
            className="flex items-center gap-1"
          >
            {isSpecialTile(p.tile) ? (
              <Tooltip content={buildTileTooltip(p.tile)} placement="top" delay={200}>
                <TileView tile={p.tile} disabled size="sm" animate={false} skin={skin} />
              </Tooltip>
            ) : (
              <TileView tile={p.tile} disabled size="sm" animate={false} skin={skin} />
            )}
            {i < chain.placed.length - 1 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 6 }}
                className="h-0.5 bg-accent-silver/20 rounded"
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

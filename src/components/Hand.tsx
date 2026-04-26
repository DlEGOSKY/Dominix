import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Tile, PlacementSide, ChainState } from "@/types/domino";
import { getValidPlacements } from "@/engine/chain";
import TileView from "./TileView";
import type { TileSkin } from "./TileView";
import { useSettings } from "@/hooks/useSettings";
import Tooltip from "./Tooltip";

interface HandProps {
  tiles: Tile[];
  chain: ChainState;
  onPlay: (tile: Tile, side: PlacementSide) => void;
  disabled: boolean;
  skin?: TileSkin;
  onDiscard?: (tile: Tile) => void;
  canDiscard?: boolean;
  /** Optional: return the score delta if this tile were played optimally. Null if unplayable. */
  getScorePreview?: (tile: Tile) => number | null;
}

export default function Hand({ tiles, chain, onPlay, disabled, skin, onDiscard, canDiscard: discardAvailable, getScorePreview }: HandProps) {
  const [settings] = useSettings();
  const sortedTiles = useMemo(() => {
    return [...tiles].sort((a, b) => {
      const aPlayable = getValidPlacements(chain, a).length > 0 ? 0 : 1;
      const bPlayable = getValidPlacements(chain, b).length > 0 ? 0 : 1;
      if (aPlayable !== bPlayable) return aPlayable - bPlayable;
      return (a.top + a.bottom) - (b.top + b.bottom);
    });
  }, [tiles, chain]);

  const handleClick = (tile: Tile) => {
    if (disabled) return;
    const sides = getValidPlacements(chain, tile);
    if (sides.length === 0) return;

    if (sides.length === 1) {
      onPlay(tile, sides[0]!);
    } else {
      onPlay(tile, "right");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[11px] font-bold tracking-widest uppercase text-accent-silver/40">
        Mano ({tiles.length})
      </span>
      <div className="flex flex-wrap justify-center gap-3 min-h-[120px] px-2">
        <AnimatePresence mode="popLayout">
          {sortedTiles.map((tile) => {
            const sides = getValidPlacements(chain, tile);
            const playable = sides.length > 0 && !disabled;
            const preview = playable && getScorePreview ? getScorePreview(tile) : null;
            return (
              <motion.div
                key={tile.id}
                layout
                initial={{ opacity: 0, scale: 0.3, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: -50 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative group"
              >
                <TileView
                  tile={tile}
                  onClick={() => handleClick(tile)}
                  disabled={!playable}
                  highlight={playable}
                  skin={skin}
                />
                {settings.showPreview && preview !== null && preview > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md bg-surface-900/90 border border-accent-gold/40 text-[10px] font-mono font-bold text-accent-gold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    +{preview}
                  </motion.div>
                )}
                {settings.showHints && (
                  <div className="absolute inset-0 pointer-events-none">
                    <Tooltip
                      content={<TileTooltipContent tile={tile} playable={playable} sides={sides} preview={settings.showPreview ? preview : null} />}
                      placement="top"
                      delay={180}
                      className="absolute inset-0 w-full h-full"
                    >
                      <div className="w-full h-full pointer-events-auto" />
                    </Tooltip>
                  </div>
                )}
                {onDiscard && discardAvailable && !disabled && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDiscard(tile); }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 border border-red-400/50 text-[9px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-400"
                    title="Descartar"
                  >
                    x
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

const EDITION_DESC: Record<NonNullable<Tile["edition"]>, { label: string; desc: string; color: string }> = {
  foil: { label: "Foil", desc: "+30 score plano", color: "text-blue-300" },
  holo: { label: "Holo", desc: "x1.15 multiplicador", color: "text-purple-300" },
  polychrome: { label: "Polychrome", desc: "x1.30 multiplicador (1 max)", color: "text-pink-300" },
  negative: { label: "Negative", desc: "+1 accion esta ronda", color: "text-slate-200" },
};

function TypeLabel(tile: Tile): { label: string; color: string; desc: string } {
  const t = tile.type ?? "normal";
  const isDouble = tile.top === tile.bottom;
  switch (t) {
    case "wild": return { label: "Comodin", color: "text-purple-300", desc: "Conecta con cualquier numero" };
    case "golden": return { label: "Dorada", color: "text-amber-300", desc: "Score base x2" };
    case "mirror": return { label: "Espejo", color: "text-cyan-300", desc: "Refleja el extremo" };
    case "bomb": return { label: "Bomba", color: "text-red-300", desc: "Detona efectos al jugar" };
    case "locked": return { label: "Bloqueada", color: "text-slate-400", desc: "Se desbloquea mas adelante" };
    default:
      return isDouble
        ? { label: "Doble", color: "text-accent-gold", desc: "Ambos extremos iguales" }
        : { label: "Normal", color: "text-accent-silver/70", desc: "Ficha estandar" };
  }
}

function TileTooltipContent({ tile, playable, sides, preview }: { tile: Tile; playable: boolean; sides: PlacementSide[]; preview: number | null }) {
  const sum = tile.top + tile.bottom;
  const typeInfo = TypeLabel(tile);
  const edInfo = tile.edition ? EDITION_DESC[tile.edition] : null;
  const placement =
    !playable ? "No conecta con los extremos"
    : sides.length === 2 ? "Encaja en ambos extremos"
    : sides[0] === "left" ? "Encaja por la izquierda"
    : "Encaja por la derecha";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
        <span className="text-[9px] font-mono text-accent-silver/50">
          {tile.top}|{tile.bottom} · {sum}
        </span>
      </div>
      <p className="text-[9px] text-accent-silver/50 leading-tight">{typeInfo.desc}</p>
      {tile.pact && (
        <div className="mt-0.5 pt-1 border-t border-surface-600/40">
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300">Pacto Sagrado</span>
          <p className="text-[9px] text-accent-silver/50 mt-0.5 leading-tight">+100 al jugarla · +100 dentro de patron · +100 con edition</p>
        </div>
      )}
      {edInfo && (
        <div className="mt-0.5 pt-1 border-t border-surface-600/40">
          <span className={`text-[9px] font-bold uppercase tracking-wider ${edInfo.color}`}>{edInfo.label}</span>
          <p className="text-[9px] text-accent-silver/50 mt-0.5 leading-tight">{edInfo.desc}</p>
        </div>
      )}
      <div className={`mt-0.5 pt-1 border-t border-surface-600/40 text-[9px] ${playable ? "text-green-400/80" : "text-red-400/70"}`}>
        {placement}
        {preview !== null && preview > 0 && (
          <span className="text-accent-gold font-mono font-bold ml-1">+{preview}</span>
        )}
      </div>
    </div>
  );
}

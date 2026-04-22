import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Tile, PlacementSide, ChainState } from "@/types/domino";
import { getValidPlacements } from "@/engine/chain";
import TileView from "./TileView";
import type { TileSkin } from "./TileView";

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
                {preview !== null && preview > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md bg-surface-900/90 border border-accent-gold/40 text-[10px] font-mono font-bold text-accent-gold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    +{preview}
                  </motion.div>
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

import { AnimatePresence, motion } from "framer-motion";
import type { Tile, PlacementSide, ChainState } from "@/types/domino";
import { getValidPlacements } from "@/engine/chain";
import TileView from "./TileView";

interface HandProps {
  tiles: Tile[];
  chain: ChainState;
  onPlay: (tile: Tile, side: PlacementSide) => void;
  disabled: boolean;
}

export default function Hand({ tiles, chain, onPlay, disabled }: HandProps) {
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
      <span className="text-xs font-medium tracking-widest uppercase text-accent-silver/60">
        Mano ({tiles.length})
      </span>
      <div className="flex flex-wrap justify-center gap-2 min-h-[120px]">
        <AnimatePresence mode="popLayout">
          {tiles.map((tile) => {
            const sides = getValidPlacements(chain, tile);
            const playable = sides.length > 0 && !disabled;
            return (
              <motion.div
                key={tile.id}
                layout
                exit={{ opacity: 0, scale: 0.5, y: -50 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <TileView
                  tile={tile}
                  onClick={() => handleClick(tile)}
                  disabled={!playable}
                  highlight={playable}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import type { Tile } from "@/types/domino";
import { audio } from "@/engine/audio";

interface TileViewProps {
  tile: Tile;
  onClick?: () => void;
  disabled?: boolean;
  highlight?: boolean;
  size?: "sm" | "md";
  animate?: boolean;
}

const dots: Record<number, number[][]> = {
  0: [],
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ],
  5: [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 2],
  ],
  6: [
    [0, 0],
    [0, 2],
    [1, 0],
    [1, 2],
    [2, 0],
    [2, 2],
  ],
};

function DotGrid({ value, cellSize }: { value: number; cellSize: number }) {
  const positions = dots[value] ?? [];
  const gap = cellSize / 3;

  return (
    <div
      className="grid grid-cols-3 grid-rows-3 place-items-center"
      style={{ width: cellSize, height: cellSize }}
    >
      {Array.from({ length: 9 }).map((_, idx) => {
        const row = Math.floor(idx / 3);
        const col = idx % 3;
        const hasDot = positions.some((p) => p[0] === row && p[1] === col);
        return (
          <div key={idx} className="flex items-center justify-center" style={{ width: gap, height: gap }}>
            {hasDot && (
              <div
                className="rounded-full bg-white"
                style={{
                  width: gap * 0.6,
                  height: gap * 0.6,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TileView({
  tile,
  onClick,
  disabled = false,
  highlight = false,
  size = "md",
  animate = true,
}: TileViewProps) {
  const cellSize = size === "md" ? 48 : 36;
  const isDouble = tile.top === tile.bottom;
  const tileType = tile.type ?? "normal";
  const isLocked = tileType === "locked";
  const isWild = tileType === "wild";
  const isGolden = tileType === "golden";

  const handleClick = () => {
    if (!disabled && onClick) {
      audio.play("tile_place");
      onClick();
    }
  };

  const handleHover = () => {
    if (!disabled && highlight) {
      audio.play("tile_hover");
    }
  };

  const getBgClass = () => {
    if (isWild) return "bg-gradient-to-br from-purple-600/80 to-purple-900/80";
    if (isGolden) return "bg-gradient-to-br from-yellow-500/80 to-amber-700/80";
    if (isLocked) return "bg-surface-700";
    if (isDouble) return "bg-surface-600";
    return "bg-tile-bg";
  };

  const getBorderClass = () => {
    if (highlight) return "border-accent-gold shadow-[0_0_12px_rgba(212,168,83,0.4)]";
    if (isWild) return "border-purple-400";
    if (isGolden) return "border-yellow-400";
    if (isLocked) return "border-surface-500";
    return "border-tile-border";
  };

  return (
    <motion.button
      onClick={handleClick}
      onHoverStart={handleHover}
      disabled={disabled || isLocked}
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={!disabled && !isLocked ? { scale: 1.05 } : undefined}
      whileTap={!disabled && !isLocked ? { scale: 0.95 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={[
        "relative flex flex-col items-center rounded-lg border-2",
        "select-none",
        getBorderClass(),
        disabled || isLocked
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:border-accent-gold/60 hover:bg-tile-hover",
        getBgClass(),
      ].join(" ")}
      style={{ padding: size === "md" ? 6 : 4 }}
    >
      {isWild && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[8px] text-white font-bold">
          W
        </div>
      )}
      {isGolden && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[8px] text-surface-900 font-bold">
          x2
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-900/60 rounded-lg">
          <span className="text-surface-400 text-lg">🔒</span>
        </div>
      )}
      <DotGrid value={tile.top} cellSize={cellSize} />
      <div
        className="w-full my-1 border-t border-tile-border"
        style={{ opacity: 0.5 }}
      />
      <DotGrid value={tile.bottom} cellSize={cellSize} />
    </motion.button>
  );
}

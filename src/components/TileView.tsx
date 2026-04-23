import React from "react";
import { motion } from "framer-motion";
import type { Tile } from "@/types/domino";
import { audio } from "@/engine/audio";

export type TileSkin = "default" | "obsidian" | "emerald" | "ruby" | "void" | "gold" | "ivory" | "neon";

interface TileViewProps {
  tile: Tile;
  onClick?: () => void;
  disabled?: boolean;
  highlight?: boolean;
  size?: "sm" | "md";
  animate?: boolean;
  skin?: TileSkin;
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

function DotGrid({ value, cellSize, dotClass, dotShape = "round" }: { value: number; cellSize: number; dotClass: string; dotShape?: "round" | "square" | "diamond" }) {
  const positions = dots[value] ?? [];
  const gap = cellSize / 3;
  const dotSize = gap * 0.6;

  const shapeStyle: React.CSSProperties =
    dotShape === "square"
      ? { borderRadius: "2px", width: dotSize, height: dotSize }
      : dotShape === "diamond"
      ? { borderRadius: "2px", transform: "rotate(45deg)", width: dotSize * 0.75, height: dotSize * 0.75 }
      : { borderRadius: "50%", width: dotSize, height: dotSize };

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
                className={dotClass}
                style={shapeStyle}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const SKIN_STYLES: Record<TileSkin, { bg: string; border: string; dot: string; separator?: string; dotShape?: "round" | "square" | "diamond" }> = {
  default: { bg: "", border: "", dot: "" },
  obsidian: {
    bg: "bg-gradient-to-b from-[#1c1c28] to-[#0e0e18]",
    border: "border-slate-400/40",
    dot: "bg-slate-300",
    separator: "via-slate-500/40",
    dotShape: "square",
  },
  emerald: {
    bg: "bg-gradient-to-b from-[#0d2b1f] to-[#071a12]",
    border: "border-emerald-500/50",
    dot: "bg-emerald-300",
    separator: "via-emerald-500/40",
    dotShape: "round",
  },
  ruby: {
    bg: "bg-gradient-to-b from-[#2a0d10] to-[#180608]",
    border: "border-rose-500/50",
    dot: "bg-rose-300",
    separator: "via-rose-500/40",
    dotShape: "round",
  },
  void: {
    bg: "bg-gradient-to-b from-[#07070f] to-[#030306]",
    border: "border-violet-400/50",
    dot: "bg-violet-400",
    separator: "via-violet-500/40",
    dotShape: "diamond",
  },
  gold: {
    bg: "bg-gradient-to-b from-[#2a1d06] to-[#190f02]",
    border: "border-amber-400/60",
    dot: "bg-amber-300",
    separator: "via-amber-400/50",
    dotShape: "round",
  },
  ivory: {
    bg: "bg-gradient-to-b from-[#f5f0e8] to-[#e8dcc8]",
    border: "border-stone-400/60",
    dot: "bg-stone-700",
    separator: "via-stone-400/50",
    dotShape: "round",
  },
  neon: {
    bg: "bg-gradient-to-b from-[#040812] to-[#010408]",
    border: "border-cyan-400/70",
    dot: "bg-cyan-400",
    separator: "via-cyan-400/50",
    dotShape: "diamond",
  },
};

export default function TileView({
  tile,
  onClick,
  disabled = false,
  highlight = false,
  size = "md",
  animate = true,
  skin = "default",
}: TileViewProps) {
  const cellSize = size === "md" ? 48 : 36;
  const isDouble = tile.top === tile.bottom;
  const tileType = tile.type ?? "normal";
  const isLocked = tileType === "locked";
  const isWild = tileType === "wild";
  const isGolden = tileType === "golden";
  const isMirror = tileType === "mirror";
  const isBomb = tileType === "bomb";

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

  const skinStyle = (!isWild && !isGolden && !isLocked && !isMirror && !isBomb && skin !== "default") ? SKIN_STYLES[skin] : null;
  const skinDotShape = skinStyle?.dotShape ?? "round";

  const getBgClass = () => {
    if (isWild) return "bg-gradient-to-br from-purple-700/90 via-purple-800/80 to-indigo-900/90";
    if (isGolden) return "bg-gradient-to-br from-amber-500/80 via-yellow-500/70 to-amber-700/80";
    if (isMirror) return "bg-gradient-to-br from-cyan-700/80 via-teal-800/70 to-cyan-900/80";
    if (isBomb) return "bg-gradient-to-br from-red-700/80 via-orange-800/70 to-red-900/80";
    if (isLocked) return "bg-gradient-to-b from-surface-700 to-surface-800";
    if (skinStyle) return skinStyle.bg;
    if (isDouble) return "bg-gradient-to-b from-[#22223a] via-surface-700 to-[#1a1a2c]";
    return "bg-gradient-to-b from-[#26264a] via-[#1e1e38] to-[#16162a]";
  };

  const getBorderClass = () => {
    if (highlight) return "border-accent-gold/80";
    if (isWild) return "border-purple-400/60";
    if (isGolden) return "border-yellow-400/60";
    if (isMirror) return "border-cyan-400/60";
    if (isBomb) return "border-red-400/60";
    if (isLocked) return "border-surface-500/50";
    if (skinStyle) return skinStyle.border;
    return "border-tile-border/60";
  };

  const getShadowClass = () => {
    if (highlight) return "tile-depth-highlight";
    if (isWild) return "tile-wild-glow";
    if (isGolden) return "tile-golden-glow";
    if (isMirror) return "tile-depth";
    if (isBomb) return "tile-depth";
    return "tile-depth";
  };

  const getEffectClass = () => {
    if (isWild) return "wild-holo";
    if (isGolden) return "golden-shimmer";
    if (!disabled && !isLocked) return "tile-shine";
    return "";
  };

  const dotClass = isWild ? "dot-wild" : isGolden ? "dot-golden" : isMirror ? "dot-mirror" : isBomb ? "dot-bomb" : skinStyle ? skinStyle.dot : "dot-normal";

  const editionClass = tile.edition ? `edition-${tile.edition}` : "";
  const editionBorderClass = (() => {
    switch (tile.edition) {
      case "foil": return "border-blue-300/70";
      case "holo": return "border-purple-400/70";
      case "polychrome": return "border-pink-400/70";
      case "negative": return "border-slate-400/60";
      default: return "";
    }
  })();

  return (
    <motion.button
      onClick={handleClick}
      onHoverStart={handleHover}
      disabled={disabled || isLocked}
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={!disabled && !isLocked ? { scale: 1.08, y: -4 } : undefined}
      whileTap={!disabled && !isLocked ? { scale: 0.95 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={[
        "relative flex flex-col items-center rounded-xl border-2 overflow-hidden",
        "select-none",
        editionBorderClass || getBorderClass(),
        getShadowClass(),
        getEffectClass(),
        editionClass,
        disabled || isLocked
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer",
        getBgClass(),
      ].join(" ")}
      style={{ padding: size === "md" ? 8 : 5 }}
    >
      {tile.pact && (
        <>
          <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: "inset 0 0 0 1px rgba(251,191,36,0.7), 0 0 14px rgba(251,191,36,0.5)" }} />
          <div className="absolute -top-0.5 -left-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-amber-200/80 flex items-center justify-center shadow-[0_0_6px_rgba(251,191,36,0.7)] pointer-events-none">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" className="text-amber-950">
              <path d="M12 3l2.5 6.5L21 11l-5 4.5 1.5 6.5L12 18.5 6.5 22 8 15.5 3 11l6.5-1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" />
            </svg>
          </div>
        </>
      )}
      {isWild && (
        <div className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 rounded-bl-lg bg-purple-500/90 text-[7px] text-white font-bold uppercase tracking-wider">
          Wild
        </div>
      )}
      {isGolden && (
        <div className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 rounded-bl-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-[7px] text-surface-900 font-bold uppercase tracking-wider">
          x2
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-900/70 rounded-xl backdrop-blur-[1px]">
          <div className="w-6 h-6 rounded-full bg-surface-600 border border-surface-500 flex items-center justify-center">
            <div className="w-2 h-2.5 border-2 border-surface-400 rounded-sm border-b-0" />
          </div>
        </div>
      )}
      <DotGrid value={tile.top} cellSize={cellSize} dotClass={dotClass} dotShape={isWild || isGolden || isMirror || isBomb ? "round" : skinDotShape} />
      <div className="w-4/5 my-1.5 relative">
        <div className={["h-px bg-gradient-to-r from-transparent to-transparent", skinStyle?.separator ?? "via-tile-border/40"].join(" ")} />
        {highlight && (
          <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent" />
        )}
      </div>
      <DotGrid value={tile.bottom} cellSize={cellSize} dotClass={dotClass} dotShape={isWild || isGolden || isMirror || isBomb ? "round" : skinDotShape} />
      {tile.edition && (
        <div
          className={[
            "absolute -bottom-0.5 left-0 right-0 text-center py-0.5 text-[7px] font-bold uppercase tracking-widest",
            tile.edition === "foil" && "bg-blue-500/30 text-blue-100",
            tile.edition === "holo" && "bg-purple-500/30 text-purple-100",
            tile.edition === "polychrome" && "bg-pink-500/30 text-pink-100",
            tile.edition === "negative" && "bg-slate-700/50 text-slate-100",
          ].filter(Boolean).join(" ")}
        >
          {tile.edition}
        </div>
      )}
    </motion.button>
  );
}

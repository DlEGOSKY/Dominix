import { useReduceMotion } from "@/hooks/useSettings";
import React from "react";
import { motion } from "framer-motion";
import type { Tile } from "@/types/domino";
import { audio } from "@/engine/audio";
import { getTileSkin } from "@/engine/tileSkins";
import { MaterialSurface, RomanHalf, romanValue } from "@/engine/materialArt";
import { t } from "@/engine/i18n";
import EditionBadge from "./EditionBadge";
import NumericTileRibbon from "./NumericTileRibbon";

export type TileSkin =
  | "default"
  | "banda_doble"
  | "chatarra_lujo"
  | "invitados_umbral"
  | "among_us"
  | "hollow_knight"
  | "one_piece"
  | "roma_eterna"
  | "diamond"
  | "imperium"
  | "eclipse_glass"
  | "orbital_reactor"
  | "sunken_temple"
  | "dragon_forge"
  | "alchemist_cabinet"
  | "midnight_express"
  | "obsidian"
  | "emerald"
  | "ruby"
  | "void"
  | "gold"
  | "ivory"
  | "neon"
  | "pacto"
  | "reliquia"
  | "cosmos"
  | "tarot"
  | "astral"
  | "bestiario"
  | "naturaleza"
  | "mecanico";

interface TileViewProps {
  tile: Tile;
  onClick?: () => void;
  disabled?: boolean;
  highlight?: boolean;
  size?: "sm" | "md";
  animate?: boolean;
  /** Hand owns the outer exit; other containers retain their presence lifecycle. */
  animateExit?: boolean;
  skin?: TileSkin;
  /** Non-interactive collection preview; avoids buttons inside skin buttons. */
  staticView?: boolean;
  placementSound?: boolean;
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

function ValueArtHalf({ value, iconFn, cellSize, accent, portrait = false, labelEdge = "bottom", roman = false, showLabel = true }: {
  value: number;
  iconFn: (v: number) => React.ReactNode;
  cellSize: number;
  accent: string;
  portrait?: boolean;
  roman?: boolean;
  showLabel?: boolean;
  labelEdge?: "top" | "bottom";
}) {
  if (portrait) return <div aria-hidden="true" className="relative overflow-hidden rounded-sm" style={{ width: cellSize, height: cellSize }}>
    {iconFn(value)}
    {showLabel && <span data-value-label={value} className={`absolute right-0 ${labelEdge === "top" ? "top-0" : "bottom-0"} px-1 rounded-sm bg-surface-900/95 border border-white/20 font-mono font-black tabular-nums leading-none`} style={{ fontSize: cellSize >= 48 ? 12 : 10, lineHeight: "14px", color: accent }}>{roman && value > 0 ? romanValue(value) : value}</span>}
  </div>;
  const iconSize = Math.round(cellSize * 0.62);
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ width: cellSize, height: cellSize, gap: 2 }}
    >
      <div style={{ width: iconSize, height: iconSize, flexShrink: 0 }}>
        {iconFn(value)}
      </div>
      <span
        className="font-mono font-bold tabular-nums leading-none"
        style={{ fontSize: cellSize >= 48 ? 10 : 9, color: accent }}
      >
        {value}
      </span>
    </div>
  );
}

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
      className="relative z-10 grid grid-cols-3 grid-rows-3 place-items-center"
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

// Skin palettes are kept in `@/engine/tileSkins.tsx`. The view fetches the
// active definition through `getTileSkin(id)`. Portrait packs retain their art
// under special-type markers; legacy skins keep the original type palettes.

export default function TileView({
  tile,
  onClick,
  disabled = false,
  highlight = false,
  size = "md",
  animate = true,
  animateExit = true,
  skin = "default",
  staticView = false,
  placementSound = true,
}: TileViewProps) {
  const reducedMotion = useReduceMotion();
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
      if (placementSound) audio.play("tile_place");
      onClick();
    }
  };

  const handleHover = () => {
    if (!disabled && highlight) {
      audio.play("tile_hover");
    }
  };

  const skinDef = getTileSkin(skin);
  const isPortrait = skinDef.valueArtStyle === "portrait";
  const isRoman = skinDef.valueArtStyle === "roman";
  const isSpecial = isWild || isGolden || isLocked || isMirror || isBomb;
  const skinActive = skinDef.id !== "default" && (isPortrait || isRoman || !!skinDef.material || !isSpecial);
  const skinStyle = skinActive ? skinDef : null;
  const skinDotShape = skinStyle?.dotShape ?? "round";
  const romanAccent = isGolden ? "#37220c" : isSpecial ? "#fff0d4" : skinDef.accent;

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
    if (isLocked) return "border-accent-silver/30";
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
    if (reducedMotion || staticView) return "";
    if (isWild) return "wild-holo";
    if (isGolden) return "golden-shimmer";
    if (isMirror) return "tile-mirror-flow";
    if (isBomb) return "tile-bomb-pulse";
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

  // Build a screen-reader description: type + values + edition + pact
  const describeType = isWild ? t("tile.aria.wild") : isGolden ? t("tile.aria.golden") : isMirror ? t("tile.type.mirror") : isBomb ? t("tile.type.bomb") : isLocked ? t("tile.aria.locked") : isDouble ? t("tile.aria.double") : "";
  const ariaLabel = [
    describeType,
    t("tile.aria.values", { top: tile.top, bottom: tile.bottom }),
    tile.pact ? t("tile.aria.pact") : "",
    tile.edition ? t("tile.aria.edition", { edition: tile.edition }) : "",
  ].filter(Boolean).join(", ");

  const Root = staticView ? motion.div : motion.button;
  return (
    <Root
      {...(staticView ? { role: "img" } : { disabled: disabled || isLocked })}
      onClick={staticView ? undefined : handleClick}
      onHoverStart={staticView ? undefined : handleHover}
      aria-label={ariaLabel}
      data-skin={skinActive ? skinDef.id : "default"}
      data-tile-id={tile.id}
      initial={animate && !reducedMotion ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      exit={animateExit && !reducedMotion ? { scale: 0.8, opacity: 0 } : undefined}
      whileHover={!disabled && !isLocked && !staticView && !reducedMotion ? { scale: 1.08, y: -4 } : undefined}
      whileTap={!disabled && !isLocked && !staticView && !reducedMotion ? { scale: 0.95 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={[
        "relative flex flex-col items-center rounded-xl border-2 overflow-hidden",
        "select-none",
        editionBorderClass || getBorderClass(),
        getShadowClass(),
        getEffectClass(),
        editionClass,
        staticView ? "cursor-default" : disabled || isLocked
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer",
        getBgClass(),
      ].join(" ")}
      style={{ padding: size === "md" ? 8 : 5 }}
    >
      {/* Highlight pulse for playable tiles */}
      {highlight && !disabled && !isLocked && !reducedMotion && (
        <motion.div
          className="absolute -inset-0.5 rounded-xl border border-accent-gold/40 pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {/* Skin texture rendered behind everything else (cosmetic only) */}
      {skinStyle?.material && <MaterialSurface material={skinStyle.material} tileId={tile.id} special={isSpecial} />}
      {skinStyle?.pattern}
      {/* Skin corner glyph — suppressed if the pact already owns that slot */}
      {skinStyle?.glyph && !tile.pact && skinStyle.glyph}
      {tile.pact && (
        <>
          <div className="absolute inset-0 rounded-xl pointer-events-none tile-pact-aura" />
            {!skinDef.valueFace && <div data-pact-badge className="absolute z-30 -top-0.5 -left-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-amber-200/80 flex items-center justify-center shadow-[0_0_6px_rgba(251,191,36,0.7)] pointer-events-none">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" className="text-amber-950">
              <path d="M12 3l2.5 6.5L21 11l-5 4.5 1.5 6.5L12 18.5 6.5 22 8 15.5 3 11l6.5-1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" />
            </svg>
            </div>}
        </>
      )}
      {isWild && !skinDef.valueFace && (
        <div data-tile-badge="wild" className="absolute z-20 -top-0.5 -right-0.5 px-1 py-0.5 rounded-bl-lg bg-purple-800 text-[8px] leading-none text-white font-bold uppercase tracking-wide">
          {t(size === "sm" ? "tile.badge.wild" : "tile.aria.wild")}
        </div>
      )}
      {isGolden && !skinDef.valueFace && (
        <div className="absolute z-20 -top-0.5 -right-0.5 px-1.5 py-0.5 rounded-bl-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-[8px] leading-none text-surface-900 font-bold uppercase tracking-wider">
          x2
        </div>
      )}
      {!skinDef.valueFace && (isPortrait || isRoman || !!skinStyle?.material) && (isMirror || isBomb) && <span data-tile-badge={isMirror ? "mirror" : "bomb"} className={`absolute z-20 -top-0.5 -right-0.5 px-1 py-0.5 rounded-bl-lg text-[8px] leading-none text-white font-bold ${isMirror ? "bg-cyan-800" : "bg-red-800"}`}>
        {t(size === "sm" ? isMirror ? "tile.badge.mirror" : "tile.badge.bomb" : isMirror ? "tile.type.mirror" : "tile.type.bomb")}
      </span>}
      {isLocked && (
        <div className="absolute z-20 inset-0 flex items-center justify-center bg-surface-900/70 rounded-xl backdrop-blur-[1px]">
          <div className="w-6 h-6 rounded-full bg-surface-600 border border-accent-silver/40 flex items-center justify-center">
            <div className="w-2 h-2.5 border-2 border-accent-silver/80 rounded-sm border-b-0" />
          </div>
        </div>
      )}
      {isRoman ? <RomanHalf value={tile.top} cellSize={cellSize} accent={romanAccent} /> : skinActive && skinDef.valueIcon ? (
        <ValueArtHalf value={tile.top} iconFn={skinDef.valueFace ?? skinDef.valueIcon} cellSize={cellSize} accent={skinDef.accent} portrait={isPortrait} roman={skinDef.portraitNumerals === "roman" && !skinDef.valueFace} showLabel={!skinDef.valueFace}/>
      ) : (
        <DotGrid value={tile.top} cellSize={cellSize} dotClass={dotClass} dotShape={isWild || isGolden || isMirror || isBomb ? "round" : skinDotShape} />
      )}
      <div className="w-4/5 my-1.5 relative z-10">
        <div className={["h-px bg-gradient-to-r from-transparent to-transparent", skinStyle?.separator ?? "via-tile-border/40"].join(" ")} />
        {skinDef.valueFace && <NumericTileRibbon tile={tile} cellSize={cellSize}/>}
        {highlight && (
          <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent" />
        )}
      </div>
      {isRoman ? <RomanHalf value={tile.bottom} cellSize={cellSize} accent={romanAccent} labelEdge="top" /> : skinActive && skinDef.valueIcon ? (
        <ValueArtHalf value={tile.bottom} iconFn={skinDef.valueFace ?? skinDef.valueIcon} cellSize={cellSize} accent={skinDef.accent} portrait={isPortrait} labelEdge="top" roman={skinDef.portraitNumerals === "roman" && !skinDef.valueFace} showLabel={!skinDef.valueFace}/>
      ) : (
        <DotGrid value={tile.bottom} cellSize={cellSize} dotClass={dotClass} dotShape={isWild || isGolden || isMirror || isBomb ? "round" : skinDotShape} />
      )}
      {tile.edition && !skinDef.valueFace && <EditionBadge edition={tile.edition} />}
    </Root>
  );
}

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Tile, PlacementSide, ChainState } from "@/types/domino";
import { getValidPlacements } from "@/engine/chain";
import TileView from "./TileView";
import type { TileSkin } from "./TileView";
import { useSettings, useReduceMotion } from "@/hooks/useSettings";
import Tooltip from "./Tooltip";
import { t } from "@/engine/i18n";
import TileDetails from "./TileDetails";
import type { ScoreExplanation } from "@/engine/scoreExplanation";
import ResourceSheet from "./ResourceSheet";
import ScoreExplanationView from "./ScoreExplanationView";
import type { ActionCue } from "@/engine/actionFeedback";

interface HandProps {
  tiles: Tile[];
  chain: ChainState;
  onPlay: (tile: Tile, side: PlacementSide) => void;
  disabled: boolean;
  skin?: TileSkin;
  onDiscard?: (tile: Tile) => void;
  canDiscard?: boolean;
  /** Score delta for the requested end, or the default click (right when both fit). */
  getPlacements?: (tile: Tile) => PlacementSide[];
  getScoreExplanation?: (tile: Tile, side?: PlacementSide) => ScoreExplanation | null;
  getScorePreview?: (tile: Tile, side?: PlacementSide) => number | null;
  actionCue?: ActionCue | null;
}

export default function Hand({ tiles, chain, onPlay, disabled, skin, onDiscard, canDiscard: discardAvailable, getScorePreview, getPlacements, getScoreExplanation, actionCue }: HandProps) {
  const [inspection, setInspection] = useState<{id:string;side?:PlacementSide} | null>(null);
  const inspectedTile = tiles.find(tile => tile.id === inspection?.id);
  const explanation = inspectedTile && getScoreExplanation ? getScoreExplanation(inspectedTile, inspection?.side) : null;
  const reducedMotion = useReduceMotion();
  const [settings] = useSettings();
  useEffect(()=>{if(disabled || !settings.showPreview || !inspectedTile)setInspection(null);},[disabled,settings.showPreview,inspectedTile]);
  const placements = (tile: Tile) => getPlacements ? getPlacements(tile) : getValidPlacements(chain, tile);
  const sortedTiles = useMemo(() => {
    return [...tiles].sort((a, b) => {
      const aPlayable = placements(a).length > 0 ? 0 : 1;
      const bPlayable = placements(b).length > 0 ? 0 : 1;
      if (aPlayable !== bPlayable) return aPlayable - bPlayable;
      return (a.top + a.bottom) - (b.top + b.bottom);
    });
  }, [tiles, chain, getPlacements]);

  const handleClick = (tile: Tile) => {
    if (disabled) return;
    const sides = placements(tile);
    if (sides.length === 0) return;

    if (sides.length === 1) {
      onPlay(tile, sides[0]!);
    } else {
      onPlay(tile, "right");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 hand-panel">
      {inspection && inspectedTile && explanation && settings.showPreview && !disabled && <ResourceSheet mobileOnly={false} title={t("explain.title", {top:inspectedTile.top,bottom:inspectedTile.bottom})} onClose={() => setInspection(null)}>
        <div className="flex gap-2 mb-4">{placements(inspectedTile).map(side=><button key={side} className="px-3 min-h-11 border border-surface-600 rounded text-xs" aria-pressed={explanation.side===side} onClick={()=>setInspection({id:inspectedTile.id,side})}>{t(side === "left" ? "board.leftEnd" : "board.rightEnd")}</button>)}</div>
        <ScoreExplanationView explanation={explanation} />
      </ResourceSheet>}
      <span className="hand-caption">
        {t("hand.label")} ({tiles.length})
      </span>
      <div className="flex flex-wrap justify-center gap-3 min-h-[120px] px-2">
        <AnimatePresence mode="popLayout" custom={actionCue}>
          {sortedTiles.map((tile) => {
            const sides = placements(tile);
            const playable = sides.length > 0 && !disabled;
            const preview = settings.showPreview && playable && getScorePreview ? getScorePreview(tile) : null;
            const blockedReason = playable ? null : disabled ? t("hand.closed")
              : tile.type === "locked" ? t("hand.locked")
              : getValidPlacements(chain, tile).length > 0 ? t("hand.bossBlocked")
              : t("hand.noConnection");
            const arriving = actionCue?.tile?.id === tile.id && (actionCue.kind === "draw" || actionCue.kind === "undo");
            return (
              <motion.div
                key={tile.id}
                data-hand-piece={tile.id}
                data-hand-arrival={arriving ? actionCue.kind : undefined}
                layout={!reducedMotion}
                layoutDependency={tiles}
                initial={reducedMotion ? false : arriving ? {opacity:0,scale:.94,y:actionCue.kind==="draw"?-22:-16,x:actionCue.kind==="undo"?-8:0} : { opacity: 0, scale: 0.3, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0, x:0, rotate:0 }}
                variants={{ leaving: (cue: ActionCue | null) => cue?.kind==="discard" && cue.tile?.id===tile.id
                  ? {opacity:0,x:26,y:10,rotate:5,scale:.9,transition:{duration:settings.fastAnimations ? 0.11 : 0.22,ease:"easeOut"}}
                  : {opacity:0,scale:.5,y:-50,transition:{duration:settings.fastAnimations ? 0.09 : 0.18}} }}
                exit={reducedMotion ? undefined : "leaving"}
                transition={reducedMotion ? { duration: 0 } : arriving ? {duration:settings.fastAnimations ? 0.14 : 0.28,ease:[.22,1,.36,1]} : { type: "spring", stiffness: 400, damping: 30 }}
                className="relative group"
              >
                {/* Playable ring — only when chain has tiles and this tile connects */}
                {playable && chain.placed.length > 0 && !reducedMotion && (
                  <motion.div
                    className="absolute -inset-1 rounded-2xl border border-accent-gold/30 pointer-events-none"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <Tooltip
                  content={<TileDetails tile={tile}>
                    <div className={`mt-0.5 pt-1 border-t border-surface-600/40 text-[10px] ${playable ? "text-green-300" : "text-red-300"}`}>
                      {blockedReason ?? t(sides.length === 2 ? "hand.fitsBoth" : sides[0] === "left" ? "hand.fitsLeft" : "hand.fitsRight")}
                      {settings.showPreview && preview !== null && <span className={`${preview < 0 ? "text-red-300" : "text-accent-gold"} font-mono font-bold ml-1`}>{preview >= 0 ? "+" : ""}{preview}</span>}
                    </div>
                  </TileDetails>}
                  placement="top"
                  delay={180}
                  disabled={!settings.showHints}
                  accessibleLabel={settings.showHints && !playable && !disabled ? `${tile.top}|${tile.bottom}: ${blockedReason}` : undefined}
                >
                  <TileView
                    tile={tile}
                    animate={false}
                    animateExit={false}
                    onClick={() => handleClick(tile)}
                    disabled={!playable}
                    highlight={playable}
                    skin={skin}
                    placementSound={false}
                  />
                </Tooltip>
                {playable && chain.placed.length > 0 && sides.length === 2 && (
                  <div className="hand-sides" role="group" aria-label={t("hand.chooseEnd")}>
                    {sides.map((side) => {
                      const delta = settings.showPreview ? getScorePreview?.(tile, side) : null;
                      const score = delta == null ? null : `${delta >= 0 ? "+" : ""}${delta}`;
                      const label = t(side === "left" ? "hand.playLeft" : "hand.playRight", { top: tile.top, bottom: tile.bottom });
                      return <button key={side} onClick={() => onPlay(tile, side)}
                        aria-label={score === null ? label : `${label} · ${t("hand.scoreDelta", { n: score })}`} title={label}>
                        <span aria-hidden="true">{side === "left" ? "←" : "→"}</span>
                        {score !== null && <span aria-hidden="true" className="hand-side-score" data-negative={delta! < 0}>{score}</span>}
                      </button>;
                    })}
                  </div>
                )}
                {settings.showPreview && preview !== null && (
                  <div className="hand-preview" data-negative={preview < 0} title={t("hand.previewExplanation")} aria-label={t("hand.scoreDelta", { n: `${preview >= 0 ? "+" : ""}${preview}` })}>{getScoreExplanation ? <button type="button" className="min-h-11 px-2 rounded border border-accent-gold/30 hover:bg-accent-gold/10" aria-label={t("explain.inspect", {top:tile.top,bottom:tile.bottom})} onClick={() => setInspection({id:tile.id})}>{preview >= 0 ? "+" : ""}{preview} <span aria-hidden="true">?</span></button> : <>{preview >= 0 ? "+" : ""}{preview}</>}</div>
                )}
                {onDiscard && discardAvailable && !disabled && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDiscard(tile); }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 border border-red-400/50 text-[9px] text-white font-bold opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-400 hand-discard"
                    aria-label={t("hand.discard", { top: tile.top, bottom: tile.bottom })}
                    title={t("hand.discard", { top: tile.top, bottom: tile.bottom })}
                  >
                    <span aria-hidden="true">×</span><span className="hand-discard-label">{t("hand.discardAction")}</span>
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

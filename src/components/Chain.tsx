import { useReduceMotion, useSettings } from "@/hooks/useSettings";
import { useEffect } from "react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { t } from "@/engine/i18n";
import type { ChainState } from "@/types/domino";
import TileView from "./TileView";
import type { TileSkin } from "./TileView";
import Tooltip from "./Tooltip";
import TileDetails, { tileDetailsLabel } from "./TileDetails";

interface ChainProps {
  chain: ChainState;
  skin?: TileSkin;
  patternFlash?: number;
}

export default function Chain({ chain, skin, patternFlash = 0 }: ChainProps) {

  const reducedMotion = useReduceMotion();
  const [settings] = useSettings();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  // Capture the tiles present at this pattern trigger; later placements must not replay it.
  useEffect(() => {
    if (!scope.current || reducedMotion || patternFlash <= 0) return;
    const pieces = [...scope.current.querySelectorAll<HTMLElement>("[data-chain-piece]")];
    const controls = pieces.map((piece, i) => animate(piece, {
      scale: [1, 1.04, 1], filter: ["brightness(1)", "brightness(1.35)", "brightness(1)"],
    }, { delay: Math.min(i * 0.018, 0.12), duration: 0.36, ease: [0.22, 1, 0.36, 1] }));
    return () => {
      controls.forEach(control => control.stop());
      pieces.filter(piece => piece.isConnected).forEach(piece => {
        void animate(piece, { scale: 1, filter: "brightness(1)" }, { duration: 0 });
      });
    };
  }, [patternFlash, reducedMotion, animate, scope]);

  if (chain.placed.length === 0) {
    return (
      <motion.div
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        className="table-empty"
      >
        {t("chain.empty")}
      </motion.div>
    );
  }

  return (
    <div ref={scope} className="chain-flow flex flex-wrap items-center justify-center gap-1.5 min-h-[8rem] py-4" role="group" aria-label={`${t("chain.sequence", { n: chain.placed.length })}. ${t("board.leftEnd")}: ${chain.leftEnd}. ${t("board.rightEnd")}: ${chain.rightEnd}.`}>
      <AnimatePresence mode="popLayout">
        {chain.placed.map((p, i) => (
          <motion.div
            key={p.tile.id}
            layout={!reducedMotion}
            layoutDependency={chain.placed}
            initial={false}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0, filter: "brightness(1)" }}
            transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 32 }}
            data-chain-piece
            className="relative flex items-center gap-1"
          >
            <div className="chain-entry" data-chain-position={i + 1} data-chain-tile={p.tile.id}>
            {chain.placed.length >= 7 && <span className="chain-index" aria-hidden="true">{i + 1}</span>}
            <Tooltip content={<TileDetails tile={p.tile} />} placement="top" delay={200}
              disabled={!settings.showHints} accessibleLabel={settings.showHints ? `${t("chain.position", { n: i + 1, total: chain.placed.length })}. ${tileDetailsLabel(p.tile)}` : undefined}>
              <TileView tile={p.tile} staticView size="sm" animate={false} skin={skin} />
              {!reducedMotion && <span aria-hidden="true" data-placement-feedback className="placement-feedback" />}
            </Tooltip>
            <span className="chain-end-mark" aria-hidden="true">
              {i === 0 && <span data-chain-end="left">← {chain.leftEnd}</span>}
              {i === chain.placed.length - 1 && <span data-chain-end="right">{chain.rightEnd} →</span>}
            </span>
            </div>
            {i < chain.placed.length - 1 && (
              <motion.div
                initial={reducedMotion ? false : { width: 0 }}
                animate={{ width: 6 }}
                transition={reducedMotion ? { duration: 0 } : undefined}
                className="h-0.5 bg-accent-silver/20 rounded"
                data-chain-link
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

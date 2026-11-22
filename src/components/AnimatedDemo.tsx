import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import TileView from "./TileView";
import type { Tile } from "@/types/domino";
import {trainingChainScore} from "@/engine/training";
import {useReduceMotion} from "@/hooks/useSettings";
import { useTranslation } from "@/engine/i18n";

interface DemoStep {
  hand: Tile[];
  chain: Tile[];
  label?: string;
  highlight?: string; // tile id to highlight
}

interface AnimatedDemoProps {
  steps: DemoStep[];
  intervalMs?: number;
}

export default function AnimatedDemo({ steps, intervalMs = 2000 }: AnimatedDemoProps) {
  const { t } = useTranslation();
  const [stepIdx, setStepIdx] = useState(0);
  const reduced=useReduceMotion();
  const [paused, setPaused] = useState(reduced);

  const advance = useCallback(() => {
    if(document.hidden || document.querySelector('dialog[open]'))return;
    setStepIdx((prev) => (prev + 1) % steps.length);
  }, [steps.length]);
  useEffect(()=>{if(reduced)setPaused(true);},[reduced]);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(advance, intervalMs);
    return () => clearInterval(timer);
  }, [advance, intervalMs, paused]);

  const current = steps[stepIdx]!;
  const currentScore=trainingChainScore(current.chain);

  return (
    <button
      type="button"
      aria-pressed={paused}
      aria-label={paused ? t("demo.aria.resume") : t("demo.aria.pause")}
      className="relative w-full text-left rounded-2xl bg-surface-800/60 border border-surface-600/30 overflow-hidden cursor-pointer"
      onClick={() => setPaused((p) => !p)}
    >
      {/* Progress dots + pause */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={[
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                i === stepIdx ? "bg-accent-gold scale-125" : i < stepIdx ? "bg-accent-gold/40" : "bg-surface-600",
              ].join(" ")}
            />
          ))}
        </div>
        {paused && (
          <span className="text-[8px] text-accent-silver/30 uppercase tracking-widest">{t("demo.paused")}</span>
        )}
      </div>

      <div className="flex flex-col items-center gap-3 px-4 pb-4 pt-1">
        {/* Chain area */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[8px] text-accent-silver/25 uppercase tracking-widest font-bold">{t("demo.chain")}</span>
          <div className="flex flex-wrap justify-center items-center gap-1 min-h-[36px]">
            <AnimatePresence mode="popLayout">
              {current.chain.map((tile, i) => (
                <motion.div
                  key={`chain-${tile.id}-${i}`}
                  initial={reduced ? false : { opacity: 0, scale: 0.5, x: 30 }}
                  animate={{ opacity: 1, scale: 0.8, x: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ delay: i * 0.12, duration: 0.3, type: "spring", stiffness: 300 }}
                  className="origin-center"
                >
                  <TileView tile={tile} disabled size="sm" animate={false} />
                </motion.div>
              ))}
            </AnimatePresence>
            {current.chain.length === 0 && (
              <span className="text-[10px] text-accent-silver/15 italic">{t("demo.empty")}</span>
            )}
          </div>
        </div>

        {/* Score + Label row */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            key={currentScore}
            initial={reduced ? false : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5"
          >
            <span data-demo-score className="font-mono font-bold text-lg text-accent-gold tabular-nums">{currentScore}</span>
            <span className="text-[8px] text-accent-silver/25">pts</span>
          </motion.div>

          <AnimatePresence mode="wait">
            {current.label && (
              <motion.span
                key={current.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[10px] text-accent-silver/50 font-medium text-center leading-tight"
              >
                {current.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Hand area */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[8px] text-accent-silver/25 uppercase tracking-widest font-bold">{t("demo.hand")}</span>
          <div className="flex flex-wrap justify-center items-center gap-1 min-h-[36px]">
            <AnimatePresence mode="popLayout">
              {current.hand.map((tile) => (
                <motion.div
                  key={`hand-${tile.id}`}
                  initial={reduced ? false : { opacity: 0, y: 15 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: current.highlight === tile.id ? 0.9 : 0.8,
                  }}
                  exit={{ opacity: 0, y: -20, scale: 0.5 }}
                  transition={{ duration: 0.25 }}
                  className={[
                    "origin-center",
                    current.highlight === tile.id ? "ring-2 ring-accent-gold/50 rounded-lg" : "",
                  ].join(" ")}
                >
                  <TileView tile={tile} disabled size="sm" animate={false} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-accent-silver px-3 pb-5">{t("demo.realScore")}</p>
      {/* Click hint */}
      <div className="absolute bottom-1.5 right-2.5">
        <span className="text-[7px] text-accent-silver/12">{paused ? t("demo.clickResume") : t("demo.clickPause")}</span>
      </div>
    </button>
  );
}

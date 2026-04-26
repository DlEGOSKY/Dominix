import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GiLaurelCrown, GiInfinity } from "react-icons/gi";
import { celebrateBigEvent } from "@/engine/celebrate";
import { audio } from "@/engine/audio";
import OrbitingRays from "./cinematic/OrbitingRays";
import Sparkles from "./cinematic/Sparkles";
import RadialFlash from "./cinematic/RadialFlash";
import Shockwave from "./cinematic/Shockwave";

interface VictoryOverlayProps {
  /** Round reached when the Eco act started (or beyond). */
  finalRound: number;
  /** Total score, used to scale the message intensity. */
  totalScore: number;
  /** Fired when user dismisses (auto after delay or click). */
  onContinue: () => void;
}

/**
 * Cinematic shown the moment a player crosses into "El Eco" — round 16+.
 * This is the symbolic completion of Dominix's three-act structure: the
 * player has finished the ritual and now walks beyond the dominion.
 *
 * Composition:
 *  - white flash at impact
 *  - twin shockwaves expanding (gold + violet for "transcendence")
 *  - rotating golden rays, slowly orbiting
 *  - continuous sparkle field around the laurel crown
 *  - massive title: "ETERNIDAD"
 */
export default function VictoryOverlay({ finalRound, totalScore, onContinue }: VictoryOverlayProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    celebrateBigEvent();
    audio.play("pattern_mega");
  }, []);

  // Auto-advance after 4.2s, but any input dismisses early
  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(onContinue, 350);
    }, 4200);
    const onKey = () => {
      setVisible(false);
      window.setTimeout(onContinue, 350);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [visible, onContinue]);

  const handleClick = () => {
    setVisible(false);
    window.setTimeout(onContinue, 350);
  };

  // Subtitle adapts to how deep the player went
  const subtitle = (() => {
    if (totalScore >= 50000) return "Tu nombre se inscribe en el firmamento.";
    if (totalScore >= 20000) return "Has cruzado el umbral del dominio.";
    if (finalRound >= 20) return "El Eco te reconoce.";
    return "Mas alla del ritual, solo queda lo que dejaste.";
  })();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="victory-title"
          className="fixed inset-0 z-[60] flex items-center justify-center cursor-pointer overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(120,80,30,0.45) 0%, rgba(40,15,60,0.85) 60%, rgba(0,0,0,0.97) 100%)",
          }}
        >
          {/* Layer 1: opening flash */}
          <RadialFlash color="rgba(255,243,199,1)" intensity={0.95} duration={0.8} />

          {/* Layer 2: rotating rays of light (slow, divine feel) */}
          <OrbitingRays rays={14} color="rgba(252,211,77,0.4)" length={1200} width={3} duration={18} />
          <OrbitingRays rays={10} color="rgba(167,139,250,0.25)" length={1000} width={2} duration={24} reverse />

          {/* Layer 3: shockwaves (gold + violet) */}
          <Shockwave color="rgba(252,211,77,0.6)" rings={3} reach={1300} duration={1.8} stagger={0.2} />
          <Shockwave color="rgba(167,139,250,0.4)" rings={2} reach={1100} duration={1.6} stagger={0.3} />

          {/* Layer 4: continuous sparkles */}
          <Sparkles count={50} color="rgba(252,211,77,0.95)" spread={520} sizeRange={[2, 8]} loop seed={42} />
          <Sparkles count={20} color="rgba(255,255,255,0.85)" spread={420} sizeRange={[2, 5]} loop seed={199} />

          {/* Content stack */}
          <div className="relative flex flex-col items-center gap-7 px-6 max-w-2xl text-center">
            {/* Crown icon with glow */}
            <motion.div
              initial={{ scale: 0, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 180, damping: 15 }}
              className="relative"
            >
              <div
                aria-hidden
                className="absolute inset-0 blur-3xl opacity-90"
                style={{ background: "radial-gradient(circle, rgba(252,211,77,0.95) 0%, transparent 65%)" }}
              />
              <GiLaurelCrown
                size={140}
                className="relative text-amber-200 drop-shadow-[0_0_30px_rgba(252,211,77,0.95)]"
              />
            </motion.div>

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.6em] text-amber-200/75"
            >
              <GiInfinity size={16} />
              <span>El Eco te recibe</span>
              <GiInfinity size={16} />
            </motion.div>

            {/* Massive title */}
            <motion.h2
              id="victory-title"
              initial={{ opacity: 0, y: 30, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.85, type: "spring", stiffness: 180, damping: 18 }}
              className="font-display font-black text-6xl sm:text-8xl tracking-tight leading-none"
              style={{
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 35%, #f59e0b 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                textShadow: "0 0 40px rgba(252,211,77,0.7)",
                filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.6))",
              }}
            >
              ETERNIDAD
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-base sm:text-lg italic text-amber-100/80 max-w-md leading-relaxed"
            >
              {subtitle}
            </motion.p>

            {/* Stats pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="flex items-center gap-6 mt-3 px-6 py-2.5 rounded-full bg-black/40 border border-amber-400/30 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-200/50">Ronda</span>
                <span className="text-2xl font-mono font-bold text-amber-100 tabular-nums">{finalRound}</span>
              </div>
              <span className="w-px h-8 bg-amber-400/20" />
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-200/50">Score</span>
                <span className="text-2xl font-mono font-bold text-amber-100 tabular-nums">
                  {totalScore.toLocaleString()}
                </span>
              </div>
            </motion.div>

            {/* CTA hint */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 2 }}
              className="text-[10px] uppercase tracking-[0.4em] text-amber-100/40 mt-2"
            >
              Click para continuar
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

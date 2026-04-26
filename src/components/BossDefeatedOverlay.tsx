import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GiCrossedSwords, GiTrophyCup } from "react-icons/gi";
import type { Boss } from "@/engine/boss";
import { celebrateBigEvent } from "@/engine/celebrate";
import { audio } from "@/engine/audio";
import Shockwave from "./cinematic/Shockwave";
import RadialParticles from "./cinematic/RadialParticles";
import RadialFlash from "./cinematic/RadialFlash";
import { useLocalizedBoss } from "@/engine/i18nContent";

interface BossDefeatedOverlayProps {
  boss: Boss | null;
  visible: boolean;
  onContinue: () => void;
}

/**
 * Full-screen cinematic shown the instant a boss is defeated, before the
 * standard BossRewardScreen. Sets the tone of a major victory: dark vignette,
 * massive title, crossed swords logo, ambient glow.
 */
export default function BossDefeatedOverlay({ boss, visible, onContinue }: BossDefeatedOverlayProps) {
  // Hook order requires unconditional invocation; use a stub when boss is null.
  const loc = useLocalizedBoss(boss ?? ({ id: "", name: "", description: "", targetMultiplier: 1, reward: { gold: 0, extraRelic: false } } as never));
  useEffect(() => {
    if (!visible) return;
    celebrateBigEvent();
    audio.play("pattern_mega");
  }, [visible]);

  // Auto-advance after 2.6s, or any key/click cuts it short
  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(onContinue, 2600);
    const onKey = () => onContinue();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [visible, onContinue]);

  if (!boss) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onContinue}
          role="dialog"
          aria-modal="true"
          aria-labelledby="boss-defeated-title"
          className="fixed inset-0 z-[60] flex items-center justify-center cursor-pointer"
          style={{
            background: "radial-gradient(ellipse at center, rgba(120,20,20,0.55) 0%, rgba(0,0,0,0.95) 70%)",
          }}
        >
          {/* Impact: white flash punctuates the moment of defeat */}
          <RadialFlash color="rgba(255,243,199,1)" intensity={0.85} duration={0.55} />

          {/* Impact: dual shockwaves expanding outward */}
          <Shockwave color="rgba(251,191,36,0.6)" rings={3} reach={1100} duration={1.4} stagger={0.18} />
          <Shockwave color="rgba(220,38,38,0.4)" rings={2} reach={900} duration={1.2} stagger={0.25} />

          {/* Impact: gold particles flying out radially */}
          <RadialParticles count={28} color="rgba(252,211,77,0.95)" size={6} reach={420} duration={1.7} delay={0.05} />

          {/* Outer glow pulse (sustains after the impact) */}
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.04, 1],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: "radial-gradient(circle at center, rgba(251,191,36,0.18) 0%, transparent 55%)",
            }}
          />

          {/* Vertical accent rays */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: [0, 0.5, 0.3], scaleY: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "repeating-linear-gradient(180deg, transparent 0px, transparent 60px, rgba(251,191,36,0.04) 60px, rgba(251,191,36,0.04) 62px)",
            }}
          />

          <div className="relative flex flex-col items-center gap-6 px-6 max-w-2xl">
            {/* Crossed swords icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 16 }}
              className="relative"
            >
              <div
                className="absolute inset-0 blur-2xl opacity-70"
                style={{ background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)" }}
              />
              <GiCrossedSwords
                size={96}
                className="relative text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]"
              />
            </motion.div>

            {/* Eyebrow */}
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-[11px] font-bold uppercase tracking-[0.5em] text-amber-300/80"
            >
              Jefe derrotado
            </motion.span>

            {/* Boss name with dramatic typography */}
            <motion.h2
              id="boss-defeated-title"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.55, type: "spring", stiffness: 200, damping: 18 }}
              className="font-display font-black text-5xl sm:text-7xl tracking-tight text-white text-center leading-none"
              style={{
                textShadow: "0 0 30px rgba(251,191,36,0.5), 0 4px 12px rgba(0,0,0,0.8)",
              }}
            >
              {loc.name}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.85 }}
              className="text-sm text-white/70 italic max-w-md text-center"
            >
              {loc.description.split(".")[0]}
            </motion.p>

            {/* Reward pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05 }}
              className="flex items-center gap-3 mt-2"
            >
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/40">
                <GiTrophyCup size={16} className="text-amber-300" />
                <span className="text-sm font-mono font-bold text-amber-200">+{boss.reward.gold}</span>
              </div>
              {boss.reward.extraRelic && (
                <div className="px-4 py-1.5 rounded-lg bg-purple-500/15 border border-purple-400/40">
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-200">+ Reliquia</span>
                </div>
              )}
            </motion.div>

            {/* CTA hint */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="text-[10px] uppercase tracking-[0.3em] text-white/30 mt-4"
            >
              Click para continuar
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

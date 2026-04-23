import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import type { ActDefinition } from "@/engine/acts";

interface ActTransitionProps {
  act: ActDefinition | null;
  onDismiss: () => void;
}

/**
 * Cinematic overlay shown when the player crosses into a new act.
 * Auto-dismisses after a short duration; also dismissible on tap.
 */
export default function ActTransition({ act, onDismiss }: ActTransitionProps) {
  useEffect(() => {
    if (!act) return;
    const t = setTimeout(onDismiss, 3400);
    return () => clearTimeout(t);
  }, [act, onDismiss]);

  return (
    <AnimatePresence>
      {act && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onDismiss}
          className="fixed inset-0 z-[60] flex items-center justify-center cursor-pointer"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.98) 70%)",
          }}
        >
          {/* Ambient halo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${act.ambient.accent} 0%, transparent 55%)`,
            }}
          />

          {/* Top rule */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "40%" }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="absolute top-[38%] h-px bg-gradient-to-r from-transparent via-accent-silver/50 to-transparent"
          />
          {/* Bottom rule */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "40%" }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="absolute bottom-[38%] h-px bg-gradient-to-r from-transparent via-accent-silver/50 to-transparent"
          />

          <div className="relative flex flex-col items-center gap-5 px-8">
            <motion.div
              initial={{ opacity: 0, y: 8, letterSpacing: "0.6em" }}
              animate={{ opacity: 0.8, y: 0, letterSpacing: "0.4em" }}
              transition={{ duration: 1.0, delay: 0.25 }}
              className="text-[11px] font-bold uppercase text-accent-silver/55"
            >
              {act.numeral}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-black text-5xl sm:text-6xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50"
            >
              {act.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-[13px] italic text-accent-silver/60 text-center max-w-md"
            >
              "{act.tagline}"
            </motion.p>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="mt-2 text-[9px] font-bold uppercase tracking-[0.45em] text-accent-silver/35"
            >
              {act.mood}
            </motion.span>
          </div>

          {/* Dismiss hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ duration: 0.6, delay: 2.0 }}
            className="absolute bottom-10 text-[9px] uppercase tracking-widest text-accent-silver/40"
          >
            Toca para continuar
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

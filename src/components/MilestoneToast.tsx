import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface MilestoneToastProps {
  title: string | null;
  subtitle: string | null;
  onDismiss: () => void;
}

/**
 * A rare, high-weight celebratory toast for first-time moments (first Act
 * III, first Echo, first legendary pattern). Intentionally more imposing
 * than a quest toast — this is supposed to feel like a ceremony.
 *
 * Stays 4.5s, then auto-dismisses.
 */
export default function MilestoneToast({ title, subtitle, onDismiss }: MilestoneToastProps) {
  useEffect(() => {
    if (!title) return;
    const id = setTimeout(onDismiss, 4500);
    return () => clearTimeout(id);
  }, [title, onDismiss]);

  return (
    <AnimatePresence>
      {title && (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="relative px-6 py-4 rounded-2xl bg-gradient-to-b from-accent-gold/15 via-surface-900/95 to-surface-950/95 border border-accent-gold/40 shadow-[0_0_40px_rgba(212,168,83,0.25)] backdrop-blur-md min-w-[280px] max-w-md">
            {/* Halo */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(212,168,83,0.18) 0%, transparent 70%)",
              }}
            />
            <div className="relative flex flex-col items-center text-center gap-1.5">
              <motion.span
                initial={{ letterSpacing: "0.4em", opacity: 0 }}
                animate={{ letterSpacing: "0.3em", opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent-gold/70"
              >
                Hito alcanzado
              </motion.span>
              <motion.h3
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="font-display font-black text-xl text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-accent-silver/60"
              >
                {title}
              </motion.h3>
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-[11px] italic text-accent-silver/70 leading-relaxed"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

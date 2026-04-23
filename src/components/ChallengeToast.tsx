import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface ChallengeToastProps {
  title: string | null;
  description: string | null;
  xp: number | null;
  onDismiss: () => void;
}

/**
 * Compact in-run toast for character challenge completion. Lives in the
 * bottom-right so it does not fight with the bigger MilestoneToast.
 * Auto-dismisses after 3.5s.
 */
export default function ChallengeToast({ title, description, xp, onDismiss }: ChallengeToastProps) {
  useEffect(() => {
    if (!title) return;
    const id = setTimeout(onDismiss, 3500);
    return () => clearTimeout(id);
  }, [title, onDismiss]);

  return (
    <AnimatePresence>
      {title && (
        <motion.div
          key={title}
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed bottom-8 right-6 z-40 pointer-events-none max-w-xs"
        >
          <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-900/95 border border-accent-gold/40 shadow-[0_0_24px_rgba(212,168,83,0.18)] backdrop-blur-md">
            <div className="w-9 h-9 rounded-full bg-accent-gold/15 border border-accent-gold/50 flex items-center justify-center shrink-0">
              <span className="text-accent-gold text-sm font-bold">✓</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-accent-gold/70">
                Desafio completado
              </span>
              <span className="font-display font-black text-sm text-white truncate">{title}</span>
              {description && (
                <span className="text-[10px] text-accent-silver/55 leading-tight truncate">
                  {description}
                </span>
              )}
            </div>
            {xp !== null && xp > 0 && (
              <span className="ml-auto font-mono text-sm font-bold text-accent-gold tabular-nums shrink-0">
                +{xp}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

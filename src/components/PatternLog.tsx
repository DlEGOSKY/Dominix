import { AnimatePresence, motion } from "framer-motion";

export interface PatternLogEntry {
  id: string;
  name: string;
  bonus: number;
}

interface PatternLogProps {
  entries: PatternLogEntry[];
}

/**
 * Side panel listing patterns activated during the current round.
 * Appears floating at the top-left. Hidden when empty.
 */
export default function PatternLog({ entries }: PatternLogProps) {
  if (entries.length === 0) return null;

  return (
    <div className="pointer-events-none absolute left-3 top-20 z-10 hidden lg:flex flex-col gap-1.5 max-w-[180px]">
      <span className="text-[9px] font-bold uppercase tracking-widest text-accent-silver/35 pl-1">
        Patrones de la ronda
      </span>
      <AnimatePresence initial={false}>
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            layout
            initial={{ opacity: 0, x: -12, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-accent-gold/30 bg-surface-800/70 backdrop-blur-sm"
          >
            <div className="w-1 h-4 rounded-full bg-accent-gold/80" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-white truncate">{entry.name}</div>
              <div className="text-[9px] font-mono text-accent-gold/80">+{entry.bonus}</div>
            </div>
            <div className="text-[8px] text-accent-silver/30 font-mono">#{i + 1}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import type { PatternResult } from "@/engine/patterns";

interface PatternDisplayProps {
  patterns: PatternResult[];
  multiplier: number;
}

export default function PatternDisplay({ patterns, multiplier }: PatternDisplayProps) {
  if (patterns.length === 0) {
    return (
      <div className="text-xs text-accent-silver/40 tracking-wide h-8 flex items-center">
        Sin patrones activos
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        <AnimatePresence mode="popLayout">
          {patterns.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 25 }}
              className="px-3 py-1.5 rounded-md bg-surface-700 border border-accent-gold/30 text-sm"
            >
              <span className="font-medium text-accent-gold">{p.name}</span>
              {p.bonus > 0 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-2 text-green-400"
                >
                  +{p.bonus}
                </motion.span>
              )}
              {p.multiplier > 1 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-2 text-blue-400"
                >
                  x{p.multiplier}
                </motion.span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {multiplier > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm font-mono font-semibold text-blue-400"
          >
            Multiplicador total: x{multiplier.toFixed(1)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

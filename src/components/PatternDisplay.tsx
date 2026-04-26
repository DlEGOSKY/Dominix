import { motion, AnimatePresence } from "framer-motion";
import type { PatternResult, ComboResult } from "@/engine/patterns";
import { ALL_PATTERNS } from "@/engine/patterns";
import { getPatternIcon } from "@/engine/patternIcons";
import Tooltip, { PatternTooltipContent } from "./Tooltip";
import { localizePattern, localizePatternById } from "@/engine/i18nContent";
import { useTranslation } from "@/engine/i18n";

interface PatternDisplayProps {
  patterns: PatternResult[];
  multiplier: number;
  combo?: ComboResult | null;
}

export default function PatternDisplay({ patterns, multiplier, combo }: PatternDisplayProps) {
  // Subscribe to lang changes so chip names + tooltip refresh on switch.
  useTranslation();
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
          {patterns.map((p, i) => {
            const def = ALL_PATTERNS.find((d) => d.id === p.id);
            const Icon = getPatternIcon(p.id);
            const locName = localizePatternById(p.id, p.name).name;
            const chip = (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                className="px-3 py-1.5 rounded-md bg-surface-700 border border-accent-gold/30 text-sm flex items-center gap-1.5"
              >
                {Icon && <Icon className="text-accent-gold" size={14} />}
                <span className="font-medium text-accent-gold">{locName}</span>
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
            );
            if (!def) return chip;
            const locDef = localizePattern(def);
            return (
              <Tooltip
                key={p.id}
                content={
                  <PatternTooltipContent
                    name={locDef.name}
                    description={locDef.description}
                    bonus={p.bonus}
                    multiplier={p.multiplier}
                  />
                }
                placement="top"
                delay={200}
              >
                {chip}
              </Tooltip>
            );
          })}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {combo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/40"
          >
            <span className="font-bold text-sm text-purple-300">{combo.name}</span>
            <span className="ml-2 text-green-400 text-sm">+{combo.bonus}</span>
            <span className="ml-2 text-blue-400 text-sm">x{combo.multiplier}</span>
          </motion.div>
        )}
      </AnimatePresence>
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

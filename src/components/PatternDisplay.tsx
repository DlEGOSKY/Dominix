import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { PatternResult, ComboResult } from "@/engine/patterns";
import { ALL_PATTERNS } from "@/engine/patterns";
import { getPatternIcon } from "@/engine/patternIcons";
import Tooltip, { PatternTooltipContent } from "./Tooltip";
import { localizePattern, localizePatternById } from "@/engine/i18nContent";
import { useTranslation } from "@/engine/i18n";

// Above this number of simultaneously active patterns the list collapses
// to the highest-impact ones with a toggle. Late Act III runs routinely
// trigger 10-14 patterns at once and 4-5 chip rows hijack the playfield.
const COLLAPSE_THRESHOLD = 6;

interface PatternDisplayProps {
  patterns: PatternResult[];
  multiplier: number;
  combo?: ComboResult | null;
}

export default function PatternDisplay({ patterns, multiplier, combo }: PatternDisplayProps) {
  // Subscribe to lang changes so chip names + tooltip refresh on switch.
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (patterns.length === 0) {
    return (
      <div className="text-xs text-accent-silver/40 tracking-wide h-8 flex items-center">
        {t("patterns.empty")}
      </div>
    );
  }

  // Sort by impact so the visible chips show the top contributors first;
  // the original order is irrelevant to the player and "importance first"
  // is more useful when collapsed.
  const ranked = [...patterns].sort((a, b) => {
    const impactA = a.bonus + (a.multiplier - 1) * 100;
    const impactB = b.bonus + (b.multiplier - 1) * 100;
    return impactB - impactA;
  });
  const overflow = ranked.length - COLLAPSE_THRESHOLD;
  const collapsible = overflow > 0;
  const visiblePatterns = collapsible && !expanded ? ranked.slice(0, COLLAPSE_THRESHOLD) : ranked;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        <AnimatePresence mode="popLayout">
          {visiblePatterns.map((p, i) => {
            const def = ALL_PATTERNS.find((d) => d.id === p.id);
            const Icon = getPatternIcon(p.id);
            const locName = localizePatternById(p.id, p.name).name;
            const isDominant = i === 0 && patterns.length > 1;
            const chip = (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
                className={[
                  "flex items-center gap-1.5 rounded-md border",
                  isDominant
                    ? "px-3.5 py-2 bg-surface-700 border-accent-gold/60 shadow-[0_0_8px_rgba(212,168,83,0.2)] text-sm"
                    : "px-2.5 py-1.5 bg-surface-700/80 border-accent-gold/25 text-xs",
                ].join(" ")}
              >
                {Icon && <Icon className={isDominant ? "text-accent-gold" : "text-accent-gold/70"} size={isDominant ? 14 : 12} />}
                <span className={`font-medium ${isDominant ? "text-accent-gold" : "text-accent-gold/80"}`}>{locName}</span>
                {p.bonus > 0 && (
                  <span className={`font-mono ${isDominant ? "text-green-400" : "text-green-400/70"}`}>
                    +{p.bonus}
                  </span>
                )}
                {p.multiplier > 1 && (
                  <span className={`font-mono ${isDominant ? "text-blue-400" : "text-blue-400/70"}`}>
                    x{p.multiplier}
                  </span>
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
        {collapsible && (
          <motion.button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 rounded-md bg-surface-700/60 border border-accent-silver/20 text-sm font-medium text-accent-silver/70 hover:text-accent-silver hover:border-accent-silver/40 transition-colors"
            aria-expanded={expanded}
          >
            {expanded ? t("patterns.showLess") : t("patterns.showMore", { n: overflow })}
          </motion.button>
        )}
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
            {t("patterns.totalMult", { n: multiplier.toFixed(1) })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

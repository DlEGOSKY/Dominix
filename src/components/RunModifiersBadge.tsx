import { motion, AnimatePresence } from "framer-motion";

interface RunModifiersBadgeProps {
  /** Flat score bonus per tile active for the rest of the run. */
  flatBonusPerTile?: number;
  /** Multiplier applied to the next round's target (1 = none). */
  pendingTargetMultiplier?: number;
}

/**
 * Small inline indicator that surfaces run-wide effects granted by narrative
 * interludes (e.g. "El yo salvaje" = +3 per tile, "El Guardian" = -15% next
 * target). Hidden by default; only renders when something is actually active.
 *
 * Placed next to the score bar so the player feels the mark from their
 * choice persist through gameplay.
 */
export default function RunModifiersBadge({
  flatBonusPerTile = 0,
  pendingTargetMultiplier = 1,
}: RunModifiersBadgeProps) {
  const flags: Array<{ key: string; label: string; color: string; icon: string }> = [];

  if (flatBonusPerTile > 0) {
    flags.push({
      key: "flat",
      label: `+${flatBonusPerTile} / ficha`,
      color: "from-emerald-500/20 to-emerald-700/10 border-emerald-400/30 text-emerald-200",
      icon: "+",
    });
  }

  if (pendingTargetMultiplier !== 1) {
    const pct = Math.round((pendingTargetMultiplier - 1) * 100);
    const sign = pct > 0 ? "+" : "";
    const isBuff = pct < 0;
    flags.push({
      key: "target",
      label: `Meta ${sign}${pct}%`,
      color: isBuff
        ? "from-sky-500/20 to-sky-700/10 border-sky-400/30 text-sky-200"
        : "from-rose-500/20 to-rose-700/10 border-rose-400/30 text-rose-200",
      icon: isBuff ? "↓" : "↑",
    });
  }

  if (flags.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <AnimatePresence>
        {flags.map((f) => (
          <motion.div
            key={f.key}
            initial={{ opacity: 0, scale: 0.8, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-b ${f.color} border text-[10px] font-bold tracking-wide`}
            title="Eco de un interludio narrativo"
          >
            <span className="opacity-60">{f.icon}</span>
            <span>{f.label}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

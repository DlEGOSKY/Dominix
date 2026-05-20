import { motion } from "framer-motion";
import type { ChaosTwist } from "@/engine/chaos";
import { GiTwirlyFlower, GiSparkles, GiCrossedSwords } from "react-icons/gi";

interface ChaosTwistBadgeProps {
  twist: ChaosTwist | null;
  compact?: boolean;
}

/**
 * Displays the active chaos twist for the current round.
 * Shows icon, name, and description with color-coded tone.
 */
export default function ChaosTwistBadge({ twist, compact = false }: ChaosTwistBadgeProps) {
  if (!twist) return null;

  const toneConfig = {
    good: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-300",
      icon: GiSparkles,
      glow: "shadow-[0_0_12px_rgba(34,197,94,0.2)]",
    },
    bad: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-300",
      icon: GiCrossedSwords,
      glow: "shadow-[0_0_12px_rgba(239,68,68,0.2)]",
    },
    neutral: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-300",
      icon: GiTwirlyFlower,
      glow: "shadow-[0_0_12px_rgba(168,85,247,0.2)]",
    },
  };

  const config = toneConfig[twist.tone];
  const Icon = config.icon;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg} ${config.border} border ${config.glow}`}
      >
        <Icon size={14} className={config.text} />
        <span className={`text-xs font-bold ${config.text}`}>{twist.name}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 p-4 rounded-xl ${config.bg} ${config.border} border-2 ${config.glow}`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bg} ${config.border} border flex items-center justify-center`}>
        <Icon size={20} className={config.text} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-bold text-sm ${config.text}`}>{twist.name}</h3>
          <span className="text-[9px] uppercase tracking-widest text-accent-silver/40 font-bold">
            {twist.tone === "good" ? "Beneficio" : twist.tone === "bad" ? "Desafío" : "Neutral"}
          </span>
        </div>
        <p className="text-xs text-accent-silver/70 leading-relaxed">{twist.description}</p>
      </div>
    </motion.div>
  );
}

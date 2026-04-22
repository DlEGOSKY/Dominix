import { motion } from "framer-motion";
import type { RewardOption } from "@/types/reward";
import { audio } from "@/engine/audio";
import { getRelicRarity, getRelicFamily, FAMILY_META } from "@/engine/relics";
import RelicCard from "./RelicCard";

interface RewardScreenProps {
  options: RewardOption[];
  onSelect: (option: RewardOption) => void;
  onSkip: () => void;
}

function getCardStyle(option: RewardOption) {
  if (option.reward.type === "relic") {
    const rarity = getRelicRarity(option.reward.relic);
    if (rarity === "legendary") {
      return {
        border: "border-purple-400/60",
        glow: "hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]",
        badge: "bg-purple-500/20 text-purple-300 border-purple-400/40",
        badgeText: "Legendaria",
        topGlow: "bg-gradient-to-b from-purple-500/20 to-transparent",
      };
    }
    if (rarity === "rare") {
      return {
        border: "border-blue-400/50",
        glow: "hover:shadow-[0_0_35px_rgba(59,130,246,0.3)]",
        badge: "bg-blue-500/20 text-blue-300 border-blue-400/40",
        badgeText: "Rara",
        topGlow: "bg-gradient-to-b from-blue-500/15 to-transparent",
      };
    }
    return {
      border: "border-accent-gold/40",
      glow: "hover:shadow-[0_0_30px_rgba(212,168,83,0.2)]",
      badge: "bg-accent-gold/20 text-accent-gold border-accent-gold/30",
      badgeText: "Reliquia",
      topGlow: "bg-gradient-to-b from-accent-gold/10 to-transparent",
    };
  }
  return {
    border: "border-cyan-500/40",
    glow: "hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
    badgeText: "Mutacion",
    topGlow: "bg-gradient-to-b from-cyan-500/10 to-transparent",
  };
}

export default function RewardScreen({ options, onSelect, onSkip }: RewardScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-surface-900/95 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="flex flex-col items-center gap-8 max-w-3xl px-6">
        <div className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 20 }}
            className="w-12 h-12 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center mb-2"
          >
            <div className="w-5 h-5 rounded-sm bg-accent-gold/60 rotate-45" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-3xl text-white tracking-tight"
          >
            Elige una mejora
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-sm text-accent-silver/40"
          >
            Cada decision define tu build
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
          {options.map((option, i) => {
            const style = getCardStyle(option);
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                whileHover={{ scale: 1.04, y: -6 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  audio.play("relic_select");
                  onSelect(option);
                }}
                className={[
                  "relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 text-left overflow-hidden",
                  "reward-card",
                  style.border,
                  style.glow,
                  "transition-shadow duration-300",
                ].join(" ")}
              >
                {/* Top glow accent */}
                <div className={`absolute top-0 left-0 right-0 h-16 ${style.topGlow} pointer-events-none`} />

                {/* Badge */}
                <span className={`relative px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${style.badge}`}>
                  {style.badgeText}
                </span>

                {/* Relic card visual or generic icon */}
                {option.reward.type === "relic" ? (
                  <div className="relative flex justify-center w-full">
                    <RelicCard relicId={option.reward.relic.id} size="md" showName={false} />
                  </div>
                ) : (
                  <div className="relative w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-cyan-400/50" />
                  </div>
                )}

                {/* Name */}
                <span className="relative font-display font-bold text-white text-xl leading-tight">
                  {option.name}
                </span>

                {/* Description */}
                <span className="relative text-sm text-accent-silver/60 leading-relaxed flex-1">
                  {option.description}
                </span>

                {/* Family tag (relic only) */}
                {option.reward.type === "relic" && (() => {
                  const fam = getRelicFamily(option.reward.relic);
                  if (!fam) return null;
                  const meta = FAMILY_META[fam];
                  const famTextClass =
                    fam === "patron" ? "text-accent-gold" :
                    fam === "numero" ? "text-blue-300" :
                    fam === "fuerza" ? "text-red-300" :
                    fam === "cadena" ? "text-purple-300" :
                    "text-green-300";
                  return (
                    <span
                      className={`relative text-[10px] uppercase tracking-widest font-bold ${famTextClass}`}
                      title={meta.setBonusDescription}
                    >
                      {meta.icon} {meta.name}
                    </span>
                  );
                })()}

                {/* Bottom decorative line */}
                <div className="w-full mt-1">
                  <div className={`h-0.5 rounded-full bg-gradient-to-r ${
                    style.badgeText === "Legendaria"
                      ? "from-purple-400/60 via-purple-400/30 to-transparent"
                      : style.badgeText === "Rara"
                        ? "from-blue-400/60 via-blue-400/30 to-transparent"
                        : style.badgeText === "Reliquia"
                          ? "from-accent-gold/40 via-accent-gold/20 to-transparent"
                          : "from-cyan-400/40 via-cyan-400/20 to-transparent"
                  }`} />
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onSkip}
          className="mt-2 px-6 py-2.5 rounded-xl text-sm text-accent-silver/40 hover:text-accent-silver/70 border border-surface-600/50 hover:border-surface-600 transition-all"
        >
          Saltar recompensa
        </motion.button>
      </div>
    </motion.div>
  );
}

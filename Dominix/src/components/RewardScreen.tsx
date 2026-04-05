import { motion } from "framer-motion";
import type { RewardOption } from "@/types/reward";
import { audio } from "@/engine/audio";

interface RewardScreenProps {
  options: RewardOption[];
  onSelect: (option: RewardOption) => void;
  onSkip: () => void;
}

export default function RewardScreen({ options, onSelect, onSkip }: RewardScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-surface-900/95 flex items-center justify-center z-50"
    >
      <div className="flex flex-col items-center gap-6 max-w-2xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display font-bold text-2xl text-accent-gold tracking-tight"
        >
          Elige una mejora
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {options.map((option, i) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ scale: 1.03, borderColor: "#d4a853" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                audio.play("relic_select");
                onSelect(option);
              }}
              className="flex flex-col items-start gap-2 p-4 rounded-xl border-2 border-surface-600 bg-surface-800 hover:bg-surface-700 transition-colors text-left"
            >
              <span className="font-semibold text-white text-lg">{option.name}</span>
              <span className="text-sm text-accent-silver/70 leading-relaxed">
                {option.description}
              </span>
              {option.reward.type !== "relic" && (
                <span className="text-xs text-blue-400 mt-1">Mutacion</span>
              )}
            </motion.button>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onSkip}
          className="mt-2 px-4 py-2 text-sm text-accent-silver/50 hover:text-accent-silver transition"
        >
          Saltar recompensa
        </motion.button>
      </div>
    </motion.div>
  );
}

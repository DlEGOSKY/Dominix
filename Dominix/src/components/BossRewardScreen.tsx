import { motion } from "framer-motion";
import type { Boss } from "@/engine/boss";
import { ALL_RELICS } from "@/engine/relics";

interface BossRewardScreenProps {
  boss: Boss;
  bonusRelicId?: string;
  onContinue: () => void;
}

export default function BossRewardScreen({ boss, bonusRelicId, onContinue }: BossRewardScreenProps) {
  const bonusRelic = bonusRelicId ? ALL_RELICS.find((r) => r.id === bonusRelicId) : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex flex-col items-center gap-3"
      >
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-b from-green-500/20 to-green-600/10 border border-green-500/30 flex items-center justify-center"
        >
          <div className="w-10 h-10 rounded-full bg-green-500/60" />
        </motion.div>
        <h2 className="font-display font-black text-3xl bg-gradient-to-b from-green-300 to-green-500 bg-clip-text text-transparent">
          Jefe Derrotado
        </h2>
        <span className="text-accent-silver/50 text-sm">{boss.name}</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-5 w-full max-w-sm"
      >
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface-800/80 border border-accent-gold/20 w-full">
          <div className="w-12 h-12 rounded-xl bg-accent-gold/15 border border-accent-gold/30 flex items-center justify-center shrink-0">
            <div className="w-5 h-5 rounded-full bg-accent-gold/70" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono font-bold text-2xl text-accent-gold">+{boss.reward.gold}g</span>
            <span className="text-[10px] font-bold text-accent-silver/40 uppercase tracking-widest">Oro de recompensa</span>
          </div>
        </div>

        {bonusRelic && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4 p-5 rounded-2xl bg-surface-800/80 border border-purple-500/20 w-full"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
              <div className="w-5 h-5 rounded-full bg-purple-500/70" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-display font-bold text-lg text-white">{bonusRelic.name}</span>
              <span className="text-xs text-accent-silver/50">{bonusRelic.description}</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="px-8 py-3 rounded-xl bg-gradient-to-b from-green-500 to-green-600 text-white font-bold text-sm tracking-wide hover:brightness-110 transition shadow-lg shadow-green-500/20"
      >
        Continuar
      </motion.button>
    </div>
  );
}

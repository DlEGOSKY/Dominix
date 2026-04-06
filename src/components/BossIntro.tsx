import { motion } from "framer-motion";
import type { Boss } from "@/engine/boss";

interface BossIntroProps {
  boss: Boss;
  round: number;
  onStart: () => void;
}

export default function BossIntro({ boss, round, onStart }: BossIntroProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="flex flex-col items-center gap-6 max-w-md"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="px-4 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40"
        >
          <span className="text-red-400 text-sm font-semibold tracking-wider uppercase">
            Ronda {round} — Jefe
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-display font-black text-4xl text-white text-center"
        >
          {boss.name}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-accent-silver/70 text-center text-lg leading-relaxed"
        >
          {boss.description}
        </motion.p>

        {boss.restriction && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
          >
            <span className="text-yellow-400 text-sm font-medium">
              {getRestrictionText(boss.restriction)}
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex items-center gap-4 text-sm text-accent-silver/50"
        >
          <span>Recompensa: +{boss.reward.gold} oro</span>
          {boss.reward.extraRelic && <span>+ Reliquia extra</span>}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          onClick={onStart}
          className="mt-4 px-8 py-3 rounded-xl bg-red-500 text-white font-bold text-lg hover:bg-red-400 transition shadow-lg shadow-red-500/30"
        >
          Enfrentar
        </motion.button>
      </motion.div>
    </div>
  );
}

function getRestrictionText(restriction: Boss["restriction"]): string {
  if (!restriction) return "";
  switch (restriction.type) {
    case "no_doubles":
      return "Restriccion: No puedes jugar fichas dobles";
    case "max_tiles":
      return `Restriccion: Maximo ${restriction.count} fichas en la cadena`;
    case "min_patterns":
      return `Restriccion: Debes activar al menos ${restriction.count} patrones`;
    case "no_wild":
      return "Restriccion: Las fichas comodin estan desactivadas";
  }
}

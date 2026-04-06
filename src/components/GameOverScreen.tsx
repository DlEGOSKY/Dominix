import { motion } from "framer-motion";
import type { RunStats } from "@/types/domino";
import { ALL_RELICS } from "@/engine/relics";

interface GameOverScreenProps {
  stats: RunStats;
  relicIds: string[];
  finalRound: number;
  onRestart: () => void;
  onHome: () => void;
  isNewBest: boolean;
}

export default function GameOverScreen({
  stats,
  relicIds,
  finalRound,
  onRestart,
  onHome,
  isNewBest,
}: GameOverScreenProps) {
  const relics = ALL_RELICS.filter((r) => relicIds.includes(r.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
        className="flex flex-col items-center gap-2"
      >
        <h2 className="font-display font-bold text-3xl text-red-400">
          Run Terminada
        </h2>
        {isNewBest && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-3 py-1 rounded-full bg-accent-gold/20 text-accent-gold text-sm font-medium"
          >
            Nuevo record
          </motion.span>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-1"
      >
        <span className="text-6xl font-mono font-bold text-white">
          {finalRound}
        </span>
        <span className="text-sm text-accent-silver/50 uppercase tracking-wider">
          Rondas completadas
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-4"
      >
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-800">
          <span className="font-mono font-bold text-xl text-accent-gold">
            {stats.totalScore}
          </span>
          <span className="text-xs text-accent-silver/50">Score total</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-800">
          <span className="font-mono font-bold text-xl text-white">
            {stats.tilesPlayed}
          </span>
          <span className="text-xs text-accent-silver/50">Fichas jugadas</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-800">
          <span className="font-mono font-bold text-xl text-blue-400">
            {stats.patternsActivated}
          </span>
          <span className="text-xs text-accent-silver/50">Patrones</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-800">
          <span className="font-mono font-bold text-xl text-green-400">
            {stats.highestRoundScore}
          </span>
          <span className="text-xs text-accent-silver/50">Mejor ronda</span>
        </div>
      </motion.div>

      {relics.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-2 mt-2"
        >
          <span className="text-xs text-accent-silver/50 uppercase tracking-wider">
            Reliquias obtenidas
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {relics.map((relic) => (
              <div
                key={relic.id}
                className="px-3 py-1.5 rounded-md bg-surface-700 border border-accent-silver/20 text-xs text-accent-silver"
                title={relic.description}
              >
                {relic.name}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3 mt-6"
      >
        <button
          onClick={onRestart}
          className="px-6 py-3 rounded-xl bg-accent-gold text-surface-900 font-bold text-sm tracking-wide hover:brightness-110 transition"
        >
          Nueva Run
        </button>
        <button
          onClick={onHome}
          className="px-6 py-3 rounded-xl border border-accent-silver/30 text-accent-silver font-medium text-sm tracking-wide hover:bg-surface-700 transition"
        >
          Inicio
        </button>
      </motion.div>
    </motion.div>
  );
}

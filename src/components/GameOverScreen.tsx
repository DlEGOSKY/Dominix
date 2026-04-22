import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import type { RunStats } from "@/types/domino";
import { ALL_RELICS } from "@/engine/relics";
import { calculateRunXP, loadProgression, getXPForNextLevel } from "@/engine/progression";
import RecapHighlights from "./RecapHighlights";

interface GameOverScreenProps {
  stats: RunStats;
  relicIds: string[];
  finalRound: number;
  onRestart: () => void;
  onHome: () => void;
  isNewBest: boolean;
}

function RoundScoreChart({ scores }: { scores: number[] }) {
  const W = 400;
  const H = 80;
  const PAD_X = 8;
  const PAD_Y = 8;
  const maxScore = Math.max(...scores, 1);
  const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  const bestIdx = scores.indexOf(Math.max(...scores));
  const barW = Math.max(4, Math.floor((W - PAD_X * 2) / scores.length) - 3);
  const barSpacing = (W - PAD_X * 2) / scores.length;
  const avgY = PAD_Y + (1 - avg / maxScore) * (H - PAD_Y * 2);

  return (
    <div className="w-full overflow-x-auto">
      <svg width="100%" viewBox={`0 0 ${W} ${H + 18}`} className="overflow-visible">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((frac) => {
          const y = PAD_Y + (1 - frac) * (H - PAD_Y * 2);
          return (
            <line key={frac} x1={PAD_X} y1={y} x2={W - PAD_X} y2={y}
              stroke="rgba(168,178,193,0.07)" strokeWidth="1" />
          );
        })}

        {/* Avg line */}
        <line x1={PAD_X} y1={avgY} x2={W - PAD_X} y2={avgY}
          stroke="rgba(212,168,83,0.35)" strokeWidth="1" strokeDasharray="4 3" />
        <text x={W - PAD_X - 2} y={avgY - 3} fill="rgba(212,168,83,0.5)"
          fontSize="7" textAnchor="end" fontFamily="monospace">avg {avg}</text>

        {/* Bars */}
        {scores.map((score, i) => {
          const x = PAD_X + i * barSpacing + (barSpacing - barW) / 2;
          const barH = Math.max(2, ((score / maxScore) * (H - PAD_Y * 2)));
          const y = H - PAD_Y - barH;
          const isBest = i === bestIdx;
          return (
            <g key={i}>
              <motion.rect
                x={x} y={H - PAD_Y} width={barW} height={0}
                rx={2}
                fill={isBest ? "rgba(74,222,128,0.7)" : "rgba(168,178,193,0.25)"}
                animate={{ y, height: barH }}
                transition={{ delay: 0.55 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
              {isBest && (
                <motion.rect
                  x={x} y={H - PAD_Y} width={barW} height={0}
                  rx={2}
                  fill="rgba(74,222,128,0.15)"
                  style={{ filter: "blur(4px)" }}
                  animate={{ y, height: barH }}
                  transition={{ delay: 0.55 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              {/* Round label */}
              <text x={x + barW / 2} y={H + 10} fill="rgba(168,178,193,0.3)"
                fontSize="7" textAnchor="middle" fontFamily="monospace">
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
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
  const [recapDone, setRecapDone] = useState(false);

  const xpData = useMemo(() => {
    const earned = calculateRunXP(finalRound, stats.totalScore, stats.bossesDefeated, stats.patternsActivated);
    const prog = loadProgression();
    const xpInfo = getXPForNextLevel(prog.xp);
    return { earned, level: prog.level, ...xpInfo };
  }, [finalRound, stats]);

  return (
    <>
      <AnimatePresence>
        {!recapDone && (
          <RecapHighlights
            stats={stats}
            finalRound={finalRound}
            onFinished={() => setRecapDone(true)}
          />
        )}
      </AnimatePresence>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: recapDone ? 1 : 0 }}
      transition={{ delay: recapDone ? 0.1 : 0, duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
        className="flex flex-col items-center gap-4"
      >
        {isNewBest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
            className="px-5 py-1.5 rounded-full bg-accent-gold/15 border border-accent-gold/30"
          >
            <span className="text-accent-gold text-xs font-bold uppercase tracking-widest">Nuevo record</span>
          </motion.div>
        )}
        <h2 className="font-display font-black text-4xl bg-gradient-to-b from-red-300 to-red-500 bg-clip-text text-transparent">
          Run Terminada
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-1"
      >
        <span
          className="text-7xl font-mono font-black text-white tabular-nums tracking-tighter"
          style={{ textShadow: "0 0 30px rgba(255,255,255,0.1)" }}
        >
          {finalRound}
        </span>
        <span className="text-[11px] font-bold text-accent-silver/40 uppercase tracking-widest">
          Rondas completadas
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mt-2 max-w-lg w-full"
      >
        {[
          { value: stats.totalScore, label: "Score total", color: "text-accent-gold" },
          { value: stats.tilesPlayed, label: "Fichas jugadas", color: "text-white" },
          { value: stats.patternsActivated, label: "Patrones", color: "text-blue-400" },
          { value: stats.highestRoundScore, label: "Mejor ronda", color: "text-green-400" },
          { value: stats.bossesDefeated, label: "Jefes", color: "text-red-400" },
          { value: stats.goldEarned, label: "Oro ganado", color: "text-yellow-400" },
          { value: stats.shopPurchases, label: "Compras", color: "text-cyan-400" },
          { value: stats.bestCombo, label: "Mejor combo", color: "text-purple-400" },
        ].filter((s) => s.value > 0).map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.05 }}
            className="flex flex-col gap-1.5 p-4 rounded-xl bg-surface-800/80 border border-surface-600/40"
          >
            <span className={`font-mono font-bold text-2xl ${stat.color}`}>
              {stat.value}
            </span>
            <span className="text-[10px] font-bold text-accent-silver/40 uppercase tracking-wider">{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Round score chart */}
      {stats.roundScores && stats.roundScores.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-lg px-4 py-4 rounded-xl bg-surface-800/60 border border-surface-600/30"
        >
          <p className="text-[10px] font-bold text-accent-silver/35 uppercase tracking-widest mb-3">Score por ronda</p>
          <RoundScoreChart scores={stats.roundScores} />
        </motion.div>
      )}

      {/* XP Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="flex flex-col items-center gap-3 w-full max-w-sm"
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-[10px] font-bold text-accent-silver/40 uppercase tracking-widest">Nivel {xpData.level}</span>
          <span className="text-sm font-mono font-bold text-accent-gold">+{xpData.earned} XP</span>
        </div>
        <div className="relative w-full h-2.5 rounded-full bg-surface-700 overflow-hidden">
          <motion.div
            initial={{ width: `${Math.max(0, (xpData.current - xpData.earned) / xpData.needed) * 100}%` }}
            animate={{ width: `${Math.min(xpData.progress * 100, 100)}%` }}
            transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-accent-gold to-amber-400"
          />
        </div>
        <span className="text-[10px] font-mono text-accent-silver/30">{xpData.current}/{xpData.needed} XP</span>
      </motion.div>

      {relics.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-3 mt-2"
        >
          <span className="text-[10px] font-bold text-accent-silver/40 uppercase tracking-widest">
            Reliquias obtenidas
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {relics.map((relic) => (
              <div
                key={relic.id}
                className="px-3 py-1.5 rounded-lg bg-surface-700/60 border border-accent-gold/15 text-xs text-accent-silver/70 font-medium"
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
        transition={{ delay: 0.6 }}
        className="flex gap-4 mt-4"
      >
        <button
          onClick={onRestart}
          className="px-8 py-3 rounded-xl bg-gradient-to-b from-accent-gold to-amber-600 text-surface-900 font-bold text-sm tracking-wide hover:brightness-110 transition shadow-lg shadow-accent-gold/20"
        >
          Nueva Run
        </button>
        <button
          onClick={onHome}
          className="px-8 py-3 rounded-xl border border-surface-600/50 text-accent-silver/50 font-medium text-sm tracking-wide hover:text-accent-silver/80 hover:border-surface-600 transition-all"
        >
          Inicio
        </button>
      </motion.div>
    </motion.div>
    </>
  );
}

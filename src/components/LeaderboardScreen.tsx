import { motion } from "framer-motion";
import { getLeaderboard, clearLeaderboard, type LeaderboardEntry } from "@/engine/leaderboard";
import { useState } from "react";
import { useTranslation } from "@/engine/i18n";

interface LeaderboardScreenProps {
  onBack: () => void;
}

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<LeaderboardEntry[]>(getLeaderboard());

  const handleClear = () => {
    clearLeaderboard();
    setEntries([]);
  };

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col items-center px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display font-black text-3xl text-accent-gold tracking-tight mb-8"
      >
        {t("leaderboard.title")}
      </motion.h1>

      {entries.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-accent-silver/50 text-sm"
        >
          {t("leaderboard.empty")}
        </motion.p>
      ) : (
        <div className="w-full max-w-lg space-y-2">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={[
                "flex items-center gap-4 px-4 py-3 rounded-xl border",
                i === 0
                  ? "bg-accent-gold/10 border-accent-gold/40"
                  : i === 1
                  ? "bg-surface-800 border-gray-400/30"
                  : i === 2
                  ? "bg-surface-800 border-orange-600/30"
                  : "bg-surface-800 border-surface-600",
              ].join(" ")}
            >
              <span
                className={[
                  "font-mono font-bold text-xl w-8 text-center",
                  i === 0
                    ? "text-accent-gold"
                    : i === 1
                    ? "text-gray-300"
                    : i === 2
                    ? "text-orange-400"
                    : "text-accent-silver/50",
                ].join(" ")}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono font-bold text-2xl text-white tabular-nums">
                    {entry.totalScore}
                  </span>
                  <span className="text-xs text-accent-silver/50">
                    R{entry.rounds} | {entry.patternsActivated}p | {entry.relicsCollected}r
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-accent-silver/40">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  {entry.modifier && (
                    <span className="text-xs text-blue-400">{entry.modifier}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-lg border border-surface-600 text-accent-silver/70 hover:text-white hover:border-accent-silver/40 transition text-sm font-medium"
        >
          {t("btn.back")}
        </button>
        {entries.length > 0 && (
          <button
            onClick={handleClear}
            className="px-6 py-2.5 rounded-lg border border-red-500/30 text-red-400/70 hover:text-red-400 hover:border-red-500/50 transition text-sm font-medium"
          >
            {t("leaderboard.clearAll")}
          </button>
        )}
      </div>
    </div>
  );
}

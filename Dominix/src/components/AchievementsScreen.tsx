import { motion } from "framer-motion";
import { ALL_ACHIEVEMENTS, getUnlockedAchievements, getAchievementProgress } from "@/engine/achievements";
import type { SavedData } from "@/types/domino";

interface AchievementsScreenProps {
  savedData: SavedData;
  onBack: () => void;
}

const ICONS: Record<string, string> = {
  star: "★",
  shield: "◆",
  medal: "●",
  crown: "♔",
  trophy: "🏆",
  zap: "⚡",
  flame: "🔥",
  bolt: "⚡",
  repeat: "↻",
  heart: "♥",
  infinity: "∞",
  eye: "◉",
  gem: "◈",
  layers: "▦",
  "check-circle": "✓",
};

export default function AchievementsScreen({ savedData, onBack }: AchievementsScreenProps) {
  const unlockedIds = getUnlockedAchievements();
  const progress = getAchievementProgress(savedData);

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2 mb-8"
      >
        <h1 className="font-display font-black text-4xl tracking-tight text-white">
          LOGROS
        </h1>
        <div className="flex items-center gap-3">
          <div className="w-48 h-2 rounded-full bg-surface-700 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-accent-gold"
            />
          </div>
          <span className="text-sm text-accent-silver/60">
            {progress.unlocked}/{progress.total}
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full mb-8">
        {ALL_ACHIEVEMENTS.map((achievement, i) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={[
                "flex items-start gap-4 p-4 rounded-xl border transition-colors",
                isUnlocked
                  ? "bg-surface-800 border-accent-gold/30"
                  : "bg-surface-800/50 border-surface-600 opacity-60",
              ].join(" ")}
            >
              <span
                className={[
                  "text-2xl w-10 h-10 flex items-center justify-center rounded-lg",
                  isUnlocked ? "bg-accent-gold/20 text-accent-gold" : "bg-surface-700 text-surface-500",
                ].join(" ")}
              >
                {isUnlocked ? ICONS[achievement.icon] ?? "★" : "?"}
              </span>
              <div className="flex flex-col gap-1 flex-1">
                <span
                  className={[
                    "font-semibold",
                    isUnlocked ? "text-white" : "text-surface-400",
                  ].join(" ")}
                >
                  {isUnlocked ? achievement.name : "???"}
                </span>
                <span className="text-xs text-accent-silver/50">
                  {achievement.description}
                </span>
              </div>
              {isUnlocked && (
                <span className="text-accent-gold text-lg">✓</span>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onBack}
        className="px-6 py-3 rounded-xl border border-accent-silver/30 text-accent-silver font-medium hover:bg-surface-700 transition"
      >
        Volver
      </motion.button>
    </div>
  );
}

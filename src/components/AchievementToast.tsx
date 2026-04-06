import { motion, AnimatePresence } from "framer-motion";
import type { Achievement } from "@/engine/achievements";

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
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

export default function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={onDismiss}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 cursor-pointer"
        >
          <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-gradient-to-r from-accent-gold/20 to-yellow-600/20 border border-accent-gold/40 shadow-lg shadow-accent-gold/10 backdrop-blur-sm">
            <span className="text-3xl">
              {ICONS[achievement.icon] ?? "★"}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-accent-gold/70 uppercase tracking-wider font-medium">
                Logro desbloqueado
              </span>
              <span className="font-bold text-white text-lg">
                {achievement.name}
              </span>
              <span className="text-sm text-accent-silver/70">
                {achievement.description}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

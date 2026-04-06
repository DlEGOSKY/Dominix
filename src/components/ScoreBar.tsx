import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ScoreBarProps {
  score: number;
  target: number;
  round: number;
}

export default function ScoreBar({ score, target, round }: ScoreBarProps) {
  const pct = Math.min((score / target) * 100, 100);
  const met = score >= target;
  const [displayScore, setDisplayScore] = useState(score);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (score === displayScore) return;

    setIsAnimating(true);
    const diff = score - displayScore;
    const steps = Math.min(Math.abs(diff), 20);
    const increment = diff / steps;
    let current = displayScore;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      setDisplayScore(Math.round(current));

      if (step >= steps) {
        setDisplayScore(score);
        setIsAnimating(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-md mx-auto">
      <div className="flex items-baseline justify-between w-full">
        <motion.span
          key={round}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-medium tracking-widest uppercase text-accent-silver/60"
        >
          Ronda {round}
        </motion.span>
        <span className="text-xs font-medium tracking-widest uppercase text-accent-silver/60">
          Meta: {target}
        </span>
      </div>

      <div className="relative w-full h-3 rounded-full bg-surface-700 overflow-hidden">
        <motion.div
          className={[
            "h-full rounded-full",
            met ? "bg-green-500" : "bg-accent-gold",
          ].join(" ")}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>

      <motion.span
        animate={{
          scale: isAnimating ? [1, 1.1, 1] : 1,
          color: met ? "#4ade80" : "#ffffff",
        }}
        transition={{ duration: 0.2 }}
        className="font-mono font-bold text-5xl tabular-nums tracking-tight"
      >
        {displayScore}
      </motion.span>
    </div>
  );
}

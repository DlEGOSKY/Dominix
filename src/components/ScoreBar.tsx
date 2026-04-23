import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
  const [bigJump, setBigJump] = useState(false);
  const lastJumpRef = useRef(0);

  useEffect(() => {
    if (score === displayScore) return;

    setIsAnimating(true);
    const diff = score - displayScore;
    const absDiff = Math.abs(diff);
    lastJumpRef.current = absDiff;
    const isBig = absDiff >= 100;
    setBigJump(isBig);

    // Adaptive: bigger jumps get more steps but not linearly (log scale), and
    // small jumps tick quickly. Clamped so anything feels snappy.
    const steps = Math.min(Math.max(Math.ceil(Math.log2(absDiff + 1) * 5), 8), 28);
    const tickMs = absDiff < 40 ? 18 : absDiff < 150 ? 26 : 34;
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
        // Release big-jump state shortly after settle
        if (isBig) setTimeout(() => setBigJump(false), 450);
      }
    }, tickMs);

    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto">
      <div className="flex items-baseline justify-between w-full px-1">
        <motion.span
          key={round}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-bold tracking-widest uppercase text-accent-silver/50"
        >
          Ronda {round}
        </motion.span>
        <span className="text-[11px] font-bold tracking-widest uppercase text-accent-silver/50">
          Meta: {target}
        </span>
      </div>

      <div className="relative w-full h-4 rounded-full bg-surface-700/60 overflow-hidden border border-surface-600/20">
        <motion.div
          className={[
            "h-full rounded-full relative bar-shine",
            met
              ? "bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 shadow-[0_0_16px_rgba(74,222,128,0.5)]"
              : "bg-gradient-to-r from-accent-gold via-amber-400 to-accent-gold shadow-[0_0_12px_rgba(212,168,83,0.4)]",
          ].join(" ")}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none rounded-full" />
      </div>

      <motion.span
        animate={{
          scale: bigJump ? [1, 1.28, 0.94, 1.05, 1] : isAnimating ? [1, 1.12, 1] : 1,
          color: met ? "#4ade80" : "#ffffff",
        }}
        transition={{ duration: bigJump ? 0.55 : 0.2, ease: bigJump ? [0.34, 1.56, 0.64, 1] : "easeOut" }}
        className="font-mono font-black text-5xl tabular-nums tracking-tighter"
        style={{
          textShadow: met
            ? "0 0 24px rgba(74,222,128,0.5), 0 0 48px rgba(74,222,128,0.2)"
            : bigJump
            ? "0 0 32px rgba(251,191,36,0.7), 0 0 64px rgba(251,191,36,0.35), 0 0 8px rgba(255,255,255,0.4)"
            : isAnimating
            ? "0 0 20px rgba(255,255,255,0.2)"
            : "0 0 8px rgba(255,255,255,0.05)",
        }}
      >
        {displayScore}
      </motion.span>
    </div>
  );
}

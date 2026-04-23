import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { RunStats } from "@/types/domino";
import { getActForRound } from "@/engine/acts";

interface RecapHighlightsProps {
  stats: RunStats;
  finalRound: number;
  relicIds?: string[];
  onFinished: () => void;
  durationPerSlideMs?: number;
}

interface Slide {
  label: string;
  value: string;
  subtext?: string;
  color: string;
  icon: React.ReactNode;
  tone?: "narrative";
}

export default function RecapHighlights({ stats, finalRound, relicIds, onFinished, durationPerSlideMs = 1400 }: RecapHighlightsProps) {
  const slides: Slide[] = buildSlides(stats, finalRound, relicIds ?? []);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx >= slides.length) {
      const t = setTimeout(onFinished, 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIdx((i) => i + 1), durationPerSlideMs);
    return () => clearTimeout(t);
  }, [idx, slides.length, durationPerSlideMs, onFinished]);

  if (idx >= slides.length) return null;
  const slide = slides[idx]!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/95 backdrop-blur-sm"
    >
      {/* Background ambient gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(ellipse at 30% 40%, rgba(234, 179, 8, 0.08) 0%, transparent 60%)",
            "radial-gradient(ellipse at 70% 60%, rgba(234, 179, 8, 0.12) 0%, transparent 60%)",
            "radial-gradient(ellipse at 30% 40%, rgba(234, 179, 8, 0.08) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, y: -10 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex flex-col items-center gap-6 relative"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center ${slide.color} opacity-80`}
          >
            {slide.icon}
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-center flex flex-col items-center"
          >
            <p className="text-[11px] uppercase tracking-[0.35em] text-accent-silver/40 font-bold mb-3">{slide.label}</p>
            {slide.tone === "narrative" ? (
              <>
                <motion.p
                  key={slide.value}
                  initial={{ opacity: 0, letterSpacing: "0.4em" }}
                  animate={{ opacity: 1, letterSpacing: "-0.02em" }}
                  transition={{ duration: 0.7 }}
                  className="font-display font-black text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50"
                >
                  {slide.value}
                </motion.p>
                {slide.subtext && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mt-4 italic text-[13px] text-accent-silver/60 max-w-md"
                  >
                    {slide.subtext}
                  </motion.p>
                )}
              </>
            ) : (
              <motion.p
                key={slide.value}
                initial={{ opacity: 0, letterSpacing: "0.2em" }}
                animate={{ opacity: 1, letterSpacing: "-0.03em" }}
                transition={{ duration: 0.5 }}
                className="font-mono font-black text-7xl md:text-8xl text-white tabular-nums"
                style={{ textShadow: "0 0 40px rgba(255,255,255,0.2)" }}
              >
                {slide.value}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute bottom-8 flex gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={[
              "w-1.5 h-1.5 rounded-full transition-all duration-500",
              i === idx ? "bg-accent-gold scale-125 w-6" : i < idx ? "bg-accent-gold/30" : "bg-surface-600/50",
            ].join(" ")}
          />
        ))}
      </div>

      <button
        onClick={onFinished}
        className="absolute top-6 right-6 text-[10px] text-accent-silver/30 hover:text-accent-silver/60 uppercase tracking-widest transition-colors"
      >
        Saltar →
      </button>
    </motion.div>
  );
}

function buildSlides(stats: RunStats, finalRound: number, relicIds: string[]): Slide[] {
  const slides: Slide[] = [];

  // Narrative opener: the act the run reached
  const act = getActForRound(Math.max(1, finalRound));
  slides.push({
    label: act.numeral,
    value: act.name,
    subtext: `"${act.tagline}"`,
    color: "bg-white/8",
    icon: <IconAct />,
    tone: "narrative",
  });

  slides.push({
    label: "Alcanzaste la ronda",
    value: finalRound.toString(),
    color: "bg-white/10",
    icon: <IconFlag />,
  });

  slides.push({
    label: "Score total",
    value: stats.totalScore.toLocaleString(),
    color: "bg-accent-gold/15",
    icon: <IconStar />,
  });

  if (stats.highestRoundScore > 0) {
    slides.push({
      label: "Mejor ronda",
      value: stats.highestRoundScore.toLocaleString(),
      color: "bg-green-500/15",
      icon: <IconPeak />,
    });
  }

  if (stats.patternsActivated > 0) {
    slides.push({
      label: "Patrones activados",
      value: stats.patternsActivated.toString(),
      color: "bg-blue-500/15",
      icon: <IconSparkle />,
    });
  }

  if (stats.bossesDefeated > 0) {
    slides.push({
      label: "Jefes derrotados",
      value: stats.bossesDefeated.toString(),
      color: "bg-red-500/15",
      icon: <IconCrown />,
    });
  }

  if (relicIds.length >= 3) {
    slides.push({
      label: "Reliquias acumuladas",
      value: relicIds.length.toString(),
      color: "bg-purple-500/15",
      icon: <IconGem />,
    });
  }

  return slides;
}

function IconFlag() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path d="M5 3v18M5 4h12l-3 5 3 5H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-white" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14 3 9.5l6.5-.5L12 3z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" strokeLinejoin="round" className="text-accent-gold" />
    </svg>
  );
}

function IconPeak() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path d="M3 20l7-12 4 6 3-4 4 10H3z" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.25" strokeLinejoin="round" className="text-green-300" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l4 4M14 14l4 4M18 6l-4 4M10 14l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-blue-300" />
    </svg>
  );
}

function IconCrown() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path d="M4 8l3 3 5-6 5 6 3-3v9H4V8z" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.2" strokeLinejoin="round" className="text-red-300" />
    </svg>
  );
}

function IconAct() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" className="text-accent-silver/70" />
      <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" className="text-accent-silver/40" />
      <circle cx="12" cy="12" r="2" fill="currentColor" className="text-white" />
    </svg>
  );
}

function IconGem() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l6 5-6 13-6-13 6-5z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.25" strokeLinejoin="round" className="text-purple-300" />
      <path d="M6 8h12M9 8l3 13M15 8l-3 13" stroke="currentColor" strokeWidth="0.8" className="text-purple-300/60" />
    </svg>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export type ReactionKind = "bomb" | "wild" | "pattern" | "big_score";

export interface ReactionEvent {
  id: number;
  kind: ReactionKind;
  label?: string;
}

interface ChainReactionEffectProps {
  event: ReactionEvent | null;
  onComplete: () => void;
}

export default function ChainReactionEffect({ event, onComplete }: ChainReactionEffectProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!event) return;
    setVisible(true);
    const duration = event.kind === "big_score" ? 1600 : 1100;
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 200);
    }, duration);
    return () => clearTimeout(t);
  }, [event, onComplete]);

  if (!event) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderEffect(event)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function renderEffect(event: ReactionEvent) {
  switch (event.kind) {
    case "bomb":
      return <BombExplosion />;
    case "wild":
      return <WildRipple />;
    case "pattern":
      return <PatternGlow label={event.label} />;
    case "big_score":
      return <BigScoreBurst label={event.label} />;
  }
}

function BombExplosion() {
  return (
    <>
      {/* Core flash */}
      <motion.div
        className="absolute rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(251, 146, 60, 0.9) 0%, rgba(239, 68, 68, 0.6) 40%, transparent 70%)",
        }}
        initial={{ width: 40, height: 40, opacity: 0 }}
        animate={{ width: 320, height: 320, opacity: [0, 1, 0] }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
      {/* Shockwave ring */}
      <motion.div
        className="absolute rounded-full border-4 border-red-400/70"
        initial={{ width: 60, height: 60, opacity: 0.8 }}
        animate={{ width: 500, height: 500, opacity: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      {/* Particles */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const dx = Math.cos(angle) * 200;
        const dy = Math.sin(angle) * 200;
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-orange-400"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: dx, y: dy, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        );
      })}
    </>
  );
}

function WildRipple() {
  return (
    <>
      {/* Chromatic rings */}
      {[0, 0.1, 0.2].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            borderColor: i === 0 ? "rgba(168, 85, 247, 0.7)" : i === 1 ? "rgba(34, 211, 238, 0.7)" : "rgba(236, 72, 153, 0.7)",
          }}
          initial={{ width: 40, height: 40, opacity: 0.8 }}
          animate={{ width: 400, height: 400, opacity: 0 }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
        />
      ))}
      {/* Center glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 60%)",
        }}
        initial={{ width: 40, height: 40, opacity: 0 }}
        animate={{ width: 200, height: 200, opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.9 }}
      />
    </>
  );
}

function PatternGlow({ label }: { label?: string }) {
  return (
    <>
      {/* Radial glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(234, 179, 8, 0.35) 0%, rgba(234, 179, 8, 0.1) 40%, transparent 70%)",
        }}
        initial={{ width: 100, height: 100, opacity: 0 }}
        animate={{ width: 700, height: 700, opacity: [0, 1, 0] }}
        transition={{ duration: 1 }}
      />
      {/* Label */}
      {label && (
        <motion.div
          className="absolute top-1/3 px-4 py-1.5 rounded-full bg-accent-gold/20 border border-accent-gold/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20], scale: [0.8, 1.1, 1, 1] }}
          transition={{ duration: 1.1, times: [0, 0.2, 0.7, 1] }}
        >
          <span className="text-accent-gold text-sm font-bold uppercase tracking-widest">{label}</span>
        </motion.div>
      )}
      {/* Sparkles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 120 + Math.random() * 80;
        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-accent-gold"
            style={{ boxShadow: "0 0 8px rgba(234, 179, 8, 0.8)" }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              opacity: [0, 1, 0],
              scale: [0, 1, 0.3],
            }}
            transition={{ duration: 0.9, delay: i * 0.04 }}
          />
        );
      })}
    </>
  );
}

function BigScoreBurst({ label }: { label?: string }) {
  // The same effect is reused for two very different things:
  //  1. Short numeric bursts ("+5000") — meant to feel cinematic and huge.
  //  2. Long textual reactions ("Nueva reliquia: Cadena maestra",
  //     "Pacto +200 (edition + cosmos)", "Caos: Buena suerte"). These were
  //     overflowing the viewport because the span had no cap.
  // We pick a size profile based on whether the label looks numeric & short.
  const isShortNumeric = !!label && label.length <= 7 && /^[+\-x0-9.,\s]+$/.test(label);
  return (
    <>
      {/* Flash */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.18) 0%, transparent 60%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.3 }}
      />
      {/* Big number / long-text variant */}
      {label && (
        <motion.div
          initial={{ opacity: 0, scale: 0.3, y: 40 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.3, 1.4, 1.1, 1.1],
            y: [40, 0, 0, -80],
          }}
          transition={{ duration: 1.5, times: [0, 0.2, 0.75, 1], ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute px-6 max-w-[90vw] sm:max-w-[70vw] text-center"
        >
          <span
            className={[
              "font-mono font-black text-accent-gold tabular-nums leading-tight inline-block",
              isShortNumeric
                ? "text-7xl md:text-8xl whitespace-nowrap"
                : "text-2xl sm:text-3xl md:text-4xl break-words",
            ].join(" ")}
            style={{ textShadow: "0 0 40px rgba(234, 179, 8, 0.8), 0 0 80px rgba(234, 179, 8, 0.4)" }}
          >
            {label}
          </span>
        </motion.div>
      )}
      {/* Sparkles rain */}
      {Array.from({ length: 20 }).map((_, i) => {
        const dx = (Math.random() - 0.5) * 600;
        const dy = (Math.random() - 0.5) * 400;
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-accent-gold"
            style={{ boxShadow: "0 0 6px rgba(234, 179, 8, 0.9)" }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: dx, y: dy, opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, delay: 0.1 + i * 0.03 }}
          />
        );
      })}
    </>
  );
}

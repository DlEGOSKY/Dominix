import { useReduceMotion } from "@/hooks/useSettings";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface ScorePopupProps {
  score: number;
}

interface Popup {
  id: number;
  value: number;
  x: number;
}

let popupId = 0;

export default function ScorePopup({ score }: ScorePopupProps) {
  const reducedMotion = useReduceMotion();
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const [popups, setPopups] = useState<Popup[]>([]);
  const previous = useRef(score);

  useEffect(() => {
    const diff = score - previous.current;
    previous.current = score;
    if (diff <= 0 || reducedMotion) return;

    const id = ++popupId;
    const x = Math.random() * 60 - 30;
    setPopups((prev) => [...prev.slice(-3), { id, value: diff, x }]);

    const timer = setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
      timers.current.delete(timer);
    }, 1400);

    timers.current.add(timer);
  }, [score, reducedMotion]);

  useEffect(() => {
    const pending = timers.current;
    return () => { for (const timer of pending) clearTimeout(timer); };
  }, []);

  if (reducedMotion) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {popups.map((popup) => {
          const isHuge = popup.value >= 500;
          const isBig = popup.value >= 200;
          const rotation = (Math.random() - 0.5) * 12;
          return (
            <motion.div
              key={popup.id}
              initial={{ opacity: 1, y: 0, x: popup.x, scale: 0.4, rotate: 0 }}
              animate={{
                opacity: 0,
                y: isHuge ? -100 : isBig ? -90 : -80,
                scale: isHuge ? 1.4 : isBig ? 1.25 : 1.1,
                rotate: rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: isHuge ? 1.3 : 1.1, ease: [0.22, 1, 0.36, 1] }}
              className={[
                "absolute left-1/2 top-1/2 -translate-x-1/2 font-mono font-black tabular-nums",
                isHuge
                  ? "text-4xl text-purple-300"
                  : isBig
                  ? "text-3xl text-accent-gold"
                  : "text-xl text-accent-gold/90",
              ].join(" ")}
              style={{
                textShadow: isHuge
                  ? "0 0 30px rgba(216,180,254,0.8), 0 0 60px rgba(216,180,254,0.4)"
                  : isBig
                  ? "0 0 20px rgba(212,168,83,0.6), 0 0 40px rgba(212,168,83,0.3)"
                  : "0 0 12px rgba(212,168,83,0.4)",
              }}
            >
              +{popup.value}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

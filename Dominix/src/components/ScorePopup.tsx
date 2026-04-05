import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface ScorePopupProps {
  score: number;
  prevScore: number;
}

interface Popup {
  id: number;
  value: number;
  x: number;
}

let popupId = 0;

export default function ScorePopup({ score, prevScore }: ScorePopupProps) {
  const [popups, setPopups] = useState<Popup[]>([]);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const diff = score - prevScore;
    if (diff <= 0) return;

    const id = ++popupId;
    const x = Math.random() * 60 - 30;
    setPopups((prev) => [...prev, { id, value: diff, x }]);

    const timer = setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1200);

    return () => clearTimeout(timer);
  }, [score, prevScore]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {popups.map((popup) => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 1, y: 0, x: popup.x, scale: 0.5 }}
            animate={{ opacity: 0, y: -80, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 font-mono font-black text-2xl text-accent-gold drop-shadow-lg"
          >
            +{popup.value}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

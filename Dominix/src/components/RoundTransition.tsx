import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface RoundTransitionProps {
  round: number;
  isBoss?: boolean;
  onComplete: () => void;
}

export default function RoundTransition({ round, isBoss, onComplete }: RoundTransitionProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 400);
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-900/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-[10px] text-accent-silver/30 uppercase tracking-[0.4em] font-medium">
              {isBoss ? "Jefe" : "Ronda"}
            </span>
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.35, type: "spring", stiffness: 300 }}
              className={[
                "font-display font-black text-7xl tabular-nums tracking-tighter",
                isBoss
                  ? "bg-gradient-to-b from-red-300 via-red-500 to-red-700 bg-clip-text text-transparent"
                  : "bg-gradient-to-b from-white via-white/80 to-accent-silver/40 bg-clip-text text-transparent",
              ].join(" ")}
              style={{
                textShadow: isBoss
                  ? "0 0 40px rgba(239,68,68,0.3)"
                  : "0 0 40px rgba(255,255,255,0.1)",
              }}
            >
              {round}
            </motion.span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="divider-glow w-32 origin-center"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

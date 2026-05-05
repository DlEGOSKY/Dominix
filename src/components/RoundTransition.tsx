import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "@/engine/i18n";

interface RoundTransitionProps {
  round: number;
  isBoss?: boolean;
  onComplete: () => void;
}

export default function RoundTransition({ round, isBoss, onComplete }: RoundTransitionProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const duration = isBoss ? 2000 : 1200;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 400);
    }, duration);
    return () => clearTimeout(timer);
  }, [onComplete, isBoss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={[
            "fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md",
            isBoss ? "bg-red-950/80" : "bg-surface-900/90",
          ].join(" ")}
        >
          {/* Boss: pulsing danger ring */}
          {isBoss && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.18, 0, 0.12, 0] }}
              transition={{ duration: 1.8, times: [0, 0.2, 0.5, 0.7, 1] }}
              style={{ background: "radial-gradient(ellipse at center, rgba(239,68,68,0.35) 0%, transparent 65%)" }}
            />
          )}

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-3"
          >
            {isBoss && (
              <motion.span
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[9px] text-red-400/60 uppercase tracking-[0.5em] font-bold"
              >
                {t("boss.warning") || "— advertencia —"}
              </motion.span>
            )}
            <span className={[
              "text-[10px] uppercase tracking-[0.4em] font-medium",
              isBoss ? "text-red-400/60" : "text-accent-silver/30",
            ].join(" ")}>
              {isBoss ? t("boss.label") : t("round.label")}
            </span>
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.35, type: "spring", stiffness: 300 }}
              className={[
                "font-display font-black tabular-nums tracking-tighter",
                isBoss ? "text-8xl" : "text-7xl",
                isBoss
                  ? "bg-gradient-to-b from-red-200 via-red-400 to-red-700 bg-clip-text text-transparent"
                  : "bg-gradient-to-b from-white via-white/80 to-accent-silver/40 bg-clip-text text-transparent",
              ].join(" ")}
              style={{
                textShadow: isBoss
                  ? "0 0 60px rgba(239,68,68,0.5), 0 0 120px rgba(239,68,68,0.2)"
                  : "0 0 40px rgba(255,255,255,0.1)",
              }}
            >
              {round}
            </motion.span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className={["origin-center", isBoss ? "w-48 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" : "divider-glow w-32"].join(" ")}
            />
            {isBoss && (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="text-[11px] text-red-300/50 font-medium tracking-wider"
              >
                {t("boss.prepare") || "prepárate"}
              </motion.span>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

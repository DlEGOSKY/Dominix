import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Interlude, InterludeChoice } from "@/engine/interludes";
import { useTranslation } from "@/engine/i18n";

interface InterludeScreenProps {
  interlude: Interlude;
  onResolve: (choice: InterludeChoice) => void;
}

/**
 * Narrative scene shown between acts. Presents a short story and 2-3
 * choices with tangible effects. The parent is responsible for applying
 * the returned choice's outcome effects to run state.
 */
export default function InterludeScreen({ interlude, onResolve }: InterludeScreenProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<InterludeChoice | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleContinue = () => {
    if (!selected) return;
    setConfirmed(true);
    // Small delay to let the resolution text breathe before leaving.
    setTimeout(() => onResolve(selected), 1600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-40 flex items-center justify-center px-6 py-10 bg-surface-900/95 backdrop-blur-md"
    >
      {/* Ambient halo */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(ellipse at 30% 30%, rgba(212,168,83,0.10) 0%, transparent 60%)",
            "radial-gradient(ellipse at 70% 50%, rgba(168,85,247,0.08) 0%, transparent 60%)",
            "radial-gradient(ellipse at 30% 30%, rgba(212,168,83,0.10) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative max-w-xl w-full flex flex-col gap-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-silver/35">
            {t("interlude.label")}
          </span>
          <h2 className="font-display font-black text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-accent-silver/40">
            {interlude.title}
          </h2>
        </motion.div>

        {/* Body */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col gap-3"
        >
          {interlude.body.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={{ delay: 0.6 + i * 0.3, duration: 0.5 }}
              className="text-[14px] text-accent-silver/75 leading-relaxed text-center italic"
            >
              {p}
            </motion.p>
          ))}
          {interlude.speaker && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.6 + interlude.body.length * 0.3, duration: 0.6 }}
              className="text-[11px] uppercase tracking-[0.3em] text-accent-gold/60 text-center mt-2"
            >
              — {interlude.speaker}
            </motion.p>
          )}
        </motion.div>

        {/* Choices or resolution */}
        <AnimatePresence mode="wait">
          {!confirmed ? (
            <motion.div
              key="choices"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.8 + interlude.body.length * 0.3, duration: 0.5 }}
              className="flex flex-col gap-2.5"
            >
              {interlude.choices.map((choice, i) => {
                const isSelected = selected?.id === choice.id;
                return (
                  <motion.button
                    key={choice.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + interlude.body.length * 0.3 + i * 0.08 }}
                    onClick={() => setSelected(choice)}
                    className={[
                      "text-left px-5 py-4 rounded-xl border transition-all",
                      isSelected
                        ? "bg-accent-gold/15 border-accent-gold/50 shadow-[0_0_30px_rgba(212,168,83,0.15)]"
                        : "bg-surface-800/70 border-surface-600/40 hover:border-surface-500 hover:bg-surface-800",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm font-semibold ${isSelected ? "text-accent-gold" : "text-white"}`}>
                        {choice.label}
                      </span>
                      {choice.hint && (
                        <span className="text-[11px] text-accent-silver/50 italic">
                          {choice.hint}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 + interlude.body.length * 0.3 }}
                disabled={!selected}
                onClick={handleContinue}
                className={[
                  "mt-3 px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide self-center transition",
                  selected
                    ? "bg-gradient-to-b from-accent-gold to-amber-600 text-surface-900 hover:brightness-110 shadow-lg shadow-accent-gold/20"
                    : "bg-surface-700 text-accent-silver/30 cursor-not-allowed",
                ].join(" ")}
              >
                {t("btn.continue")}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="resolution"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <p className="italic text-[14px] text-accent-silver/80 leading-relaxed max-w-md">
                {selected?.outcome.resolution}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

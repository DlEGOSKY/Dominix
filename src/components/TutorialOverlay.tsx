import { motion, AnimatePresence } from "framer-motion";
import type { TutorialStep } from "@/engine/tutorial";

interface TutorialOverlayProps {
  step: TutorialStep;
  currentIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

export default function TutorialOverlay({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onSkip,
}: TutorialOverlayProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-surface-900/80 pointer-events-auto" />

        {/* Highlight area */}
        {step.highlight && (
          <div
            className={`absolute ${getHighlightPosition(step.highlight)} border-2 border-accent-gold rounded-xl animate-pulse pointer-events-none`}
            style={{ boxShadow: "0 0 0 9999px rgba(15, 15, 20, 0.85)" }}
          />
        )}

        {/* Tutorial card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pointer-events-auto"
        >
          <div className="bg-surface-800 border border-surface-600 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-accent-silver/50 uppercase tracking-wider">
                Tutorial {currentIndex + 1}/{totalSteps}
              </span>
              <button
                onClick={onSkip}
                className="text-xs text-accent-silver/40 hover:text-accent-silver transition"
              >
                Saltar tutorial
              </button>
            </div>

            <h3 className="font-display font-bold text-xl text-white mb-2">
              {step.title}
            </h3>
            <p className="text-accent-silver/70 text-sm leading-relaxed mb-6">
              {step.content}
            </p>

            <div className="flex items-center gap-3">
              {/* Progress dots */}
              <div className="flex gap-1.5 flex-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i <= currentIndex
                        ? "bg-accent-gold w-4"
                        : "bg-surface-600 w-1.5"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={onNext}
                className="px-5 py-2.5 rounded-lg bg-accent-gold text-surface-900 font-semibold text-sm hover:brightness-110 transition"
              >
                {currentIndex === totalSteps - 1 ? "Empezar" : "Siguiente"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function getHighlightPosition(highlight: string): string {
  switch (highlight) {
    case "hand":
      return "bottom-32 left-4 right-4 h-24";
    case "chain":
      return "top-1/3 left-4 right-4 h-32";
    case "score":
      return "top-24 left-1/4 right-1/4 h-16";
    case "patterns":
      return "top-40 left-8 right-8 h-12";
    case "target":
      return "top-24 right-8 w-24 h-16";
    case "relics":
      return "top-16 left-1/4 right-1/4 h-12";
    default:
      return "";
  }
}

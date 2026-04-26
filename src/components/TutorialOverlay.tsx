import { motion, AnimatePresence } from "framer-motion";
import type { TutorialStep } from "@/engine/tutorial";
import { GiSwordSpin } from "react-icons/gi";
import { useTranslation } from "@/engine/i18n";

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
  const { t } = useTranslation();
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

        {/* Highlight area with synced pulse + animated arrow pointing into it */}
        {step.highlight && (
          <>
            <motion.div
              key={`hi-${step.highlight}`}
              animate={{ boxShadow: [
                "0 0 0 9999px rgba(15,15,20,0.85), 0 0 0 0px rgba(212,168,83,0.6)",
                "0 0 0 9999px rgba(15,15,20,0.85), 0 0 0 8px rgba(212,168,83,0.0)",
                "0 0 0 9999px rgba(15,15,20,0.85), 0 0 0 0px rgba(212,168,83,0.6)",
              ] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute ${getHighlightPosition(step.highlight)} border-2 border-accent-gold rounded-xl pointer-events-none`}
            />
            <ArrowPointer highlight={step.highlight} />
          </>
        )}

        {/* Tutorial card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pointer-events-auto"
        >
          <div className="relative bg-gradient-to-b from-surface-800 to-surface-900 border border-accent-gold/30 rounded-2xl p-6 shadow-2xl shadow-accent-gold/10 overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/60 to-transparent" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-accent-gold/70 uppercase tracking-[0.3em] font-bold">
                {t("tutorial.step", { current: currentIndex + 1, total: totalSteps })}
              </span>
              <button
                onClick={onSkip}
                className="text-[10px] uppercase tracking-widest text-accent-silver/40 hover:text-accent-silver transition"
              >
                {t("tutorial.skip")}
              </button>
            </div>

            <h3 className="font-display font-black text-2xl text-white mb-2 leading-tight">
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
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-accent-gold to-yellow-500 text-surface-900 font-bold text-sm hover:brightness-110 transition shadow-md shadow-accent-gold/30"
              >
                {currentIndex === totalSteps - 1 ? t("tutorial.start") : t("tutorial.nextArrow")}
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

/**
 * Pulsing arrow pointing toward the highlighted region. Position + rotation
 * are computed from the same `highlight` keys used by getHighlightPosition.
 */
function ArrowPointer({ highlight }: { highlight: string }) {
  const config = arrowConfig(highlight);
  if (!config) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: config.bounceAxis === "x" ? [0, config.bounceAmount, 0] : 0,
        y: config.bounceAxis === "y" ? [0, config.bounceAmount, 0] : 0,
      }}
      transition={{
        x: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
      }}
      className={`absolute ${config.position} pointer-events-none text-accent-gold drop-shadow-[0_0_8px_rgba(212,168,83,0.7)]`}
      style={{ transform: `rotate(${config.rotate}deg)` }}
    >
      <GiSwordSpin size={32} />
    </motion.div>
  );
}

interface ArrowConfig {
  position: string;
  rotate: number;
  bounceAxis: "x" | "y";
  bounceAmount: number;
}

function arrowConfig(highlight: string): ArrowConfig | null {
  switch (highlight) {
    case "hand":
      // Arrow above the hand pointing down
      return { position: "bottom-[14rem] left-1/2 -translate-x-1/2", rotate: 90, bounceAxis: "y", bounceAmount: 8 };
    case "chain":
      // Arrow above the chain pointing down
      return { position: "top-[26%] left-1/2 -translate-x-1/2", rotate: 90, bounceAxis: "y", bounceAmount: 6 };
    case "score":
      return { position: "top-44 left-1/2 -translate-x-1/2", rotate: -90, bounceAxis: "y", bounceAmount: -6 };
    case "patterns":
      return { position: "top-56 left-1/2 -translate-x-1/2", rotate: -90, bounceAxis: "y", bounceAmount: -6 };
    case "target":
      return { position: "top-44 right-12", rotate: 0, bounceAxis: "x", bounceAmount: -8 };
    case "relics":
      return { position: "top-32 left-1/2 -translate-x-1/2", rotate: -90, bounceAxis: "y", bounceAmount: -6 };
    default:
      return null;
  }
}

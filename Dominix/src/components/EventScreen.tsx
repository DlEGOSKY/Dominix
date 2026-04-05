import { motion } from "framer-motion";
import type { GameEvent, ChoiceOption, EventEffect } from "@/engine/events";

interface EventScreenProps {
  event: GameEvent;
  onContinue: (effect?: Exclude<EventEffect, { type: "choice" }>) => void;
}

export default function EventScreen({ event, onContinue }: EventScreenProps) {
  const isChoice = event.effect.type === "choice";
  const options = isChoice ? (event.effect as { type: "choice"; options: ChoiceOption[] }).options : [];

  const typeColors = {
    blessing: "text-green-400",
    curse: "text-red-400",
    choice: "text-blue-400",
    shop: "text-accent-gold",
  };

  const typeBg = {
    blessing: "from-green-600/20 to-green-800/10",
    curse: "from-red-600/20 to-red-800/10",
    choice: "from-blue-600/20 to-blue-800/10",
    shop: "from-accent-gold/20 to-yellow-800/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
        className={`max-w-md w-full rounded-2xl border border-surface-600 bg-gradient-to-b ${typeBg[event.type]} p-8`}
      >
        <div className="flex flex-col items-center gap-4 text-center mb-8">
          <span className={`text-xs uppercase tracking-wider font-medium ${typeColors[event.type]}`}>
            {event.type === "blessing" ? "Bendicion" : event.type === "curse" ? "Maldicion" : "Evento"}
          </span>
          <h2 className="font-display font-bold text-3xl text-white">
            {event.name}
          </h2>
          <p className="text-accent-silver/70">
            {event.description}
          </p>
        </div>

        {isChoice ? (
          <div className="flex flex-col gap-3">
            {options.map((option, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                onClick={() => onContinue(option.effect)}
                className="p-4 rounded-xl border border-surface-500 bg-surface-700/50 hover:bg-surface-600 hover:border-accent-silver/40 transition-all text-left"
              >
                <span className="font-semibold text-white block mb-1">
                  {option.label}
                </span>
                <span className="text-sm text-accent-silver/60">
                  {option.description}
                </span>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => onContinue(event.effect as Exclude<EventEffect, { type: "choice" }>)}
            className="w-full py-4 rounded-xl bg-surface-700 border border-surface-500 text-white font-semibold hover:bg-surface-600 transition"
          >
            Continuar
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}

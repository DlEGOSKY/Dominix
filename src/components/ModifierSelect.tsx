import { useState } from "react";
import { motion } from "framer-motion";
import { ALL_MODIFIERS, isModifierUnlocked } from "@/engine/modifiers";

interface ModifierSelectProps {
  bestRound: number;
  totalRuns: number;
  onStart: (modifierIds: string[]) => void;
  onCancel: () => void;
}

export default function ModifierSelect({ bestRound, totalRuns, onStart, onCancel }: ModifierSelectProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState("normal");
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  const difficulties = ALL_MODIFIERS.filter((m) => m.type === "difficulty");
  const variants = ALL_MODIFIERS.filter((m) => m.type === "variant" || m.type === "challenge");

  const toggleVariant = (id: string) => {
    setSelectedVariants((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    const modifiers = [selectedDifficulty, ...selectedVariants];
    onStart(modifiers);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-surface-900/95 z-40 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-surface-800 border border-surface-600 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-display font-bold text-2xl text-white mb-6 text-center">
          Configurar Run
        </h2>

        {/* Dificultad */}
        <div className="mb-6">
          <h3 className="text-sm text-accent-silver/60 uppercase tracking-wider mb-3">
            Dificultad
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {difficulties.map((mod) => {
              const unlocked = isModifierUnlocked(mod, bestRound, totalRuns);
              const selected = selectedDifficulty === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => unlocked && setSelectedDifficulty(mod.id)}
                  disabled={!unlocked}
                  className={[
                    "p-3 rounded-lg border text-left transition-all",
                    selected
                      ? "bg-accent-gold/20 border-accent-gold/50 text-white"
                      : unlocked
                      ? "bg-surface-700 border-surface-600 text-accent-silver hover:border-accent-silver/40"
                      : "bg-surface-800 border-surface-700 text-surface-500 cursor-not-allowed",
                  ].join(" ")}
                >
                  <span className="font-semibold block">
                    {unlocked ? mod.name : "???"}
                  </span>
                  <span className="text-xs opacity-70">
                    {unlocked ? mod.description : `Desbloquea en ronda ${mod.unlockCondition?.value}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Variantes */}
        <div className="mb-6">
          <h3 className="text-sm text-accent-silver/60 uppercase tracking-wider mb-3">
            Modificadores (opcional)
          </h3>
          <div className="flex flex-col gap-2">
            {variants.map((mod) => {
              const unlocked = isModifierUnlocked(mod, bestRound, totalRuns);
              const selected = selectedVariants.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  onClick={() => unlocked && toggleVariant(mod.id)}
                  disabled={!unlocked}
                  className={[
                    "p-3 rounded-lg border text-left transition-all flex items-center gap-3",
                    selected
                      ? "bg-blue-600/20 border-blue-500/50 text-white"
                      : unlocked
                      ? "bg-surface-700 border-surface-600 text-accent-silver hover:border-accent-silver/40"
                      : "bg-surface-800 border-surface-700 text-surface-500 cursor-not-allowed",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "w-5 h-5 rounded border-2 flex items-center justify-center text-xs",
                      selected ? "bg-blue-500 border-blue-500" : "border-surface-500",
                    ].join(" ")}
                  >
                    {selected && "✓"}
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold block">
                      {unlocked ? mod.name : "???"}
                    </span>
                    <span className="text-xs opacity-70">
                      {unlocked
                        ? mod.description
                        : mod.unlockCondition?.type === "rounds"
                        ? `Desbloquea en ronda ${mod.unlockCondition.value}`
                        : `Desbloquea con ${mod.unlockCondition?.value} runs`}
                    </span>
                  </div>
                  {mod.type === "challenge" && unlocked && (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      Desafio
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-surface-600 text-accent-silver font-medium hover:bg-surface-700 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleStart}
            className="flex-1 py-3 rounded-xl bg-accent-gold text-surface-900 font-bold hover:brightness-110 transition"
          >
            Iniciar Run
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

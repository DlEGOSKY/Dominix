import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SavedData } from "@/types/domino";
import { audio } from "@/engine/audio";
import { getDailyDateString, hasDailyBeenPlayed } from "@/engine/daily";
import { getNextUnlocks } from "@/engine/unlocks";
import { ALL_RELICS } from "@/engine/relics";
import ModifierSelect from "./ModifierSelect";

interface HomeScreenProps {
  savedData: SavedData;
  onStartRun: (modifiers: string[]) => void;
  onStartDaily: () => void;
  onShowAchievements: () => void;
}

export default function HomeScreen({ savedData, onStartRun, onStartDaily, onShowAchievements }: HomeScreenProps) {
  const hasPlayed = savedData.totalRuns > 0;
  const [muted, setMuted] = useState(audio.isMuted());
  const [showModifiers, setShowModifiers] = useState(false);
  const dailyPlayed = hasDailyBeenPlayed();
  const nextUnlocks = getNextUnlocks(savedData, 2);

  const toggleMute = () => {
    const newMuted = !muted;
    audio.setMuted(newMuted);
    setMuted(newMuted);
    if (!newMuted) audio.play("button_click");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-6">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-2"
      >
        <h1 className="font-display font-black text-6xl tracking-tight text-white">
          DOMINIX
        </h1>
        <p className="text-accent-silver/60 text-sm tracking-widest uppercase">
          Roguelike de domino
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModifiers(true)}
          className="px-8 py-4 rounded-xl bg-accent-gold text-surface-900 font-bold text-lg tracking-wide hover:brightness-110 transition shadow-lg shadow-accent-gold/20"
        >
          Nueva Run
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 25 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartDaily}
          disabled={dailyPlayed}
          className={[
            "px-8 py-4 rounded-xl font-bold text-lg tracking-wide transition shadow-lg",
            dailyPlayed
              ? "bg-surface-700 text-accent-silver/50 cursor-not-allowed"
              : "bg-blue-600 text-white hover:brightness-110 shadow-blue-600/20",
          ].join(" ")}
        >
          {dailyPlayed ? "Diario completado" : "Reto Diario"}
        </motion.button>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="text-xs text-accent-silver/40"
      >
        {getDailyDateString()}
      </motion.p>

      {hasPlayed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-4 mt-4"
        >
          <div className="w-64 h-px bg-surface-600" />
          
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold text-2xl text-white">
                {savedData.bestRound}
              </span>
              <span className="text-xs text-accent-silver/50 uppercase tracking-wider">
                Mejor ronda
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold text-2xl text-accent-gold">
                {savedData.bestScore}
              </span>
              <span className="text-xs text-accent-silver/50 uppercase tracking-wider">
                Mejor score
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold text-2xl text-white">
                {savedData.totalRuns}
              </span>
              <span className="text-xs text-accent-silver/50 uppercase tracking-wider">
                Runs totales
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono font-bold text-2xl text-white">
                {savedData.totalRoundsPlayed}
              </span>
              <span className="text-xs text-accent-silver/50 uppercase tracking-wider">
                Rondas jugadas
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {nextUnlocks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex flex-col items-center gap-2 mt-2"
        >
          <span className="text-xs text-accent-silver/40 uppercase tracking-wider">
            Proximos desbloqueos
          </span>
          <div className="flex flex-col gap-1">
            {nextUnlocks.map((unlock) => {
              const relic = ALL_RELICS.find((r) => r.id === unlock.relicId);
              return (
                <div
                  key={unlock.relicId}
                  className="text-xs text-accent-silver/50 flex items-center gap-2"
                >
                  <span className="text-accent-gold">{relic?.name ?? unlock.relicId}</span>
                  <span>— {unlock.description}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="absolute top-6 right-6 flex gap-2">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onShowAchievements}
          className="px-3 py-2 rounded-lg bg-surface-800 border border-surface-600 text-accent-gold/70 text-sm hover:border-accent-gold/40 transition"
        >
          Logros
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          onClick={toggleMute}
          className="px-3 py-2 rounded-lg bg-surface-800 border border-surface-600 text-accent-silver/60 text-sm hover:border-accent-silver/40 transition"
        >
          {muted ? "Sonido OFF" : "Sonido ON"}
        </motion.button>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-8 text-xs text-accent-silver/30"
      >
        Construye cadenas. Activa patrones. Rompe la run.
      </motion.p>

      <AnimatePresence>
        {showModifiers && (
          <ModifierSelect
            bestRound={savedData.bestRound}
            totalRuns={savedData.totalRuns}
            onStart={(mods) => {
              setShowModifiers(false);
              onStartRun(mods);
            }}
            onCancel={() => setShowModifiers(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

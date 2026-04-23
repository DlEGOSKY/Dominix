import { motion } from "framer-motion";
import { useState } from "react";
import {
  getWeeklyLabel,
  getWeeklyTheme,
  getWeeklyPreset,
  getWeeklyRecord,
  getWeeklyShareText,
} from "@/engine/weekly";

interface WeeklyChallengeScreenProps {
  onStart: () => void;
  onBack: () => void;
}

/**
 * Pre-run screen for the Weekly Challenge: shows the current theme, the
 * deterministic modifier for the week, the player's local best, and a
 * share button so they can copy their result to clipboard.
 */
export default function WeeklyChallengeScreen({ onStart, onBack }: WeeklyChallengeScreenProps) {
  const label = getWeeklyLabel();
  const theme = getWeeklyTheme();
  const preset = getWeeklyPreset();
  const record = getWeeklyRecord();
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    if (!record) return;
    const text = getWeeklyShareText(record.bestScore, record.bestRound);
    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 ambient-grain">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Back */}
        <button
          onClick={onBack}
          className="text-accent-silver/60 hover:text-white text-sm transition self-start"
        >
          ← Volver
        </button>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-2 text-center"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-silver/35">
            Reto Semanal
          </span>
          <h1 className="font-display font-black text-4xl text-transparent bg-clip-text bg-gradient-to-b from-white via-white/85 to-accent-silver/50">
            {theme}
          </h1>
          <span className="text-[11px] text-accent-gold/60 uppercase tracking-widest">{label}</span>
        </motion.div>

        {/* Modifier */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl bg-gradient-to-b from-surface-800/80 to-surface-900/80 border border-accent-gold/20 p-5 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent-gold/70">
            Modificador de la semana
          </span>
          <p className="text-white text-lg font-semibold tracking-tight text-center">
            {preset.modifierText}
          </p>
          <p className="text-[11px] text-accent-silver/50 italic text-center max-w-sm">
            Todos los jugadores enfrentan el mismo reto esta semana. Mismas fichas iniciales, mismo modificador.
          </p>
        </motion.div>

        {/* Local record */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="grid grid-cols-3 gap-2"
        >
          <Stat label="Mejor score" value={record?.bestScore ? record.bestScore.toLocaleString() : "—"} />
          <Stat label="Mejor ronda" value={record?.bestRound ? String(record.bestRound) : "—"} />
          <Stat label="Intentos" value={String(record?.runs ?? 0)} />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-col gap-2"
        >
          <button
            onClick={onStart}
            className="w-full px-6 py-3.5 rounded-2xl bg-gradient-to-b from-accent-gold to-amber-600 text-surface-900 font-bold text-sm tracking-wide hover:brightness-110 btn-premium transition"
          >
            {record ? "Intentar de nuevo" : "Comenzar reto"}
          </button>

          {record && (
            <button
              onClick={handleShare}
              className="w-full px-6 py-2.5 rounded-2xl bg-surface-800/70 border border-surface-600/40 text-accent-silver/70 hover:border-accent-silver/40 text-xs font-semibold tracking-wide transition"
            >
              {shared ? "Copiado al portapapeles" : "Compartir resultado"}
            </button>
          )}
        </motion.div>

        <p className="text-[10px] text-accent-silver/30 text-center mt-2">
          El reto rota cada semana. Tu mejor score queda guardado localmente hasta el siguiente lunes.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2 py-3 rounded-xl bg-surface-800/50 border border-surface-600/30">
      <span className="text-[9px] font-bold uppercase tracking-widest text-accent-silver/40">
        {label}
      </span>
      <span className="text-base font-bold text-white">{value}</span>
    </div>
  );
}

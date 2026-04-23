import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Boss } from "@/engine/boss";

interface BossIntroProps {
  boss: Boss;
  round: number;
  onStart: () => void;
}

export default function BossIntro({ boss, round, onStart }: BossIntroProps) {
  // Letter-by-letter name reveal
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    setRevealed(0);
    const interval = setInterval(() => {
      setRevealed((r) => {
        if (r >= boss.name.length) {
          clearInterval(interval);
          return r;
        }
        return r + 1;
      });
    }, 65);
    return () => clearInterval(interval);
  }, [boss.name]);

  const phaseCount = boss.phases?.length ?? 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Pulsing red vignette */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(220,38,38,0.22) 100%)",
        }}
      />

      {/* Ambient scanning lines */}
      <motion.div
        className="fixed left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)" }}
        initial={{ top: "10%" }}
        animate={{ top: ["10%", "90%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="fixed left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.35), transparent)" }}
        initial={{ top: "70%" }}
        animate={{ top: ["70%", "20%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 1 }}
      />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="relative flex flex-col items-center gap-6 max-w-md"
      >
        {/* Concentric expanding rings icon */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-red-500/40"
              initial={{ scale: 0.3, opacity: 0.8 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.65, ease: "easeOut" }}
            />
          ))}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-red-500/15 border-2 border-red-500/50 flex items-center justify-center relative z-10"
          >
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" className="text-red-400">
              <path d="M12 3a7 7 0 0 0-7 7v4l2 2v3h3v-2h4v2h3v-3l2-2v-4a7 7 0 0 0-7-7z" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.2" />
              <circle cx="9" cy="11" r="1.6" fill="currentColor" />
              <circle cx="15" cy="11" r="1.6" fill="currentColor" />
            </svg>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <div className="h-px w-8 bg-red-500/50" />
          <span className="text-red-400 text-[10px] font-bold tracking-[0.25em] uppercase">
            Ronda {round} · Jefe
          </span>
          <div className="h-px w-8 bg-red-500/50" />
        </motion.div>

        {/* Name revealed letter-by-letter */}
        <h2
          className="font-display font-black text-5xl text-center bg-gradient-to-b from-white via-white/90 to-red-200/40 bg-clip-text text-transparent min-h-[60px]"
          aria-label={boss.name}
        >
          {boss.name.split("").map((ch, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: -12, filter: "blur(6px)" }}
              animate={revealed > i ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={{ duration: 0.25 }}
              style={{ display: "inline-block", whiteSpace: ch === " " ? "pre" : "normal" }}
            >
              {ch}
            </motion.span>
          ))}
          {revealed < boss.name.length && (
            <motion.span
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-1 h-10 align-middle bg-red-400 ml-1"
            />
          )}
        </h2>

        {phaseCount > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-1.5"
          >
            {Array.from({ length: phaseCount }).map((_, i) => (
              <div key={i} className="w-6 h-1 rounded-full bg-red-500/40" />
            ))}
            <span className="text-[9px] text-red-400/60 uppercase tracking-widest ml-2">
              {phaseCount} fases
            </span>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-accent-silver/65 text-center text-base leading-relaxed max-w-sm"
        >
          {boss.description}
        </motion.p>

        {boss.restriction && (
          <motion.div
            initial={{ opacity: 0, x: -10, scaleX: 0.9 }}
            animate={{ opacity: 1, x: 0, scaleX: 1 }}
            transition={{ delay: 0.9 }}
            className="relative px-5 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-sm overflow-hidden"
          >
            {/* Inner shimmer */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.3), transparent)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="relative text-yellow-400/95 text-sm font-medium">
              {getRestrictionText(boss.restriction)}
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-gold/10 border border-accent-gold/30">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-gold shadow-[0_0_8px_rgba(212,168,83,0.6)]" />
            <span className="font-mono font-bold text-sm text-accent-gold">+{boss.reward.gold}</span>
          </div>
          {boss.reward.extraRelic && (
            <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <span className="font-mono font-bold text-sm text-purple-300">+Reliquia</span>
            </div>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="mt-2 px-10 py-3.5 rounded-xl bg-gradient-to-b from-red-500 to-red-700 text-white font-bold text-lg tracking-wide transition shadow-lg shadow-red-500/40 hover:shadow-red-500/60 relative overflow-hidden"
        >
          <motion.span
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          />
          <span className="relative">Enfrentar</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

function getRestrictionText(restriction: Boss["restriction"]): string {
  if (!restriction) return "";
  switch (restriction.type) {
    case "no_doubles":
      return "Restriccion: No puedes jugar fichas dobles";
    case "max_tiles":
      return `Restriccion: Maximo ${restriction.count} fichas en la cadena`;
    case "min_patterns":
      return `Restriccion: Debes activar al menos ${restriction.count} patrones`;
    case "no_wild":
      return "Restriccion: Las fichas comodin estan desactivadas";
    case "only_doubles":
      return "Restriccion: Solo puedes jugar fichas dobles";
    case "only_low":
      return `Restriccion: Solo fichas con suma <= ${restriction.max}`;
    case "min_chain_length":
      return `Requisito: La cadena debe tener al menos ${restriction.count} fichas`;
    case "no_repeat_number":
      return "Restriccion: No puedes repetir el mismo numero de conexion consecutivo";
    case "max_doubles":
      return `Restriccion: Maximo ${restriction.count} ficha(s) doble en la cadena`;
    case "even_sum_only":
      return "Restriccion: Solo fichas con suma par son validas";
    case "exact_chain_length":
      return `Requisito: La cadena debe tener exactamente ${restriction.count} fichas`;
    default: {
      // Exhaustiveness guard: forces future BossRestriction types to be handled here.
      const _never: never = restriction;
      void _never;
      return "";
    }
  }
}

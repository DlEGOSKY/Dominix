import { motion } from "framer-motion";
import type { Boss } from "@/engine/boss";

interface BossIntroProps {
  boss: Boss;
  round: number;
  onStart: () => void;
}

export default function BossIntro({ boss, round, onStart }: BossIntroProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Background vignette */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(220,38,38,0.08)_100%)] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative flex flex-col items-center gap-8 max-w-md"
      >
        {/* Decorative icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center"
        >
          <div className="w-10 h-10 rounded-lg bg-red-500/30 border border-red-500/40 rotate-45" />
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-4 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30"
        >
          <span className="text-red-400 text-[10px] font-bold tracking-widest uppercase">
            Ronda {round} — Jefe
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-display font-black text-5xl text-center bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
        >
          {boss.name}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-accent-silver/60 text-center text-lg leading-relaxed max-w-sm"
        >
          {boss.description}
        </motion.p>

        {boss.restriction && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="px-5 py-3 rounded-xl bg-yellow-500/8 border border-yellow-500/25 backdrop-blur-sm"
          >
            <span className="text-yellow-400/90 text-sm font-medium">
              {getRestrictionText(boss.restriction)}
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-gold/10 border border-accent-gold/20">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-gold/70" />
            <span className="font-mono font-bold text-sm text-accent-gold">+{boss.reward.gold}</span>
          </div>
          {boss.reward.extraRelic && (
            <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <span className="font-mono font-bold text-sm text-purple-400">+Reliquia</span>
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
          className="mt-4 px-10 py-3.5 rounded-xl bg-gradient-to-b from-red-500 to-red-700 text-white font-bold text-lg tracking-wide transition shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
        >
          Enfrentar
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
  }
}

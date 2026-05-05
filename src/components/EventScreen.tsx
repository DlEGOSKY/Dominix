import { motion } from "framer-motion";
import type { GameEvent, ChoiceOption, EventEffect } from "@/engine/events";
import { useLocalizedEvent } from "@/engine/i18nContent";
import { useTranslation } from "@/engine/i18n";

interface EventScreenProps {
  event: GameEvent;
  onContinue: (effect?: Exclude<EventEffect, { type: "choice" }>) => void;
}

export default function EventScreen({ event, onContinue }: EventScreenProps) {
  const { t } = useTranslation();
  const loc = useLocalizedEvent(event);
  const isChoice = event.effect.type === "choice";
  // Pair each source ChoiceOption (carries the actual effect we must run) with
  // its translated label/description by index. localizeEvent keeps order stable.
  const sourceOptions = isChoice ? (event.effect as { type: "choice"; options: ChoiceOption[] }).options : [];
  const options = sourceOptions.map((src, i) => ({
    effect: src.effect,
    label: loc.options?.[i]?.label ?? src.label,
    description: loc.options?.[i]?.description ?? src.description,
  }));

  const typeColors = {
    blessing: "text-green-400",
    curse: "text-red-400",
    choice: "text-blue-400",
    shop: "text-accent-gold",
  };

  const typeBg = {
    blessing: "from-green-600/15 to-green-900/5",
    curse: "from-red-600/15 to-red-900/5",
    choice: "from-blue-600/15 to-blue-900/5",
    shop: "from-accent-gold/15 to-yellow-900/5",
  };

  const typeBorder = {
    blessing: "border-green-500/40",
    curse: "border-red-500/40",
    choice: "border-blue-500/40",
    shop: "border-accent-gold/40",
  };

  const typeGlow = {
    blessing: "0 0 40px rgba(34,197,94,0.12)",
    curse: "0 0 40px rgba(239,68,68,0.15)",
    choice: "0 0 40px rgba(59,130,246,0.12)",
    shop: "0 0 40px rgba(212,168,83,0.12)",
  };

  const typeGlyph = {
    blessing: "✦",
    curse: "✸",
    choice: "◈",
    shop: "◆",
  };

  const typeLabel = {
    blessing: t("event.blessing"),
    curse: t("event.curse"),
    choice: t("event.choice"),
    shop: t("event.choice"),
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
        className={`max-w-md w-full rounded-2xl border-2 bg-gradient-to-b ${typeBg[event.type]} ${typeBorder[event.type]} p-8 relative overflow-hidden`}
        style={{ boxShadow: typeGlow[event.type] }}
      >
        {/* Ambient top shimmer */}
        <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${typeBg[event.type]} to-transparent opacity-60 pointer-events-none`} />

        <div className="relative flex flex-col items-center gap-4 text-center mb-8">
          {/* Type glyph icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 20 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${
              event.type === "blessing" ? "bg-green-500/10 border-green-500/30" :
              event.type === "curse" ? "bg-red-500/10 border-red-500/30" :
              "bg-blue-500/10 border-blue-500/30"
            }`}
          >
            <span className={typeColors[event.type]}>{typeGlyph[event.type]}</span>
          </motion.div>
          <span className={`text-[10px] uppercase tracking-[0.3em] font-bold ${typeColors[event.type]}`}>
            {typeLabel[event.type]}
          </span>
          <h2 className="font-display font-bold text-3xl text-white">
            {loc.name}
          </h2>
          <p className="text-accent-silver/65 leading-relaxed text-sm max-w-xs">
            {loc.description}
          </p>
        </div>

        {isChoice ? (
          <div className="flex flex-col gap-3">
            {options.map((option, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onContinue(option.effect)}
                className="p-4 rounded-xl border border-blue-500/25 bg-surface-800/60 hover:bg-blue-500/10 hover:border-blue-400/40 transition-all text-left group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-white leading-tight">
                    {option.label}
                  </span>
                  <span className="shrink-0 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/25 text-blue-300 uppercase tracking-widest group-hover:bg-blue-500/25 transition-colors">
                    {option.effect.type === "bonus_score" ? `+${option.effect.value}pts` :
                     option.effect.type === "bonus_actions" ? `+${option.effect.actions} acc` :
                     option.effect.type === "add_tiles" ? `+${option.effect.count} fichas` :
                     option.effect.type === "heal_hand" ? `+${option.effect.count} mano` :
                     option.effect.type === "reduce_target" ? `-${option.effect.percent}% meta` :
                     option.effect.type === "increase_target" ? `+${option.effect.percent}% meta` :
                     option.effect.type === "remove_random_tile" ? `-${option.effect.count} ficha` :
                     option.effect.type === "add_relic" ? "reliquia" :
                     ""}
                  </span>
                </div>
                <span className="text-sm text-accent-silver/55 mt-1 block leading-relaxed">
                  {option.description}
                </span>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onContinue(event.effect as Exclude<EventEffect, { type: "choice" }>)}
            className={[
              "w-full py-4 rounded-xl border font-semibold text-sm tracking-wide transition-all",
              event.type === "blessing"
                ? "bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20 hover:border-green-400/50"
                : event.type === "curse"
                ? "bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:border-red-400/50"
                : "bg-surface-700/60 border-surface-500/50 text-white hover:bg-surface-600/70",
            ].join(" ")}
          >
            {t("event.continue")}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}

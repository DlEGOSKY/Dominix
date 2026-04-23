import { AnimatePresence, motion } from "framer-motion";
import type { Consumable } from "@/engine/consumables";

interface ConsumableBarProps {
  consumables: Consumable[];
  onUse: (id: string) => void;
  disabled?: boolean;
  /** Id of a consumable that was just used, to play a short flash. */
  flashId?: string | null;
  /** Optional class for the outer container (e.g. to hide on mobile). */
  className?: string;
}

const TINT_CLASSES: Record<Consumable["tint"], { bg: string; border: string; text: string; glow: string }> = {
  blue:   { bg: "bg-blue-500/15",   border: "border-blue-400/50",   text: "text-blue-200",   glow: "rgba(96,165,250,0.6)" },
  green:  { bg: "bg-green-500/15",  border: "border-green-400/50",  text: "text-green-200",  glow: "rgba(74,222,128,0.6)" },
  gold:   { bg: "bg-amber-500/15",  border: "border-amber-400/60",  text: "text-amber-200",  glow: "rgba(251,191,36,0.7)" },
  purple: { bg: "bg-purple-500/15", border: "border-purple-400/50", text: "text-purple-200", glow: "rgba(192,132,252,0.6)" },
  pink:   { bg: "bg-pink-500/15",   border: "border-pink-400/50",   text: "text-pink-200",   glow: "rgba(244,114,182,0.6)" },
  cyan:   { bg: "bg-cyan-500/15",   border: "border-cyan-400/50",   text: "text-cyan-200",   glow: "rgba(34,211,238,0.6)" },
};

const RARITY_BADGE: Record<Consumable["rarity"], { label: string; color: string }> = {
  common: { label: "C", color: "bg-slate-600/60 text-slate-200" },
  rare: { label: "R", color: "bg-blue-600/60 text-blue-100" },
  legendary: { label: "L", color: "bg-amber-500/70 text-amber-50" },
};

export default function ConsumableBar({ consumables, onUse, disabled, flashId, className }: ConsumableBarProps) {
  if (consumables.length === 0) return null;

  return (
    <div className={`flex flex-col items-center gap-1 w-full ${className ?? ""}`}>
      <span className="text-[9px] font-bold uppercase tracking-widest text-accent-silver/35">
        Consumibles
      </span>
      <div className="flex items-center justify-center gap-2">
        <AnimatePresence mode="popLayout">
          {consumables.map((c) => {
            const tint = TINT_CLASSES[c.tint];
            const rarity = RARITY_BADGE[c.rarity];
            const isFlashing = flashId === c.id;
            return (
              <motion.button
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.7, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.4, y: -20, rotate: 18 }}
                whileHover={!disabled ? { scale: 1.06, y: -2 } : undefined}
                whileTap={!disabled ? { scale: 0.94 } : undefined}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                disabled={disabled}
                onClick={() => !disabled && onUse(c.id)}
                title={`${c.name}: ${c.description}`}
                className={[
                  "relative group flex flex-col items-center justify-center gap-1",
                  "w-[68px] h-[84px] rounded-xl border-2 backdrop-blur-sm transition",
                  tint.bg,
                  tint.border,
                  tint.text,
                  disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-lg",
                ].join(" ")}
                style={{
                  boxShadow: !disabled ? `0 0 12px 0 ${tint.glow}` : undefined,
                }}
              >
                {/* Flash overlay */}
                {isFlashing && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    initial={{ opacity: 0.8, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.6 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    style={{ background: tint.glow }}
                  />
                )}
                {/* Rarity badge */}
                <span className={`absolute top-1 left-1 w-3.5 h-3.5 rounded text-[8px] font-bold flex items-center justify-center ${rarity.color}`}>
                  {rarity.label}
                </span>
                {/* Glyph */}
                <div className="text-2xl font-black font-display tracking-tighter" style={{ textShadow: `0 0 8px ${tint.glow}` }}>
                  {c.glyph}
                </div>
                {/* Name */}
                <div className="text-[8px] font-bold uppercase tracking-wider text-center leading-tight px-0.5">
                  {c.name}
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-lg bg-surface-900/95 border border-surface-600/60 px-2.5 py-2 shadow-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-30">
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${tint.text} mb-0.5`}>
                    {c.name}
                  </div>
                  <div className="text-[9px] text-accent-silver/60 leading-tight">
                    {c.description}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

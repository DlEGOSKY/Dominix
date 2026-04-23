import { motion, AnimatePresence } from "framer-motion";
import {
  computeCelestialSetBonus,
  FIRMAMENT_META,
  patternName,
  type CelestialCard,
  type Firmament,
} from "@/engine/celestial";

interface CelestialBarProps {
  cards: CelestialCard[];
}

/**
 * Compact horizontal row of celestial cards owned in the current run, plus
 * a row of active firmament alignments (set bonuses). Each card is tinted
 * by its firmament so the player can read their cosmic loadout at a glance.
 */
export default function CelestialBar({ cards }: CelestialBarProps) {
  if (cards.length === 0) return null;

  const setBonus = computeCelestialSetBonus(cards);
  const firmamentCounts: Record<Firmament, number> = { length: 0, doubles: 0, structural: 0, rhythmic: 0 };
  for (const c of cards) firmamentCounts[c.firmament]++;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Active alignments (set bonuses) */}
      {(setBonus.firmamentAlignments.length > 0 || setBonus.cosmicAlignment) && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {setBonus.firmamentAlignments.map((f) => {
            const meta = FIRMAMENT_META[f];
            return (
              <motion.div
                key={`align-${f}`}
                initial={{ opacity: 0, y: -4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`group relative flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${meta.border} ${meta.bg} ${meta.text}`}
                style={{ boxShadow: `0 0 10px ${meta.glow}` }}
              >
                <span className="text-[8px] font-black uppercase tracking-[0.15em]">Alin.</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">{meta.label}</span>
                <span className="text-[8px] font-mono opacity-70">{firmamentCounts[f]}</span>

                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 rounded-lg bg-surface-900/95 border border-surface-600/60 px-2.5 py-2 shadow-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-30">
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${meta.text} mb-0.5`}>
                    Alineacion {meta.label}
                  </div>
                  <div className="text-[9px] text-accent-silver/60 leading-tight">
                    {meta.description}
                  </div>
                  <div className="text-[9px] text-accent-silver/80 mt-1 leading-tight font-semibold">
                    {meta.bonusDescription}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {setBonus.cosmicAlignment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="group relative flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-amber-400/70 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-blue-500/20 text-amber-200"
              style={{ boxShadow: "0 0 16px rgba(251,191,36,0.55), 0 0 28px rgba(168,85,247,0.35)" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-amber-300">
                <path d="M12 3l2.5 6.5L21 11l-5 4.5 1.5 6.5L12 18.5 6.5 22 8 15.5 3 11l6.5-1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="currentColor" fillOpacity="0.5" />
              </svg>
              <span className="text-[9px] font-bold uppercase tracking-widest">Alineacion Cosmica</span>

              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 rounded-lg bg-surface-900/95 border border-amber-400/60 px-2.5 py-2 shadow-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-30">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-200 mb-0.5">
                  Alineacion Cosmica
                </div>
                <div className="text-[9px] text-accent-silver/60 leading-tight">
                  Activa con 5+ cartas celestes
                </div>
                <div className="text-[9px] text-amber-300/90 mt-1 leading-tight font-semibold">
                  +40 score plano por cadena puntuada · x1.08 al total · potencia el Pacto (+20%)
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Cards row */}
      <div className="flex flex-col items-center gap-1 w-full">
        <span className="text-[9px] font-bold uppercase tracking-widest text-accent-silver/30">
          Cartas celestes · {cards.length}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {cards.map((c, i) => {
              const meta = FIRMAMENT_META[c.firmament];
              return (
                <motion.div
                  key={`${c.id}-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0.6, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ type: "spring", stiffness: 360, damping: 22, delay: i * 0.04 }}
                  className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg border backdrop-blur-sm ${meta.border} ${meta.bg} ${meta.text}`}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="opacity-80">
                    <path d="M12 3l2.5 6.5L21 11l-5 4.5 1.5 6.5L12 18.5 6.5 22 8 15.5 3 11l6.5-1.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{c.name}</span>
                  <span className="text-[9px] font-mono opacity-70">+{Math.round(c.bonusMultiplier * 100)}%</span>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 rounded-lg bg-surface-900/95 border border-surface-600/60 px-2.5 py-2 shadow-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-30">
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${meta.text} mb-0.5`}>
                      {c.name}
                    </div>
                    <div className="text-[9px] text-accent-silver/50 leading-tight">
                      Firmamento: <span className={meta.text}>{meta.label}</span>
                    </div>
                    <div className="text-[9px] text-accent-silver/50 leading-tight">
                      Afecta a <span className={meta.text}>{patternName(c.patternId)}</span>
                    </div>
                    <div className={`text-[9px] mt-1 leading-tight ${meta.text}`}>
                      {c.description}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

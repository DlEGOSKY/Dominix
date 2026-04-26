import { motion, AnimatePresence } from "framer-motion";
import {
  ALL_RELICS,
  getRelicFamily,
  getRelicRarity,
  getFamilyCounts,
  FAMILY_META,
} from "@/engine/relics";
import type { RelicFamily } from "@/types/relic";
import RelicCard from "./RelicCard";
import Tooltip, { RelicTooltipContent } from "./Tooltip";

interface RelicBarProps {
  relicIds: string[];
  /** Increments to trigger a pulse wave on all relics (e.g., when a pattern fires) */
  pulseKey?: number;
  /** Optional subset of relic ids to emphasize in the next pulse */
  highlightIds?: string[];
}

function familyBorder(family: RelicFamily | null, active: boolean): string {
  if (!family) return active ? "border-accent-gold/60" : "border-accent-silver/20";
  switch (family) {
    case "patron": return active ? "border-accent-gold/60" : "border-accent-gold/30";
    case "numero": return active ? "border-blue-400/60" : "border-blue-400/30";
    case "fuerza": return active ? "border-red-400/60" : "border-red-400/30";
    case "cadena": return active ? "border-purple-400/60" : "border-purple-400/30";
    case "accion": return active ? "border-green-400/60" : "border-green-400/30";
  }
}

function familyText(family: RelicFamily | null): string {
  if (!family) return "text-accent-silver";
  switch (family) {
    case "patron": return "text-accent-gold";
    case "numero": return "text-blue-300";
    case "fuerza": return "text-red-300";
    case "cadena": return "text-purple-300";
    case "accion": return "text-green-300";
  }
}

export default function RelicBar({ relicIds, pulseKey = 0, highlightIds }: RelicBarProps) {
  if (relicIds.length === 0) return null;

  const relics = ALL_RELICS.filter((r) => relicIds.includes(r.id));
  const counts = getFamilyCounts(relicIds);
  const activeFamilies = (Object.keys(counts) as RelicFamily[]).filter((f) => counts[f] >= 3);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex items-center gap-3">
        <span className="text-xs text-accent-silver/40 uppercase tracking-wider">
          Reliquias ({relics.length})
        </span>
        {/* Family progress pills */}
        {(Object.keys(counts) as RelicFamily[]).filter((f) => counts[f] > 0).map((family) => {
          const count = counts[family];
          const meta = FAMILY_META[family];
          const active = count >= 3;
          const FamilyIcon = meta.icon;
          return (
            <div
              key={family}
              title={`${meta.name}: ${count}/3 · ${meta.setBonusDescription}`}
              className={[
                "flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-bold tabular-nums transition-all",
                active ? "bg-surface-700/80" : "bg-surface-800/50",
                familyBorder(family, active),
                familyText(family),
              ].join(" ")}
            >
              <FamilyIcon size={11} />
              <span>{count}</span>
              {active && <span className="ml-0.5">★</span>}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <AnimatePresence mode="popLayout">
          {relics.map((relic, i) => {
            const isHighlight = highlightIds?.includes(relic.id);
            const fam = getRelicFamily(relic);
            const rarity = getRelicRarity(relic);
            const tooltipContent = (
              <RelicTooltipContent
                name={relic.name}
                description={relic.description}
                family={fam ? FAMILY_META[fam].name : null}
                FamilyIcon={fam ? FAMILY_META[fam].icon : undefined}
                familyColor={fam ? familyText(fam) : undefined}
                rarity={rarity}
              />
            );
            return (
              <motion.div
                key={relic.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 25 }}
                className="relative"
              >
                <Tooltip content={tooltipContent} placement="top" delay={250}>
                  {/* Inner wrapper handles the bounce + shake on each pulse */}
                  <motion.div
                    key={`pulse-anim-${pulseKey}-${relic.id}`}
                    initial={{ scale: 1, rotate: 0, y: 0 }}
                    animate={
                      pulseKey > 0
                        ? isHighlight
                          ? {
                              scale: [1, 1.25, 1.05, 1],
                              rotate: [0, -6, 6, -2, 0],
                              y: [0, -4, 0],
                            }
                          : {
                              scale: [1, 1.08, 1],
                              y: [0, -1.5, 0],
                            }
                        : { scale: 1, rotate: 0, y: 0 }
                    }
                    transition={{
                      delay: i * 0.03,
                      duration: isHighlight ? 0.55 : 0.32,
                      ease: "easeOut",
                    }}
                  >
                    <RelicCard relicId={relic.id} size="xs" showName={false} />
                  </motion.div>
                </Tooltip>
                {pulseKey > 0 && isHighlight && (
                  <motion.div
                    key={`pulse-glow-${pulseKey}-${relic.id}`}
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{
                      opacity: [0, 0.95, 0],
                      scale: [1, 1.32, 1.05],
                    }}
                    transition={{ delay: i * 0.04, duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      boxShadow:
                        "0 0 22px 3px rgba(212,168,83,0.95), 0 0 4px 0 rgba(255,255,255,0.7) inset",
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Active set bonuses summary */}
      {activeFamilies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-2 mt-1"
        >
          {activeFamilies.map((f) => {
            const FamilyIcon = FAMILY_META[f].icon;
            return (
              <div
                key={f}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-surface-800/70 border ${familyBorder(f, true)} ${familyText(f)}`}
                title={FAMILY_META[f].setBonusDescription}
              >
                <FamilyIcon size={11} />
                <span>Set {FAMILY_META[f].name}</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

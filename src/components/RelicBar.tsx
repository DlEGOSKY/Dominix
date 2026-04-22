import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ALL_RELICS,
  getRelicFamily,
  getFamilyCounts,
  FAMILY_META,
} from "@/engine/relics";
import type { RelicFamily } from "@/types/relic";
import RelicCard from "./RelicCard";

interface RelicBarProps {
  relicIds: string[];
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

export default function RelicBar({ relicIds }: RelicBarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (relicIds.length === 0) return null;

  const relics = ALL_RELICS.filter((r) => relicIds.includes(r.id));
  const hoveredRelic = relics.find((r) => r.id === hoveredId);
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
              <span className="text-[11px]">{meta.icon}</span>
              <span>{count}</span>
              {active && <span className="ml-0.5">★</span>}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <AnimatePresence mode="popLayout">
          {relics.map((relic, i) => (
            <motion.div
              key={relic.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 25 }}
              onMouseEnter={() => setHoveredId(relic.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative"
            >
              <RelicCard relicId={relic.id} size="xs" showName={false} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {hoveredRelic && (
          <motion.div
            key={hoveredRelic.id}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-0.5 text-xs text-accent-silver/60 text-center max-w-sm"
          >
            <span>{hoveredRelic.description}</span>
            {(() => {
              const fam = getRelicFamily(hoveredRelic);
              if (!fam) return null;
              return (
                <span className={`text-[10px] uppercase tracking-widest font-bold ${familyText(fam)}`}>
                  {FAMILY_META[fam].icon} {FAMILY_META[fam].name}
                </span>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active set bonuses summary */}
      {activeFamilies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-2 mt-1"
        >
          {activeFamilies.map((f) => (
            <div
              key={f}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-surface-800/70 border ${familyBorder(f, true)} ${familyText(f)}`}
              title={FAMILY_META[f].setBonusDescription}
            >
              <span>{FAMILY_META[f].icon}</span>
              <span>Set {FAMILY_META[f].name}</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

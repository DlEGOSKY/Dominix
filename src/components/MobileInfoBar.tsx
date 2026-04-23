import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Consumable } from "@/engine/consumables";
import type { CelestialCard } from "@/engine/celestial";
import { FIRMAMENT_META } from "@/engine/celestial";
import { ALL_RELICS } from "@/engine/relics";
import { ALL_ACTIVE_MUTATIONS } from "@/engine/activeMutations";
import type { ActiveMutationState } from "@/engine/activeMutations";
import type { GameState } from "@/types/domino";

interface MobileInfoBarProps {
  relicIds: string[];
  consumables: Consumable[];
  celestials: CelestialCard[];
  mutationStates: ActiveMutationState[];
  game: GameState;
  onUseConsumable: (id: string) => void;
  onActivateMutation: (id: string) => void;
  consumableFlashId?: string | null;
}

type Tab = "relics" | "consum" | "celest" | "mut";

/**
 * Mobile compact panel row — shown only on <sm viewports. Condenses the four
 * auxiliary bars (relics, consumables, celestials, mutations) into a single
 * row of chips. Tapping a chip opens a bottom sheet with full details.
 */
export default function MobileInfoBar({
  relicIds,
  consumables,
  celestials,
  mutationStates,
  game,
  onUseConsumable,
  onActivateMutation,
  consumableFlashId,
}: MobileInfoBarProps) {
  const [openTab, setOpenTab] = useState<Tab | null>(null);

  const chips: { id: Tab; label: string; count: number; color: string; hidden?: boolean }[] = [
    { id: "relics", label: "Reliquias", count: relicIds.length, color: "accent-gold" },
    { id: "consum", label: "Consumibles", count: consumables.length, color: "blue-400" },
    { id: "celest", label: "Celestes", count: celestials.length, color: "cyan-300" },
    { id: "mut", label: "Mutaciones", count: mutationStates.length, color: "purple-400", hidden: mutationStates.length === 0 },
  ];

  const visibleChips = chips.filter((c) => !c.hidden);

  return (
    <>
      <div className="w-full grid gap-1.5 sm:hidden" style={{ gridTemplateColumns: `repeat(${visibleChips.length}, minmax(0, 1fr))` }}>
        {visibleChips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => setOpenTab(chip.id)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-lg border transition-all ${
              chip.count > 0
                ? `border-surface-600/40 bg-surface-800/50 text-${chip.color}`
                : "border-surface-700/30 bg-surface-800/20 text-accent-silver/25"
            }`}
          >
            <span className="text-[8px] uppercase tracking-widest font-bold opacity-70">{chip.label}</span>
            <span className="text-sm font-black tabular-nums">{chip.count}</span>
          </button>
        ))}
      </div>

      {/* Bottom sheet */}
      <AnimatePresence>
        {openTab && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 sm:hidden"
              onClick={() => setOpenTab(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-surface-900 border-t-2 border-surface-600/40 rounded-t-2xl max-h-[75vh] overflow-y-auto sm:hidden"
            >
              <div className="sticky top-0 bg-surface-900 border-b border-surface-700/40 px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-accent-silver/80">
                  {chips.find((c) => c.id === openTab)?.label}
                </span>
                <button
                  onClick={() => setOpenTab(null)}
                  className="text-accent-silver/50 hover:text-accent-silver text-xs uppercase tracking-widest"
                >
                  Cerrar
                </button>
              </div>
              <div className="p-4">
                {openTab === "relics" && <RelicsContent relicIds={relicIds} />}
                {openTab === "consum" && (
                  <ConsumablesContent
                    consumables={consumables}
                    onUse={(id) => {
                      onUseConsumable(id);
                      setOpenTab(null);
                    }}
                    flashId={consumableFlashId}
                  />
                )}
                {openTab === "celest" && <CelestialsContent cards={celestials} />}
                {openTab === "mut" && (
                  <MutationsContent
                    states={mutationStates}
                    game={game}
                    onActivate={(id) => {
                      onActivateMutation(id);
                      setOpenTab(null);
                    }}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function RelicsContent({ relicIds }: { relicIds: string[] }) {
  if (relicIds.length === 0) {
    return <p className="text-xs text-accent-silver/40 text-center py-4">No hay reliquias aun</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {relicIds.map((id) => {
        const r = ALL_RELICS.find((x) => x.id === id);
        if (!r) return null;
        return (
          <div key={id} className="p-3 rounded-xl bg-accent-gold/5 border border-accent-gold/20">
            <div className="text-sm font-bold text-accent-gold">{r.name}</div>
            <div className="text-[11px] text-accent-silver/60 mt-1 leading-snug">{r.description}</div>
          </div>
        );
      })}
    </div>
  );
}

function ConsumablesContent({
  consumables,
  onUse,
  flashId,
}: {
  consumables: Consumable[];
  onUse: (id: string) => void;
  flashId?: string | null;
}) {
  if (consumables.length === 0) {
    return <p className="text-xs text-accent-silver/40 text-center py-4">Sin consumibles</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {consumables.map((c) => (
        <button
          key={c.id}
          onClick={() => onUse(c.id)}
          className={`p-3 rounded-xl bg-blue-500/10 border text-left transition-all ${
            flashId === c.id ? "border-blue-300 bg-blue-500/20" : "border-blue-500/30"
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-sm font-bold text-blue-300">{c.name}</div>
            <span className="text-[9px] uppercase tracking-widest text-blue-400/60">Usar</span>
          </div>
          <div className="text-[11px] text-accent-silver/60 mt-1 leading-snug">{c.description}</div>
        </button>
      ))}
    </div>
  );
}

function CelestialsContent({ cards }: { cards: CelestialCard[] }) {
  if (cards.length === 0) {
    return <p className="text-xs text-accent-silver/40 text-center py-4">Sin cartas celestes</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {cards.map((c) => {
        const meta = FIRMAMENT_META[c.firmament];
        return (
          <div key={c.id} className={`p-3 rounded-xl border ${meta.bg} ${meta.border}`}>
            <div className="flex items-baseline justify-between gap-2">
              <div className={`text-sm font-bold ${meta.text}`}>{c.name}</div>
              <span className={`text-[8px] uppercase tracking-widest font-bold ${meta.text} opacity-70`}>
                {meta.label}
              </span>
            </div>
            <div className="text-[11px] text-accent-silver/60 mt-1 leading-snug">{c.description}</div>
          </div>
        );
      })}
    </div>
  );
}

function MutationsContent({
  states,
  game,
  onActivate,
}: {
  states: ActiveMutationState[];
  game: GameState;
  onActivate: (id: string) => void;
}) {
  if (states.length === 0) {
    return <p className="text-xs text-accent-silver/40 text-center py-4">Sin mutaciones activas</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {states.map((ms) => {
        const mut = ALL_ACTIVE_MUTATIONS.find((m) => m.id === ms.mutationId);
        if (!mut) return null;
        const canUse = ms.usesLeft > 0 && game.result === "playing";
        const costLabel = mut.cost.type === "actions" ? `${mut.cost.amount} acc` : `${mut.cost.amount} pts`;
        return (
          <button
            key={ms.mutationId}
            onClick={() => canUse && onActivate(ms.mutationId)}
            disabled={!canUse}
            className={`p-3 rounded-xl bg-purple-500/10 border text-left transition-all ${
              canUse ? "border-purple-500/40 active:bg-purple-500/25" : "border-surface-600/30 opacity-50"
            }`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-sm font-bold text-purple-300">{mut.name}</div>
              <span className="text-[9px] uppercase tracking-widest text-purple-400/60">
                {costLabel} · {ms.usesLeft}x
              </span>
            </div>
            <div className="text-[11px] text-accent-silver/60 mt-1 leading-snug">{mut.description}</div>
          </button>
        );
      })}
    </div>
  );
}

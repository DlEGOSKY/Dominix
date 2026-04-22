import { useState } from "react";
import { motion } from "framer-motion";
import { ALL_RELICS } from "@/engine/relics";
import { ALL_PATTERNS } from "@/engine/patterns";
import RelicCard from "./RelicCard";
import TileView from "./TileView";
import type { TileSkin } from "./TileView";
import { getUnlockedRelics, getLockedRelics } from "@/engine/unlocks";
import { loadProgression, getProgressionBonuses, saveActiveSkin, loadActiveSkin } from "@/engine/progression";
import { ALL_EDITIONS, loadDiscoveredEditions } from "@/engine/editions";
import type { SavedData } from "@/types/domino";

type Tab = "relics" | "patterns" | "skins" | "editions";

interface CollectionScreenProps {
  savedData: SavedData;
  onBack: () => void;
}

const SKIN_INFO: { id: TileSkin; name: string; unlockLevel: number }[] = [
  { id: "default",  name: "Clasica",    unlockLevel: 1 },
  { id: "obsidian", name: "Obsidiana",  unlockLevel: 3 },
  { id: "emerald",  name: "Esmeralda",  unlockLevel: 6 },
  { id: "ruby",     name: "Rubi",       unlockLevel: 9 },
  { id: "ivory",    name: "Marfil",     unlockLevel: 11 },
  { id: "void",     name: "Vacio",      unlockLevel: 14 },
  { id: "neon",     name: "Neon",       unlockLevel: 17 },
  { id: "gold",     name: "Dorado",     unlockLevel: 20 },
];

const DEMO_TILE = { id: "skin-demo", top: 3, bottom: 5 };

export default function CollectionScreen({ savedData, onBack }: CollectionScreenProps) {
  const [tab, setTab] = useState<Tab>("relics");
  const [activeSkin, setActiveSkin] = useState<TileSkin>(() => loadActiveSkin() as TileSkin);

  const unlocked = getUnlockedRelics(savedData);
  const locked = getLockedRelics(savedData);
  const unlockedIds = new Set(unlocked);

  const prog = loadProgression();
  const bonuses = getProgressionBonuses(prog);
  const unlockedSkins = new Set(["default", ...bonuses.unlockedSkins]);

  const discoveredEditions = loadDiscoveredEditions();

  const tabs: { id: Tab; label: string; count: string }[] = [
    { id: "relics", label: "Reliquias", count: `${unlockedIds.size}/${ALL_RELICS.length}` },
    { id: "patterns", label: "Patrones", count: `${ALL_PATTERNS.length}` },
    { id: "editions", label: "Ediciones", count: `${discoveredEditions.size}/${ALL_EDITIONS.length}` },
    { id: "skins", label: "Skins", count: `${unlockedSkins.size}/${SKIN_INFO.length}` },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center gap-6 px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 w-full">
        <button
          onClick={onBack}
          className="px-3 py-2 rounded-lg bg-surface-800 border border-surface-600 text-accent-silver/60 text-sm hover:border-accent-silver/40 transition"
        >
          Volver
        </button>
        <h1 className="font-display font-black text-2xl bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
          Coleccion
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 w-full">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all",
              tab === t.id
                ? "bg-accent-gold/15 border border-accent-gold/30 text-accent-gold"
                : "bg-surface-800 border border-surface-600 text-accent-silver/50 hover:border-accent-silver/30",
            ].join(" ")}
          >
            {t.label}
            <span className="ml-1.5 text-[10px] opacity-60">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "relics" && (
        <div className="flex flex-col gap-3 w-full">
          {ALL_RELICS.map((relic, i) => {
            const isUnlocked = unlockedIds.has(relic.id);
            const lockInfo = locked.find((l) => l.relicId === relic.id);
            return (
              <motion.div
                key={relic.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={[
                  "flex items-start gap-4 p-4 rounded-xl border transition-all",
                  isUnlocked
                    ? "bg-surface-800/80 border-accent-gold/20"
                    : "bg-surface-900/60 border-surface-700/40 opacity-50",
                ].join(" ")}
              >
                <div className="shrink-0">
                  <RelicCard relicId={relic.id} size="xs" showName={false} locked={!isUnlocked} />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className={[
                    "font-bold text-sm",
                    isUnlocked ? "text-white" : "text-accent-silver/40",
                  ].join(" ")}>
                    {isUnlocked ? relic.name : "???"}
                  </span>
                  <span className="text-xs text-accent-silver/50">
                    {isUnlocked ? relic.description : (lockInfo?.description ?? "Bloqueada")}
                  </span>
                </div>
                {isUnlocked && (
                  <div className="flex items-center gap-2 shrink-0">
                    {relic.effect.type === "multiplier" ? (
                      <span className="text-[10px] font-mono font-bold text-accent-gold/70">x{relic.effect.value}</span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-green-400/70">+{relic.effect.value}</span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === "patterns" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {ALL_PATTERNS.map((pattern, i) => (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex flex-col gap-2 p-4 rounded-xl bg-surface-800/80 border border-blue-500/15"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{pattern.name}</span>
                <div className="flex items-center gap-2">
                  {pattern.bonus > 0 && (
                    <span className="text-[10px] font-mono font-bold text-green-400/70">+{pattern.bonus}</span>
                  )}
                  {pattern.multiplier > 1 && (
                    <span className="text-[10px] font-mono font-bold text-accent-gold/70">x{pattern.multiplier}</span>
                  )}
                </div>
              </div>
              <span className="text-xs text-accent-silver/50">{pattern.description}</span>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "editions" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {ALL_EDITIONS.map((edition, i) => {
            const owned = discoveredEditions.has(edition.id);
            return (
              <motion.div
                key={edition.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={[
                  "relative flex items-start gap-4 p-4 rounded-xl border transition-all overflow-hidden",
                  owned
                    ? "bg-surface-800/80 border-pink-400/30"
                    : "bg-surface-900/60 border-surface-700/40 opacity-40",
                ].join(" ")}
              >
                {/* Mini tile preview with edition effect */}
                <div className={[
                  "relative w-14 h-20 shrink-0 rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 overflow-hidden",
                  "bg-gradient-to-b from-[#26264a] to-[#16162a]",
                  owned ? `edition-${edition.id}` : "",
                  owned ? (
                    edition.id === "foil" ? "border-blue-300/70" :
                    edition.id === "holo" ? "border-purple-400/70" :
                    edition.id === "polychrome" ? "border-pink-400/70" :
                    "border-slate-400/60"
                  ) : "border-surface-600",
                ].join(" ")}>
                  <div className="w-2 h-2 rounded-full bg-accent-silver/70" />
                  <div className="w-6 h-px bg-tile-border/40" />
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-silver/70" />
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-silver/70" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className={[
                    "font-bold text-sm",
                    owned ? "text-white" : "text-accent-silver/40",
                  ].join(" ")}>
                    {owned ? edition.name : "???"}
                  </span>
                  <span className="text-xs text-accent-silver/50">
                    {owned ? edition.description : "Encuentrala durante una run para descubrirla"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === "skins" && (
        <div className="flex flex-col gap-4 w-full">
          <p className="text-xs text-accent-silver/40 text-center">
            Skin activa: <span className="text-accent-gold font-bold">{SKIN_INFO.find(s => s.id === activeSkin)?.name ?? "Clasica"}</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            {SKIN_INFO.map((skin, i) => {
              const owned = unlockedSkins.has(skin.id) || skin.id === "default";
              const isActive = activeSkin === skin.id;
              return (
                <motion.button
                  key={skin.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  disabled={!owned}
                  onClick={() => {
                    if (!owned) return;
                    setActiveSkin(skin.id);
                    saveActiveSkin(skin.id);
                  }}
                  className={[
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    owned ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
                    isActive
                      ? "border-accent-gold/60 bg-accent-gold/8"
                      : owned
                        ? "border-surface-600/50 bg-surface-800/60 hover:border-surface-500"
                        : "border-surface-700/30 bg-surface-900/40",
                  ].join(" ")}
                >
                  <div className={["pointer-events-none", !owned ? "grayscale" : ""].join(" ")}>
                    <TileView tile={DEMO_TILE} disabled skin={skin.id} size="sm" animate={false} />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className={[
                      "text-sm font-bold",
                      isActive ? "text-accent-gold" : owned ? "text-white" : "text-accent-silver/40",
                    ].join(" ")}>
                      {skin.name}
                    </span>
                    {isActive && (
                      <span className="text-[9px] text-accent-gold/70 uppercase tracking-widest font-bold">Activa</span>
                    )}
                    {!owned && (
                      <span className="text-[9px] text-accent-silver/30 uppercase tracking-wider">Nv. {skin.unlockLevel}</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
      {/* CC-BY Attribution */}
      <div className="w-full pt-4 border-t border-surface-700/40 text-center">
        <p className="text-[10px] text-accent-silver/25 leading-relaxed">
          Iconos de reliquias por{" "}
          <a
            href="https://game-icons.net"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent-silver/50 transition"
          >
            game-icons.net
          </a>
          {" "}— Licencia CC BY 3.0
        </p>
      </div>
    </div>
  );
}

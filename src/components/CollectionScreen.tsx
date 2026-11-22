import { useState } from "react";
import { motion } from "framer-motion";
import { ALL_RELICS } from "@/engine/relics";
import { ALL_PATTERNS } from "@/engine/patterns";
import { getPatternIcon } from "@/engine/patternIcons";
import RelicCard from "./RelicCard";
import SkinWardrobe from "./SkinWardrobe";
import type { TileSkin } from "./TileView";
import { getUnlockedRelics, getLockedRelics } from "@/engine/unlocks";
import { loadProgression, getProgressionBonuses, saveActiveSkin, loadActiveSkin } from "@/engine/progression";
import { ALL_TILE_SKINS } from "@/engine/tileSkins";
import { ALL_EDITIONS, loadDiscoveredEditions } from "@/engine/editions";
import { audio } from "@/engine/audio";
import { localizeRelic, localizePattern } from "@/engine/i18nContent";
import { useTranslation } from "@/engine/i18n";
import { useReduceMotion } from "@/hooks/useSettings";
import type { SavedData } from "@/types/domino";

type Tab = "relics" | "patterns" | "skins" | "editions";

interface CollectionScreenProps {
  savedData: SavedData;
  onBack: () => void;
  initialTab?: Tab;
}

export default function CollectionScreen({ savedData, onBack, initialTab = "relics" }: CollectionScreenProps) {
  // Subscribe to lang changes so localized relic copy updates on switch.
  const { t } = useTranslation();
  const reducedMotion = useReduceMotion();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [activeSkin, setActiveSkin] = useState<TileSkin>(() => loadActiveSkin() as TileSkin);
  const equipSkin = (skin: TileSkin) => {
    setActiveSkin(skin);
    saveActiveSkin(skin);
    audio.play("button_click");
  };

  const unlocked = getUnlockedRelics(savedData);
  const locked = getLockedRelics(savedData);
  const unlockedIds = new Set(unlocked);

  const prog = loadProgression();
  const bonuses = getProgressionBonuses(prog);
  const unlockedSkins = new Set(["default", ...bonuses.unlockedSkins]);

  const discoveredEditions = loadDiscoveredEditions();

  const tabs: { id: Tab; label: string; count: string }[] = [
    { id: "relics",   label: t("collection.tab.relics"),   count: `${unlockedIds.size}/${ALL_RELICS.length}` },
    { id: "patterns", label: t("collection.tab.patterns"), count: `${ALL_PATTERNS.length}` },
    { id: "editions", label: t("collection.tab.editions"), count: `${discoveredEditions.size}/${ALL_EDITIONS.length}` },
    { id: "skins",    label: t("collection.tab.skins"),    count: `${unlockedSkins.size}/${ALL_TILE_SKINS.length}` },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center gap-6 px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 w-full">
        <button
          onClick={onBack}
          className="min-h-11 px-3 py-2 rounded-lg bg-surface-800 border border-surface-600 text-accent-silver/80 text-sm hover:border-accent-silver/40 transition"
        >
          {t("btn.back")}
        </button>
        <h1 className="font-display font-black text-2xl bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
          {t("collection.title")}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 w-full">
        {tabs.map((tabDef) => {
          const parts = tabDef.count.split('/').map(Number);
          const current = parts[0] ?? 0;
          const total = parts[1] ?? parts[0] ?? 1;
          const progress = total > 0 ? (current / total) * 100 : 100;
          return (
            <button
              key={tabDef.id}
              onClick={() => setTab(tabDef.id)}
              aria-label={`${tabDef.label} ${tabDef.count}`}
              aria-pressed={tab === tabDef.id}
              className={[
                "relative flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all overflow-hidden",
                tab === tabDef.id
                  ? "bg-accent-gold/15 border border-accent-gold/30 text-accent-gold"
                  : "bg-surface-800 border border-surface-600 text-accent-silver/50 hover:border-accent-silver/30",
              ].join(" ")}
            >
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-700/40">
                <motion.div
                  initial={reducedMotion ? false : { width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: reducedMotion ? 0 : 0.2, duration: reducedMotion ? 0 : 0.6, ease: "easeOut" }}
                  className={tab === tabDef.id ? "h-full bg-accent-gold/60" : "h-full bg-accent-silver/30"}
                />
              </div>
              <span className="relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5">
                <span className="text-xs sm:text-sm">{tabDef.label}</span>
                <span className="text-[10px] opacity-70">{tabDef.count}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === "relics" && (
        <div className="flex flex-col gap-3 w-full">
          {ALL_RELICS.map((relic, i) => {
            const isUnlocked = unlockedIds.has(relic.id);
            const lockInfo = locked.find((l) => l.relicId === relic.id);
            const loc = localizeRelic(relic);
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
                  <div className="flex items-center gap-2">
                    {!isUnlocked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-accent-silver/30 shrink-0">
                        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    <span className={[
                      "font-bold text-sm",
                      isUnlocked ? "text-white" : "text-accent-silver/40",
                    ].join(" ")}>
                      {isUnlocked ? loc.name : "???"}
                    </span>
                  </div>
                  <span className="text-xs text-accent-silver/50">
                    {isUnlocked ? loc.description : (lockInfo?.description ?? t("collection.relicLocked"))}
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
          {ALL_PATTERNS.map((pattern, i) => {
            const Icon = getPatternIcon(pattern.id);
            const loc = localizePattern(pattern);
            return (
              <motion.div
                key={pattern.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-surface-800/80 border border-blue-500/15"
              >
                {Icon && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                    <Icon className="text-blue-300" size={22} />
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-white truncate">{loc.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {pattern.bonus > 0 && (
                        <span className="text-[10px] font-mono font-bold text-green-400/70">+{pattern.bonus}</span>
                      )}
                      {pattern.multiplier > 1 && (
                        <span className="text-[10px] font-mono font-bold text-accent-gold/70">x{pattern.multiplier}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-accent-silver/50">{loc.description}</span>
                </div>
              </motion.div>
            );
          })}
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
                    {owned ? edition.description : t("collection.editionLockHint")}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === "skins" && <SkinWardrobe activeSkin={activeSkin} unlockedSkins={unlockedSkins} onEquip={equipSkin} />}
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

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ALL_RELICS } from "@/engine/relics";
import { ALL_PATTERNS } from "@/engine/patterns";
import { getPatternIcon } from "@/engine/patternIcons";
import RelicCard from "./RelicCard";
import TileView from "./TileView";
import type { TileSkin } from "./TileView";
import { getUnlockedRelics, getLockedRelics } from "@/engine/unlocks";
import { loadProgression, getProgressionBonuses, saveActiveSkin, loadActiveSkin } from "@/engine/progression";
import { ALL_TILE_SKINS } from "@/engine/tileSkins";
import { ALL_EDITIONS, loadDiscoveredEditions } from "@/engine/editions";
import { audio } from "@/engine/audio";
import { localizeRelic, localizePattern, localizeSkinById } from "@/engine/i18nContent";
import { useTranslation } from "@/engine/i18n";
import type { SavedData } from "@/types/domino";

type Tab = "relics" | "patterns" | "skins" | "editions";

interface CollectionScreenProps {
  savedData: SavedData;
  onBack: () => void;
}

// Source of truth for skins now lives in `engine/tileSkins.tsx`. We just
// surface the public-facing fields here (name, unlock level, flavor) so
// the collection screen has everything it needs without re-listing them.
const SKIN_INFO: { id: TileSkin; name: string; flavor: string; unlockLevel: number }[] = ALL_TILE_SKINS.map((s) => ({
  id: s.id as TileSkin,
  name: s.name,
  flavor: s.flavor,
  unlockLevel: s.unlockLevel,
}));

// Three tiles arranged like a small play sequence so each skin can be
// previewed in context (pattern + glyph + dot interactions).
const DEMO_CHAIN_TILES = [
  { id: "skin-demo-1", top: 3, bottom: 5 },
  { id: "skin-demo-2", top: 5, bottom: 2 },
  { id: "skin-demo-3", top: 2, bottom: 6 },
] as const;

export default function CollectionScreen({ savedData, onBack }: CollectionScreenProps) {
  // Subscribe to lang changes so localized relic copy updates on switch.
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("relics");
  const [activeSkin, setActiveSkin] = useState<TileSkin>(() => loadActiveSkin() as TileSkin);

  // Throttle the hover tick so sliding the cursor through the skin grid does
  // not spam audio. ~120ms keeps it tactile but never noisy.
  const lastHoverSoundRef = useRef<number>(0);
  const playHoverTick = () => {
    const now = performance.now();
    if (now - lastHoverSoundRef.current < 120) return;
    lastHoverSoundRef.current = now;
    audio.play("tile_hover");
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
    { id: "skins",    label: t("collection.tab.skins"),    count: `${unlockedSkins.size}/${SKIN_INFO.length}` },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center gap-6 px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 w-full">
        <button
          onClick={onBack}
          className="px-3 py-2 rounded-lg bg-surface-800 border border-surface-600 text-accent-silver/60 text-sm hover:border-accent-silver/40 transition"
        >
          {t("btn.back")}
        </button>
        <h1 className="font-display font-black text-2xl bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
          {t("collection.title")}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 w-full">
        {tabs.map((tabDef) => (
          <button
            key={tabDef.id}
            onClick={() => setTab(tabDef.id)}
            className={[
              "flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all",
              tab === tabDef.id
                ? "bg-accent-gold/15 border border-accent-gold/30 text-accent-gold"
                : "bg-surface-800 border border-surface-600 text-accent-silver/50 hover:border-accent-silver/30",
            ].join(" ")}
          >
            {tabDef.label}
            <span className="ml-1.5 text-[10px] opacity-60">{tabDef.count}</span>
          </button>
        ))}
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
                  <span className={[
                    "font-bold text-sm",
                    isUnlocked ? "text-white" : "text-accent-silver/40",
                  ].join(" ")}>
                    {isUnlocked ? loc.name : "???"}
                  </span>
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

      {tab === "skins" && (
        <div className="flex flex-col gap-4 w-full">
          <p className="text-xs text-accent-silver/40 text-center">
            {t("collection.activeSkin")} <span className="text-accent-gold font-bold">{(() => {
              const active = SKIN_INFO.find(s => s.id === activeSkin);
              return active ? localizeSkinById(active.id, active.name, active.flavor).name : t("collection.activeSkinDefault");
            })()}</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            {SKIN_INFO.map((skin, i) => {
              const owned = unlockedSkins.has(skin.id) || skin.id === "default";
              const isActive = activeSkin === skin.id;
              return (
                <motion.button
                  key={skin.id}
                  initial="enter"
                  animate="rest"
                  whileHover={owned ? "hover" : "rest"}
                  onHoverStart={owned ? playHoverTick : undefined}
                  variants={{
                    enter: { opacity: 0, scale: 0.9 },
                    rest: { opacity: 1, scale: 1 },
                    hover: { opacity: 1, scale: 1 },
                  }}
                  transition={{ delay: i * 0.05 }}
                  disabled={!owned}
                  onClick={() => {
                    if (!owned) return;
                    setActiveSkin(skin.id);
                    saveActiveSkin(skin.id);
                    audio.play("button_click");
                  }}
                  className={[
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                    owned ? "cursor-pointer" : "opacity-40 cursor-not-allowed",
                    isActive
                      ? "border-accent-gold/60 bg-accent-gold/8"
                      : owned
                        ? "border-surface-600/50 bg-surface-800/60 hover:border-surface-500 hover:bg-surface-800/80"
                        : "border-surface-700/30 bg-surface-900/40",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "relative pointer-events-none flex items-center justify-center -space-x-1.5",
                      !owned ? "grayscale" : "",
                    ].join(" ")}
                  >
                    {/* Radial accent glow under the chain on hover */}
                    {owned && (
                      <motion.div
                        aria-hidden
                        variants={{
                          rest: { opacity: 0, scale: 0.7 },
                          hover: { opacity: 0.85, scale: 1 },
                        }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-x-0 -bottom-2 h-8 rounded-full blur-xl"
                        style={{
                          background: `radial-gradient(ellipse at center, ${
                            ALL_TILE_SKINS.find((s) => s.id === skin.id)?.accent ?? "#a8b2c1"
                          } 0%, transparent 65%)`,
                        }}
                      />
                    )}
                    {/* Floating sparkle above center tile on hover */}
                    {owned && (
                      <motion.div
                        aria-hidden
                        variants={{
                          rest: { opacity: 0, y: 6, scale: 0 },
                          hover: { opacity: 1, y: -14, scale: 1 },
                        }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute left-1/2 -top-2 -translate-x-1/2 z-[3] pointer-events-none"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: ALL_TILE_SKINS.find((s) => s.id === skin.id)?.accent ?? "#fff",
                            boxShadow: `0 0 8px 2px ${
                              ALL_TILE_SKINS.find((s) => s.id === skin.id)?.accent ?? "#fff"
                            }`,
                          }}
                        />
                      </motion.div>
                    )}
                    {DEMO_CHAIN_TILES.map((t, idx) => {
                      const tilt = idx === 0 ? -4 : idx === 2 ? 4 : 0;
                      return (
                        <motion.div
                          key={t.id}
                          variants={{
                            rest: {
                              y: idx === 1 ? -2 : 0,
                              scale: idx === 1 ? 1.05 : 1,
                              rotate: 0,
                            },
                            hover: {
                              y: idx === 1 ? -12 : -6,
                              scale: idx === 1 ? 1.1 : 1.04,
                              rotate: tilt,
                            },
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 320,
                            damping: 22,
                            delay: idx * 0.04,
                          }}
                          style={{
                            zIndex: idx === 1 ? 2 : 1,
                            transformOrigin: "center bottom",
                          }}
                        >
                          <TileView tile={t} disabled skin={skin.id} size="sm" animate={false} />
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <span className={[
                      "text-sm font-bold",
                      isActive ? "text-accent-gold" : owned ? "text-white" : "text-accent-silver/40",
                    ].join(" ")}>
                      {localizeSkinById(skin.id, skin.name, skin.flavor).name}
                    </span>
                    <span className={[
                      "text-[10px] italic leading-tight px-1",
                      owned ? "text-accent-silver/55" : "text-accent-silver/25",
                    ].join(" ")}>
                      {owned ? localizeSkinById(skin.id, skin.name, skin.flavor).flavor : t("collection.skinLockHint", { n: skin.unlockLevel })}
                    </span>
                    {isActive && (
                      <span className="mt-1 text-[9px] text-accent-gold/70 uppercase tracking-widest font-bold">{t("collection.skinActive")}</span>
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

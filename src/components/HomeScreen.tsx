import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SavedData } from "@/types/domino";
import { audio } from "@/engine/audio";
import { getDailyDateString, hasDailyBeenPlayed } from "@/engine/daily";
import { getNextUnlocks } from "@/engine/unlocks";
import { ALL_RELICS } from "@/engine/relics";
import { loadProgression, getXPForNextLevel, LEVEL_REWARDS, getProgressionBonuses, saveActiveSkin, loadActiveSkin } from "@/engine/progression";
import { loadAscension } from "@/engine/ascension";
import { useTranslation } from "@/engine/i18n";
import { useLocalizedRelic } from "@/engine/i18nContent";
import ModifierSelect from "./ModifierSelect";

/**
 * Single "next unlock" row — kept as a subcomponent so we can call
 * `useLocalizedRelic` (a hook) for each relic without violating hook rules.
 */
function NextUnlockRow({ relicId, description }: { relicId: string; description: string }) {
  const relic = ALL_RELICS.find((r) => r.id === relicId);
  const loc = useLocalizedRelic(relic ?? { id: relicId, name: relicId, description: "", trigger: "passive", effect: { type: "bonus_flat", value: 0 } } as never);
  return (
    <span className="text-[10px] text-accent-silver/40">
      <span className="text-accent-gold font-medium">{loc.name}</span>
      {" — "}{description}
    </span>
  );
}

export interface HomeScreenProps {
  savedData: SavedData;
  onStartRun: (modifiers: string[]) => void;
  onStartDaily: () => void;
  onShowWeekly: () => void;
  onStartEndless: () => void;
  onShowAchievements: () => void;
  onShowLeaderboard: () => void;
  onShowHowToPlay: () => void;
  onShowStats: () => void;
  onShowCollection: () => void;
  onShowTalents: () => void;
  onShowCharacters: () => void;
  onShowSettings: () => void;
  onShowCodex: () => void;
  onShowChaos: () => void;
}

export default function HomeScreen({ savedData, onStartRun, onStartDaily, onShowWeekly, onStartEndless, onShowAchievements, onShowLeaderboard, onShowHowToPlay, onShowStats, onShowCollection, onShowTalents, onShowCharacters, onShowSettings, onShowCodex, onShowChaos }: HomeScreenProps) {
  const { t } = useTranslation();
  const hasPlayed = savedData.totalRuns > 0;
  const [showModifiers, setShowModifiers] = useState(false);
  const dailyPlayed = hasDailyBeenPlayed();
  const nextUnlocks = getNextUnlocks(savedData, 2);

  const prog = loadProgression();
  const bonuses = getProgressionBonuses(prog);
  const ascension = loadAscension();
  const availableSkins = ["default", ...bonuses.unlockedSkins];
  const [selectedSkin, setSelectedSkin] = useState(loadActiveSkin);

  return (
    <div className="min-h-screen flex flex-col items-center ambient-grain relative">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full bg-accent-gold/[0.03] blur-[80px]" style={{ animation: "ambient-pulse 6s ease-in-out infinite" }} />
        <div className="absolute bottom-1/3 right-1/5 w-48 h-48 rounded-full bg-purple-500/[0.03] blur-[60px]" style={{ animation: "ambient-pulse 8s ease-in-out 2s infinite" }} />
      </div>

      {/* Top nav bar */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3 z-10"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onShowHowToPlay}
            className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition"
          >
            {t("home.howToPlay")}
          </button>
          {ascension.highestCleared > 0 && (
            <div
              title={t("home.ascensionTooltip", { n: ascension.highestCleared })}
              className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-400/30 text-red-300 text-[10px] font-mono font-bold uppercase tracking-widest"
            >
              A{ascension.highestCleared}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { key: "home.characters",    action: onShowCharacters,  style: "text-cyan-400/70" },
            { key: "home.talents",       action: onShowTalents,     style: "text-blue-400/70" },
            { key: "home.chaos",         action: onShowChaos,       style: "text-purple-400/70" },
            { key: "home.stats",         action: onShowStats,       style: "text-accent-silver/50" },
            { key: "home.leaderboard",   action: onShowLeaderboard, style: "text-accent-silver/50" },
            { key: "home.collection",    action: onShowCollection,  style: "text-purple-400/60" },
            { key: "home.codex",         action: onShowCodex,       style: "text-indigo-400/70" },
            { key: "home.achievements",  action: onShowAchievements,style: "text-accent-gold/60" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={item.action}
              className={`px-2.5 py-1.5 rounded-lg bg-surface-800/60 border border-surface-600/40 text-xs font-medium hover:border-surface-500 transition ${item.style}`}
            >
              {t(item.key)}
            </button>
          ))}
          <button
            onClick={onShowSettings}
            className="px-2.5 py-1.5 rounded-lg bg-surface-800/60 border border-surface-600/40 text-xs text-accent-silver/40 hover:border-surface-500 transition"
          >
            {t("home.settings")}
          </button>
        </div>
      </motion.nav>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-7 px-6 pb-16 w-full max-w-lg">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <h1 className="font-display font-black text-7xl tracking-tight bg-gradient-to-b from-white via-white/90 to-accent-silver/50 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(212,168,83,0.15)]">
            DOMINIX
          </h1>
          <p className="text-accent-silver/40 text-[10px] tracking-[0.3em] uppercase font-medium">
            {t("home.tagline")}
          </p>
        </motion.div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModifiers(true)}
            className="flex-1 sm:flex-none px-10 py-3.5 rounded-2xl bg-gradient-to-b from-accent-gold to-amber-600 text-surface-900 font-bold text-base tracking-wide btn-premium"
          >
            {t("home.newRun")}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStartDaily}
            disabled={dailyPlayed}
            className={[
              "flex-1 sm:flex-none px-10 py-3.5 rounded-2xl font-bold text-base tracking-wide btn-premium",
              dailyPlayed
                ? "bg-surface-700 text-accent-silver/40 cursor-not-allowed"
                : "bg-gradient-to-b from-blue-500 to-blue-700 text-white",
            ].join(" ")}
          >
            {dailyPlayed ? t("home.dailyComplete") : t("home.dailyChallenge")}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onShowWeekly}
            className="flex-1 sm:flex-none px-10 py-3.5 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-700 text-white font-bold text-base tracking-wide btn-premium"
          >
            {t("home.weeklyChallenge")}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStartEndless}
            className="flex-1 sm:flex-none px-10 py-3.5 rounded-2xl bg-gradient-to-b from-purple-500 to-purple-700 text-white font-bold text-base tracking-wide btn-premium"
          >
            {t("home.endlessRun")}
          </motion.button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-[10px] text-accent-silver/25 tracking-widest"
        >
          {getDailyDateString()}
        </motion.p>

        {/* Stats + Level combined panel */}
        {hasPlayed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full flex flex-col gap-4 p-5 rounded-2xl bg-surface-800/40 border border-surface-600/25 backdrop-blur-sm"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: savedData.bestRound, label: t("home.bestRound"), color: "text-white" },
                { value: savedData.bestScore.toLocaleString(), label: t("home.bestScore"), color: "text-accent-gold" },
                { value: savedData.totalRuns, label: t("home.totalRuns"), color: "text-white" },
                { value: savedData.totalRoundsPlayed, label: t("home.totalRounds"), color: "text-white" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1">
                  <span className={`font-mono font-black text-xl tabular-nums ${stat.color}`}>
                    {stat.value}
                  </span>
                  <span className="text-[8px] text-accent-silver/35 uppercase tracking-widest font-medium">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Level bar inline */}
            {(() => {
              const xpInfo = getXPForNextLevel(prog.xp);
              return (
                <div className="flex items-center gap-3 pt-3 border-t border-surface-600/20">
                  <div className="w-8 h-8 rounded-lg bg-accent-gold/12 border border-accent-gold/25 flex items-center justify-center shrink-0">
                    <span className="font-mono font-black text-sm text-accent-gold">{prog.level}</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[9px] font-bold text-accent-silver/35 uppercase tracking-widest">{t("home.levelN", { n: prog.level })}</span>
                      <span className="text-[9px] font-mono text-accent-silver/25">{xpInfo.current}/{xpInfo.needed} {t("home.xp")}</span>
                    </div>
                    <div className="relative w-full h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(xpInfo.progress * 100, 100)}%` }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="h-full rounded-full bg-gradient-to-r from-accent-gold/80 to-amber-400/80"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Next reward hint */}
            {(() => {
              const nextReward = LEVEL_REWARDS.find((r) => r.level > prog.level);
              return nextReward ? (
                <p className="text-[9px] text-accent-silver/25 text-center">
                  {t("home.nextLevelReward", { level: nextReward.level, reward: nextReward.name })}
                </p>
              ) : null;
            })()}
          </motion.div>
        )}

        {/* Skin picker */}
        {availableSkins.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.57 }}
            className="flex items-center gap-3"
          >
            <span className="text-[9px] font-bold text-accent-silver/30 uppercase tracking-widest">{t("home.skin")}</span>
            <div className="flex gap-1.5">
              {availableSkins.map((skin) => {
                const isActive = skin === selectedSkin;
                const colors: Record<string, string> = {
                  default: "bg-surface-700 border-surface-500",
                  obsidian: "bg-[#1a1a2e] border-slate-500",
                  emerald: "bg-emerald-900 border-emerald-500",
                  ruby: "bg-rose-900 border-rose-500",
                  ivory: "bg-stone-200 border-stone-400",
                  void: "bg-[#0a0a14] border-violet-500",
                  neon: "bg-[#020816] border-cyan-400",
                  gold: "bg-amber-900 border-amber-400",
                  pacto: "bg-[#1f0407] border-red-500",
                  reliquia: "bg-[#241a0f] border-amber-700",
                  cosmos: "bg-[#070a1d] border-indigo-400",
                  bestiario: "bg-[#10081c] border-purple-400",
                  tarot: "bg-[#1c1308] border-amber-500",
                  astral: "bg-[#030612] border-blue-400",
                  naturaleza: "bg-[#071510] border-emerald-400",
                  mecanico: "bg-[#120a04] border-orange-400",
                };
                return (
                  <button
                    key={skin}
                    onClick={() => {
                      setSelectedSkin(skin);
                      saveActiveSkin(skin);
                      audio.play("button_click");
                    }}
                    className={[
                      "w-8 h-8 rounded-md border-2 transition-all",
                      colors[skin] ?? "bg-surface-700 border-surface-500",
                      isActive ? "ring-2 ring-accent-gold ring-offset-1 ring-offset-surface-900 scale-110" : "opacity-50 hover:opacity-90",
                    ].join(" ")}
                    title={skin.charAt(0).toUpperCase() + skin.slice(1)}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Unlocks */}
        {nextUnlocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="text-[9px] text-accent-silver/30 uppercase tracking-widest font-bold">
              {t("home.nextUnlocks")}
            </span>
            {nextUnlocks.map((unlock) => (
              <NextUnlockRow key={unlock.relicId} relicId={unlock.relicId} description={unlock.description} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Footer — narrative flavor, rotates slowly across runs */}
      {(() => {
        // 6 flavor strings, rotated by total runs played. Keys live in i18n.ts
        // so they translate cleanly per language.
        const idx = savedData.totalRuns % 6;
        return (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-6 italic text-[10px] text-accent-silver/30 tracking-widest font-medium"
          >
            {t(`home.flavor.${idx}`)}
          </motion.p>
        );
      })()}

      <AnimatePresence>
        {showModifiers && (
          <ModifierSelect
            bestRound={savedData.bestRound}
            totalRuns={savedData.totalRuns}
            onStart={(mods) => {
              setShowModifiers(false);
              onStartRun(mods);
            }}
            onCancel={() => setShowModifiers(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

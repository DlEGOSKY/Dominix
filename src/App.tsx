import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RunStats, SavedData } from "./types/domino";
import type { Achievement } from "./engine/achievements";
import type { ModifierConfig } from "./engine/modifiers";
import { loadSavedData, saveBestData } from "./engine/storage";
import { saveDailyProgress } from "./engine/daily";
import { getWeeklyPreset, saveWeeklyResult } from "./engine/weekly";
const WeeklyChallengeScreen = lazy(() => import("./components/WeeklyChallengeScreen"));
import { checkNewAchievements } from "./engine/achievements";
import { applyModifiers, getDefaultConfig, ALL_MODIFIERS } from "./engine/modifiers";
// Eager: critical first-paint screens
import HomeScreen from "./components/HomeScreen";
import GameBoard from "./components/GameBoard";
import AchievementToast from "./components/AchievementToast";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import UpdatePrompt from "./components/UpdatePrompt";
import CharacterSelectScreen from "./components/CharacterSelectScreen";
// Lazy: non-critical screens loaded on demand
const GameOverScreen = lazy(() => import("./components/GameOverScreen"));
const AchievementsScreen = lazy(() => import("./components/AchievementsScreen"));
const LeaderboardScreen = lazy(() => import("./components/LeaderboardScreen"));
const HowToPlayScreen = lazy(() => import("./components/HowToPlayScreen"));
const StatsScreen = lazy(() => import("./components/StatsScreen"));
const CollectionScreen = lazy(() => import("./components/CollectionScreen"));
const TalentTreeScreen = lazy(() => import("./components/TalentTreeScreen"));
const SettingsScreen = lazy(() => import("./components/SettingsScreen"));
const CodexScreen = lazy(() => import("./components/CodexScreen"));
import { addRunRecord } from "./engine/runHistory";
import { addLeaderboardEntry } from "./engine/leaderboard";
import { addXP, calculateRunXP, loadProgression, getProgressionBonuses } from "./engine/progression";
import { audio } from "./engine/audio";
import { addCharacterXP, calculateRunMasteryXP } from "./engine/characterMastery";
import { resolveRunChallenges, type CharacterChallenge } from "./engine/characterChallenges";
import {
  ALL_CHARACTERS,
  loadSelectedCharacter,
  unlockCharacter,
  loadUnlockedCharacters,
} from "./engine/characters";
import type { CharacterId } from "./engine/characters";
import {
  applyAscensionToModifier,
  setSelectedAscension,
  markAscensionCleared,
  loadAscension,
} from "./engine/ascension";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

type AppScreen = "home" | "character_select" | "playing" | "daily" | "endless" | "weekly_intro" | "weekly" | "gameover" | "achievements" | "leaderboard" | "howtoplay" | "stats" | "collection" | "talents" | "settings" | "codex";

interface GameOverData {
  stats: RunStats;
  relicIds: string[];
  finalRound: number;
  isNewBest: boolean;
  isDaily: boolean;
  isEndless: boolean;
  isWeekly: boolean;
  /** Skin ids freshly unlocked by the level-ups this run produced. */
  unlockedSkins: string[];
  mastery: {
    characterId: CharacterId;
    xpGained: number;
    previousLevel: number;
    newLevel: number;
    leveledUp: boolean;
    challengesCompleted: CharacterChallenge[];
  };
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [savedData, setSavedData] = useState<SavedData>(loadSavedData);
  const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [currentToast, setCurrentToast] = useState<Achievement | null>(null);
  const [modifierConfig, setModifierConfig] = useState<ModifierConfig>(getDefaultConfig);
  const [activeModifierIds, setActiveModifierIds] = useState<string[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId>(loadSelectedCharacter);
  const [pendingModifiers, setPendingModifiers] = useState<string[]>([]);

  useEffect(() => {
    if (pendingAchievements.length > 0 && !currentToast) {
      setCurrentToast(pendingAchievements[0]!);
      setPendingAchievements((prev) => prev.slice(1));
    }
  }, [pendingAchievements, currentToast]);

  useEffect(() => {
    if (currentToast) {
      const timer = setTimeout(() => setCurrentToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [currentToast]);

  // Unlock the AudioContext on the first user gesture (mobile autoplay policy)
  useEffect(() => {
    let unlocked = false;
    const handler = () => {
      if (unlocked) return;
      unlocked = true;
      audio.unlock();
      window.removeEventListener("touchstart", handler);
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
    window.addEventListener("touchstart", handler, { once: true, passive: true });
    window.addEventListener("pointerdown", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => {
      window.removeEventListener("touchstart", handler);
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  const handleStartRun = useCallback((modifierIds: string[]) => {
    setPendingModifiers(modifierIds);
    setScreen("character_select");
  }, []);

  const handleConfirmCharacter = useCallback((id: CharacterId, ascensionLevel: number) => {
    setSelectedCharacter(id);
    setSelectedAscension(ascensionLevel);
    const config = applyAscensionToModifier(applyModifiers(pendingModifiers), ascensionLevel);
    setModifierConfig(config);
    setActiveModifierIds(pendingModifiers);
    setScreen("playing");
  }, [pendingModifiers]);

  const handleStartDaily = useCallback(() => {
    setScreen("daily");
  }, []);

  const handleStartEndless = useCallback(() => {
    setModifierConfig(getDefaultConfig());
    setActiveModifierIds([]);
    setScreen("endless");
  }, []);

  const handleShowWeekly = useCallback(() => {
    setScreen("weekly_intro");
  }, []);

  const handleStartWeekly = useCallback(() => {
    // Build modifier config from the weekly preset (deterministic for this week).
    const preset = getWeeklyPreset();
    const base = getDefaultConfig();
    setModifierConfig({
      ...base,
      targetMultiplier: base.targetMultiplier * preset.targetMultiplier,
      handSize: Math.max(3, base.handSize + preset.handSizeDelta),
      actionBonus: base.actionBonus + preset.actionBonusDelta,
    });
    setActiveModifierIds(["weekly"]);
    setScreen("weekly");
  }, []);

  const handleShowAchievements = useCallback(() => {
    setScreen("achievements");
  }, []);

  const handleShowLeaderboard = useCallback(() => {
    setScreen("leaderboard");
  }, []);

  const handleShowHowToPlay = useCallback(() => {
    setScreen("howtoplay");
  }, []);

  const handleShowStats = useCallback(() => {
    setScreen("stats");
  }, []);

  const handleShowCollection = useCallback(() => {
    setScreen("collection");
  }, []);

  const handleShowTalents = useCallback(() => {
    setScreen("talents");
  }, []);

  const handleShowSettings = useCallback(() => {
    setScreen("settings");
  }, []);

  const handleShowCodex = useCallback(() => {
    setScreen("codex");
  }, []);

  const handleGameOver = useCallback(
    (stats: RunStats, relicIds: string[], finalRound: number) => {
      const currentBest = savedData.bestRound;
      const isNewBest = finalRound > currentBest;
      const isDaily = screen === "daily";
      const isEndless = screen === "endless";
      const isWeekly = screen === "weekly";

      saveBestData(finalRound, stats.totalScore);
      if (isDaily) {
        saveDailyProgress(finalRound, true);
      }
      if (isWeekly) {
        saveWeeklyResult(stats.totalScore, finalRound);
      }
      if (isEndless) {
        addLeaderboardEntry({
          totalScore: stats.totalScore,
          rounds: finalRound,
          patternsActivated: stats.patternsActivated,
          relicsCollected: stats.relicsCollected,
          modifier: "Endless",
        });
      }
      
      const newSaved = loadSavedData();
      setSavedData(newSaved);

      const newAchievements = checkNewAchievements(stats, newSaved);
      if (newAchievements.length > 0) {
        setPendingAchievements(newAchievements);
      }

      const modName = activeModifierIds.length > 0
        ? activeModifierIds.map((id) => ALL_MODIFIERS.find((m) => m.id === id)?.name).filter(Boolean).join(", ")
        : undefined;
      if (!isEndless) {
        addLeaderboardEntry({
          totalScore: stats.totalScore,
          rounds: finalRound,
          patternsActivated: stats.patternsActivated,
          relicsCollected: stats.relicsCollected,
          modifier: modName || undefined,
        });
      }

      addRunRecord(stats, relicIds, finalRound, isDaily, modName || undefined);

      // Progression XP — capture the skins owned before/after the XP gain so
      // the GameOverScreen can highlight any that were unlocked by this run.
      const skinsBefore = new Set(getProgressionBonuses(loadProgression()).unlockedSkins);
      const runXP = calculateRunXP(finalRound, stats.totalScore, stats.bossesDefeated, stats.patternsActivated);
      addXP(runXP);
      const skinsAfterList = getProgressionBonuses(loadProgression()).unlockedSkins;
      const newlyUnlockedSkins = skinsAfterList.filter((id) => !skinsBefore.has(id));

      // Character Mastery XP — favors the character actively played.
      // Resolve one-shot character challenges first so their XP gets rolled
      // into the same level-up reveal instead of being a second, confusing event.
      const baseMasteryXP = calculateRunMasteryXP(finalRound, stats.bossesDefeated, stats.totalScore);
      const { newlyCompleted, xpAwarded: challengeXP } = resolveRunChallenges(
        selectedCharacter,
        stats,
        finalRound
      );
      const masteryXP = baseMasteryXP + challengeXP;
      const masteryResult = addCharacterXP(selectedCharacter, masteryXP);

      // Ascension: mark cleared if player defeated any boss on a linear/map run with ascension > 0
      if (!isDaily && !isEndless && stats.bossesDefeated >= 1) {
        const st = loadAscension();
        if (st.selected > 0) {
          markAscensionCleared(st.selected);
        }
      }

      // Character unlocks based on run outcomes
      const alreadyUnlocked = loadUnlockedCharacters();
      for (const char of ALL_CHARACTERS) {
        if (alreadyUnlocked.has(char.id)) continue;
        const cond = char.unlockCondition;
        if (!cond) continue;
        if (cond.type === "reach_round" && typeof cond.value === "number" && finalRound >= cond.value) {
          unlockCharacter(char.id);
        } else if (cond.type === "defeat_boss" && stats.bossesDefeated > 0) {
          unlockCharacter(char.id);
        }
      }

      setGameOverData({
        stats,
        relicIds,
        finalRound,
        isNewBest,
        isDaily,
        isEndless,
        isWeekly,
        unlockedSkins: newlyUnlockedSkins,
        mastery: {
          characterId: selectedCharacter,
          xpGained: masteryXP,
          previousLevel: masteryResult.previousLevel,
          newLevel: masteryResult.newLevel,
          leveledUp: masteryResult.leveledUp,
          challengesCompleted: newlyCompleted,
        },
      });
      setScreen("gameover");
    },
    [savedData.bestRound, screen, activeModifierIds, selectedCharacter]
  );

  const handleRestart = useCallback(() => {
    const wasDaily = gameOverData?.isDaily;
    const wasEndless = gameOverData?.isEndless;
    const wasWeekly = gameOverData?.isWeekly;
    setGameOverData(null);
    if (wasWeekly) {
      setScreen("weekly_intro");
    } else {
      setScreen(wasEndless ? "endless" : wasDaily ? "daily" : "playing");
    }
  }, [gameOverData?.isDaily, gameOverData?.isEndless, gameOverData?.isWeekly]);

  const handleHome = useCallback(() => {
    setGameOverData(null);
    setSavedData(loadSavedData());
    setScreen("home");
  }, []);

  const dismissToast = useCallback(() => {
    setCurrentToast(null);
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case "achievements":
        return (
          <motion.div key="achievements" {...pageVariants}>
            <AchievementsScreen savedData={savedData} onBack={handleHome} />
          </motion.div>
        );
      case "leaderboard":
        return (
          <motion.div key="leaderboard" {...pageVariants}>
            <LeaderboardScreen onBack={handleHome} />
          </motion.div>
        );
      case "howtoplay":
        return (
          <motion.div key="howtoplay" {...pageVariants}>
            <HowToPlayScreen onBack={handleHome} />
          </motion.div>
        );
      case "stats":
        return (
          <motion.div key="stats" {...pageVariants}>
            <StatsScreen onBack={handleHome} />
          </motion.div>
        );
      case "collection":
        return (
          <motion.div key="collection" {...pageVariants}>
            <CollectionScreen savedData={savedData} onBack={handleHome} />
          </motion.div>
        );
      case "character_select":
        return (
          <motion.div key="character_select" {...pageVariants}>
            <CharacterSelectScreen
              onConfirm={handleConfirmCharacter}
              onBack={handleHome}
            />
          </motion.div>
        );
      case "talents":
        return (
          <motion.div key="talents" {...pageVariants}>
            <TalentTreeScreen onBack={handleHome} />
          </motion.div>
        );
      case "settings":
        return (
          <motion.div key="settings" {...pageVariants}>
            <SettingsScreen onBack={handleHome} />
          </motion.div>
        );
      case "codex":
        return (
          <motion.div key="codex" {...pageVariants}>
            <CodexScreen onBack={handleHome} />
          </motion.div>
        );
      case "weekly_intro":
        return (
          <motion.div key="weekly_intro" {...pageVariants}>
            <WeeklyChallengeScreen
              onStart={handleStartWeekly}
              onBack={handleHome}
            />
          </motion.div>
        );
      case "home":
        return (
          <motion.div key="home" {...pageVariants}>
            <HomeScreen
              savedData={savedData}
              onStartRun={handleStartRun}
              onStartDaily={handleStartDaily}
              onShowWeekly={handleShowWeekly}
              onStartEndless={handleStartEndless}
              onShowAchievements={handleShowAchievements}
              onShowLeaderboard={handleShowLeaderboard}
              onShowHowToPlay={handleShowHowToPlay}
              onShowStats={handleShowStats}
              onShowCollection={handleShowCollection}
              onShowTalents={handleShowTalents}
              onShowSettings={handleShowSettings}
              onShowCodex={handleShowCodex}
            />
          </motion.div>
        );
      case "gameover":
        return gameOverData ? (
          <motion.div key="gameover" {...pageVariants}>
            <GameOverScreen
              stats={gameOverData.stats}
              relicIds={gameOverData.relicIds}
              finalRound={gameOverData.finalRound}
              isNewBest={gameOverData.isNewBest}
              unlockedSkins={gameOverData.unlockedSkins}
              mastery={gameOverData.mastery}
              onRestart={handleRestart}
              onHome={handleHome}
            />
          </motion.div>
        ) : null;
      default:
        return (
          <motion.div key="playing" {...pageVariants}>
            <GameBoard
              onGameOver={handleGameOver}
              isDaily={screen === "daily"}
              isEndless={screen === "endless"}
              isWeekly={screen === "weekly"}
              modifierConfig={modifierConfig}
              characterId={selectedCharacter}
            />
          </motion.div>
        );
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Saltar al contenido principal
      </a>
      <AchievementToast achievement={currentToast} onDismiss={dismissToast} />
      <PWAInstallPrompt />
      <UpdatePrompt />
      <main id="main-content">
        <Suspense fallback={<ScreenLoader />}>
          <AnimatePresence mode="wait">
            {renderScreen()}
          </AnimatePresence>
        </Suspense>
      </main>
    </>
  );
}

/** Minimal loader shown while a lazy screen chunk is being fetched. */
function ScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="flex flex-col items-center gap-3 text-accent-silver/40"
      >
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-accent-gold/30 border-t-accent-gold"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Cargando</span>
      </motion.div>
    </div>
  );
}

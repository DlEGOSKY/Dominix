import { useState, useCallback, useEffect } from "react";
import type { RunStats, SavedData } from "./types/domino";
import type { Achievement } from "./engine/achievements";
import type { ModifierConfig } from "./engine/modifiers";
import { loadSavedData, saveBestData } from "./engine/storage";
import { saveDailyProgress } from "./engine/daily";
import { checkNewAchievements } from "./engine/achievements";
import { applyModifiers, getDefaultConfig } from "./engine/modifiers";
import HomeScreen from "./components/HomeScreen";
import GameBoard from "./components/GameBoard";
import GameOverScreen from "./components/GameOverScreen";
import AchievementsScreen from "./components/AchievementsScreen";
import AchievementToast from "./components/AchievementToast";

type AppScreen = "home" | "playing" | "daily" | "gameover" | "achievements";

interface GameOverData {
  stats: RunStats;
  relicIds: string[];
  finalRound: number;
  isNewBest: boolean;
  isDaily: boolean;
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [savedData, setSavedData] = useState<SavedData>(loadSavedData);
  const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [currentToast, setCurrentToast] = useState<Achievement | null>(null);
  const [modifierConfig, setModifierConfig] = useState<ModifierConfig>(getDefaultConfig);

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

  const handleStartRun = useCallback((modifierIds: string[]) => {
    const config = applyModifiers(modifierIds);
    setModifierConfig(config);
    setScreen("playing");
  }, []);

  const handleStartDaily = useCallback(() => {
    setScreen("daily");
  }, []);

  const handleShowAchievements = useCallback(() => {
    setScreen("achievements");
  }, []);

  const handleGameOver = useCallback(
    (stats: RunStats, relicIds: string[], finalRound: number) => {
      const currentBest = savedData.bestRound;
      const isNewBest = finalRound > currentBest;
      const isDaily = screen === "daily";

      saveBestData(finalRound, stats.totalScore);
      if (isDaily) {
        saveDailyProgress(finalRound, true);
      }
      
      const newSaved = loadSavedData();
      setSavedData(newSaved);

      const newAchievements = checkNewAchievements(stats, newSaved);
      if (newAchievements.length > 0) {
        setPendingAchievements(newAchievements);
      }

      setGameOverData({
        stats,
        relicIds,
        finalRound,
        isNewBest,
        isDaily,
      });
      setScreen("gameover");
    },
    [savedData.bestRound, screen]
  );

  const handleRestart = useCallback(() => {
    const wasDaily = gameOverData?.isDaily;
    setGameOverData(null);
    setScreen(wasDaily ? "daily" : "playing");
  }, [gameOverData?.isDaily]);

  const handleHome = useCallback(() => {
    setGameOverData(null);
    setSavedData(loadSavedData());
    setScreen("home");
  }, []);

  const dismissToast = useCallback(() => {
    setCurrentToast(null);
  }, []);

  if (screen === "achievements") {
    return <AchievementsScreen savedData={savedData} onBack={handleHome} />;
  }

  if (screen === "home") {
    return (
      <>
        <AchievementToast achievement={currentToast} onDismiss={dismissToast} />
        <HomeScreen
          savedData={savedData}
          onStartRun={handleStartRun}
          onStartDaily={handleStartDaily}
          onShowAchievements={handleShowAchievements}
        />
      </>
    );
  }

  if (screen === "gameover" && gameOverData) {
    return (
      <>
        <AchievementToast achievement={currentToast} onDismiss={dismissToast} />
        <GameOverScreen
          stats={gameOverData.stats}
          relicIds={gameOverData.relicIds}
          finalRound={gameOverData.finalRound}
          isNewBest={gameOverData.isNewBest}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      </>
    );
  }

  return (
    <>
      <AchievementToast achievement={currentToast} onDismiss={dismissToast} />
      <GameBoard
        onGameOver={handleGameOver}
        isDaily={screen === "daily"}
        modifierConfig={modifierConfig}
      />
    </>
  );
}

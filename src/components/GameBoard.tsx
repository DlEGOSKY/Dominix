import { useState, useCallback, useEffect, useRef } from "react";
import type { Tile, PlacementSide, ChainState, GameState, RunStats } from "@/types/domino";
import { audio } from "@/engine/audio";
import type { RewardOption } from "@/types/reward";
import { generateFullSet, shuffle, addSpecialTiles } from "@/engine/tiles";
import { getDailyTilePool } from "@/engine/daily";
import type { ModifierConfig } from "@/engine/modifiers";
import { getDefaultConfig } from "@/engine/modifiers";
import { createEmptyChain, placeTile, hasAnyValidMove } from "@/engine/chain";
import { calculateScore } from "@/engine/score";
import { getTarget } from "@/engine/round";
import { generateRewardOptions } from "@/engine/rewards";
import { getRandomEvent, applyEventEffect } from "@/engine/events";
import type { GameEvent, EventEffect } from "@/engine/events"; // EventEffect used in handleEventContinue param type
import { TUTORIAL_STEPS, isTutorialComplete, markTutorialComplete } from "@/engine/tutorial";
import { getRandomRelics } from "@/engine/relics";
import { generateShopItems, calculateGoldEarned } from "@/engine/shop";
import type { ShopItem } from "@/engine/shop";
import { getBossForRound } from "@/engine/boss";
import type { Boss } from "@/engine/boss";
import Hand from "./Hand";
import Chain from "./Chain";
import ScoreBar from "./ScoreBar";
import PatternDisplay from "./PatternDisplay";
import RelicBar from "./RelicBar";
import RewardScreen from "./RewardScreen";
import TileSelector from "./TileSelector";
import NumberConverter from "./NumberConverter";
import EventScreen from "./EventScreen";
import TutorialOverlay from "./TutorialOverlay";
import ShopScreen from "./ShopScreen";
import BossIntro from "./BossIntro";
import ScorePopup from "./ScorePopup";
import ParticleEffect from "./ParticleEffect";

const HAND_SIZE = 7;

const INITIAL_STATS: RunStats = {
  roundsCompleted: 0,
  totalScore: 0,
  patternsActivated: 0,
  relicsCollected: 0,
  tilesPlayed: 0,
  highestRoundScore: 0,
};

function createInitialRun(
  isDaily: boolean = false,
  handSize: number = HAND_SIZE,
  targetMultiplier: number = 1,
  startingRelicCount: number = 0
): GameState {
  const pool = isDaily ? getDailyTilePool() : shuffle(generateFullSet());
  const startingRelics = startingRelicCount > 0
    ? getRandomRelics(startingRelicCount, []).map((r) => r.id)
    : [];
  return {
    hand: pool.slice(0, handSize),
    tilePool: pool.slice(handSize),
    chain: createEmptyChain(),
    score: 0,
    round: 1,
    target: Math.round(getTarget(1) * targetMultiplier),
    result: "playing",
    relics: startingRelics,
    stats: { ...INITIAL_STATS, relicsCollected: startingRelics.length },
  };
}

function startNextRound(
  prev: GameState,
  roundScore: number,
  patternsCount: number,
  targetMultiplier: number = 1,
  handSize: number = HAND_SIZE
): GameState {
  const newRound = prev.round + 1;
  const basePool = shuffle(generateFullSet());
  const pool = addSpecialTiles(basePool, newRound);
  return {
    ...prev,
    hand: pool.slice(0, handSize),
    tilePool: pool.slice(handSize),
    chain: createEmptyChain(),
    score: 0,
    round: newRound,
    target: Math.round(getTarget(newRound) * targetMultiplier),
    result: "playing",
    stats: {
      ...prev.stats,
      roundsCompleted: prev.stats.roundsCompleted + 1,
      totalScore: prev.stats.totalScore + roundScore,
      patternsActivated: prev.stats.patternsActivated + patternsCount,
      highestRoundScore: Math.max(prev.stats.highestRoundScore, roundScore),
    },
  };
}

type MutationMode = null | "remove" | "duplicate" | "convert";

interface GameBoardProps {
  onGameOver: (stats: RunStats, relicIds: string[], finalRound: number) => void;
  isDaily?: boolean;
  modifierConfig?: ModifierConfig;
}

export default function GameBoard({ onGameOver, isDaily = false, modifierConfig = getDefaultConfig() }: GameBoardProps) {
  const [game, setGame] = useState<GameState>(() =>
    createInitialRun(isDaily, modifierConfig.handSize, modifierConfig.targetMultiplier, modifierConfig.startingRelics)
  );
  const [rewardOptions, setRewardOptions] = useState<RewardOption[]>([]);
  const [mutationMode, setMutationMode] = useState<MutationMode>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [tutorialStep, setTutorialStep] = useState(() => isTutorialComplete() ? -1 : 0);
  const [gold, setGold] = useState(0);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [currentBoss, setCurrentBoss] = useState<Boss | null>(null);
  const [prevScore, setPrevScore] = useState(0);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const prevPatternCount = useRef(0);
  const modRef = useRef(modifierConfig);

  useEffect(() => {
    const currentPatterns = calculateScore(game.chain, game.relics).patternAnalysis.patterns.length;
    if (currentPatterns > prevPatternCount.current && currentPatterns > 0) {
      audio.play("pattern_activate");
      setParticleTrigger((t) => t + 1);
    }
    prevPatternCount.current = currentPatterns;
  }, [game.chain, game.relics]);

  const scoreRef = useRef(0);
  useEffect(() => {
    if (game.score !== scoreRef.current) {
      setPrevScore(scoreRef.current);
      scoreRef.current = game.score;
    }
  }, [game.score]);

  useEffect(() => {
    if (game.result === "win") {
      audio.playWinFanfare();
    } else if (game.result === "lose") {
      audio.playLoseSting();
    }
  }, [game.result]);

  const getModifiedScore = useCallback(
    (rawTotal: number) => Math.round(rawTotal * modRef.current.scoreMultiplier),
    []
  );

  const advanceRound = useCallback(
    (prev: GameState, roundScore: number, patternsCount: number) => {
      const next = startNextRound(prev, roundScore, patternsCount, modRef.current.targetMultiplier, modRef.current.handSize);
      const boss = getBossForRound(next.round);
      if (boss) {
        setCurrentBoss(boss);
        return {
          ...next,
          target: Math.round(next.target * boss.targetMultiplier),
          result: "boss_intro" as const,
        };
      }
      return next;
    },
    []
  );

  const handlePlay = useCallback(
    (tile: Tile, side: PlacementSide) => {
      if (game.result !== "playing") return;

      setGame((prev) => {
        let newChain: ChainState;
        try {
          newChain = placeTile(prev.chain, tile, side);
        } catch {
          return prev;
        }

        const newHand = prev.hand.filter((t) => t.id !== tile.id);
        const raw = calculateScore(newChain, prev.relics);
        const total = getModifiedScore(raw.total);

        const noMoves = !hasAnyValidMove(newChain, newHand);
        const handEmpty = newHand.length === 0;
        const roundOver = noMoves || handEmpty;

        let result = prev.result;
        if (roundOver) {
          result = total >= prev.target ? "win" : "lose";
        }

        return {
          ...prev,
          hand: newHand,
          chain: newChain,
          score: total,
          result,
          stats: {
            ...prev.stats,
            tilesPlayed: prev.stats.tilesPlayed + 1,
          },
        };
      });
    },
    [game.result, getModifiedScore]
  );

  const handleEndChain = useCallback(() => {
    setGame((prev) => {
      if (prev.result !== "playing") return prev;
      const raw = calculateScore(prev.chain, prev.relics);
      const total = getModifiedScore(raw.total);
      return {
        ...prev,
        score: total,
        result: total >= prev.target ? "win" : "lose",
      };
    });
  }, [getModifiedScore]);

  const handleClaimReward = useCallback(() => {
    // Claim boss reward first if applicable
    if (currentBoss) {
      setGold((g) => g + currentBoss.reward.gold);
      if (currentBoss.reward.extraRelic) {
        setGame((prev) => {
          const newRelics = getRandomRelics(1, prev.relics).map((r) => r.id);
          return {
            ...prev,
            relics: [...prev.relics, ...newRelics],
            stats: { ...prev.stats, relicsCollected: prev.stats.relicsCollected + newRelics.length },
          };
        });
      }
      setCurrentBoss(null);
    }

    setGame((prev) => {
      if (prev.result !== "win") return prev;
      const event = getRandomEvent(prev.round);
      if (event) {
        setCurrentEvent(event);
        return { ...prev, result: "event" };
      }
      const options = generateRewardOptions(prev.relics);
      if (modRef.current.noMutations) {
        const filtered = options.filter((o) => o.reward.type === "relic");
        setRewardOptions(filtered.length > 0 ? filtered : options.slice(0, 2));
      } else {
        setRewardOptions(options);
      }
      return { ...prev, result: "reward" };
    });
  }, [currentBoss]);

  const handleEventContinue = useCallback(
    (effect?: Exclude<EventEffect, { type: "choice" }>) => {
      if (effect) {
        const result = applyEventEffect(effect);
        setGame((prev) => ({
          ...prev,
          target: Math.round(prev.target * result.targetModifier),
          score: prev.score + result.scoreBonus,
        }));
      }
      setCurrentEvent(null);
      setGame((prev) => {
        const options = generateRewardOptions(prev.relics);
        if (modRef.current.noMutations) {
          const filtered = options.filter((o) => o.reward.type === "relic");
          setRewardOptions(filtered.length > 0 ? filtered : options.slice(0, 2));
        } else {
          setRewardOptions(options);
        }
        return { ...prev, result: "reward" };
      });
    },
    []
  );

  const goToShopOrNextRound = useCallback((prev: GameState) => {
    const breakdown = calculateScore(prev.chain, prev.relics);
    const earnedGold = calculateGoldEarned(getModifiedScore(breakdown.total), prev.round);
    setGold((g) => g + earnedGold);
    
    // Shop appears every 3 rounds
    if (prev.round % 3 === 0) {
      const items = generateShopItems(prev.relics, prev.round);
      setShopItems(items);
      return { ...prev, result: "shop" as const };
    }
    
    return advanceRound(prev, getModifiedScore(breakdown.total), breakdown.patternAnalysis.patterns.length);
  }, [advanceRound, getModifiedScore]);

  const handleSelectReward = useCallback((option: RewardOption) => {
    const reward = option.reward;

    if (reward.type === "relic") {
      setGame((prev) => {
        const newPrev = { ...prev, relics: [...prev.relics, reward.relic.id], stats: { ...prev.stats, relicsCollected: prev.stats.relicsCollected + 1 } };
        setRewardOptions([]);
        return goToShopOrNextRound(newPrev);
      });
    } else if (reward.type === "remove_tile") {
      setMutationMode("remove");
    } else if (reward.type === "duplicate_tile") {
      setMutationMode("duplicate");
    } else if (reward.type === "convert_number") {
      setMutationMode("convert");
    }
  }, [goToShopOrNextRound]);

  const handleRemoveTile = useCallback((tile: Tile) => {
    setGame((prev) => {
      const newPool = prev.tilePool.filter((t) => t.id !== tile.id);
      setMutationMode(null);
      setRewardOptions([]);
      return goToShopOrNextRound({ ...prev, tilePool: newPool });
    });
  }, [goToShopOrNextRound]);

  const handleDuplicateTile = useCallback((tile: Tile) => {
    setGame((prev) => {
      const duplicate: Tile = {
        ...tile,
        id: `${tile.id}-dup-${Date.now()}`,
      };
      const newPool = [...prev.tilePool, duplicate];
      setMutationMode(null);
      setRewardOptions([]);
      return goToShopOrNextRound({ ...prev, tilePool: newPool });
    });
  }, [goToShopOrNextRound]);

  const handleConvertNumber = useCallback(
    (tile: Tile, position: "top" | "bottom", newValue: number) => {
      setGame((prev) => {
        const newPool = prev.tilePool.map((t) => {
          if (t.id !== tile.id) return t;
          return {
            ...t,
            [position]: newValue,
          };
        });
        setMutationMode(null);
        setRewardOptions([]);
        return goToShopOrNextRound({ ...prev, tilePool: newPool });
      });
    },
    [goToShopOrNextRound]
  );

  const handleCancelMutation = useCallback(() => {
    setMutationMode(null);
  }, []);

  const handleSkipReward = useCallback(() => {
    setGame((prev) => {
      setRewardOptions([]);
      return goToShopOrNextRound(prev);
    });
  }, [goToShopOrNextRound]);

  const handleBuyShopItem = useCallback((item: ShopItem) => {
    if (gold < item.cost) return;
    setGold((g) => g - item.cost);

    if (item.type === "relic" && item.relic) {
      setGame((prev) => ({
        ...prev,
        relics: [...prev.relics, item.relic!.id],
        stats: { ...prev.stats, relicsCollected: prev.stats.relicsCollected + 1 },
      }));
    } else if (item.type === "tile_upgrade") {
      setGame((prev) => {
        const normalTiles = prev.tilePool.filter((t) => !t.type || t.type === "normal");
        if (normalTiles.length === 0) return prev;
        const target = normalTiles[Math.floor(Math.random() * normalTiles.length)]!;
        return {
          ...prev,
          tilePool: prev.tilePool.map((t) => t.id === target.id ? { ...t, type: "golden" as const } : t),
        };
      });
    } else if (item.type === "remove_tile") {
      setGame((prev) => {
        if (prev.tilePool.length <= 7) return prev;
        const idx = Math.floor(Math.random() * prev.tilePool.length);
        return {
          ...prev,
          tilePool: prev.tilePool.filter((_, i) => i !== idx),
        };
      });
    } else if (item.type === "heal") {
      setGame((prev) => ({
        ...prev,
        target: Math.round(prev.target * 0.9),
      }));
    }

    // Remove bought item from shop
    setShopItems((items) => items.filter((i) => i.id !== item.id));
  }, [gold]);

  const handleLeaveShop = useCallback(() => {
    setGame((prev) => {
      const breakdown = calculateScore(prev.chain, prev.relics);
      return advanceRound(prev, getModifiedScore(breakdown.total), breakdown.patternAnalysis.patterns.length);
    });
  }, [advanceRound, getModifiedScore]);

  const handleTutorialNext = useCallback(() => {
    setTutorialStep((prev) => {
      if (prev >= TUTORIAL_STEPS.length - 1) {
        markTutorialComplete();
        return -1;
      }
      return prev + 1;
    });
  }, []);

  const handleTutorialSkip = useCallback(() => {
    markTutorialComplete();
    setTutorialStep(-1);
  }, []);

  const handleStartBoss = useCallback(() => {
    setGame((prev) => ({ ...prev, result: "playing" }));
  }, []);

  const scoreBreakdown = calculateScore(game.chain, game.relics);

  if (mutationMode === "remove") {
    return (
      <TileSelector
        tiles={game.tilePool}
        title="Eliminar ficha"
        subtitle="Selecciona una ficha para quitar de tu set"
        onSelect={handleRemoveTile}
        onCancel={handleCancelMutation}
      />
    );
  }

  if (mutationMode === "duplicate") {
    return (
      <TileSelector
        tiles={game.tilePool}
        title="Duplicar ficha"
        subtitle="Selecciona una ficha para duplicar"
        onSelect={handleDuplicateTile}
        onCancel={handleCancelMutation}
      />
    );
  }

  if (mutationMode === "convert") {
    return (
      <NumberConverter
        tiles={game.tilePool}
        onConvert={handleConvertNumber}
        onCancel={handleCancelMutation}
      />
    );
  }

  if (game.result === "boss_intro" && currentBoss) {
    return (
      <BossIntro
        boss={currentBoss}
        round={game.round}
        onStart={handleStartBoss}
      />
    );
  }

  if (game.result === "event" && currentEvent) {
    return (
      <EventScreen
        event={currentEvent}
        onContinue={handleEventContinue}
      />
    );
  }

  if (game.result === "shop") {
    return (
      <ShopScreen
        items={shopItems}
        gold={gold}
        onBuy={handleBuyShopItem}
        onSkip={handleLeaveShop}
      />
    );
  }

  if (game.result === "reward") {
    return (
      <RewardScreen
        options={rewardOptions}
        onSelect={handleSelectReward}
        onSkip={handleSkipReward}
      />
    );
  }

  const modifiedTotal = getModifiedScore(scoreBreakdown.total);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto px-4 py-8 min-h-screen relative">
      {/* Tutorial overlay */}
      {tutorialStep >= 0 && tutorialStep < TUTORIAL_STEPS.length && (
        <TutorialOverlay
          step={TUTORIAL_STEPS[tutorialStep]!}
          currentIndex={tutorialStep}
          totalSteps={TUTORIAL_STEPS.length}
          onNext={handleTutorialNext}
          onSkip={handleTutorialSkip}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="font-display font-black text-2xl tracking-tight text-white/90">
          DOMINIX
        </h1>
        {isDaily && (
          <span className="px-2 py-0.5 rounded-md bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-medium tracking-wide">
            DIARIO
          </span>
        )}
        {modRef.current.scoreMultiplier !== 1 && (
          <span className="px-2 py-0.5 rounded-md bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-medium">
            Score x{modRef.current.scoreMultiplier}
          </span>
        )}
        {currentBoss && (
          <span className="px-2 py-0.5 rounded-md bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold tracking-wide">
            JEFE
          </span>
        )}
        {gold > 0 && (
          <span className="px-2 py-0.5 rounded-md bg-yellow-600/20 border border-yellow-500/30 text-accent-gold text-xs font-mono font-bold">
            {gold}g
          </span>
        )}
      </div>

      {/* Relics */}
      <RelicBar relicIds={game.relics} />

      {/* Score */}
      <div className="relative w-full">
        <ScoreBar score={modifiedTotal} target={game.target} round={game.round} />
        <ScorePopup score={modifiedTotal} prevScore={prevScore} />
      </div>

      {/* Patterns */}
      <div className="relative w-full">
        <PatternDisplay
          patterns={scoreBreakdown.patternAnalysis.patterns}
          multiplier={scoreBreakdown.multiplier}
        />
        <ParticleEffect trigger={particleTrigger} />
      </div>

      {/* Chain area */}
      <div className="w-full rounded-xl border border-surface-600 bg-surface-800 p-4 min-h-[10rem]">
        <Chain chain={game.chain} />
      </div>

      {/* Result overlay */}
      {game.result === "win" && (
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="font-mono font-bold text-3xl tracking-tight text-green-400">
            {currentBoss ? "Jefe derrotado" : "Ronda superada"} — {modifiedTotal} pts
          </span>
          {currentBoss && (
            <span className="text-sm text-accent-gold">+{currentBoss.reward.gold} oro{currentBoss.reward.extraRelic ? " + Reliquia extra" : ""}</span>
          )}
          <button
            onClick={handleClaimReward}
            className="px-5 py-2.5 rounded-lg bg-accent-gold text-surface-900 font-semibold text-sm tracking-wide hover:brightness-110 transition"
          >
            Elegir recompensa
          </button>
        </div>
      )}

      {game.result === "lose" && (
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="font-mono font-bold text-3xl tracking-tight text-red-400">
            Run terminada — {modifiedTotal} / {game.target}
          </span>
          <button
            onClick={() => {
              const finalStats: RunStats = {
                ...game.stats,
                totalScore: game.stats.totalScore + modifiedTotal,
                patternsActivated: game.stats.patternsActivated + scoreBreakdown.patternAnalysis.patterns.length,
                highestRoundScore: Math.max(game.stats.highestRoundScore, modifiedTotal),
              };
              onGameOver(finalStats, game.relics, game.stats.roundsCompleted);
            }}
            className="px-5 py-2.5 rounded-lg bg-red-500/80 text-white font-semibold text-sm tracking-wide hover:bg-red-500 transition"
          >
            Ver resultados
          </button>
        </div>
      )}

      {/* End chain button */}
      {game.result === "playing" && game.chain.placed.length > 0 && (
        <button
          onClick={handleEndChain}
          className="px-5 py-2 rounded-lg border border-accent-silver/30 text-accent-silver font-medium text-sm tracking-wide hover:bg-surface-700 transition"
        >
          Cerrar cadena
        </button>
      )}

      {/* Hand */}
      <Hand
        tiles={game.hand}
        chain={game.chain}
        onPlay={handlePlay}
        disabled={game.result !== "playing"}
      />
    </div>
  );
}

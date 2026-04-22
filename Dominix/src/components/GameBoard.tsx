import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Tile, PlacementSide, ChainState, GameState, RunStats } from "@/types/domino";
import { audio } from "@/engine/audio";
import type { RewardOption } from "@/types/reward";
import { generateFullSet, shuffle, addSpecialTiles } from "@/engine/tiles";
import { getDailyTilePool } from "@/engine/daily";
import type { ModifierConfig } from "@/engine/modifiers";
import { getDefaultConfig } from "@/engine/modifiers";
import { createEmptyChain, placeTile, hasAnyValidMove, getValidPlacements } from "@/engine/chain";
import { calculateScore } from "@/engine/score";
import { getTarget } from "@/engine/round";
import { generateRewardOptions } from "@/engine/rewards";
import { getRandomEvent, applyEventEffect } from "@/engine/events";
import type { GameEvent, EventEffect } from "@/engine/events"; // EventEffect used in handleEventContinue param type
import { TUTORIAL_STEPS, isTutorialComplete, markTutorialComplete } from "@/engine/tutorial";
import { getRandomRelics, ALL_RELICS, computeFamilySetBonuses } from "@/engine/relics";
import { generateShopItems, calculateGoldEarned, getRerollCost } from "@/engine/shop";
import type { ShopItem } from "@/engine/shop";
import { getBossForRound, ALL_BOSSES } from "@/engine/boss";
import type { Boss } from "@/engine/boss";
import { loadProgression, getProgressionBonuses, loadActiveSkin } from "@/engine/progression";
import { loadSavedData } from "@/engine/storage";
import { createActionState, canPlay, canDiscard, canDraw, usePlayAction, useDiscardAction, useDrawAction, getActionsRemaining } from "@/engine/actions";
import { setGlobalRNG, randomSeed, seedToString } from "@/engine/rng";
import { ALL_ACTIVE_MUTATIONS, resetMutationUses, canUseMutation, applyShuffleHand, applySwapEnds } from "@/engine/activeMutations";
import type { ActiveMutationState } from "@/engine/activeMutations";
import { getCharacter, injectCharacterTiles, computeGoldMultiplier, applyCharacterPassive } from "@/engine/characters";
import type { CharacterId } from "@/engine/characters";
import { getTalentBonuses } from "@/engine/talents";
import { pickRoundQuest, checkQuestCompletion } from "@/engine/quests";
import type { QuestDefinition } from "@/engine/quests";
import { loadAscension, getAccumulatedAscension } from "@/engine/ascension";
import { summarizeChainEditions, discoverEdition, rollRandomEdition } from "@/engine/editions";
import type { TileSkin } from "./TileView";
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
import BossRewardScreen from "./BossRewardScreen";
import ScoreReveal from "./ScoreReveal";
import ScorePopup from "./ScorePopup";
import ParticleEffect from "./ParticleEffect";
import ChainReactionEffect from "./ChainReactionEffect";
import type { ReactionEvent } from "./ChainReactionEffect";
import RoundTransition from "./RoundTransition";
import RunMapScreen from "./RunMapScreen";
import SanctuaryScreen from "./SanctuaryScreen";
import type { SanctuaryChoice } from "./SanctuaryScreen";
import { generateRunMap, visitNode } from "@/engine/runMap";
import type { RunMap, MapNode } from "@/engine/runMap";

const HAND_SIZE = 7;

const INITIAL_STATS: RunStats = {
  roundsCompleted: 0,
  totalScore: 0,
  patternsActivated: 0,
  relicsCollected: 0,
  tilesPlayed: 0,
  highestRoundScore: 0,
  bossesDefeated: 0,
  shopPurchases: 0,
  bestCombo: 0,
  goldEarned: 0,
  tilesDiscarded: 0,
  tilesDrawn: 0,
  roundScores: [],
};

interface ProgressionStartBonuses {
  startingGold: number;
  startingRelics: string[];
  startingGoldenTiles: number;
  handSizeBonus: number;
}

function getStartBonuses(): ProgressionStartBonuses {
  const prog = loadProgression();
  const bonuses = getProgressionBonuses(prog);
  return bonuses;
}

function createInitialRun(
  isDaily: boolean = false,
  handSize: number = HAND_SIZE,
  targetMultiplier: number = 1,
  startingRelicCount: number = 0,
  progBonuses?: ProgressionStartBonuses,
  actionBonus: number = 0
): { state: GameState; bonusGold: number } {
  const bonuses = progBonuses ?? getStartBonuses();
  const effectiveHandSize = handSize + bonuses.handSizeBonus;
  const pool = isDaily ? getDailyTilePool() : shuffle(generateFullSet());

  // Apply golden tiles from progression
  if (bonuses.startingGoldenTiles > 0) {
    let count = 0;
    for (let i = 0; i < pool.length && count < bonuses.startingGoldenTiles; i++) {
      if (pool[i]!.type === "normal" || !pool[i]!.type) {
        pool[i] = { ...pool[i]!, type: "golden" };
        count++;
      }
    }
  }

  // Combine modifier relics + progression relics
  const modRelics = startingRelicCount > 0
    ? getRandomRelics(startingRelicCount, bonuses.startingRelics).map((r) => r.id)
    : [];
  const allStartingRelics = [...new Set([...bonuses.startingRelics, ...modRelics])];

  return {
    state: {
      hand: pool.slice(0, effectiveHandSize),
      tilePool: pool.slice(effectiveHandSize),
      chain: createEmptyChain(),
      score: 0,
      round: 1,
      target: Math.round(getTarget(1) * targetMultiplier),
      result: "playing",
      relics: allStartingRelics,
      stats: { ...INITIAL_STATS, relicsCollected: allStartingRelics.length },
      actions: createActionState(1, allStartingRelics, actionBonus),
    },
    bonusGold: bonuses.startingGold,
  };
}

function startNextRound(
  prev: GameState,
  roundScore: number,
  patternsCount: number,
  targetMultiplier: number = 1,
  handSize: number = HAND_SIZE,
  actionBonus: number = 0,
  preserveCount: number = 0
): GameState {
  const newRound = prev.round + 1;
  const basePool = shuffle(generateFullSet());
  const pool = addSpecialTiles(basePool, newRound);

  // Preserve N random tiles from previous hand (tile_preserve talent)
  const preserved: typeof prev.hand = [];
  if (preserveCount > 0 && prev.hand.length > 0) {
    const copy = [...prev.hand];
    const keepN = Math.min(preserveCount, copy.length);
    for (let i = 0; i < keepN; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      preserved.push(copy.splice(idx, 1)[0]!);
    }
  }

  const needed = Math.max(0, handSize - preserved.length);
  const newHand = [...preserved, ...pool.slice(0, needed)];
  const remainingPool = pool.slice(needed);

  return {
    ...prev,
    hand: newHand,
    tilePool: remainingPool,
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
      roundScores: [...prev.stats.roundScores, roundScore],
    },
    actions: createActionState(newRound, prev.relics, actionBonus),
  };
}

type MutationMode = null | "remove" | "duplicate" | "convert";

interface GameBoardProps {
  onGameOver: (stats: RunStats, relicIds: string[], finalRound: number) => void;
  isDaily?: boolean;
  isEndless?: boolean;
  modifierConfig?: ModifierConfig;
  characterId?: CharacterId;
}

export default function GameBoard({ onGameOver, isDaily = false, isEndless = false, modifierConfig = getDefaultConfig(), characterId = "architect" }: GameBoardProps) {
  const character = getCharacter(characterId);
  const talentBonuses = getTalentBonuses();
  const ascension = getAccumulatedAscension(isDaily || isEndless ? 0 : loadAscension().selected);
  const [runSeed] = useState(() => {
    const seed = randomSeed();
    setGlobalRNG(seed);
    return seed;
  });
  const mapMode = !isDaily && !isEndless;
  const effectiveActionBonus = modifierConfig.actionBonus + talentBonuses.actionBonus;
  const [initResult] = useState(() => {
    const base = createInitialRun(isDaily, modifierConfig.handSize, modifierConfig.targetMultiplier, modifierConfig.startingRelics, undefined, effectiveActionBonus);
    // Apply character bonuses: inject special tiles, add starting relics, expand hand to char size
    let pool = injectCharacterTiles(base.state.tilePool, character);
    let hand = base.state.hand;
    const targetHandSize = Math.max(hand.length, character.startingHandSize);
    const missing = targetHandSize - hand.length;
    if (missing > 0 && pool.length >= missing) {
      hand = [...hand, ...pool.slice(0, missing)];
      pool = pool.slice(missing);
    }
    const relics = Array.from(new Set([...base.state.relics, ...character.startingRelicIds]));
    return {
      state: {
        ...base.state,
        hand,
        tilePool: pool,
        relics,
        stats: { ...base.state.stats, relicsCollected: relics.length },
      },
      bonusGold: base.bonusGold + character.startingGold,
    };
  });
  const [game, setGame] = useState<GameState>(() =>
    mapMode ? { ...initResult.state, result: "map_select" as const } : initResult.state
  );
  const [runMap, setRunMap] = useState<RunMap | null>(() => mapMode ? generateRunMap(1) : null);
  // Elite rounds have buffed target AND boosted reward rarity
  const [isEliteRound, setIsEliteRound] = useState(false);
  const [sanctuaryCtx, setSanctuaryCtx] = useState<{ gold: number; actions: number } | null>(null);
  const [rewardOptions, setRewardOptions] = useState<RewardOption[]>([]);
  const [mutationMode, setMutationMode] = useState<MutationMode>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [tutorialStep, setTutorialStep] = useState(() => isTutorialComplete() ? -1 : 0);
  const [gold, setGold] = useState(initResult.bonusGold);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [shopRerolls, setShopRerolls] = useState(0);
  const [currentBoss, setCurrentBoss] = useState<Boss | null>(null);
  const [bossPhase, setBossPhase] = useState(0);
  const [bossRewardData, setBossRewardData] = useState<{ boss: Boss; bonusRelicId?: string } | null>(null);
  const [activeSkin] = useState<TileSkin>(() => loadActiveSkin() as TileSkin);
  const [prevScore, setPrevScore] = useState(0);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [roundTransition, setRoundTransition] = useState<{ round: number; isBoss: boolean } | null>(null);
  const [reactionQueue, setReactionQueue] = useState<ReactionEvent[]>([]);
  const reactionIdRef = useRef(0);
  const [currentQuest, setCurrentQuest] = useState<QuestDefinition | null>(() => pickRoundQuest(1));
  const [questToast, setQuestToast] = useState<{ text: string; success: boolean } | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [shakeIntensity, setShakeIntensity] = useState<"small" | "medium" | "large">("medium");
  const [aberrationKey, setAberrationKey] = useState(0);
  const [patternFlash, setPatternFlash] = useState(0);

  const triggerShake = useCallback((intensity: "small" | "medium" | "large" = "medium") => {
    setShakeIntensity(intensity);
    setShakeTrigger((t) => t + 1);
  }, []);

  const triggerAberration = useCallback(() => {
    setAberrationKey((k) => k + 1);
  }, []);
  const [ownedMutationIds, setOwnedMutationIds] = useState<string[]>([]);
  const [mutationStates, setMutationStates] = useState<ActiveMutationState[]>([]);
  const [wildNextActive, setWildNextActive] = useState(false);
  const [freezeEndActive, setFreezeEndActive] = useState(false);
  const prevPatternCount = useRef(0);
  const modRef = useRef({ ...modifierConfig, actionBonus: effectiveActionBonus });

  // Active boss restriction (respects multi-phase)
  const activeBossRestriction = currentBoss?.phases
    ? currentBoss.phases[bossPhase]?.restriction
    : currentBoss?.restriction;

  const pushReaction = useCallback((kind: ReactionEvent["kind"], label?: string) => {
    reactionIdRef.current += 1;
    const ev: ReactionEvent = { id: reactionIdRef.current, kind, label };
    setReactionQueue((q) => [...q, ev]);
  }, []);

  const popReaction = useCallback(() => {
    setReactionQueue((q) => q.slice(1));
  }, []);

  useEffect(() => {
    const analysis = calculateScore(game.chain, game.relics, modRef.current.patternBonus).patternAnalysis;
    const currentPatterns = analysis.patterns.length;
    if (currentPatterns > prevPatternCount.current && currentPatterns > 0) {
      audio.play("pattern_activate");
      setParticleTrigger((t) => t + 1);
      setPatternFlash((f) => f + 1);
      triggerShake("small");
      const latestPattern = analysis.patterns[analysis.patterns.length - 1];
      pushReaction("pattern", latestPattern?.name);
      // Bomber passive: next play becomes wild
      if (character.passive.type === "wild_on_pattern") {
        setWildNextActive(true);
      }
    }
    prevPatternCount.current = currentPatterns;
  }, [game.chain, game.relics, pushReaction, character]);

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
      if (currentBoss) triggerShake("large");
      // Big score burst if round exceeded target by 50% or more
      if (game.score >= game.target * 1.5) {
        pushReaction("big_score", `+${game.score}`);
        triggerShake("large");
        triggerAberration();
      }
    } else if (game.result === "lose") {
      audio.playLoseSting();
      triggerShake("medium");
    }
  }, [game.result, game.score, game.target, pushReaction, currentBoss]);

  const familyBonuses = useMemo(() => computeFamilySetBonuses(game.relics), [game.relics]);

  // Keep modRef's actionBonus in sync with the Accion family set bonus.
  useEffect(() => {
    modRef.current.actionBonus = effectiveActionBonus + familyBonuses.accionExtraActions;
  }, [familyBonuses.accionExtraActions, effectiveActionBonus]);

  const getModifiedScore = useCallback(
    (
      rawTotal: number,
      breakdown?: { patterns: number; hasDoubles: boolean; tilesPlayed?: number; patternBonusTotal?: number; editionFlat?: number; editionMultiplier?: number },
    ) => {
      let total = Math.round(rawTotal * modRef.current.scoreMultiplier);
      // Talent bonuses (flat + per-pattern)
      total += talentBonuses.flatScoreBonus;
      // Numero family: flat per-round bonus
      total += familyBonuses.numeroFlatBonus;
      if (breakdown) {
        total += breakdown.patterns * talentBonuses.extraPatternScore;
        // Family set bonuses (score-related)
        if (breakdown.tilesPlayed !== undefined) {
          total += breakdown.tilesPlayed * familyBonuses.cadenaPerTile;
        }
        if (breakdown.patternBonusTotal !== undefined) {
          total += Math.round(breakdown.patternBonusTotal * familyBonuses.patronPatternBoost);
        }
        if (breakdown.editionFlat) total += breakdown.editionFlat;
        total = applyCharacterPassive({
          character,
          baseScore: total,
          patternCount: breakdown.patterns,
          hasDoubles: breakdown.hasDoubles,
        });
      }
      total = Math.round(total * talentBonuses.scoreMultiplier);
      total = Math.round(total * familyBonuses.fuerzaGlobalMultiplier);
      if (breakdown?.editionMultiplier && breakdown.editionMultiplier !== 1) {
        total = Math.round(total * breakdown.editionMultiplier);
      }
      return total;
    },
    [character, talentBonuses, familyBonuses]
  );

  const advanceRound = useCallback(
    (prev: GameState, roundScore: number, patternsCount: number) => {
      const next = startNextRound(prev, roundScore, patternsCount, modRef.current.targetMultiplier, modRef.current.handSize, modRef.current.actionBonus, talentBonuses.tilePreserve);
      // Reset active mutation uses for new round
      setMutationStates((ms) => resetMutationUses(ms));
      setWildNextActive(false);
      setFreezeEndActive(false);
      const boss = getBossForRound(next.round);
      if (boss) {
        setCurrentBoss(boss);
        setRoundTransition({ round: next.round, isBoss: true });
        return {
          ...next,
          target: Math.round(next.target * boss.targetMultiplier * ascension.bossTargetMultiplier),
          result: "boss_intro" as const,
        };
      }
      setRoundTransition({ round: next.round, isBoss: false });
      return next;
    },
    []
  );

  const handlePlay = useCallback(
    (tile: Tile, side: PlacementSide) => {
      if (game.result !== "playing") return;

      // Boss restrictions (pre-placement validation)
      if (activeBossRestriction) {
        const r = activeBossRestriction;
        if (r.type === "no_doubles" && tile.top === tile.bottom) return;
        if (r.type === "no_wild" && tile.type === "wild") return;
        if (r.type === "only_doubles" && tile.top !== tile.bottom) return;
        if (r.type === "only_low" && (tile.top + tile.bottom) > r.max) return;
      }

      // Wild next: convert tile to wild before playing
      let playTile = tile;
      if (wildNextActive) {
        playTile = { ...tile, type: "wild" };
        setWildNextActive(false);
      }

      // Trigger visual reactions for special tiles
      if (playTile.type === "bomb") { pushReaction("bomb"); triggerShake("large"); }
      else if (playTile.type === "wild") pushReaction("wild");

      // Discovery: unlock edition in collection
      if (playTile.edition) discoverEdition(playTile.edition);

      setGame((prev) => {
        // Action limit check
        if (prev.actions && !canPlay(prev.actions)) return prev;

        // Boss: max_tiles restriction
        if (activeBossRestriction?.type === "max_tiles" && prev.chain.placed.length >= activeBossRestriction.count) {
          return prev;
        }

        // Boss: no_repeat_number — the connecting number can't be the same as the last connection
        if (activeBossRestriction?.type === "no_repeat_number" && prev.chain.placed.length > 0) {
          const lastPlaced = prev.chain.placed[prev.chain.placed.length - 1]!;
          const lastConnection = side === "right" ? prev.chain.rightEnd : prev.chain.leftEnd;
          const prevConnection = lastPlaced.tile.top === lastConnection ? lastPlaced.tile.bottom : lastPlaced.tile.top;
          if (lastConnection !== null && lastConnection === prevConnection) {
            // same number connecting twice in a row — blocked
            return prev;
          }
        }

        let newChain: ChainState;
        try {
          newChain = placeTile(prev.chain, playTile, side);
        } catch {
          return prev;
        }

        let newHand = prev.hand.filter((t) => t.id !== tile.id);
        const raw = calculateScore(newChain, prev.relics, modRef.current.patternBonus);
        const hasDoubles = newChain.placed.some((p) => p.tile.top === p.tile.bottom);
        const ed = summarizeChainEditions(newChain);
        const total = getModifiedScore(raw.total, { patterns: raw.patternAnalysis.patterns.length, hasDoubles, tilesPlayed: newChain.placed.length, patternBonusTotal: raw.patternAnalysis.totalBonus, editionFlat: ed.flatBonus, editionMultiplier: ed.multiplier });

        // Unlock locked tiles when a pattern is activated
        if (raw.patternAnalysis.patterns.length > 0 && newHand.some((t) => t.type === "locked")) {
          newHand = newHand.map((t) => t.type === "locked" ? { ...t, type: "normal" as const } : t);
        }

        // Boss: filter hand for valid moves respecting restrictions
        let validHand = newHand;
        if (activeBossRestriction) {
          const r = activeBossRestriction;
          if (r.type === "no_doubles") validHand = validHand.filter((t) => t.top !== t.bottom);
          if (r.type === "no_wild") validHand = validHand.filter((t) => t.type !== "wild");
          if (r.type === "only_doubles") validHand = validHand.filter((t) => t.top === t.bottom);
          if (r.type === "only_low") validHand = validHand.filter((t) => (t.top + t.bottom) <= r.max);
        }

        const newActions = prev.actions ? usePlayAction(prev.actions) : prev.actions;
        const actionsExhausted = newActions ? !canPlay(newActions) : false;
        const noMoves = !hasAnyValidMove(newChain, validHand) ||
          (activeBossRestriction?.type === "max_tiles" && newChain.placed.length >= activeBossRestriction.count);
        const handEmpty = newHand.length === 0;
        const roundOver = noMoves || handEmpty || actionsExhausted;

        let result = prev.result;
        if (roundOver) {
          if (isEndless) {
            // Endless: always advance to next round
            result = "win";
          } else {
            let meetsTarget = total >= prev.target;
            if (activeBossRestriction?.type === "min_patterns") {
              meetsTarget = meetsTarget && raw.patternAnalysis.patterns.length >= activeBossRestriction.count;
            }
            if (activeBossRestriction?.type === "min_chain_length") {
              meetsTarget = meetsTarget && newChain.placed.length >= activeBossRestriction.count;
            }
            result = meetsTarget ? "win" : "lose";
          }
        }

        return {
          ...prev,
          hand: newHand,
          chain: newChain,
          score: total,
          result,
          actions: newActions,
          stats: {
            ...prev.stats,
            tilesPlayed: prev.stats.tilesPlayed + 1,
            bestCombo: Math.max(prev.stats.bestCombo, raw.patternAnalysis.patterns.length),
          },
        };
      });
    },
    [game.result, getModifiedScore, currentBoss, activeBossRestriction, isEndless]
  );

  const handleDiscard = useCallback(
    (tile: Tile) => {
      if (game.result !== "playing") return;
      setGame((prev) => {
        if (!prev.actions || !canDiscard(prev.actions)) return prev;
        const discardBonus = ALL_RELICS
          .filter((r) => prev.relics.includes(r.id) && r.effect.type === "bonus_per_discard")
          .reduce((sum, r) => sum + (r.effect as { value: number }).value, 0);
        return {
          ...prev,
          hand: prev.hand.filter((t) => t.id !== tile.id),
          score: prev.score + discardBonus,
          stats: { ...prev.stats, tilesDiscarded: prev.stats.tilesDiscarded + 1 },
          actions: useDiscardAction(prev.actions!),
        };
      });
    },
    [game.result]
  );

  const handleDraw = useCallback(() => {
    setGame((prev) => {
      if (prev.result !== "playing") return prev;
      if (!prev.actions || !canDraw(prev.actions)) return prev;
      if (prev.tilePool.length === 0) return prev;
      const drawn = prev.tilePool[0]!;
      const drawBonus = ALL_RELICS
        .filter((r) => prev.relics.includes(r.id) && r.effect.type === "bonus_on_draw")
        .reduce((sum, r) => sum + (r.effect as { value: number }).value, 0);
      return {
        ...prev,
        hand: [...prev.hand, drawn],
        tilePool: prev.tilePool.slice(1),
        score: prev.score + drawBonus,
        stats: { ...prev.stats, tilesDrawn: prev.stats.tilesDrawn + 1 },
        actions: useDrawAction(prev.actions!),
      };
    });
  }, []);

  const handleEndChain = useCallback(() => {
    setGame((prev) => {
      if (prev.result !== "playing") return prev;
      const raw = calculateScore(prev.chain, prev.relics, modRef.current.patternBonus);
      const hasDoubles = prev.chain.placed.some((p) => p.tile.top === p.tile.bottom);
      const ed = summarizeChainEditions(prev.chain);
      const total = getModifiedScore(raw.total, { patterns: raw.patternAnalysis.patterns.length, hasDoubles, tilesPlayed: prev.chain.placed.length, patternBonusTotal: raw.patternAnalysis.totalBonus, editionFlat: ed.flatBonus, editionMultiplier: ed.multiplier });

      // Endless mode: always advance (no lose from target)
      if (isEndless) {
        return { ...prev, score: total, result: "win" };
      }

      let meetsTarget = total >= prev.target;
      if (activeBossRestriction?.type === "min_patterns") {
        meetsTarget = meetsTarget && raw.patternAnalysis.patterns.length >= activeBossRestriction.count;
      }
      if (activeBossRestriction?.type === "min_chain_length") {
        meetsTarget = meetsTarget && prev.chain.placed.length >= activeBossRestriction.count;
      }
      return {
        ...prev,
        score: total,
        result: meetsTarget ? "win" : "lose",
      };
    });
  }, [getModifiedScore, activeBossRestriction, isEndless]);

  const handleClaimReward = useCallback(() => {
    if (currentBoss) {
      // Multi-phase boss: advance to next phase if not on last
      if (currentBoss.phases && bossPhase < currentBoss.phases.length - 1) {
        const nextPhaseIdx = bossPhase + 1;
        const nextPhase = currentBoss.phases[nextPhaseIdx]!;
        setBossPhase(nextPhaseIdx);
        setGame((prev) => {
          const baseTarget = getTarget(prev.round);
          return {
            ...prev,
            target: Math.round(baseTarget * nextPhase.targetMultiplier),
            chain: createEmptyChain(),
            hand: shuffle([...prev.hand, ...prev.tilePool.slice(0, Math.max(0, HAND_SIZE - prev.hand.length))]),
            tilePool: prev.tilePool.slice(Math.max(0, HAND_SIZE - prev.hand.length)),
            score: 0,
            result: "playing",
            actions: createActionState(prev.round, prev.relics, modRef.current.actionBonus),
          };
        });
        return;
      }

      // Final phase or single-phase boss: give rewards
      let bonusRelicId: string | undefined;
      setGold((g) => g + currentBoss.reward.gold);
      setGame((prev) => {
        let updated = {
          ...prev,
          stats: {
            ...prev.stats,
            bossesDefeated: prev.stats.bossesDefeated + 1,
            goldEarned: prev.stats.goldEarned + currentBoss.reward.gold,
          },
        };
        if (currentBoss.reward.extraRelic) {
          const newRelics = getRandomRelics(1, prev.relics);
          const ids = newRelics.map((r) => r.id);
          bonusRelicId = ids[0];
          updated = {
            ...updated,
            relics: [...updated.relics, ...ids],
            stats: { ...updated.stats, relicsCollected: updated.stats.relicsCollected + ids.length },
          };
        }
        return { ...updated, result: "boss_reward" as GameState["result"] };
      });
      setBossRewardData({ boss: currentBoss, bonusRelicId });
      setBossPhase(0);
      setCurrentBoss(null);
      return;
    }

    setGame((prev) => {
      if (prev.result !== "win") return prev;
      const event = getRandomEvent(prev.round);
      if (event) {
        setCurrentEvent(event);
        return { ...prev, result: "event" };
      }
      const saved = loadSavedData();
      const options = generateRewardOptions(prev.relics, saved, prev.round, ownedMutationIds, { eliteBoost: isEliteRound, legendaryWeightMultiplier: ascension.legendaryWeightMultiplier });
      if (modRef.current.noMutations) {
        const filtered = options.filter((o) => o.reward.type === "relic");
        setRewardOptions(filtered.length > 0 ? filtered : options.slice(0, 2));
      } else {
        setRewardOptions(options);
      }
      return { ...prev, result: "reward" };
    });
  }, [currentBoss, bossPhase, ownedMutationIds, isEliteRound]);

  const handleBossRewardContinue = useCallback(() => {
    setBossRewardData(null);
    setGame((prev) => {
      // In map mode: act complete, generate new map for next act
      if (mapMode && runMap) {
        const nextAct = runMap.act + 1;
        setRunMap(generateRunMap(nextAct));
        setIsEliteRound(false);
        return { ...prev, result: "map_select" as const };
      }

      const event = getRandomEvent(prev.round);
      if (event) {
        setCurrentEvent(event);
        return { ...prev, result: "event" };
      }
      const saved = loadSavedData();
      const options = generateRewardOptions(prev.relics, saved, prev.round, ownedMutationIds, { eliteBoost: isEliteRound, legendaryWeightMultiplier: ascension.legendaryWeightMultiplier });
      if (modRef.current.noMutations) {
        const filtered = options.filter((o) => o.reward.type === "relic");
        setRewardOptions(filtered.length > 0 ? filtered : options.slice(0, 2));
      } else {
        setRewardOptions(options);
      }
      return { ...prev, result: "reward" };
    });
  }, [ownedMutationIds, mapMode, runMap, isEliteRound]);

  const handleEventContinue = useCallback(
    (effect?: Exclude<EventEffect, { type: "choice" }>) => {
      if (effect) {
        const result = applyEventEffect(effect);
        setGame((prev) => {
          let newHand = [...prev.hand];
          let newPool = [...prev.tilePool];

          // Add extra tiles to hand
          if (result.handBonus > 0 && newPool.length > 0) {
            const extra = newPool.splice(0, result.handBonus);
            newHand = [...newHand, ...extra];
          }

          // tileChange > 0: add tiles from pool to hand
          if (result.tileChange > 0 && newPool.length > 0) {
            const extra = newPool.splice(0, result.tileChange);
            newHand = [...newHand, ...extra];
          }

          // tileChange < 0: remove random tiles from pool
          if (result.tileChange < 0) {
            const removeCount = Math.min(Math.abs(result.tileChange), newPool.length);
            for (let i = 0; i < removeCount; i++) {
              const idx = Math.floor(Math.random() * newPool.length);
              newPool.splice(idx, 1);
            }
          }

          const newRelics = result.relicId && !prev.relics.includes(result.relicId)
            ? [...prev.relics, result.relicId]
            : prev.relics;

          // Apply action bonuses from events
          let newActions = prev.actions;
          if (result.actionBonus && newActions) {
            newActions = {
              ...newActions,
              maxActions: Math.max(1, newActions.maxActions + result.actionBonus.actions),
              maxDiscards: Math.max(0, newActions.maxDiscards + result.actionBonus.discards),
              maxDraws: Math.max(0, newActions.maxDraws + result.actionBonus.draws),
            };
          }

          return {
            ...prev,
            hand: newHand,
            tilePool: newPool,
            relics: newRelics,
            target: Math.round(prev.target * result.targetModifier),
            score: prev.score + result.scoreBonus,
            actions: newActions,
          };
        });
      }
      setCurrentEvent(null);
      setGame((prev) => {
        // In map mode, event was a choice on the map → return to map selection
        if (mapMode) {
          return { ...prev, result: "map_select" as const };
        }
        const saved = loadSavedData();
        const options = generateRewardOptions(prev.relics, saved, prev.round, ownedMutationIds, { eliteBoost: isEliteRound, legendaryWeightMultiplier: ascension.legendaryWeightMultiplier });
        if (modRef.current.noMutations) {
          const filtered = options.filter((o) => o.reward.type === "relic");
          setRewardOptions(filtered.length > 0 ? filtered : options.slice(0, 2));
        } else {
          setRewardOptions(options);
        }
        return { ...prev, result: "reward" };
      });
    },
    [ownedMutationIds, mapMode, isEliteRound]
  );

  const goToShopOrNextRound = useCallback((prev: GameState) => {
    const breakdown = calculateScore(prev.chain, prev.relics, modRef.current.patternBonus);
    const hasDoubles = prev.chain.placed.some((p) => p.tile.top === p.tile.bottom);
    const ed = summarizeChainEditions(prev.chain);
    const bdInfo = { patterns: breakdown.patternAnalysis.patterns.length, hasDoubles, tilesPlayed: prev.chain.placed.length, patternBonusTotal: breakdown.patternAnalysis.totalBonus, editionFlat: ed.flatBonus, editionMultiplier: ed.multiplier };
    const modTotal = getModifiedScore(breakdown.total, bdInfo);
    let earnedGold = Math.round(calculateGoldEarned(modTotal, prev.round) * computeGoldMultiplier(character) * talentBonuses.goldMultiplier);

    // Quest completion check
    if (currentQuest) {
      const completed = checkQuestCompletion(currentQuest, {
        chain: prev.chain,
        score: modTotal,
        target: prev.target,
        patternsActivated: bdInfo.patterns,
      });
      if (completed && currentQuest.reward.kind === "gold") {
        earnedGold += currentQuest.reward.amount;
        setQuestToast({ text: `Reto superado: ${currentQuest.title} · +${currentQuest.reward.amount} oro`, success: true });
      } else if (!completed) {
        setQuestToast({ text: `Reto fallado: ${currentQuest.title}`, success: false });
      }
    }
    // Pick next quest for upcoming round
    setCurrentQuest(pickRoundQuest(prev.round + 1));

    setGold((g) => g + earnedGold);
    prev = {
      ...prev,
      stats: {
        ...prev.stats,
        goldEarned: prev.stats.goldEarned + earnedGold,
        roundsCompleted: prev.stats.roundsCompleted + 1,
        totalScore: prev.stats.totalScore + modTotal,
        patternsActivated: prev.stats.patternsActivated + bdInfo.patterns,
        highestRoundScore: Math.max(prev.stats.highestRoundScore, modTotal),
        roundScores: [...prev.stats.roundScores, modTotal],
      },
    };

    // Map mode: return to map selection instead of auto-advancing
    if (mapMode) {
      setIsEliteRound(false);
      return { ...prev, result: "map_select" as const };
    }

    // Shop appears every 3 rounds (linear mode only)
    if (prev.round % 3 === 0) {
      const items = generateShopItems(prev.relics, prev.round, talentBonuses.relicDiscount, ascension.shopRelicCostMultiplier);
      setShopItems(items);
      setShopRerolls(0);
      return { ...prev, result: "shop" as const };
    }

    return advanceRound(prev, modTotal, bdInfo.patterns);
  }, [advanceRound, getModifiedScore, mapMode, character, currentQuest, talentBonuses.goldMultiplier]);

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
    } else if (reward.type === "active_mutation") {
      const mutId = reward.mutationId;
      setOwnedMutationIds((prev) => [...prev, mutId]);
      setMutationStates((prev) => {
        const mutation = ALL_ACTIVE_MUTATIONS.find((m) => m.id === mutId);
        return [...prev, { mutationId: mutId, usesLeft: mutation?.usesPerRound ?? 0 }];
      });
      setGame((prev) => {
        setRewardOptions([]);
        return goToShopOrNextRound(prev);
      });
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

  const handleActivateMutation = useCallback((mutationId: string) => {
    const mutation = ALL_ACTIVE_MUTATIONS.find((m) => m.id === mutationId);
    if (!mutation) return;

    const stateIdx = mutationStates.findIndex((s) => s.mutationId === mutationId);
    if (stateIdx < 0) return;
    const state = mutationStates[stateIdx]!;
    if (!canUseMutation(mutation, state, game)) return;

    // Deduct cost
    setGame((prev) => {
      let updated = { ...prev };

      if (mutation.cost.type === "actions" && updated.actions) {
        updated = { ...updated, actions: { ...updated.actions, usedActions: updated.actions.usedActions + mutation.cost.amount } };
      }
      if (mutation.cost.type === "score") {
        updated = { ...updated, score: updated.score - mutation.cost.amount };
      }

      // Apply effect
      const eff = mutation.effect;
      if (eff.type === "shuffle_hand") {
        const result = applyShuffleHand(updated.hand, updated.tilePool, HAND_SIZE);
        updated = { ...updated, hand: result.hand, tilePool: result.pool };
      }
      if (eff.type === "wild_next") {
        setWildNextActive(true);
      }
      if (eff.type === "score_burst") {
        updated = { ...updated, score: updated.score + eff.amount };
      }
      if (eff.type === "extend_actions" && updated.actions) {
        updated = { ...updated, actions: { ...updated.actions, maxActions: updated.actions.maxActions + eff.amount } };
      }
      if (eff.type === "swap_ends") {
        updated = { ...updated, chain: applySwapEnds(updated.chain) };
      }
      if (eff.type === "freeze_end") {
        setFreezeEndActive(true);
      }

      return updated;
    });

    // Decrement uses
    setMutationStates((prev) =>
      prev.map((s) => s.mutationId === mutationId ? { ...s, usesLeft: s.usesLeft - 1 } : s)
    );

    audio.play("pattern_activate");
  }, [mutationStates, game]);

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
    } else if (item.type === "wild_tile") {
      setGame((prev) => {
        const normalTiles = prev.tilePool.filter((t) => !t.type || t.type === "normal");
        if (normalTiles.length === 0) return prev;
        const target = normalTiles[Math.floor(Math.random() * normalTiles.length)]!;
        return {
          ...prev,
          tilePool: prev.tilePool.map((t) => t.id === target.id ? { ...t, type: "wild" as const } : t),
        };
      });
    } else if (item.type === "extra_hand") {
      setGame((prev) => {
        if (prev.tilePool.length === 0) return prev;
        const extra = prev.tilePool[0]!;
        return {
          ...prev,
          hand: [...prev.hand, extra],
          tilePool: prev.tilePool.slice(1),
        };
      });
    } else if (item.type === "forge_edition") {
      setGame((prev) => {
        // Target pool: prefer tiles without edition, fall back to hand
        const poolNoEd = prev.tilePool.filter((t) => !t.edition);
        const handNoEd = prev.hand.filter((t) => !t.edition);
        let target: Tile | null = null;
        let fromHand = false;
        if (poolNoEd.length > 0) {
          target = poolNoEd[Math.floor(Math.random() * poolNoEd.length)]!;
        } else if (handNoEd.length > 0) {
          target = handNoEd[Math.floor(Math.random() * handNoEd.length)]!;
          fromHand = true;
        }
        if (!target) return prev;
        const newEdition = rollRandomEdition();
        pushReaction("pattern", `Forjada: ${newEdition}`);
        triggerShake("medium");
        if (fromHand) {
          return {
            ...prev,
            hand: prev.hand.map((t) => t.id === target!.id ? { ...t, edition: newEdition } : t),
          };
        }
        return {
          ...prev,
          tilePool: prev.tilePool.map((t) => t.id === target!.id ? { ...t, edition: newEdition } : t),
        };
      });
    }

    // Track purchase and remove bought item from shop
    setGame((prev) => ({
      ...prev,
      stats: { ...prev.stats, shopPurchases: prev.stats.shopPurchases + 1 },
    }));
    setShopItems((items) => items.filter((i) => i.id !== item.id));
  }, [gold]);

  const handleShopReroll = useCallback(() => {
    const cost = Math.round(getRerollCost(shopRerolls) * ascension.rerollCostMultiplier);
    if (gold < cost) return;
    setGold((g) => g - cost);
    setShopRerolls((r) => r + 1);
    setGame((prev) => {
      const items = generateShopItems(prev.relics, prev.round, talentBonuses.relicDiscount, ascension.shopRelicCostMultiplier);
      setShopItems(items);
      return prev;
    });
  }, [gold, shopRerolls]);

  const handleLeaveShop = useCallback(() => {
    setGame((prev) => {
      if (mapMode) {
        return { ...prev, result: "map_select" as const };
      }
      const breakdown = calculateScore(prev.chain, prev.relics, modRef.current.patternBonus);
      const hasDoubles = prev.chain.placed.some((p) => p.tile.top === p.tile.bottom);
      const ed = summarizeChainEditions(prev.chain);
      const bdInfo = { patterns: breakdown.patternAnalysis.patterns.length, hasDoubles, tilesPlayed: prev.chain.placed.length, patternBonusTotal: breakdown.patternAnalysis.totalBonus, editionFlat: ed.flatBonus, editionMultiplier: ed.multiplier };
      return advanceRound(prev, getModifiedScore(breakdown.total, bdInfo), bdInfo.patterns);
    });
  }, [advanceRound, getModifiedScore, mapMode]);

  const handleSelectMapNode = useCallback((node: MapNode) => {
    if (!runMap) return;
    const newMap = visitNode(runMap, node.id);
    const isFirstVisit = runMap.visitedNodeIds.length === 0;
    setRunMap(newMap);

    switch (node.type) {
      case "normal": {
        setIsEliteRound(false);
        if (isFirstVisit) {
          setGame((prev) => ({ ...prev, result: "playing" }));
        } else {
          setGame((prev) => {
            const next = startNextRound(prev, 0, 0, modRef.current.targetMultiplier, modRef.current.handSize, modRef.current.actionBonus, talentBonuses.tilePreserve);
            setMutationStates((ms) => resetMutationUses(ms));
            setWildNextActive(false);
            setFreezeEndActive(false);
            setRoundTransition({ round: next.round, isBoss: false });
            return { ...next, result: "playing" as const };
          });
        }
        break;
      }
      case "elite": {
        setIsEliteRound(true);
        setGame((prev) => {
          const base = isFirstVisit ? prev : startNextRound(prev, 0, 0, modRef.current.targetMultiplier, modRef.current.handSize, modRef.current.actionBonus, talentBonuses.tilePreserve);
          const eliteTarget = Math.round(base.target * 1.35);
          if (!isFirstVisit) {
            setMutationStates((ms) => resetMutationUses(ms));
            setWildNextActive(false);
            setFreezeEndActive(false);
            setRoundTransition({ round: base.round, isBoss: false });
          }
          return { ...base, target: eliteTarget, result: "playing" as const };
        });
        break;
      }
      case "event": {
        const event = getRandomEvent(game.round);
        if (event) {
          setCurrentEvent(event);
          setGame((prev) => ({ ...prev, result: "event" as const }));
        } else {
          setGame((prev) => ({ ...prev, result: "map_select" as const }));
        }
        break;
      }
      case "shop": {
        const items = generateShopItems(game.relics, game.round, talentBonuses.relicDiscount, ascension.shopRelicCostMultiplier);
        setShopItems(items);
        setShopRerolls(0);
        setGame((prev) => ({ ...prev, result: "shop" as const }));
        break;
      }
      case "sanctuary": {
        setSanctuaryCtx({ gold: 40 + game.round * 5, actions: 3 });
        setGame((prev) => ({ ...prev, result: "sanctuary" as const }));
        break;
      }
      case "boss": {
        const bossRound = runMap.act * 5;
        const bossToFight = getBossForRound(bossRound) ?? ALL_BOSSES[(runMap.act - 1) % ALL_BOSSES.length]!;
        setGame((prev) => {
          const base = isFirstVisit ? prev : startNextRound(prev, 0, 0, modRef.current.targetMultiplier, modRef.current.handSize, modRef.current.actionBonus, talentBonuses.tilePreserve);
          setCurrentBoss(bossToFight);
          setBossPhase(0);
          setMutationStates((ms) => resetMutationUses(ms));
          setWildNextActive(false);
          setFreezeEndActive(false);
          setRoundTransition({ round: bossRound, isBoss: true });
          return {
            ...base,
            round: bossRound,
            target: Math.round(getTarget(bossRound) * modRef.current.targetMultiplier * bossToFight.targetMultiplier * ascension.bossTargetMultiplier),
            result: "boss_intro" as const,
          };
        });
        break;
      }
    }
  }, [runMap, game.round, game.relics]);

  const handleSanctuaryChoice = useCallback((choice: SanctuaryChoice) => {
    if (!sanctuaryCtx) return;
    const ctx = sanctuaryCtx;
    setSanctuaryCtx(null);
    setGame((prev) => {
      let updated = { ...prev };
      if (choice === "heal_actions" && updated.actions) {
        updated = {
          ...updated,
          actions: { ...updated.actions, maxActions: updated.actions.maxActions + ctx.actions },
        };
      } else if (choice === "gold") {
        setGold((g) => g + ctx.gold);
        updated = { ...updated, stats: { ...updated.stats, goldEarned: updated.stats.goldEarned + ctx.gold } };
      } else if (choice === "remove_tile") {
        if (updated.tilePool.length > 7) {
          const idx = Math.floor(Math.random() * updated.tilePool.length);
          updated = { ...updated, tilePool: updated.tilePool.filter((_, i) => i !== idx) };
        }
      }
      return { ...updated, result: "map_select" as const };
    });
  }, [sanctuaryCtx]);

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

  const scoreBreakdown = calculateScore(game.chain, game.relics, modRef.current.patternBonus);

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

  if (game.result === "map_select" && runMap) {
    return (
      <RunMapScreen
        map={runMap}
        onSelectNode={handleSelectMapNode}
        gold={gold}
        round={game.round}
      />
    );
  }

  if (game.result === "sanctuary" && sanctuaryCtx) {
    return (
      <SanctuaryScreen
        onSelect={handleSanctuaryChoice}
        goldReward={sanctuaryCtx.gold}
        extraActions={sanctuaryCtx.actions}
      />
    );
  }

  if (game.result === "boss_reward" && bossRewardData) {
    return (
      <BossRewardScreen
        boss={bossRewardData.boss}
        bonusRelicId={bossRewardData.bonusRelicId}
        onContinue={handleBossRewardContinue}
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
        rerollCost={getRerollCost(shopRerolls)}
        onReroll={handleShopReroll}
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

  const currentEd = summarizeChainEditions(game.chain);
  const modifiedTotal = getModifiedScore(scoreBreakdown.total, {
    patterns: scoreBreakdown.patternAnalysis.patterns.length,
    hasDoubles: game.chain.placed.some((p) => p.tile.top === p.tile.bottom),
    tilesPlayed: game.chain.placed.length,
    patternBonusTotal: scoreBreakdown.patternAnalysis.totalBonus,
    editionFlat: currentEd.flatBonus,
    editionMultiplier: currentEd.multiplier,
  });

  const scoreRevealExtras = {
    editionFlat: currentEd.flatBonus > 0 ? currentEd.flatBonus : undefined,
    editionMultiplier: currentEd.multiplier !== 1 ? currentEd.multiplier : undefined,
    talentFlat: (talentBonuses.flatScoreBonus + talentBonuses.extraPatternScore * scoreBreakdown.patternAnalysis.patterns.length) > 0
      ? talentBonuses.flatScoreBonus + talentBonuses.extraPatternScore * scoreBreakdown.patternAnalysis.patterns.length
      : undefined,
    talentMultiplier: talentBonuses.scoreMultiplier !== 1 ? talentBonuses.scoreMultiplier : undefined,
    familyFlat: (familyBonuses.numeroFlatBonus + familyBonuses.cadenaPerTile * game.chain.placed.length) > 0
      ? familyBonuses.numeroFlatBonus + familyBonuses.cadenaPerTile * game.chain.placed.length
      : undefined,
    familyMultiplier: familyBonuses.fuerzaGlobalMultiplier !== 1 ? familyBonuses.fuerzaGlobalMultiplier : undefined,
  };

  // Preview: simulate placing a tile on each valid side and return best delta
  const previewScoreFor = (tile: Tile): number | null => {
    if (game.result !== "playing") return null;
    const sides = getValidPlacements(game.chain, tile);
    if (sides.length === 0) return null;
    let best = 0;
    for (const side of sides) {
      let simChain: ChainState;
      try {
        simChain = placeTile(game.chain, tile, side);
      } catch {
        continue;
      }
      const simRaw = calculateScore(simChain, game.relics, modRef.current.patternBonus);
      const simHasDoubles = simChain.placed.some((p) => p.tile.top === p.tile.bottom);
      const simEd = summarizeChainEditions(simChain);
      const simTotal = getModifiedScore(simRaw.total, {
        patterns: simRaw.patternAnalysis.patterns.length,
        hasDoubles: simHasDoubles,
        tilesPlayed: simChain.placed.length,
        patternBonusTotal: simRaw.patternAnalysis.totalBonus,
        editionFlat: simEd.flatBonus,
        editionMultiplier: simEd.multiplier,
      });
      const delta = simTotal - modifiedTotal;
      if (delta > best) best = delta;
    }
    return best;
  };

  const shakeAnim = (() => {
    switch (shakeIntensity) {
      case "small": return { x: [0, -3, 3, -2, 2, 0], y: [0, -1, 1, 0] };
      case "large": return { x: [0, -10, 10, -7, 7, -4, 0], y: [0, 4, -4, 2, 0], rotate: [0, -0.6, 0.6, 0] };
      default: return { x: [0, -6, 6, -3, 3, 0], y: [0, -2, 2, 0] };
    }
  })();

  return (
    <motion.div
      key={`gb-shake-${shakeTrigger}`}
      animate={shakeTrigger > 0 ? shakeAnim : undefined}
      transition={{ duration: shakeIntensity === "large" ? 0.5 : shakeIntensity === "medium" ? 0.35 : 0.22 }}
      className="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto px-4 py-8 min-h-screen relative ambient-grain"
    >
      {/* Round transition overlay */}
      {roundTransition && (
        <RoundTransition
          round={roundTransition.round}
          isBoss={roundTransition.isBoss}
          onComplete={() => setRoundTransition(null)}
        />
      )}

      {/* Chain reaction visual effects */}
      <ChainReactionEffect
        event={reactionQueue[0] ?? null}
        onComplete={popReaction}
      />

      {/* Round quest card */}
      {currentQuest && game.result === "playing" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md flex items-center gap-3 px-4 py-2 rounded-xl bg-surface-800/70 border border-accent-gold/30"
          title={currentQuest.description}
        >
          <span className="text-accent-gold text-lg leading-none">◆</span>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[9px] uppercase tracking-widest text-accent-silver/40 font-bold">Reto de ronda</span>
            <span className="text-xs text-white font-semibold truncate">{currentQuest.title}</span>
            <span className="text-[10px] text-accent-silver/50 truncate">{currentQuest.description}</span>
          </div>
          {currentQuest.reward.kind === "gold" && (
            <span className="text-[10px] font-mono font-bold text-accent-gold whitespace-nowrap">+{currentQuest.reward.amount}g</span>
          )}
        </motion.div>
      )}

      {/* Quest result toast */}
      <AnimatePresence>
        {questToast && (
          <motion.div
            key={questToast.text}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onAnimationComplete={() => {
              setTimeout(() => setQuestToast(null), 2500);
            }}
            className={[
              "fixed top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl border backdrop-blur-sm",
              questToast.success
                ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-300"
                : "bg-surface-800/80 border-surface-600/50 text-accent-silver/60",
            ].join(" ")}
          >
            <span className="text-xs font-bold">{questToast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
      <div className="flex items-center gap-3 w-full">
        <h1 className="font-display font-black text-xl tracking-tight bg-gradient-to-b from-white via-white/80 to-accent-silver/40 bg-clip-text text-transparent">
          DOMINIX
        </h1>
        {isDaily && (
          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-widest">
            Diario
          </span>
        )}
        {isEndless && (
          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold uppercase tracking-widest">
            Endless
          </span>
        )}
        {modRef.current.scoreMultiplier !== 1 && (
          <span className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-bold font-mono">
            x{modRef.current.scoreMultiplier}
          </span>
        )}
        {currentBoss && (
          <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-widest animate-pulse">
            Jefe
          </span>
        )}
        <span
          className="px-2 py-0.5 rounded-md bg-surface-700/40 border border-surface-600/30 text-accent-silver/70 text-[9px] font-bold uppercase tracking-widest"
          title={character.description}
        >
          {character.name}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => { navigator.clipboard.writeText(seedToString(runSeed)); }}
          title={`Seed: ${seedToString(runSeed)} (click para copiar)`}
          className="px-2 py-0.5 rounded-md text-[8px] font-mono text-accent-silver/20 hover:text-accent-silver/40 transition-colors"
        >
          {seedToString(runSeed)}
        </button>
        {gold > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel">
            <div className="w-2 h-2 rounded-full bg-accent-gold/80 shadow-[0_0_6px_rgba(212,168,83,0.4)]" />
            <span className="font-mono font-bold text-sm text-accent-gold">{gold}</span>
          </div>
        )}
      </div>

      {/* Relics */}
      <RelicBar relicIds={game.relics} />

      {/* Score */}
      <div
        key={`score-aberration-${aberrationKey}`}
        className={["relative w-full", aberrationKey > 0 ? "chromatic-aberration" : ""].join(" ")}
      >
        <ScoreBar score={modifiedTotal} target={game.target} round={game.round} />
        <ScorePopup score={modifiedTotal} prevScore={prevScore} />
      </div>

      {/* Patterns */}
      <div className="relative w-full">
        <PatternDisplay
          patterns={scoreBreakdown.patternAnalysis.patterns}
          multiplier={scoreBreakdown.multiplier}
          combo={scoreBreakdown.patternAnalysis.combo}
        />
        <ParticleEffect trigger={particleTrigger} />
      </div>

      {/* Score breakdown */}
      {game.chain.placed.length > 0 && game.result === "playing" && (
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-1.5 rounded-lg">
          <span className="text-[10px] font-mono text-accent-silver/30">Base {scoreBreakdown.baseScore}</span>
          {scoreBreakdown.lengthBonus > 0 && <span className="text-[10px] font-mono text-blue-400/40">+ Largo {scoreBreakdown.lengthBonus}</span>}
          {scoreBreakdown.patternAnalysis.totalBonus > 0 && <span className="text-[10px] font-mono text-cyan-400/40">+ Patron {Math.floor(scoreBreakdown.patternAnalysis.totalBonus * modRef.current.patternBonus)}</span>}
          {scoreBreakdown.relicBonus > 0 && <span className="text-[10px] font-mono text-purple-400/40">+ Reliquia {scoreBreakdown.relicBonus}</span>}
          {scoreBreakdown.multiplier > 1 && <span className="text-[10px] font-mono text-accent-gold/45">x{scoreBreakdown.multiplier.toFixed(2)}</span>}
          {modRef.current.scoreMultiplier !== 1 && <span className="text-[10px] font-mono text-green-400/45">x{modRef.current.scoreMultiplier}</span>}
        </div>
      )}

      {/* Boss restriction indicator */}
      {activeBossRestriction && game.result === "playing" && currentBoss && (() => {
        const r = activeBossRestriction;
        const phaseLabel = currentBoss.phases ? `Fase ${bossPhase + 1}/${currentBoss.phases.length}` : null;

        type RuleInfo = { icon: React.ReactNode; label: string; detail?: string; progress?: { current: number; max: number }; isRequirement?: boolean };
        const chainLen = game.chain.placed.length;
        const patternsNow = scoreBreakdown.patternAnalysis.patterns.length;

        const ruleInfo: RuleInfo = (() => {
          switch (r.type) {
            case "no_doubles": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="12" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
              label: "Sin dobles",
              detail: "Las fichas dobles estan prohibidas",
            };
            case "only_doubles": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="12" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/></svg>,
              label: "Solo dobles",
              detail: "Unicamente fichas dobles son validas",
            };
            case "no_wild": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-2.5L7 19l1-6-4-4 5.5-.5z" stroke="currentColor" strokeWidth="1.6"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
              label: "Sin comodines",
              detail: "Las fichas comodin no tienen efecto",
            };
            case "max_tiles": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 8V6M16 8V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              label: `Maximo ${r.count} fichas`,
              detail: "La cadena no puede exceder este limite",
              progress: { current: chainLen, max: r.count },
            };
            case "min_patterns": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5"/><circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="M12 5v2M12 17v2M5 12h2M17 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              label: `${r.count} patrones requeridos`,
              detail: "Debes activar al menos este numero de patrones",
              progress: { current: patternsNow, max: r.count },
              isRequirement: true,
            };
            case "min_chain_length": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12h4m4 0h4m4 0h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="4" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="20" cy="12" r="2" fill="currentColor"/></svg>,
              label: `Minimo ${r.count} fichas en cadena`,
              detail: "Necesitas llegar a esta longitud para ganar",
              progress: { current: chainLen, max: r.count },
              isRequirement: true,
            };
            case "only_low": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              label: `Solo fichas suma <= ${r.max}`,
              detail: "Valores mas altos estan bloqueados",
            };
            case "no_repeat_number": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 8h4v8H4zM16 8h4v8h-4z" stroke="currentColor" strokeWidth="1.6"/><path d="M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
              label: "Sin numero consecutivo repetido",
              detail: "El numero de conexion debe cambiar con cada ficha",
            };
          }
        })();

        const hasProgress = !!ruleInfo.progress;
        const progressDone = hasProgress && ruleInfo.progress!.current >= ruleInfo.progress!.max;

        return (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mx-auto"
          >
            <div className={[
              "flex items-center gap-3 px-4 py-2.5 rounded-xl border",
              "bg-gradient-to-r from-red-950/60 to-surface-900/80 backdrop-blur-sm",
              progressDone ? "border-green-500/40" : "border-red-500/30",
            ].join(" ")}>
              {/* Icon */}
              <div className={`shrink-0 ${progressDone ? "text-green-400" : "text-red-400"}`}>
                {ruleInfo.icon}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold uppercase tracking-wider ${progressDone ? "text-green-400" : "text-red-400"}`}>
                    {ruleInfo.label}
                  </span>
                  {phaseLabel && (
                    <span className="text-[9px] text-red-400/50 border border-red-500/20 rounded px-1.5 py-0.5 uppercase tracking-widest">
                      {phaseLabel}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-accent-silver/40 mt-0.5 truncate">{ruleInfo.detail}</p>
                {hasProgress && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-surface-700/60 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${progressDone ? "bg-green-400" : ruleInfo.isRequirement ? "bg-amber-400" : "bg-red-400"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (ruleInfo.progress!.current / ruleInfo.progress!.max) * 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${progressDone ? "text-green-400" : "text-accent-silver/50"}`}>
                      {ruleInfo.progress!.current}/{ruleInfo.progress!.max}
                    </span>
                  </div>
                )}
              </div>
              {/* Boss name */}
              <div className="shrink-0 text-right">
                <div className="text-[9px] text-red-400/40 uppercase tracking-widest">Jefe</div>
                <div className="text-[10px] text-red-300/70 font-bold truncate max-w-[80px]">{currentBoss.name}</div>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Chain area */}
      <div className="relative w-full rounded-2xl border border-surface-600/40 chain-surface p-5 min-h-[10rem] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,168,83,0.04)_0%,_transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-surface-600/20 to-transparent" />
        {game.chain.placed.length === 0 && game.result === "playing" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] text-accent-silver/15 uppercase tracking-[0.3em] font-medium" style={{ animation: "ambient-pulse 3s ease-in-out infinite" }}>
              Juega una ficha
            </span>
          </div>
        )}
        <Chain chain={game.chain} skin={activeSkin} patternFlash={patternFlash} />
      </div>

      {/* Result overlay */}
      {game.result === "win" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center gap-5 py-8 px-6 rounded-2xl bg-green-500/[0.04] border border-green-500/20 backdrop-blur-sm w-full"
        >
          <ParticleEffect trigger={game.round} color="#4ade80" count={32} />
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,_rgba(74,222,128,0.06)_0%,_transparent_70%)] pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="font-display font-black text-4xl tracking-tight bg-gradient-to-b from-green-200 via-green-400 to-green-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(74,222,128,0.3)]">
              {currentBoss ? "Jefe derrotado" : "Ronda superada"}
            </span>
          </motion.div>
          <ScoreReveal breakdown={scoreBreakdown} finalScore={modifiedTotal} target={game.target} won={true} extras={scoreRevealExtras} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-gold/10 border border-accent-gold/20">
              <div className="w-2 h-2 rounded-full bg-accent-gold/70" />
              <span className="font-mono font-bold text-sm text-accent-gold">+{calculateGoldEarned(modifiedTotal, game.round)}</span>
            </div>
            {currentBoss && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <span className="font-mono font-bold text-sm text-red-400">+{currentBoss.reward.gold} bonus</span>
              </div>
            )}
            {currentBoss?.reward.extraRelic && (
              <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <span className="font-mono font-bold text-sm text-purple-400">+Reliquia</span>
              </div>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleClaimReward}
              className="px-10 py-3 rounded-2xl bg-gradient-to-b from-accent-gold to-amber-600 text-surface-900 font-bold text-sm tracking-wide btn-premium"
            >
              Elegir recompensa
            </motion.button>
            {isEndless && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const endEd = summarizeChainEditions(game.chain);
                  const modifiedTotal = getModifiedScore(scoreBreakdown.total, { patterns: scoreBreakdown.patternAnalysis.patterns.length, hasDoubles: game.chain.placed.some((p) => p.tile.top === p.tile.bottom), tilesPlayed: game.chain.placed.length, patternBonusTotal: scoreBreakdown.patternAnalysis.totalBonus, editionFlat: endEd.flatBonus, editionMultiplier: endEd.multiplier });
                  const finalStats: RunStats = {
                    ...game.stats,
                    totalScore: game.stats.totalScore + modifiedTotal,
                    patternsActivated: game.stats.patternsActivated + scoreBreakdown.patternAnalysis.patterns.length,
                    highestRoundScore: Math.max(game.stats.highestRoundScore, modifiedTotal),
                  };
                  onGameOver(finalStats, game.relics, game.stats.roundsCompleted);
                }}
                className="px-6 py-3 rounded-2xl border border-accent-silver/20 text-accent-silver/60 font-bold text-sm tracking-wide hover:border-accent-silver/30 transition-all"
              >
                Terminar run
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}

      {game.result === "lose" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center gap-5 py-8 px-6 rounded-2xl bg-red-500/[0.04] border border-red-500/20 backdrop-blur-sm w-full"
        >
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,_rgba(239,68,68,0.05)_0%,_transparent_70%)] pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="font-display font-black text-4xl tracking-tight bg-gradient-to-b from-red-200 via-red-400 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              Run terminada
            </span>
          </motion.div>
          <ScoreReveal breakdown={scoreBreakdown} finalScore={modifiedTotal} target={game.target} won={false} extras={scoreRevealExtras} />
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const finalStats: RunStats = {
                ...game.stats,
                totalScore: game.stats.totalScore + modifiedTotal,
                patternsActivated: game.stats.patternsActivated + scoreBreakdown.patternAnalysis.patterns.length,
                highestRoundScore: Math.max(game.stats.highestRoundScore, modifiedTotal),
              };
              onGameOver(finalStats, game.relics, game.stats.roundsCompleted);
            }}
            className="px-10 py-3 rounded-2xl bg-gradient-to-b from-red-500 to-red-700 text-white font-bold text-sm tracking-wide btn-premium"
          >
            Ver resultados
          </motion.button>
        </motion.div>
      )}

      {/* End chain button */}
      {game.result === "playing" && game.chain.placed.length > 0 && (
        <motion.button
          onClick={handleEndChain}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-8 py-2.5 rounded-xl border border-accent-silver/15 bg-surface-800/50 text-accent-silver/60 font-medium text-sm tracking-wide hover:border-accent-gold/30 hover:text-accent-gold/80 transition-all backdrop-blur-sm"
        >
          Cerrar cadena
        </motion.button>
      )}

      {/* Actions bar */}
      {game.result === "playing" && game.actions && (
        <div className="flex items-center justify-center gap-3 w-full max-w-md">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl glass-panel">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${getActionsRemaining(game.actions) <= 3 ? "bg-red-400 animate-pulse" : "bg-accent-gold/60"}`} />
              <span className="text-[10px] font-mono font-bold text-accent-silver/50">
                {getActionsRemaining(game.actions)}<span className="text-accent-silver/25">/{game.actions.maxActions}</span>
              </span>
            </div>
            <div className="w-px h-3 bg-surface-600/40" />
            <span className="text-[10px] font-mono text-accent-silver/35">
              Pool {game.tilePool.length}
            </span>
            <div className="w-px h-3 bg-surface-600/40" />
            <span className="text-[10px] font-mono text-accent-silver/35">
              Desc {game.actions.maxDiscards - game.actions.usedDiscards}
            </span>
          </div>
          {canDraw(game.actions) && game.tilePool.length > 0 && (
            <motion.button
              onClick={handleDraw}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3.5 py-1.5 rounded-lg border border-blue-500/25 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/20 hover:border-blue-400/40 transition-all"
            >
              Robar ({game.actions.maxDraws - game.actions.usedDraws})
            </motion.button>
          )}
        </div>
      )}

      {/* Active mutations bar */}
      {mutationStates.length > 0 && game.result === "playing" && (
        <div className="flex flex-wrap items-center justify-center gap-2 w-full">
          {mutationStates.map((ms) => {
            const mut = ALL_ACTIVE_MUTATIONS.find((m) => m.id === ms.mutationId);
            if (!mut) return null;
            const usable = canUseMutation(mut, ms, game);
            const costLabel = mut.cost.type === "actions" ? `${mut.cost.amount} acc` : `${mut.cost.amount} pts`;
            return (
              <motion.button
                key={ms.mutationId}
                whileHover={usable ? { scale: 1.05 } : undefined}
                whileTap={usable ? { scale: 0.95 } : undefined}
                onClick={() => usable && handleActivateMutation(ms.mutationId)}
                disabled={!usable}
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all",
                  usable
                    ? "border-purple-500/40 bg-purple-500/15 text-purple-300 hover:bg-purple-500/25"
                    : "border-surface-600/30 bg-surface-800/30 text-accent-silver/25 cursor-not-allowed",
                ].join(" ")}
                title={mut.description}
              >
                <span>{mut.name}</span>
                <span className={usable ? "text-purple-400/60" : "text-accent-silver/20"}>{costLabel}</span>
                {ms.usesLeft > 0 && (
                  <span className="ml-0.5 w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[9px]">
                    {ms.usesLeft}
                  </span>
                )}
              </motion.button>
            );
          })}
          {wildNextActive && (
            <span className="px-2 py-1 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[9px] font-bold animate-pulse">
              WILD NEXT
            </span>
          )}
          {freezeEndActive && (
            <span className="px-2 py-1 rounded-md bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[9px] font-bold animate-pulse">
              ANCLA
            </span>
          )}
        </div>
      )}

      {/* Hand */}
      <Hand
        tiles={game.hand}
        chain={game.chain}
        onPlay={handlePlay}
        disabled={game.result !== "playing"}
        skin={activeSkin}
        onDiscard={handleDiscard}
        canDiscard={!!(game.actions && canDiscard(game.actions))}
        getScorePreview={previewScoreFor}
      />
    </motion.div>
  );
}

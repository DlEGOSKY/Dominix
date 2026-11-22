import { RUN_RULESET, SAVE_BEFORE_RELOAD_EVENT, type RunCheckpoint, type CheckpointStates } from "@/engine/runCheckpoint";
import { restoreGlobalRNG } from "@/engine/rng";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import SystemNotice from "./SystemNotice";
import { motion, AnimatePresence } from "framer-motion";
import type { Tile, PlacementSide, GameState, RunStats } from "@/types/domino";
import { useReduceMotion, useSettings } from "@/hooks/useSettings";
import { useTileFlight } from "@/hooks/useTileFlight";
import { useActionFeedback } from "@/hooks/useActionFeedback";
import { boardShortcutsBlocked } from "@/engine/actionFeedback";
import ActionFeedback from "./ActionFeedback";
import { audio } from "@/engine/audio";
import { ambient } from "@/engine/ambient";
import RewardReceipt, { type Receipt } from "./RewardReceipt";
import { rewardWasDelivered, type PendingReward } from "@/engine/rewardFeedback";
import type { RewardOption } from "@/types/reward";
import { generateFullSet, shuffle } from "@/engine/tiles";
import { getDailySeedValue, getDailyTilePool } from "@/engine/daily";
import { getWeeklySeedValue, getWeeklyTilePool } from "@/engine/weekly";
import type { ModifierConfig } from "@/engine/modifiers";
import { getDefaultConfig } from "@/engine/modifiers";
import { createEmptyChain } from "@/engine/chain";
import { calculateScore } from "@/engine/score";
import { getTarget } from "@/engine/round";
import { startNextRound, startBossPhase, recordRound, editRunTile, removeRunTile, duplicateRunTile } from "@/engine/runState";
import { explainTileScore } from "@/engine/scoreExplanation";
import { calculateRunScore, type RunScoreContext } from "@/engine/runScore";
import { playRoundTile, discardRoundTile, drawRoundTile } from "@/engine/roundActions";
import { getLegalPlacements, closeRound, resolveExhaustion } from "@/engine/roundRules";
import { generateRewardOptions } from "@/engine/rewards";
import { getRandomEvent, applyEventToRun } from "@/engine/events";
import type { EventEffect } from "@/engine/events"; // EventEffect used in handleEventContinue param type
import { isTutorialComplete, markTutorialComplete } from "@/engine/tutorial";
import { getRandomRelics, ALL_RELICS, computeFamilySetBonuses, FAMILY_META } from "@/engine/relics";
import { localizeRelic, localizePatternById, localizeBoss } from "@/engine/i18nContent";
import { t as translate } from "@/engine/i18n";
import { celebrateSetBonus, celebrateAchievement, celebrateLegendaryPattern } from "@/engine/celebrate";
import BossDefeatedOverlay from "./BossDefeatedOverlay";
import type { RelicFamily } from "@/types/relic";
import { generateShopItems, getRoundPayout, getRerollCost } from "@/engine/shop";
import type { ShopItem } from "@/engine/shop";
import { getBossForRound, ALL_BOSSES } from "@/engine/boss";
import type { Boss } from "@/engine/boss";
import { loadProgression, getProgressionBonuses, loadActiveSkin } from "@/engine/progression";
import { loadSavedData } from "@/engine/storage";
import { createActionState, getRelicHandBonus, canPlay, canDiscard, canDraw } from "@/engine/actions";
import ActionHUD from "./ActionHUD";
import { getGlobalRNG, setGlobalRNG, randomSeed, seedToString } from "@/engine/rng";
import { ALL_ACTIVE_MUTATIONS, resetMutationUses, canUseMutation, applyShuffleHand, applySwapEnds } from "@/engine/activeMutations";
import { getCharacter, injectCharacterTiles, computeGoldMultiplier } from "@/engine/characters";
import type { CharacterId } from "@/engine/characters";
import { getCharacterLevel, getMasteryBonus } from "@/engine/characterMastery";
import { getTalentBonuses } from "@/engine/talents";
import { pickRoundQuest } from "@/engine/quests";
import { loadAscension, getAccumulatedAscension } from "@/engine/ascension";
import { discoverEdition, rollRandomEdition } from "@/engine/editions";
import { getConsumable, MAX_CONSUMABLE_SLOTS, rollRandomConsumable } from "@/engine/consumables";
import { getCelestial, computeCelestialSetBonus, FIRMAMENT_META, rollRandomCelestial, type CelestialCard, type Firmament } from "@/engine/celestial";
import { rollChaosTwist, chaosMods } from "@/engine/chaos";
import { discoverPattern, discoverBoss, discoverCelestial, discoverChaos } from "@/engine/codex";
import { saveLegacy, loadLegacy, consumeLegacy, resolveLegacy } from "@/engine/legacy";
import { withSaveRollback } from "@/engine/saveSync";
import { useClipboard } from "@/hooks/useClipboard";
import { getActForRound, detectActTransition, type ActDefinition } from "@/engine/acts";
import { tryReachMilestone } from "@/engine/milestones";
import MilestoneToast from "./MilestoneToast";
import { peekNewlyCompletedChallenges, type CharacterChallenge } from "@/engine/characterChallenges";
import ChallengeToast from "./ChallengeToast";
import type { TileSkin } from "./TileView";
import Hand from "./Hand";
import Chain from "./Chain";
import ChainParticles from "./ChainParticles";
import ScoreBar from "./ScoreBar";
import ScoreSummary from "./ScoreSummary";
import RunModifiersBadge from "./RunModifiersBadge";
import PatternDisplay from "./PatternDisplay";
import RelicBar from "./RelicBar";
import PatternLog from "./PatternLog";
import ConsumableBar from "./ConsumableBar";
import CelestialBar from "./CelestialBar";
import MobileInfoBar from "./MobileInfoBar";
import ActTransition from "./ActTransition";
import InterludeScreen from "./InterludeScreen";
import { rollInterlude, type InterludeChoice } from "@/engine/interludes";
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
import { generateRunMap, visitNode, getAvailableNodes } from "@/engine/runMap";
import type { MapNode } from "@/engine/runMap";

const HAND_SIZE = 7;

const INITIAL_STATS: RunStats = {
  roundsCompleted: 0,
  totalScore: 0,
  patternsActivated: 0,
  patternBreakdown: {},
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
  actionBonus: number = 0,
  isWeekly: boolean = false
): { state: GameState; bonusGold: number } {
  const bonuses = progBonuses ?? getStartBonuses();
  const effectiveHandSize = handSize + bonuses.handSizeBonus;
  const pool = isWeekly
    ? getWeeklyTilePool()
    : isDaily
    ? getDailyTilePool()
    : shuffle(generateFullSet());

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
      runTiles: pool,
      roundBonus: 0,
      roundSettled: false,
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


function useRunValue<K extends keyof CheckpointStates>(resume: RunCheckpoint | undefined, key: K, fallback: CheckpointStates[K] | (() => CheckpointStates[K])) {
  return useState<CheckpointStates[K]>(() => resume ? resume.states[key] : typeof fallback === "function" ? (fallback as () => CheckpointStates[K])() : fallback);
}

interface GameBoardProps {
  resume?: RunCheckpoint;
  modifierIds?: string[];
  onCheckpoint?: (snapshot: RunCheckpoint) => boolean;
  onSaveExit?: () => void;
  onGameOver: (stats: RunStats, relicIds: string[], finalRound: number, seed?: number) => void | (() => void);
  isDaily?: boolean;
  isEndless?: boolean;
  isWeekly?: boolean;
  modifierConfig?: ModifierConfig;
  characterId?: CharacterId;
}

export default function GameBoard({ resume, modifierIds = [], onCheckpoint, onSaveExit, onGameOver, isDaily = false, isEndless = false, isWeekly = false, modifierConfig = getDefaultConfig(), characterId = "architect" }: GameBoardProps) {
  const seedCopy = useClipboard();
  const reducedMotion = useReduceMotion();
  const [presentationSettings] = useSettings();
  const character = getCharacter(characterId);
  const isChallenge = isDaily || isWeekly;
  const [runtime] = useState(() => resume?.runtime ?? {
    talentBonuses: getTalentBonuses(isChallenge ? { ranks: {}, spent: 0 } : undefined),
    ascension: getAccumulatedAscension(isDaily || isEndless || isWeekly ? 0 : loadAscension().selected),
    masteryBonus: getMasteryBonus(isChallenge ? 1 : getCharacterLevel(characterId)),
  });
  const { talentBonuses, ascension, masteryBonus } = runtime;
  // Character mastery: bonus unlocked by repeatedly playing this character.
  // Applies in all modes so practice feels rewarding regardless of mode.

  const [runSeed] = useState(() => {
    if (resume) { restoreGlobalRNG(resume.rng); return resume.seed; }
    const seed = isDaily ? getDailySeedValue() : isWeekly ? getWeeklySeedValue() : randomSeed();
    setGlobalRNG(seed);
    return seed;
  });
  const finishedRef = useRef(false);
  const finishRun = useCallback((stats:RunStats, relics:string[], round:number, legacy?: Parameters<typeof saveLegacy>[0]) => {
    if (finishedRef.current) return;
    // AnimatePresence keeps this board mounted during its exit animation.
    // Stop pending writes before App clears the run and records progression.
    finishedRef.current = true;
    const completion: { reveal?: () => void } = {};
    const saved = withSaveRollback(() => {
      if (legacy && (legacy.celestials.length > 0 || legacy.consumables.length > 0) && !saveLegacy(legacy)) throw new Error("Legacy save failed");
      const reveal = onGameOver(stats, relics, round, runSeed);
      if (typeof reveal === "function") completion.reveal = reveal;
    });
    if (saved) completion.reveal?.();
    else { finishedRef.current = false; setCheckpointFailed(true); }
  }, [onGameOver, runSeed]);
  const mapMode = !isDaily && !isEndless && !isWeekly;
  // Mastery action bonus stacks with talents and modifier-driven bonuses per round.
  const effectiveActionBonus = modifierConfig.actionBonus + talentBonuses.actionBonus + masteryBonus.actionBonus;
  const [initResult] = useState(() => {
    if (resume) return { state: resume.states.game, handSize: resume.handSize, bonusGold: 0 };
    setGlobalRNG(runSeed);
    const base = createInitialRun(isDaily, modifierConfig.handSize, modifierConfig.targetMultiplier, modifierConfig.startingRelics, isChallenge ? { startingGold: 0, startingRelics: [], startingGoldenTiles: 0, handSizeBonus: 0 } : undefined, effectiveActionBonus, isWeekly);
    // Apply character bonuses: inject special tiles, add starting relics, expand hand to char size
    let pool = injectCharacterTiles(base.state.tilePool, character);
    let hand = base.state.hand;
    const baseHandSize = isChallenge ? hand.length : Math.max(hand.length, character.startingHandSize);
    const relics = Array.from(new Set([...base.state.relics, ...character.startingRelicIds]));
    const targetHandSize = baseHandSize + getRelicHandBonus(relics);
    const missing = targetHandSize - hand.length;
    if (missing > 0 && pool.length >= missing) {
      hand = [...hand, ...pool.slice(0, missing)];
      pool = pool.slice(missing);
    }

    // Pacto Sagrado: pick the best candidate tile and mark it
    // (also triggered by Hermit character passive without the target penalty)
    const shouldPact = modifierConfig.pact || character.passive.type === "auto_pact";
    if (shouldPact) {
      const all = [...hand, ...pool];
      // Prefer highest-sum double, fallback to highest-sum tile
      const doubles = all.filter((t) => t.top === t.bottom && (!t.type || t.type === "normal"));
      const candidates = doubles.length > 0 ? doubles : all.filter((t) => !t.type || t.type === "normal");
      if (candidates.length > 0) {
        const chosen = [...candidates].sort((a, b) => (b.top + b.bottom) - (a.top + a.bottom))[0]!;
        hand = hand.map((t) => t.id === chosen.id ? { ...t, pact: true } : t);
        pool = pool.map((t) => t.id === chosen.id ? { ...t, pact: true } : t);
      }
    }

    // Alchemist: roll random editions onto N tiles
    if (character.passive.type === "starting_editions") {
      const count = character.passive.count;
      const all = [...hand, ...pool].filter((t) => !t.edition && (!t.type || t.type === "normal"));
      const picked = all.slice(0, count);
      for (const t of picked) {
        const ed = rollRandomEdition();
        hand = hand.map((h) => h.id === t.id ? { ...h, edition: ed } : h);
        pool = pool.map((p) => p.id === t.id ? { ...p, edition: ed } : p);
      }
    }

    return {
      state: {
        ...base.state,
        hand,
        tilePool: pool,
        runTiles: [...hand, ...pool],
        actions: createActionState(1, relics, effectiveActionBonus),
        relics,
        stats: { ...base.state.stats, relicsCollected: relics.length },
      },
      bonusGold: base.bonusGold + character.startingGold,
      handSize: baseHandSize,
    };
  });
  const [game, setGame] = useRunValue(resume, "game", () =>
    mapMode ? { ...initResult.state, result: "map_select" as const } : initResult.state
  );
  const [runMap, setRunMap] = useRunValue(resume, "runMap", () => mapMode ? generateRunMap(1) : null);
  // Elite rounds have buffed target AND boosted reward rarity
  const [isEliteRound, setIsEliteRound] = useRunValue(resume, "isEliteRound", false);
  const [sanctuaryCtx, setSanctuaryCtx] = useRunValue(resume, "sanctuaryCtx", null);
  const [rewardOptions, setRewardOptions] = useRunValue(resume, "rewardOptions", []);
  const [mutationMode, setMutationMode] = useRunValue(resume, "mutationMode", null);
  const [currentEvent, setCurrentEvent] = useRunValue(resume, "currentEvent", null);
  const [tutorialStep, setTutorialStep] = useRunValue(resume, "tutorialStep", () => isTutorialComplete() ? -1 : 0);
  const [gold, setGold] = useRunValue(resume, "gold", initResult.bonusGold + masteryBonus.startGold);
  const [shopItems, setShopItems] = useRunValue(resume, "shopItems", []);
  const [shopRerolls, setShopRerolls] = useRunValue(resume, "shopRerolls", 0);
  const [currentBoss, setCurrentBoss] = useRunValue(resume, "currentBoss", null);
  const [bossPhase, setBossPhase] = useRunValue(resume, "bossPhase", 0);
  const [bossRewardData, setBossRewardData] = useRunValue(resume, "bossRewardData", null);
  const [bossDefeatedOverlay, setBossDefeatedOverlay] = useState<Boss | null>(null);
  const [activeSkin] = useRunValue(resume, "activeSkin", () => loadActiveSkin() as TileSkin);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [roundTransition, setRoundTransition] = useState<{ round: number; isBoss: boolean } | null>(null);
  const [reactionQueue, setReactionQueue] = useState<ReactionEvent[]>([]);
  const reactionIdRef = useRef(0);
  const [currentQuest, setCurrentQuest] = useRunValue(resume, "currentQuest", () => pickRoundQuest(1));
  const [questToast, setQuestToast] = useState<{ text: string; success: boolean } | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [shakeIntensity, setShakeIntensity] = useState<"small" | "medium" | "large">("medium");
  const [aberrationKey, setAberrationKey] = useState(0);
  const [patternFlash, setPatternFlash] = useState(0);
  const [relicPulseKey, setRelicPulseKey] = useState(0);
  const [relicPulseHighlights, setRelicPulseHighlights] = useState<string[]>([]);
  const [roundPatternLog, setRoundPatternLog] = useRunValue(resume, "roundPatternLog", []);

  /** Pulse the relic bar, highlighting only the relics that match the filter. */
  const triggerRelicPulse = useCallback(
    (filter: (r: typeof ALL_RELICS[number]) => boolean) => {
      const ids = ALL_RELICS.filter((r) => game.relics.includes(r.id) && filter(r)).map((r) => r.id);
      setRelicPulseHighlights(ids);
      setRelicPulseKey((k) => k + 1);
    },
    [game.relics]
  );

  // Narrative interlude between acts (boss cleared -> map_select)
  const [pendingInterlude, setPendingInterlude] = useRunValue(resume, "pendingInterlude", null);
  // Ceremonial milestone toast ("first time reaching Act III", "first Echo", ...)
  const [milestoneToast, setMilestoneToast] = useState<{ title: string; subtitle: string } | null>(null);
  // In-run challenge toast + ids already celebrated this run (no double-fire)
  const [challengeToast, setChallengeToast] = useState<CharacterChallenge | null>(null);
  const celebratedChallengesRef = useRef<Set<string>>(new Set(resume?.celebratedChallenges ?? []));
  // One-shot multiplier applied to the next round's target (from interlude choices)
  const pendingTargetMultiplier = game.pendingRound?.targetMultiplier ?? 1;
  // Run-wide flat bonus added to each scoring event (from interlude choices)
  const [runFlatBonusPerTile, setRunFlatBonusPerTile] = useRunValue(resume, "runFlatBonusPerTile", 0);

  const triggerShake = useCallback((intensity: "small" | "medium" | "large" = "medium") => {
    setShakeIntensity(intensity);
    setShakeTrigger((t) => t + 1);
  }, []);

  // Fires the ceremonial toast if the milestone was reached for the first time.
  const maybeCelebrateMilestone = useCallback((id: Parameters<typeof tryReachMilestone>[0]) => {
    const m = tryReachMilestone(id);
    if (m) {
      setMilestoneToast({ title: m.title, subtitle: m.subtitle });
      // Soft cosmic chord to underline the moment
      audio.playCosmicChord();
    }
  }, []);

  const triggerAberration = useCallback(() => {
    setAberrationKey((k) => k + 1);
  }, []);
  const [ownedMutationIds, setOwnedMutationIds] = useRunValue(resume, "ownedMutationIds", []);
  const [mutationStates, setMutationStates] = useRunValue(resume, "mutationStates", []);
  const [wildNextActive, setWildNextActive] = useRunValue(resume, "wildNextActive", false);
  const [freezeEndActive, setFreezeEndActive] = useRunValue(resume, "freezeEndActive", false);
  const [doubleNextScoreActive, setDoubleNextScoreActive] = useRunValue(resume, "doubleNextScoreActive", false);
  // Consume legacy from previous run exactly once (gated by mount)
  const legacyRef = useRef<ReturnType<typeof resolveLegacy> | null>(null);
  if (legacyRef.current === null && !resume) {
    legacyRef.current = isChallenge ? null : resolveLegacy(loadLegacy());
  }
  const [ownedConsumables, setOwnedConsumables] = useRunValue(resume, "ownedConsumables", () => {
    const inherited = legacyRef.current?.consumable;
    return inherited ? [inherited] : [];
  });
  const [consumableFlashId, setConsumableFlashId] = useState<string | null>(null);
  const [ownedCelestials, setOwnedCelestials] = useRunValue(resume, "ownedCelestials", () => {
    const base: CelestialCard[] = [];
    // Oracle character: start with a random celestial card
    if (character.passive.type === "celestial_start") {
      base.push(rollRandomCelestial());
    }
    // Legacy from previous run
    const inheritedCelestial = legacyRef.current?.celestial;
    if (inheritedCelestial && !base.some((c) => c.id === inheritedCelestial.id)) {
      base.push(inheritedCelestial);
    }
    return base;
  });
  const prevAlignmentsRef = useRef<{ firmaments: string[]; cosmic: boolean }>(resume ? { firmaments: computeCelestialSetBonus(ownedCelestials).firmamentAlignments.slice().sort(), cosmic: computeCelestialSetBonus(ownedCelestials).cosmicAlignment } : { firmaments: [], cosmic: false });
  // Celestial boost from relics (e.g. "Sello del Firmamento")
  const celestialBoost = useMemo(() => {
    let boost = 0;
    for (const rId of game.relics) {
      const r = ALL_RELICS.find((x) => x.id === rId);
      if (r?.effect.type === "celestial_boost") boost += (r.effect as { value: number }).value;
    }
    return boost;
  }, [game.relics]);
  // Boss Heat: accumulates during boss fights. At 100 the boss "rages" (target +10%).
  const [bossHeat, setBossHeat] = useRunValue(resume, "bossHeat", 0);
  const [bossRageCount, setBossRageCount] = useRunValue(resume, "bossRageCount", 0);
  const [bossRageFlash, setBossRageFlash] = useState(0);
  // Modo Caos: one random twist per round
  const [chaosTwist, setChaosTwist] = useRunValue(resume, "chaosTwist", null);
  // Undo: snapshot key state before each play; reset at round change
  const [undoSnapshot, setUndoSnapshot] = useRunValue(resume, "undoSnapshot", null);
  const [undoUsesLeft, setUndoUsesLeft] = useRunValue(resume, "undoUsesLeft", 1);
  const prevPatternIds = useRef<Set<string>>(new Set(resume ? calculateScore(resume.states.game.chain).patternAnalysis.patterns.map(p=>p.id) : []));
  const modRef = useRef(resume?.modifiers ?? { ...modifierConfig, handSize: initResult.handSize, actionBonus: effectiveActionBonus });

  // Active boss restriction (respects multi-phase)
  const activeBossRestriction = currentBoss?.phases
    ? currentBoss.phases[bossPhase]?.restriction
    : currentBoss?.restriction;

  const pushReaction = useCallback((kind: ReactionEvent["kind"], label?: string) => {
    reactionIdRef.current += 1;
    const ev: ReactionEvent = { id: reactionIdRef.current, kind, label };
    setReactionQueue((q) => [...q.slice(-2), ev]);
  }, []);

  const popReaction = useCallback(() => {
    setReactionQueue((q) => q.slice(1));
  }, []);

  useEffect(() => {
    const analysis = calculateScore(game.chain, game.relics, modRef.current.patternBonus).patternAnalysis;
    const currentPatterns = analysis.patterns.length;
    const newlyActivated = analysis.patterns.filter((p) => !prevPatternIds.current.has(p.id));
    if (newlyActivated.length > 0) {
      // Tier sound by number of patterns and rare pattern ids
      const legendaryIds = new Set(["cadena_maxima", "todo_dobles", "fractal", "armonia", "hexagrama", "constelacion", "ouroboros"]);
      const newlyActivatedSlice = newlyActivated;
      const newlyHasLegendary = newlyActivatedSlice.some((p) => legendaryIds.has(p.id));
      const forceMega = analysis.patterns.some((p) => legendaryIds.has(p.id));
      audio.playPatternByTier(currentPatterns, forceMega);
      setParticleTrigger((t) => t + 1);
      setPatternFlash((f) => f + 1);
      // Confetti for legendary pattern OR mega combo (4+ patterns)
      if (newlyHasLegendary || currentPatterns >= 4) {
        celebrateLegendaryPattern();
      }
      triggerShake(currentPatterns >= 3 || forceMega ? "medium" : "small");
      // Add newly activated pattern(s) to round log + register in Codex
      // Pulse relics tied to these new patterns
      const newPatternIds = new Set(newlyActivated.map((p) => p.id));
      triggerRelicPulse((r) => {
        if (r.trigger === "on_pattern") return true;
        if (r.effect.type === "bonus_if_pattern" && newPatternIds.has(r.effect.patternId)) return true;
        if (r.effect.type === "multiplier_if_pattern" && newPatternIds.has(r.effect.patternId)) return true;
        if (r.effect.type === "multiplier_per_pattern") return true;
        return false;
      });
      for (const p of newlyActivated) {
        discoverPattern(p.id);
        if (p.id === "hexagrama") maybeCelebrateMilestone("first_hexagrama");
        else if (p.id === "fractal") maybeCelebrateMilestone("first_fractal");
      }
      setRoundPatternLog((log) => [
        ...log,
        ...newlyActivated.filter((p) => !log.some((entry) => entry.patternId === p.id)).map((p, i) => ({
          id: `${Date.now()}-${log.length + i}`,
          patternId: p.id,
          name: p.name,
          bonus: p.bonus,
        })),
      ]);
      const latestPattern = newlyActivated[newlyActivated.length - 1];
      pushReaction("pattern", latestPattern ? localizePatternById(latestPattern.id, latestPattern.name).name : undefined);
      // Bomber passive: next play becomes wild
      if (character.passive.type === "wild_on_pattern") {
        setWildNextActive(true);
      }
    }
    prevPatternIds.current = new Set(analysis.patterns.map((p) => p.id));
  }, [game.chain, game.relics, pushReaction, character, triggerShake, maybeCelebrateMilestone, triggerRelicPulse]);

  // Act transition (cinematic when crossing act boundaries)
  const [pendingActTransition, setPendingActTransition] = useState<ActDefinition | null>(null);
  const prevRoundRef = useRef<number>(game.round);
  const actPrologueShownRef = useRef<boolean>(!!resume);
  useEffect(() => {
    // On initial mount, show the opening act as a prologue
    if (!actPrologueShownRef.current) {
      actPrologueShownRef.current = true;
      setPendingActTransition(getActForRound(game.round));
      prevRoundRef.current = game.round;
      return;
    }
    const prev = prevRoundRef.current;
    if (game.round !== prev) {
      const newAct = detectActTransition(prev, game.round);
      if (newAct) {
        setPendingActTransition(newAct);
        // Milestones tied to crossing act boundaries
        if (newAct.id === "travesia") maybeCelebrateMilestone("first_act_ii");
        else if (newAct.id === "culminacion") maybeCelebrateMilestone("first_act_iii");
        else if (newAct.id === "eco") maybeCelebrateMilestone("first_echo");
      }
      prevRoundRef.current = game.round;
    }
  }, [game.round, maybeCelebrateMilestone]);

  // Live character challenge toasts: whenever run stats change, check if any
  // new challenge condition just became true. We intentionally fire only ONE
  // toast at a time — further matches will surface on the next stats update
  // or at game over via resolveRunChallenges.
  useEffect(() => {
    const newly = peekNewlyCompletedChallenges(
      characterId,
      game.stats,
      game.round,
      celebratedChallengesRef.current,
    );
    if (newly.length === 0) return;
    const first = newly[0]!;
    celebratedChallengesRef.current.add(first.id);
    setChallengeToast(first);
    audio.playCosmicChord();
  }, [game.stats, game.round, characterId]);

  // Current act (for ambient tint)
  const currentAct = useMemo(() => getActForRound(game.round), [game.round]);

  // Ambient music: scene follows the current act, boss overlay toggles with
  // the active boss. On unmount (leaving the run), stop everything.
  useEffect(() => {
    ambient.setScene(currentAct.id);
  }, [currentAct.id]);
  useEffect(() => {
    ambient.setBossActive(!!currentBoss);
  }, [currentBoss]);
  useEffect(() => {
    return () => {
      ambient.stopAll();
    };
  }, []);

  // A resumed round and StrictMode remount must not repeat start-of-round effects.
  const initializedRound = useRef<number | null>(resume?.states.game.round ?? null);
  useEffect(() => {
    if (initializedRound.current === game.round) return;
    initializedRound.current = game.round;
    setUndoSnapshot(null);
    setDoubleNextScoreActive(false);
    setWildNextActive(false);
    setFreezeEndActive(false);
    setMutationStates((ms) => resetMutationUses(ms));
    prevPatternIds.current = new Set();
    setUndoUsesLeft(1);
    setRoundPatternLog([]);
    setBossHeat(0);
    setBossRageCount(0);
    // Modo Caos: roll a new twist at the start of every round
    if (modRef.current.chaos) {
      const twist = rollChaosTwist();
      discoverChaos(twist.id);
      setChaosTwist(twist);
      const mods = chaosMods(twist);
      // Apply target multiplier via a setGame mutation so the bar reflects it
      if (mods.targetMultiplier !== 1) {
        setGame((prev) => ({ ...prev, target: Math.round(prev.target * mods.targetMultiplier) }));
      }
      // Toast the twist
      pushReaction(twist.tone === "good" ? "big_score" : twist.tone === "bad" ? "pattern" : "wild", translate("gb.toast.chaos", { name: twist.name }));
      triggerShake(twist.tone === "bad" ? "medium" : "small");
      if (twist.tone === "good") audio.playAlignmentChord();
      if (twist.tone === "bad") audio.play("round_lose");
      // Free reward: add a random consumable
      if (mods.freeReward) {
        const c = rollRandomConsumable();
        setOwnedConsumables((prev) => {
          const next = prev.length >= MAX_CONSUMABLE_SLOTS ? prev.slice(1) : prev;
          return [...next, c];
        });
      }
    } else {
      setChaosTwist(null);
    }
  }, [game.round, pushReaction]);

  // Legacy is consumed only by a newly started run, never a resume.
  useEffect(() => {
    if (resume) return;
    const leg = legacyRef.current;
    if (!isChallenge) consumeLegacy();
    if (!leg || (!leg.celestial && !leg.consumable)) return;
    const parts: string[] = [];
    if (leg.celestial) parts.push(leg.celestial.name);
    if (leg.consumable) parts.push(leg.consumable.name);
    pushReaction("big_score", translate("gb.toast.legacy", { parts: parts.join(" + ") }));
    audio.playAlignmentChord();
    // Only runs once on mount
  }, []);

  // Celestial alignments: detect newly-activated set bonuses and fire reactions
  useEffect(() => {
    const setBonus = computeCelestialSetBonus(ownedCelestials);
    const current = { firmaments: setBonus.firmamentAlignments.slice().sort(), cosmic: setBonus.cosmicAlignment };
    const prev = prevAlignmentsRef.current;
    const newFirmaments = current.firmaments.filter((f) => !prev.firmaments.includes(f));
    const newCosmic = current.cosmic && !prev.cosmic;
    if (newFirmaments.length > 0) {
      for (const f of newFirmaments) {
        pushReaction("pattern", translate("gb.toast.alignment", { name: FIRMAMENT_META[f as Firmament].label }));
      }
      triggerShake("medium");
      audio.playAlignmentChord();
    }
    if (newCosmic) {
      pushReaction("big_score", translate("gb.toast.cosmicAlignment"));
      triggerShake("large");
      triggerAberration();
      audio.playCosmicChord();
    }
    prevAlignmentsRef.current = current;
  }, [ownedCelestials, pushReaction, triggerAberration]);

  // Codex: register the current boss the first time it is encountered
  useEffect(() => {
    if (currentBoss) discoverBoss(currentBoss.id);
  }, [currentBoss]);

  // Boss Heat: accumulate per tile/pattern/double during boss fights
  useEffect(() => {
    if (!currentBoss) return;
    const tiles = game.chain.placed.length;
    const doubles = game.chain.placed.filter((p) => p.tile.top === p.tile.bottom).length;
    const patterns = calculateScore(game.chain).patternAnalysis.patterns.length;
    // heat accumulated so far (deterministic from chain state)
    const totalHeat = tiles * 12 + patterns * 20 + doubles * 8;
    // Compute how many rages have triggered at this level
    const expectedRages = game.bossRages ?? 0;
    if (expectedRages > bossRageCount) {
      setBossRageCount(expectedRages);
      setBossHeat(totalHeat % 100);
      // Each new rage: boss target +10%, flash + shake
      setBossRageFlash((f) => f + 1);
      triggerShake("medium");
      pushReaction("pattern", translate("gb.toast.bossRage"));
      audio.playBossRage();
    } else {
      setBossHeat(totalHeat % 100);
    }
  }, [game.chain.placed, currentBoss, game.result, game.bossRages, bossRageCount, pushReaction]);

  const presentedOutcome = useRef<string | null>(resume && ["win","lose"].includes(resume.states.game.result)
    ? `${resume.states.game.round}:${resume.states.bossPhase}:${resume.states.game.result}` : null);
  const resumedOutcome = !!resume && resume.states.game.round===game.round && resume.states.bossPhase===bossPhase && resume.states.game.result===game.result && ["win","lose"].includes(game.result);
  useEffect(() => {
    if (resumedOutcome || (game.result !== "win" && game.result !== "lose")) return;
    // Focus after the first paint: focus/scroll during the commit synchronously
    // measured the newly inserted result and blocked the close interaction.
    let timer = 0;
    const frame = requestAnimationFrame(() => {
      timer = window.setTimeout(() => {
        const title = boardRef.current?.querySelector<HTMLElement>('[data-outcome-title]');
        title?.focus({ preventScroll: true });
        title?.scrollIntoView({ block: "nearest" });
      }, 0);
    });
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); };
  }, [game.result, game.round, bossPhase, resumedOutcome]);
  useEffect(() => {
    if(game.result === "playing"){presentedOutcome.current=null;return;}
    if(game.result !== "win" && game.result !== "lose")return;
    const key=`${game.round}:${bossPhase}:${game.result}`;
    if(presentedOutcome.current===key)return;
    presentedOutcome.current=key;
    if(game.result === "win") {
      audio.playWinFanfare();
      if(currentBoss && !presentationSettings.fastAnimations)triggerShake("small");
      if(game.score >= game.target*2 && !presentationSettings.fastAnimations){
        // The result already owns a score, bar and local burst. A second
        // full-screen numeric burst added 20 animated DOM particles here.
        audio.playScoreBig();
      }
    } else {audio.playLoseSting();if(!presentationSettings.fastAnimations)triggerShake("small");}
  },[game.result,game.round,bossPhase,game.score,game.target,currentBoss,presentationSettings.fastAnimations]);


  const familyBonuses = useMemo(() => computeFamilySetBonuses(game.relics), [game.relics]);

  // Keep modRef's actionBonus in sync with the Accion family set bonus.
  useEffect(() => {
    modRef.current.actionBonus = effectiveActionBonus + familyBonuses.accionExtraActions;
  }, [familyBonuses.accionExtraActions, effectiveActionBonus]);

  // Celebrate when a relic family set newly activates (crosses to 3+ relics)
  const prevActiveFamiliesRef = useRef<Set<RelicFamily>>(new Set(resume ? familyBonuses.activeFamilies : []));
  useEffect(() => {
    const current = new Set(familyBonuses.activeFamilies);
    for (const fam of current) {
      if (!prevActiveFamiliesRef.current.has(fam)) {
        // Newly activated: confetti + audio + reaction toast
        celebrateSetBonus(fam);
        audio.play("pattern_mega");
        triggerShake("medium");
        pushReaction("big_score", translate("gb.toast.setActivated", { name: FAMILY_META[fam].name }));
      }
    }
    prevActiveFamiliesRef.current = current;
  }, [familyBonuses.activeFamilies, pushReaction, triggerShake]);

  const scoreContext: RunScoreContext = {
    character, talents: talentBonuses,
    scoreMultiplier: modRef.current.scoreMultiplier, patternBonus: modRef.current.patternBonus,
    celestials: ownedCelestials, celestialBoost, chaosTwist, flatPerTile: runFlatBonusPerTile,
  };
  const scoreGame = (state: GameState) => calculateRunScore(state, scoreContext).total;
  const legalSides = (tile: Tile, chain = game.chain) => getLegalPlacements(
    chain, wildNextActive ? { ...tile, type: "wild" } : tile, activeBossRestriction,
  );

  const advanceRound = useCallback(
    (prev: GameState) => {
      const next = startNextRound(prev, modRef.current.targetMultiplier, modRef.current.handSize, modRef.current.actionBonus, talentBonuses.tilePreserve);
      // Reset active mutation uses for new round
      setMutationStates((ms) => resetMutationUses(ms));
      setWildNextActive(false);
      setFreezeEndActive(false);
      const boss = getBossForRound(next.round);
      if (boss) {
        setCurrentBoss(boss);
        audio.playBossEnter();
        setRoundTransition({ round: next.round, isBoss: true });
        return {
          ...next,
          target: Math.round(next.target * (boss.phases?.[0]?.targetMultiplier ?? boss.targetMultiplier) * ascension.bossTargetMultiplier),
          result: "boss_intro" as const,
        };
      }
      setRoundTransition({ round: next.round, isBoss: false });
      return next;
    },
    []
  );

  const { boardRef, captureTile } = useTileFlight(game.chain, game.result, game.round, activeSkin);
  const actionCue = useActionFeedback(game, boardRef);
  const handlePlay = useCallback(
    (tile: Tile, side: PlacementSide) => {
      if (game.result !== "playing") return;

      if (!game.hand.some((t) => t.id === tile.id) || !legalSides(tile).includes(side)) return;
      if (game.actions && !canPlay(game.actions)) return;
      captureTile(tile.id, side);

      // Snapshot for potential undo (only if usage left)
      if (undoUsesLeft > 0) {
        setUndoSnapshot({ game, wildNextActive, freezeEndActive, doubleNextScoreActive, patternLog: roundPatternLog, bossRageCount });
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
      if (playTile.pact) {
        // Build a meaningful label showing the synergies that will apply
        let approx = 100;
        const parts: string[] = [];
        if (playTile.edition) { approx += 100; parts.push("edition"); }
        const cosmicActive = computeCelestialSetBonus(ownedCelestials).cosmicAlignment;
        if (cosmicActive) { approx = Math.floor(approx * 1.2); parts.push("cosmos"); }
        const suffix = parts.length > 0 ? ` (${parts.join(" + ")})` : "";
        pushReaction("big_score", translate("gb.toast.pact", { n: approx, suffix }));
        triggerShake("medium");
        triggerAberration();
        audio.playPactHit();
      }

      // Discovery: unlock edition in collection
      if (playTile.edition) discoverEdition(playTile.edition);

      // Pulse score-related relics on every tile play (passive, on_score, doubles)
      const isDouble = playTile.top === playTile.bottom;
      triggerRelicPulse((r) => {
        if (r.trigger === "on_score") return true;
        if (r.trigger === "on_double" && isDouble) return true;
        if (r.trigger === "passive" && (r.effect.type === "bonus_per_tile" || r.effect.type === "bonus_flat" || r.effect.type === "multiplier")) return true;
        return false;
      });

      setGame((prev) => playRoundTile(prev, tile, side, scoreContext, {
        wild: wildNextActive, freeze: freezeEndActive, double: doubleNextScoreActive,
        restriction: activeBossRestriction, endless: isEndless, boss: !!currentBoss,
      }));
      setFreezeEndActive(false);
      setDoubleNextScoreActive(false);
    },
    [game, scoreContext, activeBossRestriction, isEndless, doubleNextScoreActive, undoUsesLeft, wildNextActive, freezeEndActive, roundPatternLog, bossRageCount, captureTile]
  );

  const handleDiscard = useCallback(
    (tile: Tile) => {
      if (game.result !== "playing" || !game.actions || !canDiscard(game.actions) || !game.hand.some(actual => actual.id === tile.id)) return;
      setUndoSnapshot(null);
      audio.play("discard_tile");
      setGame((prev) => discardRoundTile(prev, tile, scoreContext, { restriction: activeBossRestriction, endless: isEndless }));
    },
    [game, scoreContext, activeBossRestriction, isEndless]
  );

  const handleDraw = useCallback(() => {
    if (game.result !== "playing" || !game.actions || !canDraw(game.actions) || game.tilePool.length === 0) return;
    setUndoSnapshot(null);
    audio.play("draw_tile");
    setGame((prev) => drawRoundTile(prev, scoreContext, { restriction: activeBossRestriction, endless: isEndless }));
  }, [game, scoreContext, activeBossRestriction, isEndless]);

  const handleUndo = useCallback(() => {
    if (!undoSnapshot || undoUsesLeft <= 0) return;
    if (game.result !== "playing") return;
    setGame(undoSnapshot.game);
    setWildNextActive(undoSnapshot.wildNextActive);
    setFreezeEndActive(undoSnapshot.freezeEndActive);
    setDoubleNextScoreActive(undoSnapshot.doubleNextScoreActive);
    setRoundPatternLog(undoSnapshot.patternLog);
    setBossRageCount(undoSnapshot.bossRageCount);
    prevPatternIds.current = new Set(calculateScore(undoSnapshot.game.chain).patternAnalysis.patterns.map((p) => p.id));
    setUndoSnapshot(null);
    setUndoUsesLeft((n) => n - 1);
    audio.play("button_click");
  }, [undoSnapshot, undoUsesLeft, game.result]);

  const handleUseConsumable = useCallback((consumableId: string) => {
    if (game.result !== "playing") return;
    const consumable = ownedConsumables.find((c) => c.id === consumableId);
    if (!consumable) return;

    setUndoSnapshot(null);
    const effect = consumable.effect;
    let applied = true;

    if (effect.type === "gain_actions") {
      setGame((prev) => {
        if (!prev.actions) return prev;
        return {
          ...prev,
          actions: { ...prev.actions, maxActions: prev.actions.maxActions + effect.amount },
        };
      });
      pushReaction("pattern", translate("gb.toast.actionsGain", { n: effect.amount }));
    } else if (effect.type === "gain_gold") {
      setGold((g) => g + effect.amount);
      pushReaction("pattern", translate("gb.toast.goldGain", { n: effect.amount }));
    } else if (effect.type === "gain_score") {
      setGame((prev) => {
        const updated = { ...prev, roundBonus: (prev.roundBonus ?? 0) + effect.amount };
        return { ...updated, score: scoreGame(updated) };
      });
      pushReaction("big_score", `+${effect.amount}`);
    } else if (effect.type === "hand_first_to_wild") {
      setGame((prev) => {
        if (prev.hand.length === 0) return prev;
        const lightest = [...prev.hand].sort((a, b) => (a.top + a.bottom) - (b.top + b.bottom))[0]!;
        return editRunTile(prev, lightest.id, (t) => ({ ...t, type: "wild" }));
      });
      pushReaction("wild");
    } else if (effect.type === "random_foil") {
        const candidates = game.hand.filter((t) => !t.edition);
        if (candidates.length > 0) {
        const target = candidates[Math.floor(getGlobalRNG().next() * candidates.length)]!;
        setGame(editRunTile(game, target.id, (t) => ({ ...t, edition: "foil" })));
        }
      pushReaction("pattern", translate("gb.toast.foilApplied"));
    } else if (effect.type === "purge_draw") {
      if (game.hand.length > 0) {
        const toRemove = Math.min(effect.count, game.hand.length);
        const shuffled = shuffle(game.hand);
        const newHand = shuffled.slice(toRemove);
        const drawn = game.tilePool.slice(0, effect.count);
        setGame({
          ...game,
          hand: [...newHand, ...drawn],
          tilePool: game.tilePool.slice(drawn.length),
          stats: {
            ...game.stats,
            tilesDiscarded: game.stats.tilesDiscarded + toRemove,
            tilesDrawn: game.stats.tilesDrawn + drawn.length,
          },
        });
      }
      pushReaction("pattern", translate("gb.toast.purge"));
    } else if (effect.type === "refill_hand") {
      setGame((prev) => {
        const need = Math.max(0, effect.target - prev.hand.length);
        if (need === 0) return prev;
        const drawn = prev.tilePool.slice(0, need);
        return {
          ...prev,
          hand: [...prev.hand, ...drawn],
          tilePool: prev.tilePool.slice(drawn.length),
          stats: { ...prev.stats, tilesDrawn: prev.stats.tilesDrawn + drawn.length },
        };
      });
      pushReaction("pattern", translate("gb.toast.handRestored"));
    } else if (effect.type === "double_next_score") {
      setDoubleNextScoreActive(true);
      pushReaction("pattern", translate("gb.toast.x2Next"));
    } else {
      applied = false;
    }

    if (applied) {
      audio.play("relic_select");
      setConsumableFlashId(consumableId);
      setTimeout(() => setConsumableFlashId(null), 600);
      setOwnedConsumables((prev) => prev.filter((c) => c.id !== consumableId));
    }
  }, [game, ownedConsumables, pushReaction, scoreContext]);

  // Keyboard shortcuts
  useEffect(() => {
    if (game.result !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toLowerCase();
      const editing = ["input", "select", "textarea"].includes(tag) || !!(document.activeElement as HTMLElement | null)?.isContentEditable;
      if (boardShortcutsBlocked(e, !!document.querySelector('dialog[open], [role="dialog"][aria-modal="true"], [data-round-transition]'), editing)) return;
      const k = e.key.toLowerCase();
      if (k === "u") {
        if (undoSnapshot && undoUsesLeft > 0) {
          e.preventDefault();
          handleUndo();
        }
        return;
      }
      if (k === "r") {
        if (game.actions && canDraw(game.actions) && game.tilePool.length > 0) {
          e.preventDefault();
          handleDraw();
        }
        return;
      }
      const n = parseInt(k, 10);
      if (!Number.isNaN(n) && n >= 1 && n <= 9) {
        const sorted = [...game.hand].sort((a, b) => {
          const ap = legalSides(a).length > 0 ? 0 : 1;
          const bp = legalSides(b).length > 0 ? 0 : 1;
          if (ap !== bp) return ap - bp;
          return (a.top + a.bottom) - (b.top + b.bottom);
        });
        const tile = sorted[n - 1];
        if (!tile) return;
        const sides = legalSides(tile);
        if (sides.length === 0) return;
        e.preventDefault();
        handlePlay(tile, sides.includes("right") ? "right" : sides[0]!);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [game.result, game.hand, game.chain, game.actions, game.tilePool.length, undoSnapshot, undoUsesLeft, handlePlay, handleDraw, handleUndo]);

  const handleEndChain = useCallback(() => {
    if (game.result !== "playing") return;
    audio.playChainClear();
    setGame((prev) => closeRound(prev, activeBossRestriction, isEndless));
  }, [game.result, activeBossRestriction, isEndless]);

  const claimedRoundRef = useRef<string | null>(resume?.claimedRound ?? null);
  // Random routes are prepared by an accepted action, never by a React state
  // updater: StrictMode is allowed to evaluate those updaters more than once.
  const rollRewardOptions = (state: GameState) => {
    const saved = isChallenge ? undefined : loadSavedData();
    const options = generateRewardOptions(state.relics, saved, state.round, ownedMutationIds,
      { eliteBoost: isEliteRound, legendaryWeightMultiplier: ascension.legendaryWeightMultiplier }, ownedCelestials.map(c => c.id));
    if (!modRef.current.noMutations) return options;
    const filtered = options.filter(option => option.reward.type === "relic");
    return filtered.length > 0 ? filtered : options.slice(0, 2);
  };
  const openRewardRoute = (state: GameState) => {
    const event = mapMode ? null : getRandomEvent(state.round);
    if (event) {
      if (event.type === "blessing") audio.play("event_good");
      else if (event.type === "curse") audio.play("event_bad");
      setCurrentEvent(event);
      setGame({ ...state, result: "event" });
    } else {
      setRewardOptions(rollRewardOptions(state));
      setGame({ ...state, result: "reward" });
    }
  };
  const handleClaimReward = useCallback(() => {
    if (game.result !== "win") return;
    const claimKey = `${game.round}:${bossPhase}`;
    if (claimedRoundRef.current === claimKey) return;
    claimedRoundRef.current = claimKey;
    const lastPhase = !currentBoss?.phases || bossPhase >= currentBoss.phases.length - 1;
    let claimed = game;
    if (!currentBoss || lastPhase) {
      const payout = getRoundPayout(game, computeGoldMultiplier(character) * talentBonuses.goldMultiplier, currentQuest);
      setGold((g) => g + payout.gold);
      const settled = recordRound(game, true);
      claimed = { ...settled, stats: { ...settled.stats, goldEarned: settled.stats.goldEarned + payout.gold } };
      if (currentQuest) setQuestToast({
        text: payout.questCompleted ? translate("gb.questPassed", { title: currentQuest.title, amount: currentQuest.reward.kind === "gold" ? currentQuest.reward.amount : 0 }) : translate("gb.questFailed", { title: currentQuest.title }),
        success: payout.questCompleted,
      });
      setCurrentQuest(pickRoundQuest(game.round + 1));
    }
    if (currentBoss) {
      // Multi-phase boss: advance to next phase if not on last
      if (currentBoss.phases && bossPhase < currentBoss.phases.length - 1) {
        const nextPhaseIdx = bossPhase + 1;
        const nextPhase = currentBoss.phases[nextPhaseIdx]!;
        setBossPhase(nextPhaseIdx);
        setDoubleNextScoreActive(false);
        setWildNextActive(false);
        setFreezeEndActive(false);
        setBossRageCount(0);
        setBossHeat(0);
        setUndoSnapshot(null);
        setRoundPatternLog([]);
        prevPatternIds.current = new Set();
        setMutationStates((ms) => resetMutationUses(ms));
        const baseTarget = getTarget(game.round);
        setGame(startBossPhase(game,
            Math.round(baseTarget * modRef.current.targetMultiplier * nextPhase.targetMultiplier * ascension.bossTargetMultiplier),
            modRef.current.handSize, modRef.current.actionBonus));
        return;
      }

      // Final phase or single-phase boss: give rewards
      const bonusRelicId = currentBoss.reward.extraRelic ? getRandomRelics(1, game.relics)[0]?.id : undefined;
      setGold((g) => g + currentBoss.reward.gold);
      // Boss defeated celebration
      // Cinematic overlay shown on top of the BossRewardScreen
      setBossDefeatedOverlay(currentBoss);
      // Milestone: first boss defeated
      maybeCelebrateMilestone("first_boss_defeated");
        let updated = {
          ...claimed,
          stats: {
            ...claimed.stats,
            defeatedBossIds: [...(claimed.stats.defeatedBossIds ?? []), currentBoss.id],
            bossesDefeated: claimed.stats.bossesDefeated + 1,
            goldEarned: claimed.stats.goldEarned + currentBoss.reward.gold,
          },
        };
        if (currentBoss.reward.extraRelic) {
          const ids = bonusRelicId ? [bonusRelicId] : [];
          updated = {
            ...updated,
            relics: [...updated.relics, ...ids],
            stats: { ...updated.stats, relicsCollected: updated.stats.relicsCollected + ids.length },
          };
        }
      setGame({ ...updated, result: "boss_reward" });
      setBossRewardData({ boss: currentBoss, bonusRelicId });
      setBossPhase(0);
      setCurrentBoss(null);
      return;
    }

    openRewardRoute(claimed);
  }, [game, currentBoss, bossPhase, ownedMutationIds, isEliteRound, maybeCelebrateMilestone, character, currentQuest, talentBonuses.goldMultiplier, ownedCelestials]);

  const handleBossRewardContinue = useCallback(() => {
    if (game.result !== "boss_reward") return;
    setBossRewardData(null);
      // In map mode: act complete, generate new map for next act
      if (mapMode && runMap) {
        const nextAct = runMap.act + 1;
        setRunMap(generateRunMap(nextAct));
        setIsEliteRound(false);
        // Advance the round so the first node of the next act's map
        // starts fresh (empty chain, new hand, zero score, reset mutations).
        // Without this, the boss fight's state mirrored into the first
        // round of the new act via the isFirstVisit shortcut in
        // handleSelectMapNode.
        const next = startNextRound(
          game,
          modRef.current.targetMultiplier,
          modRef.current.handSize,
          modRef.current.actionBonus,
          talentBonuses.tilePreserve
        );
        setMutationStates((ms) => resetMutationUses(ms));
        setWildNextActive(false);
        setFreezeEndActive(false);
        setUndoSnapshot(null);
        setBossRageCount(0);
        setBossHeat(0);
        // Roll a narrative interlude for the act we just finished.
        // The interlude overlays the map_select state; its resolution
        // applies effects to run state before the player picks a node.
        const completedActId = getActForRound(game.round).id;
        const interlude = rollInterlude(completedActId);
        if (interlude) setPendingInterlude(interlude);
        setGame({ ...next, result: "map_select" });
        return;
      }

    openRewardRoute(game);
  }, [game, ownedMutationIds, mapMode, runMap, isEliteRound, talentBonuses.tilePreserve, ownedCelestials]);

  const handleEventContinue = useCallback(
    (effect?: Exclude<EventEffect, { type: "choice" }>) => {
      if (game.result !== "event") return;
      const updated = effect ? applyEventToRun(game, effect) : game;
      setCurrentEvent(null);
        // In map mode, event was a choice on the map → return to map selection
        if (mapMode) {
          setGame({ ...updated, result: "map_select" });
          return;
        }
      setRewardOptions(rollRewardOptions(updated));
      setGame({ ...updated, result: "reward" });
    },
    [game, ownedMutationIds, mapMode, isEliteRound, ownedCelestials]
  );

  const goToShopOrNextRound = useCallback((prev: GameState) => {
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

    // Dealing is independent of recording results.
    return advanceRound(prev);
  }, [advanceRound, mapMode]);

  const pendingReward = useRef<PendingReward | null>(resume?.pendingReward ?? null);
  const [rewardReceipt, setRewardReceipt] = useState<Receipt | null>(null);
  const dismissRewardReceipt = useCallback(() => setRewardReceipt(null), []);
  useEffect(() => {
    const pending = pendingReward.current;
    if (!pending) return;
    if (!rewardWasDelivered(pending, { relics:game.relics, tiles:game.runTiles, consumables:ownedConsumables, celestials:ownedCelestials, mutations:ownedMutationIds })) {
      if (game.result !== "reward" && mutationMode === null) pendingReward.current = null;
      return;
    }
    pendingReward.current = null;
    const r = pending.option.reward;
    setRewardReceipt({ key: Date.now(), name: r.type === "relic" ? localizeRelic(r.relic).name : pending.option.name,
      replaced: r.type === "consumable" && pending.before.consumables.length >= MAX_CONSUMABLE_SLOTS ? pending.before.consumables[0]?.name : undefined });
  }, [game.relics, game.runTiles, game.result, mutationMode, ownedConsumables, ownedCelestials, ownedMutationIds]);

  const handleSelectReward = useCallback((option: RewardOption) => {
    if (game.result !== "reward" || !rewardOptions.some(o => o.id === option.id) || pendingReward.current) return;
    pendingReward.current = { option, before: { relics:game.relics, tiles:game.runTiles, consumables:ownedConsumables, celestials:ownedCelestials, mutations:ownedMutationIds } };
    const reward = option.reward;

    if (reward.type === "relic") {
      // Celebrate new relic acquisition
      celebrateAchievement();
      audio.play("pattern_combo");
      pushReaction("big_score", translate("gb.toast.newRelic", { name: localizeRelic(reward.relic).name }));
      const updated = { ...game, relics: [...game.relics, reward.relic.id], stats: { ...game.stats, relicsCollected: game.stats.relicsCollected + 1 } };
      setRewardOptions([]);
      setGame(goToShopOrNextRound(updated));
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
      setRewardOptions([]);
      setGame(goToShopOrNextRound(game));
    } else if (reward.type === "consumable") {
      const c = getConsumable(reward.consumableId);
      if (c) {
        setOwnedConsumables((prev) => {
          // Slot cap: drop oldest if full
          const next = prev.length >= MAX_CONSUMABLE_SLOTS ? prev.slice(1) : prev;
          return [...next, c];
        });
      }
      setRewardOptions([]);
      setGame(goToShopOrNextRound(game));
    } else if (reward.type === "celestial") {
      const c = getCelestial(reward.celestialId);
      if (c) {
        setOwnedCelestials((prev) => [...prev, c]);
        discoverCelestial(c.id);
      }
      setRewardOptions([]);
      setGame(goToShopOrNextRound(game));
    }
  }, [goToShopOrNextRound, game, rewardOptions, ownedConsumables, ownedCelestials, ownedMutationIds]);

  const handleRemoveTile = useCallback((tile: Tile) => {
    setMutationMode(null);
    setRewardOptions([]);
    setGame(goToShopOrNextRound(removeRunTile(game, tile.id)));
  }, [goToShopOrNextRound, game]);

  const handleDuplicateTile = useCallback((tile: Tile) => {
    setMutationMode(null);
    setRewardOptions([]);
    setGame(goToShopOrNextRound(duplicateRunTile(game, tile)));
  }, [goToShopOrNextRound, game]);

  const handleConvertNumber = useCallback((tile: Tile, position: "top" | "bottom", newValue: number) => {
    setMutationMode(null);
    setRewardOptions([]);
    setGame(goToShopOrNextRound(editRunTile(game, tile.id, t => ({ ...t, [position]: newValue }))));
  }, [goToShopOrNextRound, game]);

  const handleCancelMutation = useCallback(() => {
    pendingReward.current = null;
    setMutationMode(null);
  }, []);

  const handleActivateMutation = useCallback((mutationId: string) => {
    const mutation = ALL_ACTIVE_MUTATIONS.find((m) => m.id === mutationId);
    if (!mutation) return;

    const stateIdx = mutationStates.findIndex((s) => s.mutationId === mutationId);
    if (stateIdx < 0) return;
    const state = mutationStates[stateIdx]!;
    if (!canUseMutation(mutation, state, game)) return;

    setUndoSnapshot(null);
    // Deduct cost
    let updated = { ...game };

      if (mutation.cost.type === "actions" && updated.actions) {
        updated = { ...updated, actions: { ...updated.actions, usedActions: updated.actions.usedActions + mutation.cost.amount } };
      }
      if (mutation.cost.type === "score") {
        updated = { ...updated, roundBonus: (updated.roundBonus ?? 0) - mutation.cost.amount };
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
        updated = { ...updated, roundBonus: (updated.roundBonus ?? 0) + eff.amount };
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

    setGame(resolveExhaustion({ ...updated, score: scoreGame(updated) }, activeBossRestriction, isEndless));

    // Decrement uses
    setMutationStates((prev) =>
      prev.map((s) => s.mutationId === mutationId ? { ...s, usesLeft: s.usesLeft - 1 } : s)
    );

    audio.play("pattern_activate");
  }, [mutationStates, game, scoreContext, activeBossRestriction, isEndless]);

  const handleSkipReward = useCallback(() => {
    if (game.result !== "reward") return;
    pendingReward.current = null;
    setRewardOptions([]);
    setGame(goToShopOrNextRound(game));
  }, [goToShopOrNextRound, game]);

  const handleBuyShopItem = useCallback((item: ShopItem) => {
    if (game.result !== "shop" || !shopItems.some((i) => i.id === item.id) || gold < item.cost) return false;
    const normal = game.runTiles.filter((t) => !t.type || t.type === "normal");
    const noEdition = game.runTiles.filter((t) => !t.edition);
    if ((item.type === "tile_upgrade" || item.type === "wild_tile") && normal.length === 0) return false;
    if (item.type === "forge_edition" && noEdition.length === 0) return false;
    if (item.type === "remove_tile" && game.runTiles.length <= 7) return false;
    if (item.type === "relic" && (!item.relic || game.relics.includes(item.relic.id))) return false;
    audio.play("shop_buy");
    setGold((g) => g - item.cost);
    // Choose random targets once, outside the React updater.
    const source = item.type === "forge_edition" ? noEdition : item.type === "remove_tile" ? game.runTiles : normal;
    const target = source[Math.floor(getGlobalRNG().next() * source.length)];
    const edition = item.type === "forge_edition" ? rollRandomEdition() : undefined;
    setGame((prev) => {
      let updated = prev;
      if (item.type === "relic" && item.relic && !prev.relics.includes(item.relic.id)) {
        updated = { ...prev, relics: [...prev.relics, item.relic.id], stats: { ...prev.stats, relicsCollected: prev.stats.relicsCollected + 1 } };
      } else if ((item.type === "tile_upgrade" || item.type === "wild_tile") && target) {
        updated = editRunTile(prev, target.id, (t) => ({ ...t, type: item.type === "tile_upgrade" ? "golden" : "wild" }));
      } else if (item.type === "remove_tile" && target) {
        updated = removeRunTile(prev, target.id);
      } else if (item.type === "heal") {
        updated = { ...prev, pendingRound: { ...prev.pendingRound, targetMultiplier: (prev.pendingRound?.targetMultiplier ?? 1) * 0.9 } };
      } else if (item.type === "extra_hand") {
        updated = { ...prev, pendingRound: { ...prev.pendingRound, hand: (prev.pendingRound?.hand ?? 0) + 1 } };
      } else if (item.type === "forge_edition" && target && edition) {
        updated = editRunTile(prev, target.id, (t) => ({ ...t, edition }));
      }
      return { ...updated, stats: { ...updated.stats, shopPurchases: updated.stats.shopPurchases + 1 } };
    });
    setShopItems((items) => items.filter((i) => i.id !== item.id));
    return true;
  }, [gold, game, shopItems]);

  const handleShopReroll = useCallback(() => {
    const cost = Math.round(getRerollCost(shopRerolls) * ascension.rerollCostMultiplier * (character.passive.type === "reroll_discount" ? 1 - character.passive.percent / 100 : 1));
    if (gold < cost) return;
    setGold((g) => g - cost);
    setShopRerolls((r) => r + 1);
    setShopItems(generateShopItems(game.relics, game.round, talentBonuses.relicDiscount, ascension.shopRelicCostMultiplier));
  }, [gold, shopRerolls, game.relics, game.round]);

  const handleLeaveShop = useCallback(() => {
    if (game.result !== "shop") return;
    setGame(mapMode ? { ...game, result: "map_select" } : advanceRound(game));
  }, [advanceRound, mapMode, game]);

  const handleSelectMapNode = useCallback((node: MapNode) => {
    if (!runMap || !getAvailableNodes(runMap).some((n) => n.id === node.id)) return;
    const newMap = visitNode(runMap, node.id);
    const isFirstVisit = runMap.visitedNodeIds.length === 0;
    setRunMap(newMap);
    if (node.type === "normal" || node.type === "elite" || node.type === "boss") {
      setCurrentQuest(pickRoundQuest(node.round));
    }

    switch (node.type) {
      case "normal": {
        setIsEliteRound(false);
        if (isFirstVisit) {
          const next = game.pendingRound ? startNextRound({ ...game, round: node.round - 1 }, modRef.current.targetMultiplier, modRef.current.handSize, modRef.current.actionBonus, talentBonuses.tilePreserve) : game;
          setGame({ ...next, result: "playing" });
        } else {
            const next = startNextRound({ ...game, round: node.round - 1 }, modRef.current.targetMultiplier, modRef.current.handSize, modRef.current.actionBonus, talentBonuses.tilePreserve);
            setMutationStates((ms) => resetMutationUses(ms));
            setWildNextActive(false);
            setFreezeEndActive(false);
            setRoundTransition({ round: next.round, isBoss: false });
            setGame({ ...next, result: "playing" });
        }
        break;
      }
      case "elite": {
        setIsEliteRound(true);
          const base = isFirstVisit ? game : startNextRound({ ...game, round: node.round - 1 }, modRef.current.targetMultiplier, modRef.current.handSize, modRef.current.actionBonus, talentBonuses.tilePreserve);
          const eliteTarget = Math.round(base.target * 1.35);
          if (!isFirstVisit) {
            setMutationStates((ms) => resetMutationUses(ms));
            setWildNextActive(false);
            setFreezeEndActive(false);
            setRoundTransition({ round: base.round, isBoss: false });
          }
          setGame({ ...base, target: eliteTarget, result: "playing" });
        break;
      }
      case "event": {
        const event = getRandomEvent(game.round, true);
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
          const base = isFirstVisit ? game : startNextRound({ ...game, round: node.round - 1 }, modRef.current.targetMultiplier, modRef.current.handSize, modRef.current.actionBonus, talentBonuses.tilePreserve);
          setCurrentBoss(bossToFight);
          setBossPhase(0);
          setMutationStates((ms) => resetMutationUses(ms));
          setWildNextActive(false);
          setFreezeEndActive(false);
          setRoundTransition({ round: bossRound, isBoss: true });
          setGame({
            ...base,
            round: bossRound,
            target: Math.round(base.target * (bossToFight.phases?.[0]?.targetMultiplier ?? bossToFight.targetMultiplier) * ascension.bossTargetMultiplier),
            result: "boss_intro",
          });
        break;
      }
    }
  }, [runMap, game, pendingTargetMultiplier]);

  const handleInterludeResolve = useCallback((choice: InterludeChoice) => {
    const eff = choice.outcome.effects;
    let updated = game;
    if (eff.gold) {
      setGold((g) => g + eff.gold!);
      updated = { ...updated, stats: { ...updated.stats, goldEarned: updated.stats.goldEarned + eff.gold } };
    }
    if (eff.randomRelic) {
      // Narrative relic grant: filter legendary pool if requested, otherwise random
        let pool = ALL_RELICS.filter((r) => !updated.relics.includes(r.id));
        if (eff.randomRelic === "legendary") pool = pool.filter((r) => r.rarity === "legendary");
        else if (eff.randomRelic === "rare") pool = pool.filter((r) => r.rarity === "rare");
        else if (eff.randomRelic === "common") pool = pool.filter((r) => r.rarity === "common");
        if (pool.length === 0) pool = ALL_RELICS.filter((r) => !updated.relics.includes(r.id));
        if (pool.length > 0) {
        const pick = pool[Math.floor(getGlobalRNG().next() * pool.length)]!;
        updated = {
          ...updated,
          relics: [...updated.relics, pick.id],
          stats: { ...updated.stats, relicsCollected: updated.stats.relicsCollected + 1 },
        };
        }
    }
    if (eff.randomConsumable) {
      const c = rollRandomConsumable();
      setOwnedConsumables((prev) => {
        const next = prev.length >= MAX_CONSUMABLE_SLOTS ? prev.slice(1) : prev;
        return [...next, c];
      });
    }
    if (eff.randomCelestial) {
      const c = rollRandomCelestial();
      if (c) setOwnedCelestials((prev) => [...prev, c]);
    }
    if (eff.trimPool && eff.trimPool > 0 && updated.tilePool.length > eff.trimPool + 4) {
      const toTrim = eff.trimPool;
        const next = [...updated.tilePool];
        for (let i = 0; i < toTrim; i++) {
          const idx = Math.floor(getGlobalRNG().next() * next.length);
          next.splice(idx, 1);
        }
        updated = { ...updated, tilePool: next, runTiles: updated.runTiles.filter((t) => !updated.tilePool.some((p) => p.id === t.id) || next.some((p) => p.id === t.id)) };
    }
    if (eff.nextTargetMultiplier && eff.nextTargetMultiplier !== 1) {
      updated = { ...updated, pendingRound: { ...updated.pendingRound, targetMultiplier: (updated.pendingRound?.targetMultiplier ?? 1) * eff.nextTargetMultiplier } };
    }
    if (eff.permanentFlatBonus && eff.permanentFlatBonus > 0) {
      setRunFlatBonusPerTile((v) => v + eff.permanentFlatBonus!);
    }
    setPendingInterlude(null);
    setGame(updated);
  }, [game]);

  const handleSanctuaryChoice = useCallback((choice: SanctuaryChoice) => {
    if (!sanctuaryCtx) return;
    const ctx = sanctuaryCtx;
    setSanctuaryCtx(null);
      let updated = { ...game };
      if (choice === "heal_actions" && updated.actions) {
        updated = {
          ...updated,
          pendingRound: { ...updated.pendingRound, actions: (updated.pendingRound?.actions ?? 0) + ctx.actions },
        };
      } else if (choice === "gold") {
        setGold((g) => g + ctx.gold);
        updated = { ...updated, stats: { ...updated.stats, goldEarned: updated.stats.goldEarned + ctx.gold } };
      } else if (choice === "remove_tile") {
        if (updated.tilePool.length > 7) {
          const idx = Math.floor(getGlobalRNG().next() * updated.tilePool.length);
          updated = removeRunTile(updated, updated.tilePool[idx]!.id);
        }
      }
      setGame({ ...updated, result: "map_select" });
  }, [sanctuaryCtx, game]);

  const handleTutorialNext = useCallback(() => {
    markTutorialComplete();
    setTutorialStep(-1);
  }, []);

  const handleTutorialSkip = useCallback(() => {
    markTutorialComplete();
    setTutorialStep(-1);
  }, []);

  const handleStartBoss = useCallback(() => {
    setGame((prev) => ({ ...prev, result: "playing" }));
  }, []);

  const [checkpointReady, setCheckpointReady] = useState(false);
  const [checkpointFailed, setCheckpointFailed] = useState(false);
  const checkpointRound = useRef<number | null>(game.round);
  useEffect(() => { setCheckpointReady(true); }, []);
  const checkpointValues = { game, runMap, isEliteRound, sanctuaryCtx, rewardOptions, mutationMode, currentEvent, tutorialStep, gold, shopItems, shopRerolls, currentBoss, bossPhase, bossRewardData, activeSkin, currentQuest, pendingInterlude, runFlatBonusPerTile, ownedMutationIds, mutationStates, wildNextActive, freezeEndActive, doubleNextScoreActive, ownedConsumables, ownedCelestials, bossHeat, bossRageCount, chaosTwist, undoSnapshot, undoUsesLeft, roundPatternLog };
  const captureCheckpoint = (): RunCheckpoint => ({
    ruleset: RUN_RULESET, savedAt: Date.now(), mode: isWeekly ? "weekly" : isDaily ? "daily" : isEndless ? "endless" : "playing",
    characterId, modifierIds, modifierConfig, modifiers: modRef.current, runtime, seed: runSeed,
    rng: getGlobalRNG().snapshot(), handSize: initResult.handSize, states: checkpointValues,
    claimedRound: claimedRoundRef.current, celebratedChallenges: [...celebratedChallengesRef.current], pendingReward: pendingReward.current,
  });
  const latestCapture = useRef(captureCheckpoint);
  latestCapture.current = captureCheckpoint;
  useEffect(() => {
    if (!onCheckpoint || !checkpointReady) return;
    if (checkpointRound.current !== game.round) { checkpointRound.current = game.round; return; }
    const timer = setTimeout(() => { if (!finishedRef.current) setCheckpointFailed(!onCheckpoint(latestCapture.current())); }, 150);
    return () => clearTimeout(timer);
  }, [onCheckpoint, checkpointReady, game, runMap, isEliteRound, sanctuaryCtx, rewardOptions, mutationMode, currentEvent, tutorialStep, gold, shopItems, shopRerolls, currentBoss, bossPhase, bossRewardData, activeSkin, currentQuest, pendingInterlude, runFlatBonusPerTile, ownedMutationIds, mutationStates, wildNextActive, freezeEndActive, doubleNextScoreActive, ownedConsumables, ownedCelestials, bossHeat, bossRageCount, chaosTwist, undoSnapshot, undoUsesLeft, roundPatternLog]);
  useEffect(() => {
    if (!onCheckpoint || !checkpointReady) return;
    const flush = () => { if (!finishedRef.current) setCheckpointFailed(!onCheckpoint(latestCapture.current())); };
    const hidden = () => { if (document.visibilityState === "hidden") flush(); };
    const beforeReload = (event: Event) => {
      if (!finishedRef.current && !onCheckpoint(latestCapture.current())) {
        event.preventDefault();
        setCheckpointFailed(true);
      }
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener(SAVE_BEFORE_RELOAD_EVENT, beforeReload);
    document.addEventListener("visibilitychange", hidden);
    return () => { window.removeEventListener("pagehide", flush); window.removeEventListener(SAVE_BEFORE_RELOAD_EVENT, beforeReload); document.removeEventListener("visibilitychange", hidden); };
  }, [onCheckpoint, checkpointReady]);
  const saveAndExit = () => { if (onCheckpoint?.(captureCheckpoint())) onSaveExit?.(); else setCheckpointFailed(true); };

  const receiptElement = <><RewardReceipt receipt={rewardReceipt} onDismiss={dismissRewardReceipt} />
    {(seedCopy.status === "copied" || seedCopy.status === "error") && <SystemNotice><p role="status" className="pointer-events-auto w-full rounded-xl border border-surface-600 bg-surface-900 p-4 text-sm text-accent-silver">{translate(seedCopy.status === "copied" ? "copy.seedCopied" : "copy.seedFailed", { seed: seedToString(runSeed) })}</p></SystemNotice>}
    {checkpointFailed && <SystemNotice><p role="alert" className="pointer-events-auto w-full rounded-xl border border-red-400/40 bg-surface-900 p-4 text-sm text-red-200">{translate("resume.saveFailed")}</p></SystemNotice>}
  </>;
  const scoreBreakdown = calculateRunScore(game, scoreContext).breakdown;

  if (mutationMode === "remove") {
    return (
      <>{receiptElement}<TileSelector
        tiles={game.runTiles}
        title={translate("tileSelector.removeTitle")}
        subtitle={translate("tileSelector.removeSubtitle")}
        onSelect={handleRemoveTile}
        onCancel={handleCancelMutation}
      /></>
    );
  }

  if (mutationMode === "duplicate") {
    return (
      <>{receiptElement}<TileSelector
        tiles={game.runTiles}
        title={translate("tileSelector.duplicateTitle")}
        subtitle={translate("tileSelector.duplicateSubtitle")}
        onSelect={handleDuplicateTile}
        onCancel={handleCancelMutation}
      /></>
    );
  }

  if (mutationMode === "convert") {
    return (
      <>{receiptElement}<NumberConverter
        tiles={game.runTiles}
        onConvert={handleConvertNumber}
        onCancel={handleCancelMutation}
      /></>
    );
  }

  if (game.result === "map_select" && runMap) {
    return (
      <>
        {receiptElement}
        <RunMapScreen
          map={runMap}
          onSelectNode={handleSelectMapNode}
          gold={gold}
          round={game.round}
        />
        <AnimatePresence>
          {pendingInterlude && (
            <InterludeScreen
              interlude={pendingInterlude}
              onResolve={handleInterludeResolve}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  if (game.result === "sanctuary" && sanctuaryCtx) {
    return (
      <>{receiptElement}<SanctuaryScreen
        onSelect={handleSanctuaryChoice}
        goldReward={sanctuaryCtx.gold}
        extraActions={sanctuaryCtx.actions}
      /></>
    );
  }

  if (game.result === "boss_reward" && bossRewardData) {
    return (
      <>
        {receiptElement}
        <BossRewardScreen
          boss={bossRewardData.boss}
          bonusRelicId={bossRewardData.bonusRelicId}
          onContinue={handleBossRewardContinue}
        />
        <BossDefeatedOverlay
          boss={bossDefeatedOverlay}
          visible={!!bossDefeatedOverlay}
          onContinue={() => setBossDefeatedOverlay(null)}
        />
      </>
    );
  }

  if (game.result === "boss_intro" && currentBoss) {
    return (
      <>{receiptElement}<BossIntro
        boss={currentBoss}
        round={game.round}
        onStart={handleStartBoss}
      /></>
    );
  }

  if (game.result === "event" && currentEvent) {
    return (
      <>{receiptElement}<EventScreen
        event={currentEvent}
        onContinue={handleEventContinue}
      /></>
    );
  }

  if (game.result === "shop") {
    return (
      <>{receiptElement}<ShopScreen
        items={shopItems}
        gold={gold}
        onBuy={handleBuyShopItem}
        onSkip={handleLeaveShop}
        rerollCost={Math.round(getRerollCost(shopRerolls) * ascension.rerollCostMultiplier * (character.passive.type === "reroll_discount" ? 1 - character.passive.percent / 100 : 1))}
        onReroll={handleShopReroll}
      /></>
    );
  }

  if (game.result === "reward") {
    return (
      <>{receiptElement}<RewardScreen
        options={rewardOptions}
        ownedRelicIds={game.relics}
        replacedConsumableName={ownedConsumables.length >= MAX_CONSUMABLE_SLOTS ? ownedConsumables[0]?.name : undefined}
        onSelect={handleSelectReward}
        onSkip={handleSkipReward}
      /></>
    );
  }

  const modifiedTotal = game.score;
  const hasNextBossPhase = !!currentBoss?.phases && bossPhase < currentBoss.phases.length - 1;
  const scoreRevealExtras = {
    runAdjustment: game.score - scoreBreakdown.total,
  };
  const previewScoreFor = (tile: Tile, preferredSide?: PlacementSide): number | null => {
    if (game.result !== "playing") return null;
    const sides = legalSides(tile);
    if (sides.length === 0) return null;
    const side = preferredSide ?? (sides.includes("right") ? "right" : sides[0]!);
    if (!sides.includes(side)) return null;
    return playRoundTile(game, tile, side, scoreContext, {
      wild: wildNextActive, freeze: freezeEndActive, double: doubleNextScoreActive,
      restriction: activeBossRestriction, endless: isEndless, boss: !!currentBoss,
    }).score - game.score;
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
      ref={boardRef}
      animate={!reducedMotion && shakeTrigger > 0 ? shakeAnim : undefined}
      transition={{ duration: shakeIntensity === "large" ? 0.5 : shakeIntensity === "medium" ? 0.35 : 0.22 }}
      className="flex flex-col items-center gap-3 md:gap-6 w-full max-w-3xl mx-auto px-3 md:px-4 py-3 md:py-8 pb-[env(safe-area-inset-bottom,0px)] min-h-screen relative ambient-grain tactical-board"
    >
      {receiptElement}
      {/* Pattern activity log (floating, desktop only) */}
      {game.result === "playing" && <PatternLog entries={roundPatternLog} />}

      {/* Round transition overlay */}
      {roundTransition && !pendingActTransition && (
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
            <span className="text-[9px] uppercase tracking-widest text-accent-silver/40 font-bold">{translate("gb.questLabel")}</span>
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

      {/* Legacy nonnegative tutorial indexes open the isolated practice safely. */}
      {tutorialStep >= 0 && game.result === "playing" && !pendingActTransition && !roundTransition && (
        <TutorialOverlay onComplete={handleTutorialNext} onSkip={handleTutorialSkip}/>
      )}

      {/* Cinematic act transition */}
      <ActTransition
        act={pendingActTransition}
        onDismiss={() => setPendingActTransition(null)}
      />

      {/* Ceremonial milestone toast (first-time achievements in-run) */}
      <MilestoneToast
        title={milestoneToast?.title ?? null}
        subtitle={milestoneToast?.subtitle ?? null}
        onDismiss={() => setMilestoneToast(null)}
      />

      {/* Lightweight character-challenge toast (lower-right) */}
      <ChallengeToast
        title={challengeToast?.title ?? null}
        description={challengeToast?.description ?? null}
        xp={challengeToast?.xpReward ?? null}
        onDismiss={() => setChallengeToast(null)}
      />

      {onSaveExit && <div className="flex items-center gap-3 w-full justify-end">
        <button type="button" className="min-h-11 px-3 text-xs text-accent-silver border border-surface-600 rounded-lg" onClick={saveAndExit}>{translate("resume.saveExit")}</button>
      </div>}
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 w-full min-w-0">
        <h1 className="font-display font-black text-xl tracking-tight bg-gradient-to-b from-white via-white/80 to-accent-silver/40 bg-clip-text text-transparent">
          DOMINIX
        </h1>
        <motion.span
          key={currentAct.id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden sm:flex flex-col leading-tight"
          title={`${translate(`act.${currentAct.id}.name`)} — ${translate(`act.${currentAct.id}.tagline`)}`}
        >
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-accent-silver/40">
            {translate(`act.${currentAct.id}.numeral`)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent-silver/70">
            {translate(`act.${currentAct.id}.name`)}
          </span>
        </motion.span>
        {isDaily && (
          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-widest">
            {translate("home.daily")}
          </span>
        )}
        {isEndless && (
          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold uppercase tracking-widest">
            Endless
          </span>
        )}
        {isWeekly && (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
            {translate("board.weekly")}
          </span>
        )}
        {modRef.current.scoreMultiplier !== 1 && (
          <span className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-bold font-mono">
            x{modRef.current.scoreMultiplier}
          </span>
        )}
        {currentBoss && (
          <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-widest animate-pulse">
            {translate("boss.label")}
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
          onClick={() => { void seedCopy.copy(seedToString(runSeed)); }}
          disabled={seedCopy.status === "copying"}
          title={translate("board.seedCopy", { seed: seedToString(runSeed) })}
          aria-label={translate("board.seedCopy", { seed: seedToString(runSeed) })}
          className="hidden xs:block px-2 py-0.5 rounded-md text-[10px] font-mono text-accent-silver/75 hover:text-accent-silver transition-colors truncate max-w-[80px]"
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

      {/* Relics — desktop only (mobile uses MobileInfoBar) */}
      <div className="hidden sm:contents">
        <RelicBar
          relicIds={game.relics}
          pulseKey={relicPulseKey}
          highlightIds={relicPulseHighlights}
        />
      </div>

      {/* Mobile compact panels */}
      {game.result === "playing" && (
        <MobileInfoBar
          relicIds={game.relics}
          consumables={ownedConsumables}
          celestials={ownedCelestials}
          mutationStates={mutationStates}
          game={game}
          onUseConsumable={handleUseConsumable}
          onActivateMutation={handleActivateMutation}
          consumableFlashId={consumableFlashId}
        />
      )}

      {game.result === "playing" && (game.roundWinBonus ?? 0) > 0 && <p className="text-xs text-amber-200">{translate("board.winBonus", { n: game.roundWinBonus! })}</p>}
      {game.result === "playing" && (game.roundScoreFactor ?? 1) !== 1 && <p className="text-xs text-amber-200">{translate("board.scoreFactor", { n: game.roundScoreFactor! })}</p>}
      {/* Score */}
      <div
        className={["relative w-full", aberrationKey > 0 ? "chromatic-aberration" : ""].join(" ")}
      >
        <ScoreBar score={modifiedTotal} target={game.target} round={game.round} referenceOnly={isEndless} chainLength={game.chain.placed.length} />
        <ScorePopup score={modifiedTotal} />
        {(runFlatBonusPerTile > 0 || pendingTargetMultiplier !== 1) && (
          <div className="mt-1 flex justify-center">
            <RunModifiersBadge
              flatBonusPerTile={runFlatBonusPerTile}
              pendingTargetMultiplier={pendingTargetMultiplier}
            />
          </div>
        )}
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
        <ScoreSummary breakdown={scoreBreakdown} patternBonus={modRef.current.patternBonus} scoreMultiplier={modRef.current.scoreMultiplier} />
      )}

      {/* Boss restriction indicator */}
      {activeBossRestriction && game.result === "playing" && currentBoss && (() => {
        const r = activeBossRestriction;
        const phaseLabel = currentBoss.phases ? translate("gb.phase", { n: bossPhase + 1, total: currentBoss.phases.length }) : null;

        type RuleInfo = { icon: React.ReactNode; label: string; detail?: string; progress?: { current: number; max: number }; isRequirement?: boolean };
        const chainLen = game.chain.placed.length;
        const patternsNow = scoreBreakdown.patternAnalysis.patterns.length;

        const ruleInfo: RuleInfo = (() => {
          switch (r.type) {
            case "no_doubles": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="12" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
              label: translate("gb.r.no_doubles.label"),
              detail: translate("gb.r.no_doubles.detail"),
            };
            case "only_doubles": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="12" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/></svg>,
              label: translate("gb.r.only_doubles.label"),
              detail: translate("gb.r.only_doubles.detail"),
            };
            case "no_wild": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-2.5L7 19l1-6-4-4 5.5-.5z" stroke="currentColor" strokeWidth="1.6"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
              label: translate("gb.r.no_wild.label"),
              detail: translate("gb.r.no_wild.detail"),
            };
            case "max_tiles": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 8V6M16 8V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              label: translate("gb.r.max_tiles.label", { n: r.count }),
              detail: translate("gb.r.max_tiles.detail"),
              progress: { current: chainLen, max: r.count },
            };
            case "min_patterns": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5"/><circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="M12 5v2M12 17v2M5 12h2M17 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              label: translate("gb.r.min_patterns.label", { n: r.count }),
              detail: translate("gb.r.min_patterns.detail"),
              progress: { current: patternsNow, max: r.count },
              isRequirement: true,
            };
            case "min_chain_length": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12h4m4 0h4m4 0h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="4" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="20" cy="12" r="2" fill="currentColor"/></svg>,
              label: translate("gb.r.min_chain_length.label", { n: r.count }),
              detail: translate("gb.r.min_chain_length.detail"),
              progress: { current: chainLen, max: r.count },
              isRequirement: true,
            };
            case "only_low": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              label: translate("gb.r.only_low.label", { n: r.max }),
              detail: translate("gb.r.only_low.detail"),
            };
            case "no_repeat_number": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 8h4v8H4zM16 8h4v8h-4z" stroke="currentColor" strokeWidth="1.6"/><path d="M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 2"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
              label: translate("gb.r.no_repeat_number.label"),
              detail: translate("gb.r.no_repeat_number.detail"),
            };
            case "max_doubles": {
              const doublesUsed = game.chain.placed.filter((p) => p.tile.top === p.tile.bottom).length;
              return {
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="12" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M3 19l18-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/></svg>,
                label: translate("gb.r.max_doubles.label", { n: r.count }),
                detail: translate("gb.r.max_doubles.detail"),
                progress: { current: doublesUsed, max: r.count },
              };
            }
            case "even_sum_only": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 12h12M8 16h8M8 8h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
              label: translate("gb.r.even_sum_only.label"),
              detail: translate("gb.r.even_sum_only.detail"),
            };
            case "exact_chain_length": return {
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="4" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="20" cy="12" r="2" fill="currentColor"/><path d="M6 12h4m4 0h4" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="5" r="1.2" fill="currentColor" opacity="0.7"/><circle cx="12" cy="19" r="1.2" fill="currentColor" opacity="0.7"/></svg>,
              label: translate("gb.r.exact_chain_length.label", { n: r.count }),
              detail: translate("gb.r.exact_chain_length.detail"),
              progress: { current: chainLen, max: r.count },
              isRequirement: true,
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
                <div className="text-[9px] text-red-400/40 uppercase tracking-widest">{translate("boss.label")}</div>
                <div className="text-[10px] text-red-300/70 font-bold truncate max-w-[80px]">{localizeBoss(currentBoss).name}</div>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Chaos twist banner */}
      {chaosTwist && game.result === "playing" && (
        <motion.div
          key={`chaos-${game.round}`}
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className={`w-full max-w-lg mx-auto px-4 py-1.5 rounded-xl border flex items-center gap-3 ${
            chaosTwist.tone === "good" ? "bg-green-500/15 border-green-400/40 text-green-200" :
            chaosTwist.tone === "bad" ? "bg-red-500/15 border-red-400/40 text-red-200" :
            "bg-violet-500/15 border-violet-400/40 text-violet-200"
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="opacity-70 shrink-0">
            <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-2.5L7 19l1-6-4-4 5.5-.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{translate("chaos.eyebrow", { n: game.round })}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider truncate">{chaosTwist.name}</span>
              <span className="text-[9px] opacity-70 truncate">{chaosTwist.description}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Boss Heat bar */}
      {currentBoss && game.result === "playing" && (
        <motion.div
          key={`heat-rage-${bossRageFlash}`}
          initial={{ opacity: 0, y: -6 }}
          animate={bossRageFlash > 0 ? { opacity: 1, y: 0, scale: [1, 1.04, 1] } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg mx-auto px-4 py-1.5 rounded-xl bg-red-900/30 border border-red-500/25 flex items-center gap-3"
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-red-400">
              <path d="M12 3c2 4 3 6 3 9a3 3 0 0 1-6 0c0-3 1-5 3-9z M12 14a3 3 0 0 0 0 6 3 3 0 0 0 0-6z" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.3" />
            </svg>
            <span className="text-[9px] font-bold uppercase tracking-widest text-red-300">{translate("boss.heatLabel")}</span>
          </div>
          <div className="flex-1 h-1.5 bg-surface-700/60 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${bossHeat}%` }}
              transition={{ duration: 0.25 }}
              style={{
                background: bossHeat > 75
                  ? "linear-gradient(90deg, #ef4444, #f87171)"
                  : "linear-gradient(90deg, #b91c1c, #ef4444)",
                boxShadow: bossHeat > 75 ? "0 0 8px rgba(239,68,68,0.6)" : undefined,
              }}
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-red-300/80 tabular-nums shrink-0">
            {bossHeat}%
          </span>
          {bossRageCount > 0 && (
            <span className="text-[9px] font-bold text-amber-300/90 uppercase tracking-widest shrink-0">
              {translate("boss.rageMeta", { n: bossRageCount * 10 })}
            </span>
          )}
        </motion.div>
      )}

      {/* Chain area */}
      <div className="relative w-full rounded-2xl border border-surface-600/40 chain-surface p-4 sm:p-5 min-h-[8rem] sm:min-h-[10rem] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,168,83,0.04)_0%,_transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-surface-600/20 to-transparent" />
        <div className="table-heading">
          <span className="table-end">{translate("board.leftEnd")}<strong>{game.chain.leftEnd ?? "—"}</strong></span>
          <span>{translate("board.table")}</span>
          <span className="table-end"><strong>{game.chain.rightEnd ?? "—"}</strong>{translate("board.rightEnd")}</span>
        </div>
        <Chain chain={game.chain} skin={activeSkin} patternFlash={patternFlash} />
        <ChainParticles tileCount={game.chain.placed.length} enabled={game.result === "playing"} />
      </div>

      {/* Result overlay */}
      {game.result === "win" && (
        <motion.div data-round-outcome="win"
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center gap-5 py-8 px-6 rounded-2xl bg-green-500/[0.04] border border-green-500/20 w-full"
        >
          <ParticleEffect trigger={resumedOutcome ? 0 : game.round} color="#4ade80" count={presentationSettings.fastAnimations ? 4 : 8} />
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,_rgba(74,222,128,0.06)_0%,_transparent_70%)] pointer-events-none" />
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <span data-outcome-title tabIndex={-1} className="font-display font-black text-4xl tracking-tight bg-gradient-to-b from-green-200 via-green-400 to-green-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(74,222,128,0.3)]">
              {hasNextBossPhase ? translate("outcome.phaseCleared") : currentBoss ? translate("outcome.bossDefeated") : translate("outcome.roundCleared")}
            </span>
          </motion.div>
          <ScoreReveal breakdown={scoreBreakdown} finalScore={modifiedTotal} target={game.target} won={true} extras={scoreRevealExtras} referenceOnly={isEndless} />
          {(game.phaseScore ?? 0) > 0 && <p className="text-xs text-accent-silver/70">{translate("outcome.encounterScore", { n: game.score + (game.phaseScore ?? 0) })}</p>}
          {!hasNextBossPhase && <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-gold/10 border border-accent-gold/20">
              <div className="w-2 h-2 rounded-full bg-accent-gold/70" />
              <span className="font-mono font-bold text-sm text-accent-gold">+{getRoundPayout(game, computeGoldMultiplier(character) * talentBonuses.goldMultiplier, currentQuest).gold}</span>
            </div>
            {currentBoss && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <span className="font-mono font-bold text-sm text-red-400">{translate("outcome.bossBonus", { n: currentBoss.reward.gold })}</span>
              </div>
            )}
            {currentBoss?.reward.extraRelic && (
              <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <span className="font-mono font-bold text-sm text-purple-400">{translate("outcome.bossExtraRelic")}</span>
              </div>
            )}
          </motion.div>}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <motion.button
              whileHover={reducedMotion ? undefined : { scale: 1.02 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              onClick={handleClaimReward}
              className="px-10 py-3 rounded-2xl bg-gradient-to-b from-accent-gold to-amber-600 text-surface-900 font-bold text-sm tracking-wide btn-premium"
            >
              {translate(hasNextBossPhase ? "outcome.nextPhase" : "outcome.claimReward")}
            </motion.button>
            {isEndless && !currentBoss && (
              <motion.button
                whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                onClick={() => {
                  const finalStats = recordRound(game, true).stats;
                  finishRun(finalStats, game.relics, game.round, isChallenge ? undefined : { celestials: ownedCelestials, consumables: ownedConsumables, finalRound: game.stats.roundsCompleted, totalScore: finalStats.totalScore });
                }}
                className="px-6 py-3 rounded-2xl border border-accent-silver/20 text-accent-silver/60 font-bold text-sm tracking-wide hover:border-accent-silver/30 transition-all"
              >
                {translate("board.endRun")}
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}

      {game.result === "lose" && (
        <motion.div data-round-outcome="lose"
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col items-center gap-5 py-8 px-6 rounded-2xl bg-red-500/[0.04] border border-red-500/20 w-full"
        >
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,_rgba(239,68,68,0.05)_0%,_transparent_70%)] pointer-events-none" />
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <span data-outcome-title tabIndex={-1} className="font-display font-black text-4xl tracking-tight bg-gradient-to-b from-red-200 via-red-400 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              {translate("outcome.runEnded")}
            </span>
          </motion.div>
          <ScoreReveal breakdown={scoreBreakdown} finalScore={modifiedTotal} target={game.target} won={false} extras={scoreRevealExtras} referenceOnly={isEndless} />
          <motion.button
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0 }}
            whileHover={reducedMotion ? undefined : { scale: 1.02 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            onClick={() => {
              const finalStats = recordRound(game, false).stats;
              finishRun(finalStats, game.relics, game.round, isChallenge ? undefined : { celestials: ownedCelestials, consumables: ownedConsumables, finalRound: game.stats.roundsCompleted, totalScore: finalStats.totalScore });
            }}
            className="px-10 py-3 rounded-2xl bg-gradient-to-b from-red-500 to-red-700 text-white font-bold text-sm tracking-wide btn-premium"
          >
            {translate("board.results")}
          </motion.button>
        </motion.div>
      )}

      <>
      {/* End chain button */}
      {game.result === "playing" && (!isEndless || game.chain.placed.length > 0) && (
        <motion.button
          onClick={handleEndChain}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto px-8 py-3 sm:py-2.5 rounded-xl border border-accent-silver/35 bg-surface-800/80 text-accent-silver font-medium text-sm tracking-wide hover:border-accent-gold/30 hover:text-accent-gold/80 transition-all backdrop-blur-sm"
        >
          {translate("board.closeChain")}
        </motion.button>
      )}

      {/* Actions bar */}
      {game.result === "playing" && game.actions && (
        <div className="tactical-actions flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full max-w-md">
          <ActionHUD actions={game.actions} poolSize={game.tilePool.length} />
          {canDraw(game.actions) && game.tilePool.length > 0 && (
            <motion.button
              onClick={handleDraw}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="min-h-11 px-3.5 py-1.5 rounded-lg border border-blue-500/25 bg-blue-500/10 text-blue-300 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/20 hover:border-blue-400/40 transition-all"
            >
              {translate("board.draw", { n: game.actions.maxDraws - game.actions.usedDraws })}
            </motion.button>
          )}
          {undoSnapshot && undoUsesLeft > 0 && (
            <motion.button
              onClick={handleUndo}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="min-h-11 px-3.5 py-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-300 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500/20 hover:border-amber-400/40 transition-all"
              title={translate("gb.undoTitle")}
            >
              {translate("gb.undo")}
            </motion.button>
          )}
        </div>
      )}

      </>
      <ActionFeedback cue={actionCue}/>
      {/* Consumables bar — desktop only */}
      {game.result === "playing" && (
        <ConsumableBar
          className="hidden sm:flex"
          consumables={ownedConsumables}
          onUse={handleUseConsumable}
          flashId={consumableFlashId}
        />
      )}

      {/* Celestial cards bar — desktop only */}
      {game.result === "playing" && (
        <div className="hidden sm:contents">
          <CelestialBar cards={ownedCelestials} />
        </div>
      )}

      {/* Active mutations bar — desktop only */}
      {mutationStates.length > 0 && game.result === "playing" && (
        <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 w-full">
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
      {game.result === "playing" && game.hand.every((tile) => legalSides(tile).length === 0) && (
        <p role="status" className="text-xs text-amber-100/80 text-center">{translate("board.noMoves")}</p>
      )}
      <Hand
        getPlacements={legalSides}
        tiles={game.hand}
        chain={game.chain}
        onPlay={handlePlay}
        disabled={game.result !== "playing"}
        skin={activeSkin}
        onDiscard={handleDiscard}
        actionCue={actionCue}
        canDiscard={!!(game.actions && canDiscard(game.actions))}
        getScoreExplanation={(tile, side) => explainTileScore(game, tile, scoreContext, {
          wild: wildNextActive, freeze: freezeEndActive, double: doubleNextScoreActive,
          restriction: activeBossRestriction, endless: isEndless, boss: !!currentBoss,
        }, side)}
        getScorePreview={previewScoreFor}
      />
    </motion.div>
  );
}

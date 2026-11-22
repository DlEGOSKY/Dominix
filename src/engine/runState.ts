import type { GameState, Tile } from "@/types/domino";
import { createEmptyChain } from "./chain";
import { createActionState, getRelicHandBonus } from "./actions";
import { addSpecialTiles, shuffle } from "./tiles";
import { getTarget } from "./round";
import { calculateScore } from "./score";

/** Permanent edits also update unplayed copies; the scored chain remains a snapshot. */
export function editRunTile(game: GameState, id: string, edit: (tile: Tile) => Tile): GameState {
  const update = (tiles: Tile[]) => tiles.map((tile) => tile.id === id ? edit(tile) : tile);
  return { ...game, runTiles: update(game.runTiles), hand: update(game.hand), tilePool: update(game.tilePool) };
}

export function removeRunTile(game: GameState, id: string): GameState {
  const remove = (tiles: Tile[]) => tiles.filter((tile) => tile.id !== id);
  return { ...game, runTiles: remove(game.runTiles), hand: remove(game.hand), tilePool: remove(game.tilePool) };
}

export function duplicateRunTile(game: GameState, tile: Tile): GameState {
  let index = 1;
  while (game.runTiles.some((t) => t.id === `${tile.id}-copy-${index}`)) index++;
  const duplicate = { ...tile, id: `${tile.id}-copy-${index}` };
  return { ...game, runTiles: [...game.runTiles, duplicate], tilePool: [...game.tilePool, duplicate] };
}

/** Dealing never records results. Each round is settled separately, exactly once. */
export function startNextRound(
  prev: GameState,
  targetMultiplier = 1,
  handSize = 7,
  actionBonus = 0,
  preserveCount = 0,
): GameState {
  const round = prev.round + 1;
  const pending = prev.pendingRound ?? {};
  const preserved = shuffle(prev.hand)
    .filter((tile) => prev.runTiles.some((t) => t.id === tile.id))
    .slice(0, preserveCount)
    .map((tile) => prev.runTiles.find((t) => t.id === tile.id)!);
  const preservedIds = new Set(preserved.map((t) => t.id));
  // Specials are round-local. Protected permanent upgrades are never overwritten.
  const candidates = shuffle(prev.runTiles.filter((t) => !preservedIds.has(t.id)));
  const specials = addSpecialTiles(candidates, round);
  const pool = specials.map((tile, index) => {
    const original = candidates[index]!;
    return (original.type && original.type !== "normal") || original.edition || original.pact ? original : tile;
  });
  const needed = Math.max(0, handSize + getRelicHandBonus(prev.relics) + (pending.hand ?? 0) - preserved.length);
  const actions = createActionState(round, prev.relics, actionBonus);
  actions.maxActions = Math.max(1, actions.maxActions + (pending.actions ?? 0));
  actions.maxDiscards = Math.max(0, actions.maxDiscards + (pending.discards ?? 0));
  actions.maxDraws = Math.max(0, actions.maxDraws + (pending.draws ?? 0));
  return {
    ...prev,
    hand: [...preserved, ...pool.slice(0, needed)],
    tilePool: pool.slice(needed),
    chain: createEmptyChain(), score: Math.max(0, pending.score ?? 0), roundBonus: pending.score ?? 0, roundSettled: false,
    round, target: Math.round(getTarget(round) * targetMultiplier * (pending.targetMultiplier ?? 1)), result: "playing",
    actions, pendingRound: undefined, bossRages: 0, phaseScore: 0, phasePatternIds: [],
    roundStartResources: { handSize: needed + preserved.length, actions: actions.maxActions, discards: actions.maxDiscards, draws: actions.maxDraws },
    roundWinBonus: pending.winBonus ?? 0, roundScoreFactor: pending.scoreFactor ?? 1,
    roundTargetMultiplier: pending.targetMultiplier ?? 1,
  };
}

/** A phase is the same combat: keep its starting budgets and score ledger. */
export function startBossPhase(prev: GameState, target: number, handSize = 7, actionBonus = 0): GameState {
  const pool = shuffle(prev.runTiles);
  const budget = prev.roundStartResources;
  const size = budget?.handSize ?? handSize + getRelicHandBonus(prev.relics);
  const actions = createActionState(prev.round, prev.relics, actionBonus);
  if (budget) {
    actions.maxActions = budget.actions;
    actions.maxDiscards = budget.discards;
    actions.maxDraws = budget.draws;
  }
  return {
    ...prev, target: Math.round(target * (prev.roundTargetMultiplier ?? 1)), bossRages: 0,
    phaseScore: (prev.phaseScore ?? 0) + prev.score,
    phasePatternIds: [...(prev.phasePatternIds ?? []), ...calculateScore(prev.chain).patternAnalysis.patterns.map((p) => p.id)],
    chain: createEmptyChain(), hand: pool.slice(0, size), tilePool: pool.slice(size),
    score: 0, roundBonus: 0, roundWinBonus: 0, result: "playing", actions,
  };
}

/** Score was frozen by the action that closed the round, before any reward. */
export function recordRound(game: GameState, won = game.result === "win"): GameState {
  if (game.roundSettled) return game;
  const patterns = calculateScore(game.chain).patternAnalysis.patterns;
  const patternIds = [...(game.phasePatternIds ?? []), ...patterns.map((p) => p.id)];
  const score = game.score + (game.phaseScore ?? 0);
  const patternBreakdown = { ...game.stats.patternBreakdown };
  for (const id of patternIds) patternBreakdown[id] = (patternBreakdown[id] ?? 0) + 1;
  return {
    ...game, roundSettled: true,
    stats: {
      ...game.stats,
      roundsCompleted: game.stats.roundsCompleted + (won ? 1 : 0),
      totalScore: game.stats.totalScore + score,
      patternsActivated: game.stats.patternsActivated + patternIds.length,
      patternBreakdown,
      highestRoundScore: Math.max(game.stats.highestRoundScore, score),
      roundScores: [...game.stats.roundScores, score],
      roundNumbers: [...(game.stats.roundNumbers ?? game.stats.roundScores.map((_, i) => i + 1)), game.round],
    },
  };
}

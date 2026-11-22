import type { GameState, Tile, PlacementSide } from "@/types/domino";
import { placeTile } from "./chain";
import { canPlay, canDiscard, canDraw, usePlayAction, useDiscardAction, useDrawAction } from "./actions";
import { calculateScore } from "./score";
import { calculateRunScore, getPactBonus, type RunScoreContext } from "./runScore";
import { getLegalPlacements, resolveExhaustion, type BossRestriction } from "./roundRules";
import { ALL_RELICS } from "./relics";

export interface RoundActionOptions {
  wild?: boolean;
  freeze?: boolean;
  double?: boolean;
  restriction?: BossRestriction;
  endless?: boolean;
  boss?: boolean;
}

export function playRoundTile(game: GameState, tile: Tile, side: PlacementSide, ctx: RunScoreContext, options: RoundActionOptions = {}): GameState {
  const actual = game.hand.find((t) => t.id === tile.id);
  if (game.result !== "playing" || !actual || (game.actions && !canPlay(game.actions))) return game;
  const played = options.wild ? { ...actual, type: "wild" as const } : actual;
  if (!getLegalPlacements(game.chain, played, options.restriction).includes(side)) return game;
  let chain = placeTile(game.chain, played, side);
  if (options.freeze && game.chain.placed.length > 0) {
    const index = side === "left" ? 0 : chain.placed.length - 1;
    chain = {
      ...chain,
      leftEnd: side === "left" ? game.chain.leftEnd : chain.leftEnd,
      rightEnd: side === "right" ? game.chain.rightEnd : chain.rightEnd,
      placed: chain.placed.map((p, i) => i !== index ? p : {
        ...p,
        exposedLeft: side === "left" ? game.chain.leftEnd! : p.exposedLeft,
        exposedRight: side === "right" ? game.chain.rightEnd! : p.exposedRight,
      }),
    };
  }
  const patterns = calculateScore(chain).patternAnalysis.patterns;
  const previous = calculateScore(game.chain).patternAnalysis.patterns;
  const newPattern = patterns.some((p) => !previous.some((old) => old.id === p.id));
  const actions = game.actions ? usePlayAction(game.actions) : undefined;
  if (actions && played.edition === "negative") actions.maxActions += 1;
  let updated: GameState = {
    ...game, chain, actions,
    hand: game.hand.filter((t) => t.id !== actual.id).map((t) =>
      patterns.length > 0 && t.type === "locked" ? { ...t, type: "normal" } : t),
    roundBonus: (game.roundBonus ?? 0) + getPactBonus(played, newPattern, ctx.celestials),
    stats: { ...game.stats, tilesPlayed: game.stats.tilesPlayed + 1, bestCombo: Math.max(game.stats.bestCombo, patterns.length) },
  };
  updated.score = calculateRunScore(updated, ctx).total;
  if (options.double) {
    updated = { ...updated, roundBonus: (updated.roundBonus ?? 0) + updated.score - game.score };
    updated.score = calculateRunScore(updated, ctx).total;
  }
  if (options.boss) {
    const doubles = chain.placed.filter((p) => p.tile.top === p.tile.bottom).length;
    const rages = Math.floor((chain.placed.length * 12 + patterns.length * 20 + doubles * 8) / 100);
    const newRages = Math.max(0, rages - (game.bossRages ?? 0));
    updated = { ...updated, bossRages: Math.max(rages, game.bossRages ?? 0), target: Math.round(updated.target * Math.pow(1.1, newRages)) };
  }
  return resolveExhaustion(updated, options.restriction, options.endless);
}

export function discardRoundTile(game: GameState, tile: Tile, ctx: RunScoreContext, options: RoundActionOptions = {}): GameState {
  if (game.result !== "playing" || !game.actions || !canDiscard(game.actions) || !game.hand.some((t) => t.id === tile.id)) return game;
  const bonus = ALL_RELICS.reduce((sum, r) => sum + (game.relics.includes(r.id) && r.effect.type === "bonus_per_discard" ? r.effect.value : 0), 0);
  const updated = {
    ...game, hand: game.hand.filter((t) => t.id !== tile.id), actions: useDiscardAction(game.actions),
    roundBonus: (game.roundBonus ?? 0) + bonus,
    stats: { ...game.stats, tilesDiscarded: game.stats.tilesDiscarded + 1 },
  };
  updated.score = calculateRunScore(updated, ctx).total;
  return resolveExhaustion(updated, options.restriction, options.endless);
}

export function drawRoundTile(game: GameState, ctx: RunScoreContext, options: RoundActionOptions = {}): GameState {
  if (game.result !== "playing" || !game.actions || !canDraw(game.actions) || game.tilePool.length === 0) return game;
  const bonus = ALL_RELICS.reduce((sum, r) => sum + (game.relics.includes(r.id) && r.effect.type === "bonus_on_draw" ? r.effect.value : 0), 0);
  const updated = {
    ...game, hand: [...game.hand, game.tilePool[0]!], tilePool: game.tilePool.slice(1), actions: useDrawAction(game.actions),
    roundBonus: (game.roundBonus ?? 0) + bonus,
    stats: { ...game.stats, tilesDrawn: game.stats.tilesDrawn + 1 },
  };
  updated.score = calculateRunScore(updated, ctx).total;
  return resolveExhaustion(updated, options.restriction, options.endless);
}

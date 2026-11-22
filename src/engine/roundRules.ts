import type { ChainState, GameState, PlacementSide, Tile } from "@/types/domino";
import type { Boss } from "./boss";
import { getValidPlacements } from "./chain";
import { canPlay } from "./actions";
import { calculateScore } from "./score";

export type BossRestriction = Boss["restriction"];

export function getLegalPlacements(chain: ChainState, tile: Tile, restriction?: BossRestriction): PlacementSide[] {
  const r = restriction;
  if (r) {
    const double = tile.top === tile.bottom;
    if (r.type === "no_doubles" && double) return [];
    if (r.type === "no_wild" && tile.type === "wild") return [];
    if (r.type === "only_doubles" && !double) return [];
    if (r.type === "only_low" && tile.top + tile.bottom > r.max) return [];
    if (r.type === "even_sum_only" && (tile.top + tile.bottom) % 2 !== 0) return [];
    if ((r.type === "max_tiles" || r.type === "exact_chain_length") && chain.placed.length >= r.count) return [];
    if (r.type === "max_doubles" && double && chain.placed.filter((p) => p.tile.top === p.tile.bottom).length >= r.count) return [];
  }
  return getValidPlacementsWithRepeatRule(chain, tile, r);
}

function getValidPlacementsWithRepeatRule(chain: ChainState, tile: Tile, r?: BossRestriction): PlacementSide[] {
  return getValidPlacements(chain, tile).filter((side) => {
    if (r?.type !== "no_repeat_number" || chain.placed.length < 2) return true;
    const adjacent = side === "right" ? chain.placed[chain.placed.length - 1]! : chain.placed[0]!;
    const previousConnection = side === "right" ? adjacent.exposedLeft : adjacent.exposedRight;
    const nextConnection = side === "right" ? chain.rightEnd : chain.leftEnd;
    return nextConnection !== previousConnection;
  });
}

export function closeRound(game: GameState, restriction?: BossRestriction, endless = false): GameState {
  if (game.result !== "playing") return game;
  const r = restriction;
  const count = game.chain.placed.length;
  const patterns = calculateScore(game.chain).patternAnalysis.patterns.length;
  let won = game.score >= game.target;
  if (r?.type === "min_patterns") won &&= patterns >= r.count;
  if (r?.type === "min_chain_length") won &&= count >= r.count;
  if (r?.type === "exact_chain_length") won &&= count === r.count;
  const victory = endless ? count > 0 : won;
  const bonus = victory ? game.roundWinBonus ?? 0 : 0;
  return { ...game, score: game.score + bonus, roundBonus: (game.roundBonus ?? 0) + bonus, result: victory ? "win" : "lose" };
}

/** A blocked hand can still be rescued by draws, consumables or mutations. */
export function resolveExhaustion(game: GameState, restriction?: BossRestriction, endless = false): GameState {
  const chainCapped = (restriction?.type === "max_tiles" || restriction?.type === "exact_chain_length")
    && game.chain.placed.length >= restriction.count;
  return (game.actions && !canPlay(game.actions)) || chainCapped ? closeRound(game, restriction, endless) : game;
}

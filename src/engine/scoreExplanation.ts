import type { GameState, Tile, PlacementSide } from "@/types/domino";
import { calculateRunScore, type RunScoreContext, type RunScoreStep } from "./runScore";
import { playRoundTile, type RoundActionOptions } from "./roundActions";
import { getLegalPlacements } from "./roundRules";
import type { ScoreBreakdown } from "./score";
export interface ScoreExplanation {
  before: number; after: number; delta: number; side: PlacementSide; steps: RunScoreStep[];
  sources: { breakdown: ScoreBreakdown; relicIds: string[]; tiles: number; patternBonusFactor: number };
}
export function explainTileScore(game: GameState, tile: Tile, ctx: RunScoreContext, options: RoundActionOptions = {}, preferredSide?: PlacementSide): ScoreExplanation | null {
  const sides = getLegalPlacements(game.chain, options.wild ? { ...tile, type: "wild" } : tile, options.restriction);
  const side = preferredSide ?? (sides.includes("right") ? "right" : sides[0]);
  if (!side || !sides.includes(side)) return null;
  const next = playRoundTile(game, tile, side, ctx, options);
  if (next === game) return null;
  const calculated = calculateRunScore(next, ctx, true);
  return { before: game.score, after: next.score, delta: next.score - game.score, side, steps: calculated.steps,
    sources: { breakdown: calculated.breakdown, relicIds: [...next.relics], tiles: next.chain.placed.length, patternBonusFactor: ctx.patternBonus } };
}

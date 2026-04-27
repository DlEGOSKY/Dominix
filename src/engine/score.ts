import type { ChainState } from "@/types/domino";
import { analyzePatterns, type PatternAnalysis } from "./patterns";
import { calculateRelicBonus, ALL_RELICS } from "./relics";

const SCORE_PER_TILE = 10;

const LENGTH_BONUS: Record<number, number> = {
  3: 0,
  4: 10,
  5: 25,
  6: 45,
};

function lengthBonus(count: number): number {
  if (count <= 2) return 0;
  if (count <= 6) return LENGTH_BONUS[count] ?? 0;
  return 45 + (count - 6) * 25;
}

export interface ScoreBreakdown {
  baseScore: number;
  lengthBonus: number;
  patternAnalysis: PatternAnalysis;
  relicBonus: number;
  relicMultiplier: number;
  subtotal: number;
  multiplier: number;
  total: number;
}

/**
 * Soft-cap the multiplier above x4 with a hyperbolic compression curve.
 * Pattern multipliers stack multiplicatively (cadena_maxima x2 ×
 * cadena_larga x1.5 × trinidad x1.15 ...), so 5+ active patterns easily
 * produce x12-x16 stacks that trivialize late-game targets. We keep the
 * satisfaction of combos but blunt the trivialization. The curve uses
 *   f(raw) = KNEE + delta / (1 + delta * STRENGTH)
 * with KNEE = 4 and STRENGTH = 0.15, plateauing near x10.7. It satisfies
 * f(raw) <= raw above the knee (never amplifies) and is identity below:
 *   x2  -> x2.00 · x4  -> x4.00 · x6  -> x5.54 · x8  -> x6.50
 *   x12 -> x7.64 · x16 -> x8.29 · x20 -> x8.71 · x30 -> x9.46
 *   x50 -> x9.82 · x100 -> x10.20
 * Below x4 the function is the identity, so casual runs are unaffected.
 */
export function softCapMultiplier(raw: number): number {
  const KNEE = 4;
  const STRENGTH = 0.15;
  if (raw <= KNEE) return raw;
  const delta = raw - KNEE;
  return KNEE + delta / (1 + delta * STRENGTH);
}

export function calculateScore(chain: ChainState, relicIds: string[] = [], patternBonusMultiplier: number = 1): ScoreBreakdown {
  const count = chain.placed.length;
  
  // Golden tiles give double base score
  let baseScore = 0;
  for (const p of chain.placed) {
    const tileScore = SCORE_PER_TILE;
    if (p.tile.type === "golden") baseScore += tileScore * 2;
    else if (p.tile.type === "bomb") baseScore += tileScore + 15;
    else baseScore += tileScore;
  }
  
  const lengthBonusValue = lengthBonus(count);
  const patternAnalysis = analyzePatterns(chain);

  const activeRelics = ALL_RELICS.filter((r) => relicIds.includes(r.id));
  const relicResult = calculateRelicBonus(activeRelics, chain, patternAnalysis);

  const effectivePatternBonus = Math.floor(patternAnalysis.totalBonus * patternBonusMultiplier);
  const subtotal = baseScore + lengthBonusValue + effectivePatternBonus + relicResult.bonus;
  const rawMultiplier = patternAnalysis.totalMultiplier * relicResult.multiplier;
  const multiplier = softCapMultiplier(rawMultiplier);
  const total = Math.floor(subtotal * multiplier);

  return {
    baseScore,
    lengthBonus: lengthBonusValue,
    patternAnalysis,
    relicBonus: relicResult.bonus,
    relicMultiplier: relicResult.multiplier,
    subtotal,
    multiplier,
    total,
  };
}

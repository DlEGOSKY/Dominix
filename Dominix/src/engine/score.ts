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

export function calculateScore(chain: ChainState, relicIds: string[] = []): ScoreBreakdown {
  const count = chain.placed.length;
  
  // Golden tiles give double base score
  let baseScore = 0;
  for (const p of chain.placed) {
    const tileScore = SCORE_PER_TILE;
    baseScore += p.tile.type === "golden" ? tileScore * 2 : tileScore;
  }
  
  const lengthBonusValue = lengthBonus(count);
  const patternAnalysis = analyzePatterns(chain);

  const activeRelics = ALL_RELICS.filter((r) => relicIds.includes(r.id));
  const relicResult = calculateRelicBonus(activeRelics, chain, patternAnalysis);

  const subtotal = baseScore + lengthBonusValue + patternAnalysis.totalBonus + relicResult.bonus;
  const multiplier = patternAnalysis.totalMultiplier * relicResult.multiplier;
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

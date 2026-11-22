import type { GameState } from "@/types/domino";
import type { Character } from "./characters";
import type { TalentBonuses } from "./talents";
import type { CelestialCard } from "./celestial";
import type { ChaosTwist } from "./chaos";
import { calculateScore } from "./score";
import { computeFamilySetBonuses } from "./relics";
import { applyCharacterPassive } from "./characters";
import { summarizeChainEditions } from "./editions";
import { celestialTotalBonus, computeCelestialSetBonus } from "./celestial";
import { chaosMods } from "./chaos";

export interface RunScoreContext {
  character: Character;
  talents: TalentBonuses;
  scoreMultiplier: number;
  patternBonus: number;
  celestials: CelestialCard[];
  celestialBoost: number;
  chaosTwist: ChaosTwist | null;
  flatPerTile: number;
}

export interface RunScoreStep { id: string; before: number; after: number }

/** Shared by play, preview and closing. One-shot points are explicit state. */
export function calculateRunScore(game: Pick<GameState, "chain" | "relics" | "hand" | "actions" | "roundBonus" | "roundScoreFactor">, ctx: RunScoreContext, explain = false) {
  const breakdown = calculateScore(game.chain, game.relics, ctx.patternBonus, {
    handSize: game.hand.length, discardsUsed: game.actions?.usedDiscards ?? 0,
    actionsRemaining: game.actions ? Math.max(0, game.actions.maxActions - game.actions.usedActions) : 0,
  });
  const family = computeFamilySetBonuses(game.relics);
  const editions = summarizeChainEditions(game.chain);
  const count = game.chain.placed.length;
  const doubles = game.chain.placed.filter((p) => p.tile.top === p.tile.bottom).length;
  const patterns = breakdown.patternAnalysis.patterns.length;
  const steps: RunScoreStep[] = [];
  let cursor = 0;
  const stage = (id: string, after: number) => {
    if (explain && after !== cursor) steps.push({ id, before: cursor, after });
    cursor = after;
  };
  let total = 0;
  if (count > 0) {
    if (explain) {
      stage("base", breakdown.baseScore);
      stage("length", cursor + breakdown.lengthBonus);
      stage("patterns", cursor + Math.floor(breakdown.patternAnalysis.totalBonus * ctx.patternBonus));
      stage("relics", cursor + breakdown.relicBonus);
      stage("chainMultiplier", breakdown.total);
    }
    total = Math.round(breakdown.total * ctx.scoreMultiplier);
    stage("runMultiplier", total);
    total += ctx.talents.flatScoreBonus + family.numeroFlatBonus;
    total += patterns * ctx.talents.extraPatternScore;
    total += count * (family.cadenaPerTile + ctx.flatPerTile);
    total += Math.round(breakdown.patternAnalysis.totalBonus * family.patronPatternBoost);
    stage("buildFlat", total);
    total += editions.flatBonus;
    stage("editionFlat", total);
    total = applyCharacterPassive({
      character: ctx.character, baseScore: total, patternCount: patterns, hasDoubles: doubles > 0,
      discardsUsed: game.actions?.usedDiscards ?? 0,
      actionsRemaining: game.actions ? Math.max(0, game.actions.maxActions - game.actions.usedActions) : 0,
      relicCount: game.relics.length,
    });
    stage("character", total);
    total = Math.round(total * ctx.talents.scoreMultiplier);
    stage("talentMultiplier", total);
    total = Math.round(total * family.fuerzaGlobalMultiplier);
    stage("familyMultiplier", total);
    total = Math.round(total * editions.multiplier);
    stage("editionMultiplier", total);
    total += celestialTotalBonus(total, breakdown.patternAnalysis, ctx.celestials, {
      tilesPlayed: count, doublesCount: doubles, celestialBoost: ctx.celestialBoost,
    });
    stage("celestials", total);
    if (ctx.chaosTwist) {
      const chaos = chaosMods(ctx.chaosTwist);
      total += chaos.flatPerTile * count + chaos.doubleBonus * doubles;
      total += Math.floor(breakdown.patternAnalysis.totalBonus * (chaos.patternBonusMult - 1));
      total = Math.floor(total * chaos.scoreMultiplier);
    }
    stage("chaos", total);
    if (ctx.character.passive.type === "map_bonus") total += ctx.character.passive.amount;
    stage("map", total);
  }
  total = Math.round(total * (game.roundScoreFactor ?? 1));
  stage("eventFactor", total);
  const chainTotal = total;
  const finalTotal = Math.max(0, total + (game.roundBonus ?? 0));
  stage("accumulated", finalTotal);
  return { total: finalTotal, chainTotal, breakdown, steps };
}

/** Pacts trigger once on placement; their points survive later plays. */
export function getPactBonus(tile: GameState["hand"][number], newPattern: boolean, celestials: CelestialCard[]): number {
  if (!tile.pact) return 0;
  let bonus = 100 + (newPattern ? 100 : 0) + (tile.edition ? 100 : 0);
  if (computeCelestialSetBonus(celestials).cosmicAlignment) bonus = Math.floor(bonus * 1.2);
  return bonus;
}

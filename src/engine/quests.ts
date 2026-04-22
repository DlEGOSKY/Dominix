/**
 * Round Quest System — optional objectives that appear each round.
 *
 * Quests give small extra rewards (gold, wild tile, extra relic odds, etc)
 * for completing side challenges that make each round feel distinct.
 */

import type { ChainState } from "@/types/domino";
import { getGlobalRNG } from "./rng";

export type QuestId =
  | "close_with_double"
  | "activate_2_patterns"
  | "activate_3_patterns"
  | "play_many_tiles"
  | "exceed_target"
  | "no_doubles"
  | "low_sum_chain"
  | "high_sum_chain";

export type QuestRewardKind = "gold" | "extra_draw_next" | "wild_tile";

export interface QuestReward {
  kind: QuestRewardKind;
  amount: number;
}

export interface QuestDefinition {
  id: QuestId;
  title: string;
  description: string;
  reward: QuestReward;
  /** Minimum round at which this quest can appear. */
  minRound: number;
}

export const ALL_QUESTS: QuestDefinition[] = [
  {
    id: "close_with_double",
    title: "Cierre maestro",
    description: "Termina la cadena con una ficha doble",
    reward: { kind: "gold", amount: 30 },
    minRound: 2,
  },
  {
    id: "activate_2_patterns",
    title: "Patron doble",
    description: "Activa 2 o mas patrones en la misma ronda",
    reward: { kind: "gold", amount: 25 },
    minRound: 3,
  },
  {
    id: "activate_3_patterns",
    title: "Trifecta",
    description: "Activa 3 o mas patrones en la misma ronda",
    reward: { kind: "gold", amount: 50 },
    minRound: 6,
  },
  {
    id: "play_many_tiles",
    title: "Cadena extensa",
    description: "Juega 8 o mas fichas en la ronda",
    reward: { kind: "gold", amount: 20 },
    minRound: 2,
  },
  {
    id: "exceed_target",
    title: "Sobrepasar meta",
    description: "Alcanza 1.5x la meta en una sola ronda",
    reward: { kind: "gold", amount: 40 },
    minRound: 4,
  },
  {
    id: "no_doubles",
    title: "Sin dobles",
    description: "Completa la ronda sin jugar ninguna ficha doble",
    reward: { kind: "gold", amount: 35 },
    minRound: 3,
  },
  {
    id: "low_sum_chain",
    title: "Camino bajo",
    description: "Todas tus fichas deben sumar 6 o menos",
    reward: { kind: "gold", amount: 30 },
    minRound: 4,
  },
  {
    id: "high_sum_chain",
    title: "Camino alto",
    description: "Todas tus fichas deben sumar 7 o mas",
    reward: { kind: "gold", amount: 30 },
    minRound: 4,
  },
];

export function pickRoundQuest(round: number): QuestDefinition | null {
  const rng = getGlobalRNG();
  // 75% chance of a quest each round
  if (rng.next() > 0.75) return null;
  const eligible = ALL_QUESTS.filter((q) => q.minRound <= round);
  if (eligible.length === 0) return null;
  const idx = Math.floor(rng.next() * eligible.length);
  return eligible[idx] ?? null;
}

export interface RoundQuestContext {
  chain: ChainState;
  score: number;
  target: number;
  patternsActivated: number;
}

export function checkQuestCompletion(quest: QuestDefinition, ctx: RoundQuestContext): boolean {
  const placed = ctx.chain.placed;
  switch (quest.id) {
    case "close_with_double": {
      if (placed.length === 0) return false;
      const last = placed[placed.length - 1]!;
      return last.tile.top === last.tile.bottom;
    }
    case "activate_2_patterns":
      return ctx.patternsActivated >= 2;
    case "activate_3_patterns":
      return ctx.patternsActivated >= 3;
    case "play_many_tiles":
      return placed.length >= 8;
    case "exceed_target":
      return ctx.score >= Math.round(ctx.target * 1.5);
    case "no_doubles":
      return placed.length > 0 && placed.every((p) => p.tile.top !== p.tile.bottom);
    case "low_sum_chain":
      return placed.length > 0 && placed.every((p) => p.tile.top + p.tile.bottom <= 6);
    case "high_sum_chain":
      return placed.length > 0 && placed.every((p) => p.tile.top + p.tile.bottom >= 7);
  }
}

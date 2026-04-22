import type { Tile, ChainState, GameState } from "@/types/domino";
import { getGlobalRNG } from "./rng";

export interface ActiveMutation {
  id: string;
  name: string;
  description: string;
  cost: { type: "actions"; amount: number } | { type: "score"; amount: number };
  usesPerRound: number;
  effect: ActiveMutationEffect;
}

export type ActiveMutationEffect =
  | { type: "shuffle_hand" }
  | { type: "peek_pool"; count: number }
  | { type: "wild_next" }
  | { type: "score_burst"; amount: number }
  | { type: "extend_actions"; amount: number }
  | { type: "freeze_end" }
  | { type: "swap_ends" };

export interface ActiveMutationState {
  mutationId: string;
  usesLeft: number;
}

export const ALL_ACTIVE_MUTATIONS: ActiveMutation[] = [
  {
    id: "shuffle_hand",
    name: "Barajar mano",
    description: "Devuelve tu mano al pool y roba fichas nuevas",
    cost: { type: "actions", amount: 3 },
    usesPerRound: 1,
    effect: { type: "shuffle_hand" },
  },
  {
    id: "wild_next",
    name: "Toque salvaje",
    description: "Convierte la proxima ficha que juegues en wild",
    cost: { type: "actions", amount: 2 },
    usesPerRound: 1,
    effect: { type: "wild_next" },
  },
  {
    id: "score_burst",
    name: "Detonacion",
    description: "Suma 25 puntos instantaneos al score de la ronda",
    cost: { type: "actions", amount: 2 },
    usesPerRound: 2,
    effect: { type: "score_burst", amount: 25 },
  },
  {
    id: "extend_actions",
    name: "Segundo aliento",
    description: "Recupera 4 acciones extra esta ronda",
    cost: { type: "score", amount: 20 },
    usesPerRound: 1,
    effect: { type: "extend_actions", amount: 4 },
  },
  {
    id: "swap_ends",
    name: "Reversa",
    description: "Intercambia los extremos de la cadena",
    cost: { type: "actions", amount: 1 },
    usesPerRound: 1,
    effect: { type: "swap_ends" },
  },
  {
    id: "freeze_end",
    name: "Ancla",
    description: "La proxima ficha no cambia el extremo de la cadena",
    cost: { type: "actions", amount: 2 },
    usesPerRound: 1,
    effect: { type: "freeze_end" },
  },
];

export function getRandomActiveMutations(count: number, exclude: string[]): ActiveMutation[] {
  const available = ALL_ACTIVE_MUTATIONS.filter((m) => !exclude.includes(m.id));
  const shuffled = [...available].sort(() => getGlobalRNG().next() - 0.5);
  return shuffled.slice(0, count);
}

export function initMutationStates(mutationIds: string[]): ActiveMutationState[] {
  return mutationIds.map((id) => {
    const mutation = ALL_ACTIVE_MUTATIONS.find((m) => m.id === id);
    return {
      mutationId: id,
      usesLeft: mutation?.usesPerRound ?? 0,
    };
  });
}

export function resetMutationUses(states: ActiveMutationState[]): ActiveMutationState[] {
  return states.map((s) => {
    const mutation = ALL_ACTIVE_MUTATIONS.find((m) => m.id === s.mutationId);
    return { ...s, usesLeft: mutation?.usesPerRound ?? 0 };
  });
}

export function canUseMutation(
  mutation: ActiveMutation,
  state: ActiveMutationState,
  game: GameState
): boolean {
  if (state.usesLeft <= 0) return false;
  if (mutation.cost.type === "actions") {
    if (!game.actions) return false;
    const remaining = game.actions.maxActions - game.actions.usedActions;
    return remaining >= mutation.cost.amount;
  }
  if (mutation.cost.type === "score") {
    return game.score >= mutation.cost.amount;
  }
  return false;
}

export function applyShuffleHand(hand: Tile[], pool: Tile[], handSize: number): { hand: Tile[]; pool: Tile[] } {
  const combined = [...pool, ...hand];
  const shuffled = [...combined].sort(() => getGlobalRNG().next() - 0.5);
  const newHand = shuffled.slice(0, handSize);
  const newPool = shuffled.slice(handSize);
  return { hand: newHand, pool: newPool };
}

export function applySwapEnds(chain: ChainState): ChainState {
  if (chain.placed.length === 0) return chain;
  return {
    ...chain,
    leftEnd: chain.rightEnd,
    rightEnd: chain.leftEnd,
    placed: [...chain.placed].reverse().map((p) => ({
      ...p,
      exposedLeft: p.exposedRight,
      exposedRight: p.exposedLeft,
    })),
  };
}

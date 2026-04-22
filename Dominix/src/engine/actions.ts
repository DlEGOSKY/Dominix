import { ALL_RELICS } from "@/engine/relics";

export interface ActionState {
  maxActions: number;
  usedActions: number;
  maxDiscards: number;
  usedDiscards: number;
  maxDraws: number;
  usedDraws: number;
}

export interface ActionBonuses {
  extraActions: number;
  extraDiscards: number;
  extraDraws: number;
}

const BASE_ACTIONS = 12;
const BASE_DISCARDS = 2;
const BASE_DRAWS = 1;

export function getRelicActionBonuses(relicIds: string[]): ActionBonuses {
  const relics = ALL_RELICS.filter((r) => relicIds.includes(r.id));
  let extraActions = 0;
  let extraDiscards = 0;
  let extraDraws = 0;
  for (const r of relics) {
    if (r.effect.type === "extra_actions") extraActions += r.effect.value;
    if (r.effect.type === "extra_discards") extraDiscards += r.effect.value;
    if (r.effect.type === "extra_draws") extraDraws += r.effect.value;
  }
  return { extraActions, extraDiscards, extraDraws };
}

export function createActionState(round: number, relicIds: string[] = [], modifierBonus: number = 0): ActionState {
  const roundBonus = Math.floor(round / 4);
  const rb = getRelicActionBonuses(relicIds);
  return {
    maxActions: Math.max(4, BASE_ACTIONS + roundBonus + rb.extraActions + modifierBonus),
    usedActions: 0,
    maxDiscards: BASE_DISCARDS + rb.extraDiscards,
    usedDiscards: 0,
    maxDraws: BASE_DRAWS + (round >= 5 ? 1 : 0) + rb.extraDraws,
    usedDraws: 0,
  };
}

export function canPlay(state: ActionState): boolean {
  return state.usedActions < state.maxActions;
}

export function canDiscard(state: ActionState): boolean {
  return state.usedDiscards < state.maxDiscards && state.usedActions < state.maxActions;
}

export function canDraw(state: ActionState): boolean {
  return state.usedDraws < state.maxDraws && state.usedActions < state.maxActions;
}

export function usePlayAction(state: ActionState): ActionState {
  return { ...state, usedActions: state.usedActions + 1 };
}

export function useDiscardAction(state: ActionState): ActionState {
  return {
    ...state,
    usedActions: state.usedActions + 1,
    usedDiscards: state.usedDiscards + 1,
  };
}

export function useDrawAction(state: ActionState): ActionState {
  return {
    ...state,
    usedActions: state.usedActions + 1,
    usedDraws: state.usedDraws + 1,
  };
}

export function getActionsRemaining(state: ActionState): number {
  return state.maxActions - state.usedActions;
}

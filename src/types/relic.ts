export type RelicTrigger =
  | "on_score"
  | "on_pattern"
  | "on_double"
  | "on_chain_end"
  | "passive";

export interface Relic {
  id: string;
  name: string;
  description: string;
  trigger: RelicTrigger;
  effect: RelicEffect;
}

export type RelicEffect =
  | { type: "bonus_per_tile"; value: number }
  | { type: "bonus_flat"; value: number }
  | { type: "multiplier"; value: number }
  | { type: "bonus_per_double"; value: number }
  | { type: "bonus_if_pattern"; patternId: string; value: number }
  | { type: "multiplier_if_pattern"; patternId: string; value: number }
  | { type: "bonus_per_number"; number: number; value: number }
  | { type: "bonus_low_numbers"; value: number }
  | { type: "bonus_high_numbers"; value: number }
  | { type: "extra_hand_size"; value: number };

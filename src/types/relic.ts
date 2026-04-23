export type RelicTrigger =
  | "on_score"
  | "on_pattern"
  | "on_double"
  | "on_chain_end"
  | "passive";

export type RelicRarity = "common" | "rare" | "legendary";

export type RelicFamily = "patron" | "numero" | "fuerza" | "cadena" | "accion";

export interface Relic {
  id: string;
  name: string;
  description: string;
  trigger: RelicTrigger;
  effect: RelicEffect;
  /** Defaults to "common" when omitted. */
  rarity?: RelicRarity;
  /** Family for set bonuses. Resolved by engine helper if omitted. */
  family?: RelicFamily;
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
  | { type: "extra_hand_size"; value: number }
  | { type: "extra_actions"; value: number }
  | { type: "extra_discards"; value: number }
  | { type: "extra_draws"; value: number }
  | { type: "bonus_per_discard"; value: number }
  | { type: "bonus_on_draw"; value: number }
  | { type: "multiplier_per_pattern"; value: number }
  | { type: "celestial_boost"; value: number };

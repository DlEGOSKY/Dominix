/**
 * Consumable system: one-shot items that sit in a dedicated 2-slot panel,
 * separate from relics and mutations. Designed to fill the gap of "tactical
 * in-round interventions" described in GAME_DESIGN.md §6.
 *
 * Consumables are NOT persistent between runs. They drop as alternative
 * rewards and (later) in shops. Each consumable defines a self-contained
 * effect that can be resolved from GameBoard without extra UI selection.
 */

export type ConsumableRarity = "common" | "rare" | "legendary";

export type ConsumableEffect =
  | { type: "gain_actions"; amount: number }
  | { type: "gain_gold"; amount: number }
  | { type: "gain_score"; amount: number }
  | { type: "hand_first_to_wild" }
  | { type: "random_foil" }
  | { type: "purge_draw"; count: number }
  | { type: "refill_hand"; target: number }
  | { type: "double_next_score" };

export interface Consumable {
  id: string;
  name: string;
  description: string;
  rarity: ConsumableRarity;
  /** Hex-ish color token used for borders/glow. */
  tint: "blue" | "green" | "gold" | "purple" | "pink" | "cyan";
  /** Single-letter or 2-letter short glyph for compact display. */
  glyph: string;
  effect: ConsumableEffect;
}

export const ALL_CONSUMABLES: Consumable[] = [
  {
    id: "recarga",
    name: "Recarga",
    description: "Otorga +2 acciones en esta ronda",
    rarity: "common",
    tint: "green",
    glyph: "R",
    effect: { type: "gain_actions", amount: 2 },
  },
  {
    id: "despensa",
    name: "Despensa",
    description: "Recibe 30 monedas al instante",
    rarity: "common",
    tint: "gold",
    glyph: "$",
    effect: { type: "gain_gold", amount: 30 },
  },
  {
    id: "espejo",
    name: "Espejo",
    description: "Suma 25 al score de esta ronda",
    rarity: "common",
    tint: "cyan",
    glyph: "M",
    effect: { type: "gain_score", amount: 25 },
  },
  {
    id: "mago",
    name: "Mago",
    description: "Convierte la ficha mas ligera de tu mano en comodin",
    rarity: "rare",
    tint: "purple",
    glyph: "W",
    effect: { type: "hand_first_to_wild" },
  },
  {
    id: "alquimista",
    name: "Alquimista",
    description: "Aplica edicion Foil a una ficha aleatoria de tu mano",
    rarity: "rare",
    tint: "blue",
    glyph: "F",
    effect: { type: "random_foil" },
  },
  {
    id: "purga",
    name: "Purga",
    description: "Descarta 3 fichas al azar y roba 3 nuevas",
    rarity: "rare",
    tint: "pink",
    glyph: "X",
    effect: { type: "purge_draw", count: 3 },
  },
  {
    id: "mano_nueva",
    name: "Mano Nueva",
    description: "Rellena la mano hasta 7 fichas si tienes menos",
    rarity: "rare",
    tint: "green",
    glyph: "H",
    effect: { type: "refill_hand", target: 7 },
  },
  {
    id: "sol",
    name: "Sol",
    description: "La proxima ficha que juegues otorga score x2",
    rarity: "legendary",
    tint: "gold",
    glyph: "S",
    effect: { type: "double_next_score" },
  },
];

export const MAX_CONSUMABLE_SLOTS = 2;

const RARITY_WEIGHT: Record<ConsumableRarity, number> = {
  common: 6,
  rare: 3,
  legendary: 1,
};

export function rollRandomConsumable(eliteBoost = false): Consumable {
  const pool = ALL_CONSUMABLES.map((c) => ({
    c,
    w: RARITY_WEIGHT[c.rarity] * (eliteBoost && c.rarity === "legendary" ? 2 : 1),
  }));
  const total = pool.reduce((s, p) => s + p.w, 0);
  let r = Math.random() * total;
  for (const p of pool) {
    r -= p.w;
    if (r <= 0) return p.c;
  }
  return pool[0]!.c;
}

export function getConsumable(id: string): Consumable | undefined {
  return ALL_CONSUMABLES.find((c) => c.id === id);
}

/**
 * Modo Caos — one random roll per round that temporarily buffs or nerfs the
 * round. Keeps every run fresh by making the player adapt to unpredictable
 * conditions. Seed is derived from the run RNG so replays are deterministic.
 */
import { getGlobalRNG } from "./rng";

export interface ChaosTwist {
  id: string;
  name: string;
  description: string;
  /** "good" = player favor, "bad" = nerf, "neutral" = odd but balanced. */
  tone: "good" | "bad" | "neutral";
  effect: ChaosEffect;
}

export type ChaosEffect =
  | { type: "score_multiplier"; value: number }
  | { type: "target_multiplier"; value: number }
  | { type: "extra_actions"; value: number }
  | { type: "flat_bonus_per_tile"; value: number }
  | { type: "double_bonus"; value: number }
  | { type: "pattern_bonus_mult"; value: number }
  | { type: "reroll_hand" } // shuffle hand at round start (visual only; let GameBoard pick up)
  | { type: "free_reward" }; // add a free consumable at round start

export const ALL_CHAOS_TWISTS: ChaosTwist[] = [
  {
    id: "giro_aureo",
    name: "Giro Aureo",
    description: "x1.2 a todo el score de la ronda",
    tone: "good",
    effect: { type: "score_multiplier", value: 1.2 },
  },
  {
    id: "viento_del_norte",
    name: "Viento del Norte",
    description: "+3 acciones esta ronda",
    tone: "good",
    effect: { type: "extra_actions", value: 3 },
  },
  {
    id: "marea_baja",
    name: "Marea Baja",
    description: "Meta -15% esta ronda",
    tone: "good",
    effect: { type: "target_multiplier", value: 0.85 },
  },
  {
    id: "lluvia_puntos",
    name: "Lluvia de Puntos",
    description: "+5 score por cada ficha jugada",
    tone: "good",
    effect: { type: "flat_bonus_per_tile", value: 5 },
  },
  {
    id: "pulso_doble",
    name: "Pulso Doble",
    description: "Cada doble jugado suma +15 adicional",
    tone: "good",
    effect: { type: "double_bonus", value: 15 },
  },
  {
    id: "mente_clara",
    name: "Mente Clara",
    description: "x1.3 al bonus de patrones esta ronda",
    tone: "good",
    effect: { type: "pattern_bonus_mult", value: 1.3 },
  },
  {
    id: "nube_gris",
    name: "Nube Gris",
    description: "Meta +12% esta ronda",
    tone: "bad",
    effect: { type: "target_multiplier", value: 1.12 },
  },
  {
    id: "freno_mental",
    name: "Freno Mental",
    description: "-2 acciones esta ronda",
    tone: "bad",
    effect: { type: "extra_actions", value: -2 },
  },
  {
    id: "eco_debil",
    name: "Eco Debil",
    description: "x0.9 al bonus de patrones esta ronda",
    tone: "bad",
    effect: { type: "pattern_bonus_mult", value: 0.9 },
  },
  {
    id: "vientos_cambiantes",
    name: "Vientos Cambiantes",
    description: "La mano se revuelve al iniciar la ronda",
    tone: "neutral",
    effect: { type: "reroll_hand" },
  },
  {
    id: "obsequio",
    name: "Obsequio",
    description: "Recibes un consumible aleatorio gratis al iniciar",
    tone: "good",
    effect: { type: "free_reward" },
  },
];

/** Pick a random chaos twist using the seeded RNG. */
export function rollChaosTwist(): ChaosTwist {
  const rng = getGlobalRNG();
  const idx = Math.floor(rng.next() * ALL_CHAOS_TWISTS.length);
  return ALL_CHAOS_TWISTS[idx] ?? ALL_CHAOS_TWISTS[0]!;
}

/** Lightweight reducer: applies a chaos twist onto a round config. */
export interface ChaosRoundMods {
  targetMultiplier: number;
  scoreMultiplier: number;
  actionBonus: number;
  flatPerTile: number;
  doubleBonus: number;
  patternBonusMult: number;
  rerollHand: boolean;
  freeReward: boolean;
}

export function chaosMods(twist: ChaosTwist | null): ChaosRoundMods {
  const base: ChaosRoundMods = {
    targetMultiplier: 1,
    scoreMultiplier: 1,
    actionBonus: 0,
    flatPerTile: 0,
    doubleBonus: 0,
    patternBonusMult: 1,
    rerollHand: false,
    freeReward: false,
  };
  if (!twist) return base;
  const e = twist.effect;
  switch (e.type) {
    case "score_multiplier": base.scoreMultiplier *= e.value; break;
    case "target_multiplier": base.targetMultiplier *= e.value; break;
    case "extra_actions": base.actionBonus += e.value; break;
    case "flat_bonus_per_tile": base.flatPerTile += e.value; break;
    case "double_bonus": base.doubleBonus += e.value; break;
    case "pattern_bonus_mult": base.patternBonusMult *= e.value; break;
    case "reroll_hand": base.rerollHand = true; break;
    case "free_reward": base.freeReward = true; break;
  }
  return base;
}

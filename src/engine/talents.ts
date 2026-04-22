/**
 * Talent Tree — persistent meta-progression system.
 *
 * Each player level grants 1 Talent Point that can be invested in one of
 * four branches: Score, Chain, Tiles, Economy. Talents stack for permanent
 * bonuses across all future runs.
 *
 * Points can be refunded for gold.
 */

import { loadProgression } from "./progression";

export type TalentBranch = "score" | "chain" | "tiles" | "economy";

export interface TalentEffect {
  type:
    | "flat_score_bonus" // Added to score each round
    | "score_multiplier" // Multiplicative
    | "start_gold" // Extra starting gold
    | "hand_size" // Extra starting hand
    | "gold_multiplier" // All gold earned multiplied
    | "relic_discount" // Shop relics cheaper
    | "extra_pattern_score" // Each pattern yields +N extra
    | "action_bonus" // Extra actions per round
    | "starting_relic" // Grants a starting relic id
    | "tile_preserve"; // On chain reset, preserve N random tiles
  value: number | string;
}

export interface Talent {
  id: string;
  branch: TalentBranch;
  tier: number; // 1 = base, 2 = mid, 3 = advanced
  name: string;
  description: string;
  maxRank: number; // How many times it can be upgraded
  costPerRank: number; // Points required per rank
  effect: TalentEffect;
  /** Requires at least N points total in this branch to unlock */
  requiresBranchPoints?: number;
}

export const ALL_TALENTS: Talent[] = [
  // SCORE branch
  {
    id: "score_boost_1",
    branch: "score",
    tier: 1,
    name: "Precision Basica",
    description: "+3 al score base por ronda",
    maxRank: 3,
    costPerRank: 1,
    effect: { type: "flat_score_bonus", value: 3 },
  },
  {
    id: "pattern_power",
    branch: "score",
    tier: 2,
    name: "Poder de Patrones",
    description: "+5 extra por cada patron activado",
    maxRank: 3,
    costPerRank: 2,
    effect: { type: "extra_pattern_score", value: 5 },
    requiresBranchPoints: 2,
  },
  {
    id: "score_multiplier",
    branch: "score",
    tier: 3,
    name: "Dominio Total",
    description: "+3% al score total (multiplicativo)",
    maxRank: 4,
    costPerRank: 3,
    effect: { type: "score_multiplier", value: 0.03 },
    requiresBranchPoints: 5,
  },

  // CHAIN branch
  {
    id: "extra_action",
    branch: "chain",
    tier: 1,
    name: "Mano Firme",
    description: "+1 accion disponible por ronda",
    maxRank: 2,
    costPerRank: 2,
    effect: { type: "action_bonus", value: 1 },
  },
  {
    id: "bigger_hand",
    branch: "chain",
    tier: 2,
    name: "Mano Amplia",
    description: "+1 ficha en la mano inicial",
    maxRank: 2,
    costPerRank: 3,
    effect: { type: "hand_size", value: 1 },
    requiresBranchPoints: 2,
  },
  {
    id: "tile_preserve",
    branch: "chain",
    tier: 3,
    name: "Memoria de Cadena",
    description: "Al avanzar ronda, conservas 1 ficha al azar de tu mano",
    maxRank: 2,
    costPerRank: 3,
    effect: { type: "tile_preserve", value: 1 },
    requiresBranchPoints: 4,
  },

  // TILES branch
  {
    id: "starting_relic_t1",
    branch: "tiles",
    tier: 1,
    name: "Herencia Minima",
    description: "Empiezas cada run con Impulso Inicial",
    maxRank: 1,
    costPerRank: 2,
    effect: { type: "starting_relic", value: "impulso_inicial" },
  },
  {
    id: "starting_relic_t2",
    branch: "tiles",
    tier: 2,
    name: "Legado",
    description: "Tambien empiezas con Precision",
    maxRank: 1,
    costPerRank: 3,
    effect: { type: "starting_relic", value: "precision" },
    requiresBranchPoints: 2,
  },
  {
    id: "starting_relic_t3",
    branch: "tiles",
    tier: 3,
    name: "Arsenal",
    description: "Tambien empiezas con Amplificador",
    maxRank: 1,
    costPerRank: 4,
    effect: { type: "starting_relic", value: "amplificador" },
    requiresBranchPoints: 5,
  },

  // ECONOMY branch
  {
    id: "start_gold",
    branch: "economy",
    tier: 1,
    name: "Bolsillo Lleno",
    description: "+15 oro inicial por rank",
    maxRank: 3,
    costPerRank: 1,
    effect: { type: "start_gold", value: 15 },
  },
  {
    id: "gold_mult",
    branch: "economy",
    tier: 2,
    name: "Mercader",
    description: "+10% oro ganado por rank",
    maxRank: 3,
    costPerRank: 2,
    effect: { type: "gold_multiplier", value: 0.1 },
    requiresBranchPoints: 2,
  },
  {
    id: "shop_discount",
    branch: "economy",
    tier: 3,
    name: "Regateador",
    description: "Reliquias en tienda cuestan 15% menos (por rank)",
    maxRank: 2,
    costPerRank: 3,
    effect: { type: "relic_discount", value: 0.15 },
    requiresBranchPoints: 5,
  },
];

// ---- Persistence ----

const TALENTS_KEY = "dominix_talents_v1";

export interface TalentState {
  /** talentId -> rank invested (0 = not bought) */
  ranks: Record<string, number>;
  /** Total points spent (tracked separately to avoid drift) */
  spent: number;
}

function initialState(): TalentState {
  return { ranks: {}, spent: 0 };
}

export function loadTalents(): TalentState {
  try {
    const raw = localStorage.getItem(TALENTS_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as TalentState;
    return { ranks: parsed.ranks ?? {}, spent: parsed.spent ?? 0 };
  } catch {
    return initialState();
  }
}

export function saveTalents(state: TalentState): void {
  localStorage.setItem(TALENTS_KEY, JSON.stringify(state));
}

/** Total talent points available to player (= level). */
export function getTotalTalentPoints(): number {
  const prog = loadProgression();
  return prog.level; // 1 point per level (starting at level 1)
}

export function getAvailablePoints(state: TalentState = loadTalents()): number {
  return Math.max(0, getTotalTalentPoints() - state.spent);
}

export function getBranchPoints(branch: TalentBranch, state: TalentState = loadTalents()): number {
  let total = 0;
  for (const t of ALL_TALENTS) {
    if (t.branch !== branch) continue;
    const rank = state.ranks[t.id] ?? 0;
    total += rank * t.costPerRank;
  }
  return total;
}

export function canBuyTalent(talent: Talent, state: TalentState = loadTalents()): boolean {
  const rank = state.ranks[talent.id] ?? 0;
  if (rank >= talent.maxRank) return false;
  if (getAvailablePoints(state) < talent.costPerRank) return false;
  if (talent.requiresBranchPoints && getBranchPoints(talent.branch, state) < talent.requiresBranchPoints) {
    return false;
  }
  return true;
}

export function buyTalent(talentId: string): TalentState | null {
  const state = loadTalents();
  const talent = ALL_TALENTS.find((t) => t.id === talentId);
  if (!talent || !canBuyTalent(talent, state)) return null;
  const rank = state.ranks[talentId] ?? 0;
  const next: TalentState = {
    ranks: { ...state.ranks, [talentId]: rank + 1 },
    spent: state.spent + talent.costPerRank,
  };
  saveTalents(next);
  return next;
}

export function resetTalents(): TalentState {
  const next = initialState();
  saveTalents(next);
  return next;
}

// ---- Aggregate effects for a run ----

export interface TalentBonuses {
  flatScoreBonus: number;
  scoreMultiplier: number;
  extraPatternScore: number;
  startGold: number;
  handSize: number;
  goldMultiplier: number;
  relicDiscount: number;
  actionBonus: number;
  startingRelics: string[];
  tilePreserve: number;
}

export function getTalentBonuses(state: TalentState = loadTalents()): TalentBonuses {
  const result: TalentBonuses = {
    flatScoreBonus: 0,
    scoreMultiplier: 1,
    extraPatternScore: 0,
    startGold: 0,
    handSize: 0,
    goldMultiplier: 1,
    relicDiscount: 0,
    actionBonus: 0,
    startingRelics: [],
    tilePreserve: 0,
  };
  for (const talent of ALL_TALENTS) {
    const rank = state.ranks[talent.id] ?? 0;
    if (rank <= 0) continue;
    const eff = talent.effect;
    if (eff.type === "flat_score_bonus") result.flatScoreBonus += rank * (eff.value as number);
    else if (eff.type === "score_multiplier") result.scoreMultiplier *= 1 + rank * (eff.value as number);
    else if (eff.type === "extra_pattern_score") result.extraPatternScore += rank * (eff.value as number);
    else if (eff.type === "start_gold") result.startGold += rank * (eff.value as number);
    else if (eff.type === "hand_size") result.handSize += rank * (eff.value as number);
    else if (eff.type === "gold_multiplier") result.goldMultiplier *= 1 + rank * (eff.value as number);
    else if (eff.type === "relic_discount") result.relicDiscount += rank * (eff.value as number);
    else if (eff.type === "action_bonus") result.actionBonus += rank * (eff.value as number);
    else if (eff.type === "starting_relic") result.startingRelics.push(eff.value as string);
    else if (eff.type === "tile_preserve") result.tilePreserve += rank * (eff.value as number);
  }
  return result;
}

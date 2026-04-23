/**
 * Celestial Cards — permanent per-run buffs that amplify specific patterns.
 * One card targets one pattern by id. Multiple cards can stack on the same
 * pattern (multipliers multiply), or cover different patterns.
 *
 * Delivered as an alternative reward; the player builds a "cosmic loadout"
 * alongside their relics.
 *
 * Firmaments: cards are grouped into 4 firmaments. Owning 3+ cards from the
 * same firmament activates an "Alineación" — a set bonus specific to that
 * firmament. Owning 5+ total celestial cards activates "Alineación Cósmica",
 * a global bonus on top.
 */
import { ALL_PATTERNS } from "./patterns";
import type { PatternAnalysis } from "./patterns";

export type Firmament = "length" | "doubles" | "structural" | "rhythmic";

export interface CelestialCard {
  id: string;
  name: string;
  description: string;
  patternId: string;
  /** Added on top of the pattern's base bonus. 0.15 = +15% to bonus contribution. */
  bonusMultiplier: number;
  firmament: Firmament;
}

export const ALL_CELESTIAL: CelestialCard[] = [
  // Length firmament
  { id: "cielo_simple",   name: "Alba",       patternId: "cadena_simple", bonusMultiplier: 0.5,  description: "+50% al bonus de Cadena Simple", firmament: "length" },
  { id: "cielo_larga",    name: "Meridiano",  patternId: "cadena_larga",  bonusMultiplier: 0.3,  description: "+30% al bonus de Cadena Larga",  firmament: "length" },
  { id: "cielo_maxima",   name: "Cenit",      patternId: "cadena_maxima", bonusMultiplier: 0.3,  description: "+30% al bonus de Cadena Maxima", firmament: "length" },
  // Doubles firmament
  { id: "cielo_doble",    name: "Gemelas",    patternId: "doble_doble",   bonusMultiplier: 0.4,  description: "+40% al bonus de Doble Doble",   firmament: "doubles" },
  { id: "cielo_triple",   name: "Triada",     patternId: "triple_doble",  bonusMultiplier: 0.4,  description: "+40% al bonus de Triple Doble",  firmament: "doubles" },
  { id: "cielo_todo",     name: "Cosmos",     patternId: "todo_dobles",   bonusMultiplier: 0.5,  description: "+50% al bonus de Todo Dobles",   firmament: "doubles" },
  // Structural firmament
  { id: "cielo_dominio",  name: "Reina",      patternId: "dominio",       bonusMultiplier: 0.4,  description: "+40% al bonus de Dominio",       firmament: "structural" },
  { id: "cielo_cierre",   name: "Eclipse",    patternId: "cierre_exacto", bonusMultiplier: 0.5,  description: "+50% al bonus de Cierre Exacto", firmament: "structural" },
  { id: "cielo_escalera", name: "Zodiaco",    patternId: "escalera",      bonusMultiplier: 0.3,  description: "+30% al bonus de Escalera",      firmament: "structural" },
  { id: "cielo_simetria", name: "Constelacion", patternId: "simetria",    bonusMultiplier: 0.4,  description: "+40% al bonus de Simetria",      firmament: "structural" },
  { id: "cielo_espejo",   name: "Luna Doble", patternId: "espejo",        bonusMultiplier: 0.4,  description: "+40% al bonus de Espejo",        firmament: "structural" },
  // Rhythmic firmament
  { id: "cielo_alternancia", name: "Pulso",    patternId: "alternancia",  bonusMultiplier: 0.3,  description: "+30% al bonus de Alternancia",   firmament: "rhythmic" },
  { id: "cielo_avalancha",   name: "Tormenta", patternId: "avalancha",    bonusMultiplier: 0.3,  description: "+30% al bonus de Avalancha",     firmament: "rhythmic" },
  // New patterns (S6)
  { id: "cielo_trinidad",    name: "Triangulo",patternId: "trinidad",     bonusMultiplier: 0.35, description: "+35% al bonus de Trinidad",      firmament: "structural" },
  { id: "cielo_fractal",     name: "Mandala",  patternId: "fractal",      bonusMultiplier: 0.4,  description: "+40% al bonus de Fractal",       firmament: "rhythmic" },
  { id: "cielo_armonia",     name: "Silencio", patternId: "armonia",      bonusMultiplier: 0.4,  description: "+40% al bonus de Armonia",       firmament: "rhythmic" },
];

export const FIRMAMENT_META: Record<Firmament, {
  label: string;
  description: string;
  bonusDescription: string;
  glow: string;
  text: string;
  border: string;
  bg: string;
}> = {
  length: {
    label: "Extension",
    description: "Cartas de cadenas extensas",
    bonusDescription: "+6 score por cada ficha en cadena",
    glow: "rgba(96,165,250,0.55)",
    text: "text-blue-200",
    border: "border-blue-400/50",
    bg: "bg-blue-500/15",
  },
  doubles: {
    label: "Gemini",
    description: "Cartas ligadas a los dobles",
    bonusDescription: "Cada doble jugado suma +12 adicional",
    glow: "rgba(244,114,182,0.55)",
    text: "text-pink-200",
    border: "border-pink-400/50",
    bg: "bg-pink-500/15",
  },
  structural: {
    label: "Arquitecto",
    description: "Cartas de patrones estructurales",
    bonusDescription: "x1.12 al multiplicador de cadena",
    glow: "rgba(168,85,247,0.55)",
    text: "text-purple-200",
    border: "border-purple-400/50",
    bg: "bg-purple-500/15",
  },
  rhythmic: {
    label: "Compas",
    description: "Cartas de patrones rítmicos",
    bonusDescription: "+25% al bonus de patrón",
    glow: "rgba(74,222,128,0.55)",
    text: "text-green-200",
    border: "border-green-400/50",
    bg: "bg-green-500/15",
  },
};

export interface CelestialSetBonus {
  firmamentAlignments: Firmament[];
  cosmicAlignment: boolean; // 5+ total
  perTileBonus: number;
  perDoubleBonus: number;
  chainMultiplier: number;
  patternBonusMultiplier: number;
  globalFlat: number;
  globalMultiplier: number;
}

const EMPTY_SET_BONUS: CelestialSetBonus = {
  firmamentAlignments: [],
  cosmicAlignment: false,
  perTileBonus: 0,
  perDoubleBonus: 0,
  chainMultiplier: 1,
  patternBonusMultiplier: 1,
  globalFlat: 0,
  globalMultiplier: 1,
};

/**
 * Compute which set bonuses are active given the owned celestial cards.
 * - 3+ cards in a single firmament activates that firmament's alignment
 * - 5+ total cards activates the global "Cosmic Alignment"
 */
export function computeCelestialSetBonus(ownedCards: CelestialCard[]): CelestialSetBonus {
  if (ownedCards.length === 0) return EMPTY_SET_BONUS;

  const counts: Record<Firmament, number> = { length: 0, doubles: 0, structural: 0, rhythmic: 0 };
  for (const c of ownedCards) counts[c.firmament]++;

  const result: CelestialSetBonus = { ...EMPTY_SET_BONUS, firmamentAlignments: [] };

  if (counts.length >= 3) {
    result.firmamentAlignments.push("length");
    result.perTileBonus += 6;
  }
  if (counts.doubles >= 3) {
    result.firmamentAlignments.push("doubles");
    result.perDoubleBonus += 12;
  }
  if (counts.structural >= 3) {
    result.firmamentAlignments.push("structural");
    result.chainMultiplier *= 1.12;
  }
  if (counts.rhythmic >= 3) {
    result.firmamentAlignments.push("rhythmic");
    result.patternBonusMultiplier *= 1.25;
  }

  if (ownedCards.length >= 5) {
    result.cosmicAlignment = true;
    // Cosmic alignment: small global boost, scales gently with total
    result.globalFlat += 40;
    result.globalMultiplier *= 1.08;
  }

  return result;
}

export function getCelestial(id: string): CelestialCard | undefined {
  return ALL_CELESTIAL.find((c) => c.id === id);
}

export function patternName(patternId: string): string {
  return ALL_PATTERNS.find((p) => p.id === patternId)?.name ?? patternId;
}

/** Roll a random card; avoid duplicates in the owned list if possible. */
export function rollRandomCelestial(ownedIds: string[] = []): CelestialCard {
  const pool = ALL_CELESTIAL.filter((c) => !ownedIds.includes(c.id));
  const source = pool.length > 0 ? pool : ALL_CELESTIAL;
  return source[Math.floor(Math.random() * source.length)]!;
}

/**
 * Compute the extra bonus contributed by celestial cards given a pattern
 * analysis. Does NOT modify the analysis. Cards stack multiplicatively when
 * multiple target the same pattern (rare but supported).
 *
 * Also applies firmament set bonuses (Alineaciones) when 3+ cards share a
 * firmament, plus the global "Cosmic" alignment bonus at 5+ owned cards.
 *
 * Patrón de cálculo:
 *   - per-pattern multipliers sobre cada patrón activo (amplified by rhythmic alignment)
 *   - perTileBonus: score plano por cada ficha en cadena
 *   - perDoubleBonus: score plano por cada doble en cadena
 *   - chainMultiplier / globalMultiplier: se aplican como delta sobre currentTotal
 *   - globalFlat: flat adicional si el jugador tiene 5+ cartas
 *
 * currentTotal is the score that has been computed so far (after modifiedScore
 * + anything else already applied). This allows multipliers to act correctly.
 */
export function celestialTotalBonus(
  currentTotal: number,
  analysis: PatternAnalysis,
  ownedCards: CelestialCard[],
  ctx: { tilesPlayed: number; doublesCount: number; celestialBoost?: number },
): number {
  if (ownedCards.length === 0) return 0;

  const setBonus = computeCelestialSetBonus(ownedCards);
  const boost = 1 + (ctx.celestialBoost ?? 0);

  // 1) Per-pattern bonuses (possibly amplified by the rhythmic alignment)
  let perPatternExtra = 0;
  for (const p of analysis.patterns) {
    const cards = ownedCards.filter((c) => c.patternId === p.id);
    if (cards.length === 0) continue;
    let factor = 1;
    for (const c of cards) factor *= 1 + c.bonusMultiplier;
    perPatternExtra += p.bonus * (factor - 1);
  }
  perPatternExtra *= setBonus.patternBonusMultiplier;

  // 2) Flat bonuses from set alignments
  const flat =
    setBonus.perTileBonus * ctx.tilesPlayed +
    setBonus.perDoubleBonus * ctx.doublesCount +
    (analysis.patterns.length > 0 ? setBonus.globalFlat : 0);

  // 3) Multipliers are approximated as additive on currentTotal
  const multDelta = currentTotal * (setBonus.chainMultiplier * setBonus.globalMultiplier - 1);

  return Math.floor((perPatternExtra + flat + multDelta) * boost);
}

/**
 * Backward-compat wrapper: only the per-pattern bonuses (no set bonuses).
 * Kept for any caller that wants the legacy behaviour.
 */
export function celestialBonusFor(
  analysis: PatternAnalysis,
  ownedCards: CelestialCard[],
): number {
  if (ownedCards.length === 0) return 0;
  let extra = 0;
  for (const p of analysis.patterns) {
    const cards = ownedCards.filter((c) => c.patternId === p.id);
    if (cards.length === 0) continue;
    let factor = 1;
    for (const c of cards) factor *= 1 + c.bonusMultiplier;
    extra += p.bonus * (factor - 1);
  }
  return Math.floor(extra);
}

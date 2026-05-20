/**
 * Character System — playable archetypes with unique passive abilities,
 * starting equipment, and gameplay biases.
 *
 * Each character changes how a run starts and plays without fragmenting
 * the core domino mechanic.
 */

import type { Tile } from "@/types/domino";

export type CharacterId =
  | "architect"
  | "mathematician"
  | "bomber"
  | "merchant"
  | "alchemist"
  | "oracle"
  | "cartographer"
  | "hermit"
  | "gambler"
  | "perfectionist"
  | "collector"
  | "speedrunner";

export type CharacterPassive =
  | { type: "bonus_per_pattern"; amount: number }
  | { type: "double_score_on_doubles" } // double-tile score x2
  | { type: "start_with_bombs"; count: number }
  | { type: "gold_multiplier"; factor: number }
  | { type: "extra_gold_on_round_end"; amount: number }
  | { type: "wild_on_pattern" } // wild tile added on pattern activation
  | { type: "starting_editions"; count: number } // N tiles start with random edition
  | { type: "celestial_start" } // gets a free celestial at run start
  | { type: "map_bonus"; amount: number } // flat score bonus per round
  | { type: "auto_pact" } // auto-marks the highest double as pact
  | { type: "reroll_discount"; percent: number } // cheaper rerolls in shop
  | { type: "perfect_chain_bonus"; amount: number } // bonus if no discards used
  | { type: "relic_synergy"; multiplier: number } // more relics = more power
  | { type: "speed_bonus"; perAction: number }; // bonus score per unused action

export interface Character {
  id: CharacterId;
  name: string;
  title: string;
  description: string;
  color: "gold" | "blue" | "red" | "green" | "purple" | "cyan" | "teal" | "violet";
  icon: "compass" | "sigma" | "flame" | "coin" | "flask" | "eye" | "map" | "moon";
  startingHandSize: number;
  startingGold: number;
  startingRelicIds: string[];
  /** Number of extra special tiles injected at start */
  bonusSpecialTiles: { type: Tile["type"]; count: number }[];
  passive: CharacterPassive;
  unlockCondition?: {
    type: "default" | "defeat_boss" | "reach_round" | "achievement";
    value?: string | number;
  };
}

export const ALL_CHARACTERS: Character[] = [
  {
    id: "architect",
    name: "El Arquitecto",
    title: "Maestro de cadenas",
    description: "+5 score por cada patrón activado. Empieza con la reliquia Impulso Inicial.",
    color: "blue",
    icon: "compass",
    startingHandSize: 7,
    startingGold: 30,
    startingRelicIds: ["impulso_inicial"],
    bonusSpecialTiles: [],
    passive: { type: "bonus_per_pattern", amount: 5 },
    unlockCondition: { type: "default" },
  },
  {
    id: "mathematician",
    name: "La Matematica",
    title: "Calculadora de dobles",
    description: "Las fichas doble (0|0, 1|1, etc) puntúan el doble. +1 mano inicial.",
    color: "gold",
    icon: "sigma",
    startingHandSize: 8,
    startingGold: 20,
    startingRelicIds: [],
    bonusSpecialTiles: [],
    passive: { type: "double_score_on_doubles" },
    unlockCondition: { type: "reach_round", value: 8 },
  },
  {
    id: "bomber",
    name: "El Bombardero",
    title: "Explosivo",
    description: "Empieza con 2 fichas bomba. Al activar un patron, tu siguiente ficha sera salvaje.",
    color: "red",
    icon: "flame",
    startingHandSize: 7,
    startingGold: 20,
    startingRelicIds: [],
    bonusSpecialTiles: [{ type: "bomb", count: 2 }],
    passive: { type: "wild_on_pattern" },
    unlockCondition: { type: "defeat_boss", value: "guardian" },
  },
  {
    id: "merchant",
    name: "El Mercader",
    title: "Economista",
    description: "Gana +50% oro. Empieza con 60 oro y una ficha wild en el pool.",
    color: "green",
    icon: "coin",
    startingHandSize: 7,
    startingGold: 60,
    startingRelicIds: [],
    bonusSpecialTiles: [{ type: "wild", count: 1 }],
    passive: { type: "gold_multiplier", factor: 1.5 },
    unlockCondition: { type: "reach_round", value: 15 },
  },
  {
    id: "alchemist",
    name: "El Alquimista",
    title: "Forjador de ediciones",
    description: "Empieza con 2 fichas con edicion aleatoria aplicada.",
    color: "purple",
    icon: "flask",
    startingHandSize: 7,
    startingGold: 25,
    startingRelicIds: [],
    bonusSpecialTiles: [],
    passive: { type: "starting_editions", count: 2 },
    unlockCondition: { type: "defeat_boss", value: "coleccionista" },
  },
  {
    id: "oracle",
    name: "La Oracula",
    title: "Vidente del firmamento",
    description: "Empieza con 1 carta celeste aleatoria ya descubierta.",
    color: "cyan",
    icon: "eye",
    startingHandSize: 7,
    startingGold: 25,
    startingRelicIds: [],
    bonusSpecialTiles: [],
    passive: { type: "celestial_start" },
    unlockCondition: { type: "reach_round", value: 12 },
  },
  {
    id: "cartographer",
    name: "El Cartografo",
    title: "Lector de caminos",
    description: "+20 score pasivos al terminar cada ronda. Mano +1.",
    color: "teal",
    icon: "map",
    startingHandSize: 8,
    startingGold: 25,
    startingRelicIds: [],
    bonusSpecialTiles: [],
    passive: { type: "map_bonus", amount: 20 },
    unlockCondition: { type: "reach_round", value: 10 },
  },
  {
    id: "hermit",
    name: "El Ermitaño",
    title: "Guardian del pacto",
    description: "La doble mas alta del set empieza pactada (+100 al jugarla). Sin penalidad.",
    color: "violet",
    icon: "moon",
    startingHandSize: 7,
    startingGold: 30,
    startingRelicIds: [],
    bonusSpecialTiles: [],
    passive: { type: "auto_pact" },
    unlockCondition: { type: "reach_round", value: 18 },
  },
  {
    id: "gambler",
    name: "El Apostador",
    title: "Maestro del azar",
    description: "Rerolls en tienda cuestan -50%. Empieza con 40 oro y mano -1.",
    color: "red",
    icon: "coin",
    startingHandSize: 6,
    startingGold: 40,
    startingRelicIds: [],
    bonusSpecialTiles: [],
    passive: { type: "reroll_discount", percent: 50 },
    unlockCondition: { type: "reach_round", value: 20 },
  },
  {
    id: "perfectionist",
    name: "La Perfeccionista",
    title: "Purista absoluta",
    description: "+50 score si terminas la ronda sin usar descartes. Empieza con 1 descarte menos.",
    color: "cyan",
    icon: "eye",
    startingHandSize: 7,
    startingGold: 25,
    startingRelicIds: [],
    bonusSpecialTiles: [],
    passive: { type: "perfect_chain_bonus", amount: 50 },
    unlockCondition: { type: "defeat_boss", value: "apex" },
  },
  {
    id: "collector",
    name: "El Coleccionista",
    title: "Acumulador de poder",
    description: "x1.05 score por cada reliquia que tengas (maximo x2). Empieza sin reliquia.",
    color: "purple",
    icon: "flask",
    startingHandSize: 7,
    startingGold: 35,
    startingRelicIds: [],
    bonusSpecialTiles: [],
    passive: { type: "relic_synergy", multiplier: 1.05 },
    unlockCondition: { type: "reach_round", value: 25 },
  },
  {
    id: "speedrunner",
    name: "El Velocista",
    title: "Eficiencia maxima",
    description: "+10 score por cada accion no usada al cerrar. Empieza con +2 acciones.",
    color: "green",
    icon: "flame",
    startingHandSize: 7,
    startingGold: 20,
    startingRelicIds: [],
    bonusSpecialTiles: [],
    passive: { type: "speed_bonus", perAction: 10 },
    unlockCondition: { type: "reach_round", value: 22 },
  },
];

export function getCharacter(id: CharacterId): Character {
  const c = ALL_CHARACTERS.find((c) => c.id === id);
  if (!c) return ALL_CHARACTERS[0]!;
  return c;
}

export function getDefaultCharacter(): Character {
  return ALL_CHARACTERS[0]!;
}

/** Apply the character's bonus special tiles to a tile pool (mutating the type) */
export function injectCharacterTiles(pool: Tile[], character: Character): Tile[] {
  if (character.bonusSpecialTiles.length === 0) return pool;
  const newPool = [...pool];
  for (const { type, count } of character.bonusSpecialTiles) {
    let applied = 0;
    for (let i = 0; i < newPool.length && applied < count; i++) {
      const t = newPool[i]!;
      if (!t.type || t.type === "normal") {
        newPool[i] = { ...t, type };
        applied++;
      }
    }
  }
  return newPool;
}

/** Compute bonus score from passive for a round result */
export function applyCharacterPassive(params: {
  character: Character;
  baseScore: number;
  patternCount: number;
  hasDoubles: boolean;
  discardsUsed?: number;
  actionsRemaining?: number;
  relicCount?: number;
}): number {
  const { character, baseScore, patternCount, hasDoubles, discardsUsed = 0, actionsRemaining = 0, relicCount = 0 } = params;
  let total = baseScore;
  const p = character.passive;
  if (p.type === "bonus_per_pattern") total += patternCount * p.amount;
  if (p.type === "double_score_on_doubles" && hasDoubles) total = Math.round(total * 1.15);
  if (p.type === "perfect_chain_bonus" && discardsUsed === 0) total += p.amount;
  if (p.type === "speed_bonus") total += actionsRemaining * p.perAction;
  if (p.type === "relic_synergy") {
    const mult = Math.min(2, Math.pow(p.multiplier, relicCount));
    total = Math.round(total * mult);
  }
  return total;
}

export function computeGoldMultiplier(character: Character): number {
  if (character.passive.type === "gold_multiplier") return character.passive.factor;
  return 1;
}

// ---- Unlocks persistence ----
const CHAR_UNLOCK_KEY = "dominix_characters_unlocked_v1";

export function loadUnlockedCharacters(): Set<CharacterId> {
  try {
    const raw = localStorage.getItem(CHAR_UNLOCK_KEY);
    if (!raw) return new Set(["architect"]);
    const arr = JSON.parse(raw) as CharacterId[];
    return new Set<CharacterId>([...arr, "architect"]);
  } catch {
    return new Set(["architect"]);
  }
}

export function unlockCharacter(id: CharacterId): void {
  try {
    const current = loadUnlockedCharacters();
    current.add(id);
    localStorage.setItem(CHAR_UNLOCK_KEY, JSON.stringify([...current]));
  } catch {
    // ignore
  }
}

export function isCharacterUnlocked(id: CharacterId): boolean {
  return loadUnlockedCharacters().has(id);
}

// Selected character persistence
const SELECTED_CHAR_KEY = "dominix_selected_character_v1";

export function loadSelectedCharacter(): CharacterId {
  try {
    const raw = localStorage.getItem(SELECTED_CHAR_KEY);
    if (raw && ALL_CHARACTERS.some((c) => c.id === raw)) return raw as CharacterId;
  } catch {
    // ignore
  }
  return "architect";
}

export function saveSelectedCharacter(id: CharacterId): void {
  try {
    localStorage.setItem(SELECTED_CHAR_KEY, id);
  } catch {
    // ignore
  }
}

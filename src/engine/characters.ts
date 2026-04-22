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
  | "merchant";

export type CharacterPassive =
  | { type: "bonus_per_pattern"; amount: number }
  | { type: "double_score_on_doubles" } // double-tile score x2
  | { type: "start_with_bombs"; count: number }
  | { type: "gold_multiplier"; factor: number }
  | { type: "extra_gold_on_round_end"; amount: number }
  | { type: "wild_on_pattern" }; // wild tile added on pattern activation

export interface Character {
  id: CharacterId;
  name: string;
  title: string;
  description: string;
  color: "gold" | "blue" | "red" | "green";
  icon: "compass" | "sigma" | "flame" | "coin";
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
}): number {
  const { character, baseScore, patternCount, hasDoubles } = params;
  let total = baseScore;
  const p = character.passive;
  if (p.type === "bonus_per_pattern") total += patternCount * p.amount;
  if (p.type === "double_score_on_doubles" && hasDoubles) total = Math.round(total * 1.15);
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

/**
 * Character Challenges — one-time per-character objectives that reward
 * extra mastery XP and push the player to explore each archetype deeply.
 *
 * Design goals:
 * - Three tiers per character (easy / medium / hard)
 * - Objectives lean into the character's identity
 * - Fully resolved from RunStats + final round, so no mid-run plumbing
 *   is required (completion is checked at game over)
 * - Persistent via localStorage, completion is one-shot per challenge
 */

import type { RunStats } from "@/types/domino";
import type { CharacterId } from "./characters";

export interface CharacterChallenge {
  id: string;
  characterId: CharacterId;
  title: string;
  description: string;
  xpReward: number;
  /** Evaluated at game over against the run results. */
  check: (stats: RunStats, finalRound: number) => boolean;
}

/**
 * Three challenges per character, ordered from easy to hard.
 * Kept intentionally conservative in rewards so they don't outpace
 * regular mastery XP (which comes from every run).
 */
export const ALL_CHARACTER_CHALLENGES: CharacterChallenge[] = [
  // --- Architect: chain-building maestro ---
  {
    id: "architect_bronze",
    characterId: "architect",
    title: "Primer andamio",
    description: "Activa 10 patrones en una sola run",
    xpReward: 150,
    check: (s) => s.patternsActivated >= 10,
  },
  {
    id: "architect_silver",
    characterId: "architect",
    title: "Obra maestra",
    description: "Activa 20 patrones en una sola run",
    xpReward: 300,
    check: (s) => s.patternsActivated >= 20,
  },
  {
    id: "architect_gold",
    characterId: "architect",
    title: "Catedral de cadenas",
    description: "Alcanza ronda 12 y activa 25 patrones",
    xpReward: 500,
    check: (s, r) => r >= 12 && s.patternsActivated >= 25,
  },

  // --- Mathematician: doubles specialist ---
  {
    id: "mathematician_bronze",
    characterId: "mathematician",
    title: "Simetria basica",
    description: "Llega a ronda 5",
    xpReward: 150,
    check: (_s, r) => r >= 5,
  },
  {
    id: "mathematician_silver",
    characterId: "mathematician",
    title: "Teorema del doble",
    description: "Supera 800 en una sola ronda",
    xpReward: 300,
    check: (s) => s.highestRoundScore >= 800,
  },
  {
    id: "mathematician_gold",
    characterId: "mathematician",
    title: "Axioma perfecto",
    description: "Supera 2000 en una sola ronda",
    xpReward: 500,
    check: (s) => s.highestRoundScore >= 2000,
  },

  // --- Bomber: explosive plays ---
  {
    id: "bomber_bronze",
    characterId: "bomber",
    title: "Mecha corta",
    description: "Juega al menos 40 fichas en una run",
    xpReward: 150,
    check: (s) => s.tilesPlayed >= 40,
  },
  {
    id: "bomber_silver",
    characterId: "bomber",
    title: "Detonacion en cadena",
    description: "Alcanza un combo de 6 o mas",
    xpReward: 300,
    check: (s) => s.bestCombo >= 6,
  },
  {
    id: "bomber_gold",
    characterId: "bomber",
    title: "Quemadura completa",
    description: "Derrota 2 jefes en una sola run",
    xpReward: 500,
    check: (s) => s.bossesDefeated >= 2,
  },

  // --- Merchant: economy focus ---
  {
    id: "merchant_bronze",
    characterId: "merchant",
    title: "Primera ganancia",
    description: "Acumula 300 oro en una run",
    xpReward: 150,
    check: (s) => s.goldEarned >= 300,
  },
  {
    id: "merchant_silver",
    characterId: "merchant",
    title: "Ruta comercial",
    description: "Realiza 5 compras en la tienda",
    xpReward: 300,
    check: (s) => s.shopPurchases >= 5,
  },
  {
    id: "merchant_gold",
    characterId: "merchant",
    title: "Monopolio",
    description: "Acumula 600 oro y 8 compras en una run",
    xpReward: 500,
    check: (s) => s.goldEarned >= 600 && s.shopPurchases >= 8,
  },

  // --- Alchemist: edition tinkerer ---
  {
    id: "alchemist_bronze",
    characterId: "alchemist",
    title: "Receta basica",
    description: "Llega a ronda 6",
    xpReward: 150,
    check: (_s, r) => r >= 6,
  },
  {
    id: "alchemist_silver",
    characterId: "alchemist",
    title: "Elixir estable",
    description: "Alcanza 6000 puntos totales",
    xpReward: 300,
    check: (s) => s.totalScore >= 6000,
  },
  {
    id: "alchemist_gold",
    characterId: "alchemist",
    title: "Gran obra",
    description: "Alcanza 18000 puntos totales",
    xpReward: 500,
    check: (s) => s.totalScore >= 18000,
  },

  // --- Oracle: celestial seer ---
  {
    id: "oracle_bronze",
    characterId: "oracle",
    title: "Primera vision",
    description: "Activa 8 patrones en una run",
    xpReward: 150,
    check: (s) => s.patternsActivated >= 8,
  },
  {
    id: "oracle_silver",
    characterId: "oracle",
    title: "Carta leida",
    description: "Supera 1200 en una sola ronda",
    xpReward: 300,
    check: (s) => s.highestRoundScore >= 1200,
  },
  {
    id: "oracle_gold",
    characterId: "oracle",
    title: "Firmamento completo",
    description: "Llega a ronda 10 con 18+ patrones",
    xpReward: 500,
    check: (s, r) => r >= 10 && s.patternsActivated >= 18,
  },

  // --- Cartographer: path reader ---
  {
    id: "cartographer_bronze",
    characterId: "cartographer",
    title: "Primer sendero",
    description: "Llega a ronda 6",
    xpReward: 150,
    check: (_s, r) => r >= 6,
  },
  {
    id: "cartographer_silver",
    characterId: "cartographer",
    title: "Mapa detallado",
    description: "Derrota 1 jefe",
    xpReward: 300,
    check: (s) => s.bossesDefeated >= 1,
  },
  {
    id: "cartographer_gold",
    characterId: "cartographer",
    title: "Atlas completo",
    description: "Llega a ronda 13",
    xpReward: 500,
    check: (_s, r) => r >= 13,
  },

  // --- Hermit: pact guardian ---
  {
    id: "hermit_bronze",
    characterId: "hermit",
    title: "Primer pacto",
    description: "Llega a ronda 7",
    xpReward: 150,
    check: (_s, r) => r >= 7,
  },
  {
    id: "hermit_silver",
    characterId: "hermit",
    title: "Voto silencioso",
    description: "Alcanza 8000 puntos totales",
    xpReward: 300,
    check: (s) => s.totalScore >= 8000,
  },
  {
    id: "hermit_gold",
    characterId: "hermit",
    title: "Ofrenda eterna",
    description: "Alcanza combo 8+ y ronda 11",
    xpReward: 500,
    check: (s, r) => s.bestCombo >= 8 && r >= 11,
  },
];

export function getChallengesFor(characterId: CharacterId): CharacterChallenge[] {
  return ALL_CHARACTER_CHALLENGES.filter((c) => c.characterId === characterId);
}

// --- Persistence ----------------------------------------------------------

const STORAGE_KEY = "dominix_character_challenges_v1";

type CompletedMap = Record<string, true>;

function loadRaw(): CompletedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CompletedMap;
  } catch {
    return {};
  }
}

function saveRaw(map: CompletedMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function isChallengeCompleted(id: string): boolean {
  return loadRaw()[id] === true;
}

export function loadCompletedChallenges(): Set<string> {
  return new Set(Object.keys(loadRaw()));
}

/**
 * Non-persistent check used during the run to trigger a live toast the
 * moment a challenge's condition becomes true. The caller should track
 * which ids it has already celebrated this run so the same toast does
 * not fire twice.
 *
 * Final persistence still happens via `resolveRunChallenges` at game over.
 */
export function peekNewlyCompletedChallenges(
  characterId: CharacterId,
  stats: RunStats,
  roundReached: number,
  alreadyCelebrated: Set<string>
): CharacterChallenge[] {
  const completedGlobally = loadCompletedChallenges();
  const result: CharacterChallenge[] = [];
  for (const challenge of getChallengesFor(characterId)) {
    if (completedGlobally.has(challenge.id)) continue;
    if (alreadyCelebrated.has(challenge.id)) continue;
    if (challenge.check(stats, roundReached)) {
      result.push(challenge);
    }
  }
  return result;
}

/**
 * Evaluate every challenge for the given character against a finished run.
 * Persists newly-completed ones and returns them so the UI can celebrate.
 */
export function resolveRunChallenges(
  characterId: CharacterId,
  stats: RunStats,
  finalRound: number
): { newlyCompleted: CharacterChallenge[]; xpAwarded: number } {
  const map = loadRaw();
  const newlyCompleted: CharacterChallenge[] = [];
  let xpAwarded = 0;
  for (const challenge of getChallengesFor(characterId)) {
    if (map[challenge.id]) continue;
    if (challenge.check(stats, finalRound)) {
      map[challenge.id] = true;
      newlyCompleted.push(challenge);
      xpAwarded += challenge.xpReward;
    }
  }
  if (newlyCompleted.length > 0) saveRaw(map);
  return { newlyCompleted, xpAwarded };
}

/** Count completed / total for a character. */
export function getChallengeProgress(characterId: CharacterId): {
  completed: number;
  total: number;
} {
  const completed = loadCompletedChallenges();
  const challenges = getChallengesFor(characterId);
  return {
    completed: challenges.filter((c) => completed.has(c.id)).length,
    total: challenges.length,
  };
}

export function resetCharacterChallenges(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

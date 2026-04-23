/**
 * Character Mastery — per-character persistent progression.
 *
 * Each character accumulates XP from completed runs. Mastery level unlocks
 * small permanent bonuses when playing that character, plus cosmetic badges
 * shown in the character select screen.
 *
 * Design goals:
 * - Reward rotation between characters rather than dumping all XP into one
 * - Bonuses are mild (not power creep) — mastery is primarily cosmetic +
 *   a small quality-of-life nudge
 * - Levels are reachable in a few runs, not grindy
 */

import type { CharacterId } from "./characters";

export const MAX_MASTERY_LEVEL = 5;

/** XP required to REACH each level (cumulative). Level 1 = 0 XP. */
const LEVEL_THRESHOLDS = [0, 300, 900, 2000, 4000, 7500];

export interface MasteryBonus {
  startGold: number;
  actionBonus: number;
  /** Mastery-exclusive flavor shown in the UI. */
  badge?: string;
}

/** Cumulative bonus at a given mastery level. */
export function getMasteryBonus(level: number): MasteryBonus {
  const lv = Math.max(0, Math.min(MAX_MASTERY_LEVEL, level));
  const bonus: MasteryBonus = { startGold: 0, actionBonus: 0 };
  if (lv >= 2) bonus.startGold += 10;
  if (lv >= 3) bonus.startGold += 15;
  if (lv >= 4) bonus.actionBonus += 1;
  if (lv >= 5) bonus.badge = "Maestro";
  return bonus;
}

/** One-line description of what a specific level unlocks. Used in the UI. */
export function getLevelRewardText(level: number): string {
  switch (level) {
    case 2: return "+10 oro inicial";
    case 3: return "+15 oro inicial adicional";
    case 4: return "+1 accion por ronda (permanente)";
    case 5: return "Titulo 'Maestro' + insignia dorada";
    default: return "";
  }
}

export type MasteryMap = Partial<Record<CharacterId, number>>;

const STORAGE_KEY = "dominix_character_mastery_v1";

function loadRaw(): MasteryMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MasteryMap;
  } catch {
    return {};
  }
}

function saveRaw(map: MasteryMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Raw XP accumulated by a character. */
export function getCharacterXP(id: CharacterId): number {
  return loadRaw()[id] ?? 0;
}

/** Mastery level for the given XP amount (1 = base, capped at MAX). */
export function levelForXP(xp: number): number {
  let level = 1;
  for (let i = 1; i <= MAX_MASTERY_LEVEL; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]!) level = i + 1;
  }
  return Math.min(MAX_MASTERY_LEVEL, level);
}

export function getCharacterLevel(id: CharacterId): number {
  return levelForXP(getCharacterXP(id));
}

/**
 * Current level / next level progress, used for the mastery bar in UI.
 * If already at max level, returns { level: MAX, current: 1, needed: 1 }.
 */
export function getMasteryProgress(id: CharacterId): {
  level: number;
  xp: number;
  currentLevelXP: number;
  nextLevelXP: number;
  percent: number;
  maxed: boolean;
} {
  const xp = getCharacterXP(id);
  const level = levelForXP(xp);
  const maxed = level >= MAX_MASTERY_LEVEL;
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextLevelXP = maxed
    ? LEVEL_THRESHOLDS[MAX_MASTERY_LEVEL] ?? currentLevelXP + 1
    : LEVEL_THRESHOLDS[level] ?? currentLevelXP + 1;
  const span = Math.max(1, nextLevelXP - currentLevelXP);
  const within = Math.max(0, xp - currentLevelXP);
  const percent = maxed ? 100 : Math.min(100, (within / span) * 100);
  return { level, xp, currentLevelXP, nextLevelXP, percent, maxed };
}

/**
 * XP earned from a finished run. Favors depth (rounds) and bosses over
 * raw score so that pushing further is always worthwhile.
 */
export function calculateRunMasteryXP(
  roundsReached: number,
  bossesDefeated: number,
  totalScore: number
): number {
  return Math.round(roundsReached * 15 + bossesDefeated * 60 + totalScore / 80);
}

/**
 * Credit XP to a character. Returns the new level and whether the player
 * leveled up (for celebratory toast).
 */
export function addCharacterXP(
  id: CharacterId,
  amount: number
): { previousLevel: number; newLevel: number; leveledUp: boolean } {
  const map = loadRaw();
  const before = map[id] ?? 0;
  const previousLevel = levelForXP(before);
  const next = before + Math.max(0, Math.round(amount));
  map[id] = next;
  saveRaw(map);
  const newLevel = levelForXP(next);
  return { previousLevel, newLevel, leveledUp: newLevel > previousLevel };
}

export function resetCharacterMastery(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

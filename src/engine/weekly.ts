/**
 * Weekly Challenge — a deterministic run that rotates every Monday.
 *
 * Everyone playing the same week gets:
 * - Same tile pool order (seed by ISO week)
 * - Same preset modifiers (chosen deterministically from the seed)
 * - Same "theme" name shown in the UI
 *
 * Results are persisted locally so the player can see their best score for
 * the current week. When the week rolls over, the entry resets.
 *
 * No server, no global leaderboard — this is local-first "social" via
 * share text that the player can copy to clipboard.
 */

import type { Tile } from "@/types/domino";
import { generateFullSet } from "./tiles";
import { shuffleWithSeed } from "./daily";

/** ISO week number (week starts Monday, week 1 contains Jan 4). */
function getISOWeek(date: Date = new Date()): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Sun=0 becomes 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

function getWeeklySeed(): number {
  const { year, week } = getISOWeek();
  // Stable 32-bit seed combining year and week
  return year * 100 + week;
}

export function getWeeklyLabel(): string {
  const { year, week } = getISOWeek();
  return `Semana ${week} · ${year}`;
}

/** Themed names cycling through the year (24 themes, more than enough). */
const WEEKLY_THEMES = [
  "El Ritmo Antiguo",
  "La Marea Numerica",
  "Ecos Cruzados",
  "Cadena del Oraculo",
  "Peso del Destino",
  "Silencio Doble",
  "Ofrenda Perfecta",
  "Fuga de Patrones",
  "Herencia Rota",
  "Cima del Vertigo",
  "Hierro Liquido",
  "La Aurora Inversa",
  "Espejos Paralelos",
  "Caos Armonico",
  "Rito del Umbral",
  "Camino Menor",
  "Noche Infinita",
  "Pulso Perdido",
  "Cifra Oculta",
  "Trama de Eco",
  "Tumba de Seis",
  "Hilo Dorado",
  "Oraculo Silente",
  "Voz del Azar",
];

export function getWeeklyTheme(): string {
  const { week } = getISOWeek();
  return WEEKLY_THEMES[(week - 1) % WEEKLY_THEMES.length]!;
}

/**
 * Deterministic modifier preset for the week. Uses the seed to pick a
 * combination of 1-2 mild challenges. Not as harsh as a boss fight but
 * enough to make runs feel different week over week.
 */
export interface WeeklyPreset {
  targetMultiplier: number;
  handSizeDelta: number;
  actionBonusDelta: number;
  /** Short human descriptor for the UI. */
  modifierText: string;
}

export function getWeeklyPreset(): WeeklyPreset {
  const seed = getWeeklySeed();
  const mod = seed % 6;
  switch (mod) {
    case 0:
      return { targetMultiplier: 1.10, handSizeDelta: 0, actionBonusDelta: 0, modifierText: "Metas +10%" };
    case 1:
      return { targetMultiplier: 1.0, handSizeDelta: -1, actionBonusDelta: 0, modifierText: "-1 ficha en mano" };
    case 2:
      return { targetMultiplier: 1.0, handSizeDelta: 0, actionBonusDelta: -1, modifierText: "-1 accion por ronda" };
    case 3:
      return { targetMultiplier: 1.05, handSizeDelta: -1, actionBonusDelta: 0, modifierText: "Metas +5% y -1 ficha" };
    case 4:
      return { targetMultiplier: 1.0, handSizeDelta: 0, actionBonusDelta: 1, modifierText: "+1 accion por ronda (ligero)" };
    default:
      return { targetMultiplier: 1.05, handSizeDelta: 0, actionBonusDelta: -1, modifierText: "Metas +5% y -1 accion" };
  }
}

export function getWeeklyTilePool(): Tile[] {
  const seed = getWeeklySeed();
  const fullSet = generateFullSet();
  return shuffleWithSeed(fullSet, seed);
}

// ---- Persistence (local best) ----

const STORAGE_KEY = "dominix_weekly_v1";

export interface WeeklyRecord {
  seed: number;
  bestScore: number;
  bestRound: number;
  runs: number;
  lastPlayedAt: number;
}

export function getWeeklyRecord(): WeeklyRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as WeeklyRecord;
    // Expire silently when week rolls over
    if (data.seed !== getWeeklySeed()) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveWeeklyResult(score: number, round: number): WeeklyRecord {
  const current = getWeeklyRecord();
  const next: WeeklyRecord = {
    seed: getWeeklySeed(),
    bestScore: Math.max(score, current?.bestScore ?? 0),
    bestRound: Math.max(round, current?.bestRound ?? 0),
    runs: (current?.runs ?? 0) + 1,
    lastPlayedAt: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

/** Short share text the player can copy. */
export function getWeeklyShareText(score: number, round: number): string {
  const label = getWeeklyLabel();
  const theme = getWeeklyTheme();
  return `Dominix · ${label} · "${theme}"\nScore ${score.toLocaleString()} · Ronda ${round}`;
}

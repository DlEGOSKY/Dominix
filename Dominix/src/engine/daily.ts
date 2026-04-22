import type { Tile } from "@/types/domino";
import { generateFullSet } from "./tiles";

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function getDailySeed(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  return year * 10000 + month * 100 + day;
}

export function getDailyDateString(): string {
  const now = new Date();
  return now.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const result = [...array];
  const random = seededRandom(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }

  return result;
}

export function getDailyTilePool(): Tile[] {
  const seed = getDailySeed();
  const fullSet = generateFullSet();
  return shuffleWithSeed(fullSet, seed);
}

export function getDailySeedValue(): number {
  return getDailySeed();
}

const DAILY_STORAGE_KEY = "dominix_daily";

interface DailyProgress {
  seed: number;
  bestRound: number;
  completed: boolean;
}

export function getDailyProgress(): DailyProgress | null {
  try {
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as DailyProgress;
    if (data.seed !== getDailySeed()) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveDailyProgress(bestRound: number, completed: boolean): void {
  const progress: DailyProgress = {
    seed: getDailySeed(),
    bestRound,
    completed,
  };
  localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(progress));
}

export function hasDailyBeenPlayed(): boolean {
  const progress = getDailyProgress();
  return progress !== null && progress.completed;
}

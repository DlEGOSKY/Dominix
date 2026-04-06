import type { SavedData } from "@/types/domino";

const STORAGE_KEY = "dominix_save";

const DEFAULT_DATA: SavedData = {
  bestRound: 0,
  bestScore: 0,
  totalRuns: 0,
  totalRoundsPlayed: 0,
};

export function loadSavedData(): SavedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

export function saveBestData(round: number, score: number): void {
  const current = loadSavedData();
  const updated: SavedData = {
    bestRound: Math.max(current.bestRound, round),
    bestScore: Math.max(current.bestScore, score),
    totalRuns: current.totalRuns + 1,
    totalRoundsPlayed: current.totalRoundsPlayed + round,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function incrementRuns(): void {
  const current = loadSavedData();
  current.totalRuns += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

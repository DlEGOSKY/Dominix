import type { RunStats } from "@/types/domino";

export interface RunRecord {
  id: string;
  date: string;
  timestamp: number;
  rounds: number;
  totalScore: number;
  tilesPlayed: number;
  patternsActivated: number;
  relicsCollected: number;
  bossesDefeated: number;
  shopPurchases: number;
  bestCombo: number;
  goldEarned: number;
  highestRoundScore: number;
  relicIds: string[];
  modifier?: string;
  isDaily: boolean;
  roundScores?: number[];
}

export interface AggregateStats {
  totalRuns: number;
  totalScore: number;
  totalTilesPlayed: number;
  totalPatternsActivated: number;
  totalRelicsCollected: number;
  totalBossesDefeated: number;
  totalGoldEarned: number;
  totalShopPurchases: number;
  bestRound: number;
  bestScore: number;
  bestCombo: number;
  bestSingleRoundScore: number;
  avgRounds: number;
  avgScore: number;
  longestWinStreak: number;
  currentWinStreak: number;
  favoriteRelics: { id: string; count: number }[];
}

const HISTORY_KEY = "dominix_run_history";
const MAX_HISTORY = 100;

export function loadRunHistory(): RunRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RunRecord[];
  } catch {
    return [];
  }
}

function saveRunHistory(history: RunRecord[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

export function addRunRecord(
  stats: RunStats,
  relicIds: string[],
  finalRound: number,
  isDaily: boolean,
  modifier?: string
): RunRecord {
  const record: RunRecord = {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
    timestamp: Date.now(),
    rounds: finalRound,
    totalScore: stats.totalScore,
    tilesPlayed: stats.tilesPlayed,
    patternsActivated: stats.patternsActivated,
    relicsCollected: stats.relicsCollected,
    bossesDefeated: stats.bossesDefeated,
    shopPurchases: stats.shopPurchases,
    bestCombo: stats.bestCombo,
    goldEarned: stats.goldEarned,
    highestRoundScore: stats.highestRoundScore,
    relicIds,
    modifier,
    isDaily,
    roundScores: stats.roundScores ?? [],
  };

  const history = loadRunHistory();
  history.unshift(record);
  saveRunHistory(history);
  return record;
}

export function getAggregateStats(): AggregateStats {
  const history = loadRunHistory();

  if (history.length === 0) {
    return {
      totalRuns: 0,
      totalScore: 0,
      totalTilesPlayed: 0,
      totalPatternsActivated: 0,
      totalRelicsCollected: 0,
      totalBossesDefeated: 0,
      totalGoldEarned: 0,
      totalShopPurchases: 0,
      bestRound: 0,
      bestScore: 0,
      bestCombo: 0,
      bestSingleRoundScore: 0,
      avgRounds: 0,
      avgScore: 0,
      longestWinStreak: 0,
      currentWinStreak: 0,
      favoriteRelics: [],
    };
  }

  const relicCounts = new Map<string, number>();

  let totalScore = 0;
  let totalTilesPlayed = 0;
  let totalPatternsActivated = 0;
  let totalRelicsCollected = 0;
  let totalBossesDefeated = 0;
  let totalGoldEarned = 0;
  let totalShopPurchases = 0;
  let bestRound = 0;
  let bestScore = 0;
  let bestCombo = 0;
  let bestSingleRoundScore = 0;

  for (const run of history) {
    totalScore += run.totalScore;
    totalTilesPlayed += run.tilesPlayed;
    totalPatternsActivated += run.patternsActivated;
    totalRelicsCollected += run.relicsCollected;
    totalBossesDefeated += run.bossesDefeated;
    totalGoldEarned += run.goldEarned;
    totalShopPurchases += run.shopPurchases;
    bestRound = Math.max(bestRound, run.rounds);
    bestScore = Math.max(bestScore, run.totalScore);
    bestCombo = Math.max(bestCombo, run.bestCombo);
    bestSingleRoundScore = Math.max(bestSingleRoundScore, run.highestRoundScore);

    for (const relicId of run.relicIds) {
      relicCounts.set(relicId, (relicCounts.get(relicId) || 0) + 1);
    }
  }

  // Win streak: runs with 5+ rounds count as "good"
  let longestWinStreak = 0;
  let currentWinStreak = 0;
  for (const run of history) {
    if (run.rounds >= 3) {
      currentWinStreak++;
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    } else {
      currentWinStreak = 0;
    }
  }
  // Reset current streak to count from most recent
  currentWinStreak = 0;
  for (const run of history) {
    if (run.rounds >= 3) {
      currentWinStreak++;
    } else {
      break;
    }
  }

  const favoriteRelics = Array.from(relicCounts.entries())
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalRuns: history.length,
    totalScore,
    totalTilesPlayed,
    totalPatternsActivated,
    totalRelicsCollected,
    totalBossesDefeated,
    totalGoldEarned,
    totalShopPurchases,
    bestRound,
    bestScore,
    bestCombo,
    bestSingleRoundScore,
    avgRounds: Math.round((history.reduce((s, r) => s + r.rounds, 0) / history.length) * 10) / 10,
    avgScore: Math.round(totalScore / history.length),
    longestWinStreak,
    currentWinStreak,
    favoriteRelics,
  };
}

export function getRecentRuns(count: number = 10): RunRecord[] {
  return loadRunHistory().slice(0, count);
}

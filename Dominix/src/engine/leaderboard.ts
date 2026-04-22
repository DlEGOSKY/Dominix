export interface LeaderboardEntry {
  id: string;
  totalScore: number;
  rounds: number;
  patternsActivated: number;
  relicsCollected: number;
  date: string;
  modifier?: string;
}

const STORAGE_KEY = "dominix_leaderboard";
const MAX_ENTRIES = 10;

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export function addLeaderboardEntry(entry: Omit<LeaderboardEntry, "id" | "date">): LeaderboardEntry {
  const entries = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString(),
  };
  entries.push(newEntry);
  entries.sort((a, b) => b.totalScore - a.totalScore);
  const trimmed = entries.slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return newEntry;
}

export function isNewHighScore(totalScore: number): boolean {
  const entries = getLeaderboard();
  if (entries.length < MAX_ENTRIES) return true;
  return totalScore > (entries[entries.length - 1]?.totalScore ?? 0);
}

export function clearLeaderboard(): void {
  localStorage.removeItem(STORAGE_KEY);
}

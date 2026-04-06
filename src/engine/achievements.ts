import type { RunStats, SavedData } from "@/types/domino";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: RunStats, saved: SavedData) => boolean;
  reward?: string;
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_win",
    name: "Primera Victoria",
    description: "Supera tu primera ronda",
    icon: "star",
    condition: (_, saved) => saved.totalRoundsPlayed >= 1,
  },
  {
    id: "round_3",
    name: "Superviviente",
    description: "Alcanza la ronda 3",
    icon: "shield",
    condition: (_, saved) => saved.bestRound >= 3,
  },
  {
    id: "round_5",
    name: "Veterano",
    description: "Alcanza la ronda 5",
    icon: "medal",
    condition: (_, saved) => saved.bestRound >= 5,
  },
  {
    id: "round_8",
    name: "Maestro",
    description: "Alcanza la ronda 8",
    icon: "crown",
    condition: (_, saved) => saved.bestRound >= 8,
  },
  {
    id: "round_10",
    name: "Leyenda",
    description: "Alcanza la ronda 10",
    icon: "trophy",
    condition: (_, saved) => saved.bestRound >= 10,
  },
  {
    id: "score_200",
    name: "Puntuador",
    description: "Consigue 200 puntos en una ronda",
    icon: "zap",
    condition: (_, saved) => saved.bestScore >= 200,
  },
  {
    id: "score_300",
    name: "Combo Master",
    description: "Consigue 300 puntos en una ronda",
    icon: "flame",
    condition: (_, saved) => saved.bestScore >= 300,
  },
  {
    id: "score_500",
    name: "Destructor",
    description: "Consigue 500 puntos en una ronda",
    icon: "bolt",
    condition: (_, saved) => saved.bestScore >= 500,
  },
  {
    id: "runs_5",
    name: "Persistente",
    description: "Completa 5 runs",
    icon: "repeat",
    condition: (_, saved) => saved.totalRuns >= 5,
  },
  {
    id: "runs_10",
    name: "Dedicado",
    description: "Completa 10 runs",
    icon: "heart",
    condition: (_, saved) => saved.totalRuns >= 10,
  },
  {
    id: "runs_25",
    name: "Adicto",
    description: "Completa 25 runs",
    icon: "infinity",
    condition: (_, saved) => saved.totalRuns >= 25,
  },
  {
    id: "patterns_10",
    name: "Reconocedor",
    description: "Activa 10 patrones en una run",
    icon: "eye",
    condition: (stats) => stats.patternsActivated >= 10,
  },
  {
    id: "relics_5",
    name: "Coleccionista",
    description: "Obtiene 5 reliquias en una run",
    icon: "gem",
    condition: (stats) => stats.relicsCollected >= 5,
  },
  {
    id: "tiles_30",
    name: "Eficiente",
    description: "Juega 30 fichas en una run",
    icon: "layers",
    condition: (stats) => stats.tilesPlayed >= 30,
  },
  {
    id: "perfect_round",
    name: "Ronda Perfecta",
    description: "Juega todas las fichas de tu mano en una ronda",
    icon: "check-circle",
    condition: (stats) => stats.highestRoundScore >= 250,
  },
];

const ACHIEVEMENTS_KEY = "dominix_achievements";

export function getUnlockedAchievements(): string[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function saveUnlockedAchievements(ids: string[]): void {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(ids));
}

export function checkNewAchievements(
  stats: RunStats,
  saved: SavedData
): Achievement[] {
  const unlocked = getUnlockedAchievements();
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ALL_ACHIEVEMENTS) {
    if (unlocked.includes(achievement.id)) continue;
    if (achievement.condition(stats, saved)) {
      newlyUnlocked.push(achievement);
    }
  }

  if (newlyUnlocked.length > 0) {
    const newIds = [...unlocked, ...newlyUnlocked.map((a) => a.id)];
    saveUnlockedAchievements(newIds);
  }

  return newlyUnlocked;
}

export function getAchievementProgress(_saved: SavedData): {
  unlocked: number;
  total: number;
  percentage: number;
} {
  const unlocked = getUnlockedAchievements().length;
  const total = ALL_ACHIEVEMENTS.length;
  return {
    unlocked,
    total,
    percentage: Math.round((unlocked / total) * 100),
  };
}

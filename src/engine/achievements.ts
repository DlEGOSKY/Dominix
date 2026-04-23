import type { RunStats, SavedData } from "@/types/domino";
import { loadCodex } from "./codex";

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
  {
    id: "boss_slayer",
    name: "Caza Jefes",
    description: "Derrota a un jefe",
    icon: "skull",
    condition: (stats) => stats.bossesDefeated >= 1,
  },
  {
    id: "boss_master",
    name: "Domina Jefes",
    description: "Derrota 3 jefes en una run",
    icon: "swords",
    condition: (stats) => stats.bossesDefeated >= 3,
  },
  {
    id: "shopaholic",
    name: "Comprador Compulsivo",
    description: "Compra 5 items en la tienda en una run",
    icon: "shopping-bag",
    condition: (stats) => stats.shopPurchases >= 5,
  },
  {
    id: "combo_2",
    name: "Doble Combo",
    description: "Activa 2 patrones en una misma cadena",
    icon: "sparkles",
    condition: (stats) => stats.bestCombo >= 2,
  },
  {
    id: "combo_4",
    name: "Mega Combo",
    description: "Activa 4 patrones en una misma cadena",
    icon: "stars",
    condition: (stats) => stats.bestCombo >= 4,
  },
  {
    id: "gold_hoarder",
    name: "Acumulador de Oro",
    description: "Acumula 200 de oro en una run",
    icon: "coins",
    condition: (stats) => stats.goldEarned >= 200,
  },
  {
    id: "relic_collector",
    name: "Relicario",
    description: "Obtiene 8 reliquias en una run",
    icon: "archive",
    condition: (stats) => stats.relicsCollected >= 8,
  },
  {
    id: "score_1000",
    name: "Rompe Records",
    description: "Consigue 1000 puntos totales en una run",
    icon: "target",
    condition: (stats) => stats.totalScore >= 1000,
  },
  {
    id: "tiles_50",
    name: "Maquina de Fichas",
    description: "Juega 50 fichas en una run",
    icon: "boxes",
    condition: (stats) => stats.tilesPlayed >= 50,
  },
  {
    id: "round_15",
    name: "Inmortal",
    description: "Alcanza la ronda 15",
    icon: "infinity",
    condition: (_, saved) => saved.bestRound >= 15,
  },
  {
    id: "round_20",
    name: "Eterno",
    description: "Alcanza la ronda 20",
    icon: "sun",
    condition: (_, saved) => saved.bestRound >= 20,
  },
  {
    id: "boss_5",
    name: "Cazador Veterano",
    description: "Derrota 5 jefes en una run",
    icon: "sword",
    condition: (stats) => stats.bossesDefeated >= 5,
  },
  {
    id: "patterns_20",
    name: "Visionario",
    description: "Activa 20 patrones en una run",
    icon: "eye",
    condition: (stats) => stats.patternsActivated >= 20,
  },
  {
    id: "combo_6",
    name: "Combo Legendario",
    description: "Activa 6 patrones en una misma cadena",
    icon: "zap",
    condition: (stats) => stats.bestCombo >= 6,
  },
  {
    id: "score_2000",
    name: "Imparable",
    description: "Consigue 2000 puntos totales en una run",
    icon: "flame",
    condition: (stats) => stats.totalScore >= 2000,
  },
  {
    id: "gold_500",
    name: "Rey Midas",
    description: "Acumula 500 de oro en una run",
    icon: "coins",
    condition: (stats) => stats.goldEarned >= 500,
  },
  {
    id: "shopaholic_10",
    name: "Mercader",
    description: "Compra 10 items en la tienda en una run",
    icon: "shopping-cart",
    condition: (stats) => stats.shopPurchases >= 10,
  },
  {
    id: "relics_12",
    name: "Museo Ambulante",
    description: "Obtiene 12 reliquias en una run",
    icon: "gem",
    condition: (stats) => stats.relicsCollected >= 12,
  },
  {
    id: "tiles_80",
    name: "Dominador Total",
    description: "Juega 80 fichas en una run",
    icon: "grid",
    condition: (stats) => stats.tilesPlayed >= 80,
  },
  {
    id: "round_score_400",
    name: "Ronda Explosiva",
    description: "Consigue 400 puntos en una sola ronda",
    icon: "bolt",
    condition: (stats) => stats.highestRoundScore >= 400,
  },
  {
    id: "runs_50",
    name: "Obsesionado",
    description: "Completa 50 runs",
    icon: "repeat",
    condition: (_, saved) => saved.totalRuns >= 50,
  },
  {
    id: "discard_10",
    name: "Descartador",
    description: "Descarta 10 fichas en una run",
    icon: "trash",
    condition: (stats) => stats.tilesDiscarded >= 10,
  },
  {
    id: "discard_25",
    name: "Purga Total",
    description: "Descarta 25 fichas en una run",
    icon: "eraser",
    condition: (stats) => stats.tilesDiscarded >= 25,
  },
  {
    id: "draw_5",
    name: "Buscador",
    description: "Roba 5 fichas en una run",
    icon: "search",
    condition: (stats) => stats.tilesDrawn >= 5,
  },
  {
    id: "draw_15",
    name: "Explorador Nato",
    description: "Roba 15 fichas en una run",
    icon: "compass",
    condition: (stats) => stats.tilesDrawn >= 15,
  },
  // ---- Codex-based achievements ----
  {
    id: "codex_patterns_10",
    name: "Curioso",
    description: "Descubre 10 patrones distintos",
    icon: "eye",
    condition: () => loadCodex().patterns.discovered >= 10,
  },
  {
    id: "codex_patterns_all",
    name: "Enciclopedista",
    description: "Descubre todos los patrones",
    icon: "book",
    condition: () => {
      const c = loadCodex();
      return c.patterns.discovered >= c.patterns.total;
    },
  },
  {
    id: "codex_bosses_10",
    name: "Cazador Infatigable",
    description: "Enfrenta 10 jefes distintos",
    icon: "swords",
    condition: () => loadCodex().bosses.discovered >= 10,
  },
  {
    id: "codex_celestial_8",
    name: "Astronomo",
    description: "Descubre 8 cartas celestes",
    icon: "sparkles",
    condition: () => loadCodex().celestial.discovered >= 8,
  },
  {
    id: "codex_celestial_all",
    name: "Cartografo del Firmamento",
    description: "Descubre todas las cartas celestes",
    icon: "stars",
    condition: () => {
      const c = loadCodex();
      return c.celestial.discovered >= c.celestial.total;
    },
  },
  {
    id: "codex_chaos_all",
    name: "Casa del Caos",
    description: "Vive todos los giros del Modo Caos",
    icon: "zap",
    condition: () => {
      const c = loadCodex();
      return c.chaos.discovered >= c.chaos.total;
    },
  },
  {
    id: "codex_complete",
    name: "Dominix Pleno",
    description: "Descubre todo el contenido del Codex",
    icon: "crown",
    condition: () => {
      const c = loadCodex();
      return (
        c.patterns.discovered >= c.patterns.total &&
        c.bosses.discovered >= c.bosses.total &&
        c.celestial.discovered >= c.celestial.total &&
        c.chaos.discovered >= c.chaos.total
      );
    },
  },
  // ---- New system achievements ----
  {
    id: "combo_8",
    name: "Ceremonia Perfecta",
    description: "Activa 8 patrones en una misma cadena",
    icon: "stars",
    condition: (stats) => stats.bestCombo >= 8,
  },
  {
    id: "round_score_700",
    name: "Catarsis",
    description: "Consigue 700 puntos en una sola ronda",
    icon: "bolt",
    condition: (stats) => stats.highestRoundScore >= 700,
  },
  {
    id: "score_3000",
    name: "Abismo Puntos",
    description: "Consigue 3000 puntos totales en una run",
    icon: "flame",
    condition: (stats) => stats.totalScore >= 3000,
  },
  {
    id: "round_25",
    name: "Inquebrantable",
    description: "Alcanza la ronda 25",
    icon: "shield",
    condition: (_, saved) => saved.bestRound >= 25,
  },
  {
    id: "runs_100",
    name: "Ceremonia Eterna",
    description: "Completa 100 runs",
    icon: "infinity",
    condition: (_, saved) => saved.totalRuns >= 100,
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

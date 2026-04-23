/**
 * Milestones — persistent "first time" markers. Each milestone fires only
 * the first time the player reaches it, across all runs. Used to trigger
 * celebratory toasts and unlock unspoken rewards.
 *
 * Unlike achievements (which enumerate stats and progress), milestones are
 * specifically for the "aha, I finally did that" moments.
 */

export type MilestoneId =
  | "first_act_ii"
  | "first_act_iii"
  | "first_echo"
  | "first_hexagrama"
  | "first_fractal"
  | "first_boss_defeated"
  | "first_legendary_relic";

interface MilestoneMeta {
  id: MilestoneId;
  title: string;
  subtitle: string;
}

export const MILESTONES: Record<MilestoneId, MilestoneMeta> = {
  first_act_ii: {
    id: "first_act_ii",
    title: "La Travesia comienza",
    subtitle: "Dejaste atras el Umbral. Lo dificil empieza ahora.",
  },
  first_act_iii: {
    id: "first_act_iii",
    title: "La Culminacion te espera",
    subtitle: "Pocos llegan hasta aqui. El ritual se vuelve real.",
  },
  first_echo: {
    id: "first_echo",
    title: "Mas alla del dominio",
    subtitle: "Has entrado al Eco. No hay mapas para este territorio.",
  },
  first_hexagrama: {
    id: "first_hexagrama",
    title: "Hexagrama trazado",
    subtitle: "Seis fichas, seis numeros. La forma perfecta.",
  },
  first_fractal: {
    id: "first_fractal",
    title: "Cadena fractal",
    subtitle: "Toda suma es potencia de dos. La geometria te reconoce.",
  },
  first_boss_defeated: {
    id: "first_boss_defeated",
    title: "Primer jefe caido",
    subtitle: "Supiste ceder, y ganaste. El camino se abre.",
  },
  first_legendary_relic: {
    id: "first_legendary_relic",
    title: "Reliquia legendaria",
    subtitle: "Algunas formas solo aparecen para quienes las ven.",
  },
};

const STORAGE_KEY = "dominix_milestones_v1";

function loadReached(): Set<MilestoneId> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as MilestoneId[]);
  } catch {
    return new Set();
  }
}

function saveReached(set: Set<MilestoneId>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export function hasReached(id: MilestoneId): boolean {
  return loadReached().has(id);
}

/**
 * Tries to mark a milestone as reached. Returns the milestone meta if this
 * was the first time (caller should celebrate), null otherwise.
 */
export function tryReachMilestone(id: MilestoneId): MilestoneMeta | null {
  const reached = loadReached();
  if (reached.has(id)) return null;
  reached.add(id);
  saveReached(reached);
  return MILESTONES[id];
}

export function resetMilestones() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

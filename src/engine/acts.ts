/**
 * Acts — narrative structure for a run.
 *
 * A run is divided into three thematic acts, each with a name, a tone, and
 * a visual ambient. Beyond act III begins "El Eco" (endless territory).
 *
 * This adds macro-structure to what was previously just a linear progression
 * of round numbers.
 */

export type ActId = "umbral" | "travesia" | "culminacion" | "eco";

export interface ActDefinition {
  id: ActId;
  numeral: string;
  name: string;
  tagline: string;
  /** Range of rounds this act spans (inclusive). Eco is open-ended. */
  range: [number, number];
  /** Tailwind tint classes for ambient background. */
  ambient: {
    from: string;
    via: string;
    to: string;
    accent: string;
  };
  /** Short mood descriptor shown under the numeral in transitions. */
  mood: string;
}

export const ACTS: ActDefinition[] = [
  {
    id: "umbral",
    numeral: "Acto I",
    name: "El Umbral",
    tagline: "Donde las fichas aun susurran.",
    range: [1, 5],
    ambient: {
      from: "from-slate-950",
      via: "via-slate-900",
      to: "to-slate-950",
      accent: "rgba(148,163,184,0.10)", // slate-400
    },
    mood: "Sereno",
  },
  {
    id: "travesia",
    numeral: "Acto II",
    name: "La Travesia",
    tagline: "El dominio exige precio.",
    range: [6, 10],
    ambient: {
      from: "from-amber-950/40",
      via: "via-slate-950",
      to: "to-red-950/30",
      accent: "rgba(251,146,60,0.12)", // amber-500
    },
    mood: "Tenso",
  },
  {
    id: "culminacion",
    numeral: "Acto III",
    name: "La Culminacion",
    tagline: "Toda cadena encuentra su ultimo eco.",
    range: [11, 15],
    ambient: {
      from: "from-purple-950/50",
      via: "via-slate-950",
      to: "to-amber-950/40",
      accent: "rgba(212,168,83,0.18)", // accent-gold
    },
    mood: "Ritual",
  },
  {
    id: "eco",
    numeral: "El Eco",
    name: "Mas alla del dominio",
    tagline: "Lo que sigue ya no tiene nombre.",
    range: [16, Infinity],
    ambient: {
      from: "from-violet-950/50",
      via: "via-slate-950",
      to: "to-violet-950/50",
      accent: "rgba(168,85,247,0.15)", // violet-500
    },
    mood: "Infinito",
  },
];

export function getActForRound(round: number): ActDefinition {
  for (const act of ACTS) {
    if (round >= act.range[0] && round <= act.range[1]) return act;
  }
  return ACTS[ACTS.length - 1]!;
}

/**
 * Returns the act of the current round IF it just changed relative to the
 * previous round — i.e. we crossed into a new act. Returns null otherwise.
 */
export function detectActTransition(prevRound: number, newRound: number): ActDefinition | null {
  if (newRound <= prevRound) return null;
  const prevAct = getActForRound(prevRound);
  const newAct = getActForRound(newRound);
  if (prevAct.id === newAct.id) return null;
  return newAct;
}

/** Whether a given round is the first round of its act. */
export function isActOpener(round: number): boolean {
  const act = getActForRound(round);
  return act.range[0] === round;
}

/** Whether a given round is the final round of its act (for finite acts). */
export function isActFinale(round: number): boolean {
  const act = getActForRound(round);
  return act.range[1] === round;
}

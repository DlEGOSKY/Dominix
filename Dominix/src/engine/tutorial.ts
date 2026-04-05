export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  highlight?: "hand" | "chain" | "score" | "patterns" | "relics" | "target";
  action?: "play_tile" | "end_chain" | "claim_reward" | "any";
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Bienvenido a Dominix",
    content: "Un roguelike de domino donde construyes cadenas, activas patrones y coleccionas reliquias para llegar lo mas lejos posible.",
    action: "any",
  },
  {
    id: "hand",
    title: "Tu Mano",
    content: "Estas son tus fichas. Cada ficha tiene dos numeros. Haz clic en una ficha para jugarla.",
    highlight: "hand",
    action: "any",
  },
  {
    id: "chain",
    title: "La Cadena",
    content: "Las fichas se conectan por numeros iguales. El numero de un extremo debe coincidir con el de la ficha que juegas.",
    highlight: "chain",
    action: "play_tile",
  },
  {
    id: "score",
    title: "Puntuacion",
    content: "Cada ficha jugada suma puntos. Cadenas mas largas dan bonus. Tu objetivo es alcanzar la meta de la ronda.",
    highlight: "score",
    action: "any",
  },
  {
    id: "target",
    title: "Meta de Ronda",
    content: "Debes alcanzar esta puntuacion para superar la ronda. Si no puedes jugar mas fichas y no llegas, pierdes la run.",
    highlight: "target",
    action: "any",
  },
  {
    id: "patterns",
    title: "Patrones",
    content: "Ciertas combinaciones activan patrones que dan bonus o multiplicadores. Experimenta para descubrirlos.",
    highlight: "patterns",
    action: "any",
  },
  {
    id: "end",
    title: "Listo para Jugar",
    content: "Supera rondas, elige recompensas y construye tu build. Buena suerte!",
    action: "any",
  },
];

const TUTORIAL_KEY = "dominix_tutorial_done";

export function isTutorialComplete(): boolean {
  return localStorage.getItem(TUTORIAL_KEY) === "1";
}

export function markTutorialComplete(): void {
  localStorage.setItem(TUTORIAL_KEY, "1");
}

export function resetTutorial(): void {
  localStorage.removeItem(TUTORIAL_KEY);
}

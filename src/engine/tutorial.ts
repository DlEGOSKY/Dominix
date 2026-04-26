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
    title: "Bienvenido al ritual",
    content: "Dominix se juega por rondas. Cada cinco rondas termina un acto, y al final del acto enfrentas un jefe. Tu mision: llegar lo mas lejos posible.",
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
    title: "La cadena",
    content: "Las fichas se conectan por numeros iguales: el extremo de la cadena debe coincidir con un numero de la ficha que juegas. Cada ficha jugada suma puntos.",
    highlight: "chain",
    action: "play_tile",
  },
  {
    id: "target",
    title: "Meta de la ronda",
    content: "Debes alcanzar la meta mostrada. Si no lo logras antes de quedarte sin jugadas, la run termina.",
    highlight: "target",
    action: "any",
  },
  {
    id: "patterns",
    title: "Patrones",
    content: "Ciertas formas de tu cadena activan patrones: bonus y multiplicadores. Cuantos mas acumules, mas peso tiene cada ficha. Experimenta para descubrirlos.",
    highlight: "patterns",
    action: "any",
  },
  {
    id: "actions",
    title: "Acciones, descartes y robos",
    content: "Cada ronda tienes un limite de acciones. Jugar, descartar (pasa el cursor y pulsa X) y robar fichas del pool consumen acciones. Planifica.",
    action: "any",
  },
  {
    id: "relics",
    title: "Reliquias y build",
    content: "Al superar rondas eliges reliquias. Pertenecen a familias (Patron, Numero, Fuerza, Cadena, Accion). Tres de la misma familia activan un bonus de set permanente.",
    highlight: "relics",
    action: "any",
  },
  {
    id: "acts",
    title: "Actos e interludios",
    content: "Cada acto (5 rondas) termina en un jefe. Al derrotarlo te espera un interludio narrativo: una eleccion que marca la run. Respeta el ritmo del acto.",
    action: "any",
  },
  {
    id: "progression",
    title: "Progresion y Coleccion",
    content: "Cada run te da XP, incluso si caes. Al subir de nivel desbloqueas oro inicial, reliquias de partida, fichas doradas y skins con identidad propia (Pacto, Reliquia, Cosmos y mas). Revisa todo lo desbloqueado en Coleccion desde el menu principal y elige tu skin activa.",
    action: "any",
  },
  {
    id: "end",
    title: "Que comience el ritual",
    content: "Supera rondas, elige con intencion, construye tu build. La ceremonia empieza ahora.",
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

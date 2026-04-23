/**
 * Interludes — narrative scenes triggered after an act boss is defeated,
 * before the next act's map appears. Each interlude presents 2-3 choices
 * with tangible effects on the run.
 *
 * Designed to add soul and identity: these are the moments where the player
 * pauses, reads a few lines of atmosphere, and makes a decision that leaves
 * a mark on the run.
 */

import type { ActId } from "./acts";

export interface InterludeOutcome {
  /** Short narrative text shown after the choice resolves. */
  resolution: string;
  /** Delta to apply to run state. */
  effects: {
    gold?: number;
    /** Add a random relic of this rarity, or a random one if omitted. */
    randomRelic?: "common" | "rare" | "legendary" | "any";
    /** Grant a random consumable. */
    randomConsumable?: boolean;
    /** Grant a random celestial. */
    randomCelestial?: boolean;
    /** Modify the next round's target (multiplicative, e.g. 0.85 = -15%). */
    nextTargetMultiplier?: number;
    /** Permanent bonus score flat for the rest of the run. */
    permanentFlatBonus?: number;
    /** Remove a random tile from the player's current pool. */
    trimPool?: number;
  };
}

export interface InterludeChoice {
  id: string;
  label: string;
  hint?: string;
  outcome: InterludeOutcome;
}

export interface Interlude {
  id: string;
  /** Which acts (after which finale) this interlude can appear. */
  afterActs: ActId[];
  /** Title card. */
  title: string;
  /** 2-3 short narrative paragraphs setting the scene. */
  body: string[];
  /** Attribution / speaker note, optional. */
  speaker?: string;
  choices: InterludeChoice[];
}

export const INTERLUDES: Interlude[] = [
  {
    id: "mercader_ecos",
    afterActs: ["umbral", "travesia"],
    title: "El Mercader de Ecos",
    body: [
      "Una figura cubierta por un manto gris aparece en el margen del mapa.",
      "Su rostro es imposible de recordar. Extiende tres objetos envueltos en tela. Uno brilla bajo el paño. Los otros dos, no.",
    ],
    speaker: "Elige con cuidado. El eco de esta decision persistira.",
    choices: [
      {
        id: "oro",
        label: "Tomar el oro",
        hint: "Ganancia segura, sin riesgo.",
        outcome: {
          resolution: "El mercader asiente. Las monedas pesan mas de lo que deberian.",
          effects: { gold: 60 },
        },
      },
      {
        id: "reliquia",
        label: "Tomar la reliquia envuelta",
        hint: "Al azar, podria ser mundana o legendaria.",
        outcome: {
          resolution: "Algo se despliega en tu mano. Hay un brillo que ya no puedes ignorar.",
          effects: { randomRelic: "any" },
        },
      },
      {
        id: "consumible",
        label: "Tomar el consumible envuelto",
        hint: "Un solo uso, pero inmediato.",
        outcome: {
          resolution: "Un fragmento de voluntad ajena se adhiere a tu inventario.",
          effects: { randomConsumable: true },
        },
      },
    ],
  },
  {
    id: "espejo_roto",
    afterActs: ["umbral", "travesia", "culminacion"],
    title: "El Espejo Roto",
    body: [
      "Un espejo cuelga en medio del pasillo. Esta partido por la mitad.",
      "En una mitad te ves a ti mismo, pero el rostro esta frio, calculador. En la otra, te ves jugando con desenfreno, rodeado de luz.",
      "Ambas versiones te observan.",
    ],
    speaker: "Una de las dos gana el proximo asalto.",
    choices: [
      {
        id: "frio",
        label: "Abrazar al yo calculador",
        hint: "Proxima ronda con meta reducida (-15%).",
        outcome: {
          resolution: "Tu proximo asalto sera medido. Cada ficha caera donde debe.",
          effects: { nextTargetMultiplier: 0.85 },
        },
      },
      {
        id: "salvaje",
        label: "Abrazar al yo salvaje",
        hint: "Score permanente +3 por ficha restante de la run.",
        outcome: {
          resolution: "La luz te acompana. Cada ficha que caiga pesara un poco mas.",
          effects: { permanentFlatBonus: 3 },
        },
      },
    ],
  },
  {
    id: "ofrenda_ritual",
    afterActs: ["travesia", "culminacion"],
    title: "La Ofrenda",
    body: [
      "Un altar de piedra. Fichas carbonizadas alrededor, todavia humeantes.",
      "Una voz sin cuerpo susurra: 'Entrega lo que te sobra. Recibe lo que no tienes.'",
    ],
    speaker: "El ritual no pregunta, solo cobra.",
    choices: [
      {
        id: "entregar",
        label: "Quemar 3 fichas del pool",
        hint: "Pool mas pequeno. A cambio, una carta celestial.",
        outcome: {
          resolution: "Tres fichas se vuelven ceniza. El cielo se abre por un instante.",
          effects: { trimPool: 3, randomCelestial: true },
        },
      },
      {
        id: "retirarse",
        label: "Retirarse en silencio",
        hint: "Sin costo. Sin premio. Solo paz.",
        outcome: {
          resolution: "El altar se apaga a tus espaldas. Respiras.",
          effects: {},
        },
      },
    ],
  },
  {
    id: "guardian_umbral",
    afterActs: ["culminacion"],
    title: "El Guardian del Umbral",
    body: [
      "Al final del acto, una silueta enorme bloquea el paso.",
      "No te ataca. Te observa. Ha visto a cientos como tu romperse aqui.",
      "Extiende una mano. En ella, una marca que no reconoces. En la otra, el silencio.",
    ],
    speaker: "Aceptar la marca cambia la run para siempre.",
    choices: [
      {
        id: "marca",
        label: "Aceptar la marca",
        hint: "Reliquia legendaria, pero proxima meta +20%.",
        outcome: {
          resolution: "La marca arde en tu pecho. Algo se grabo en ti que no podras borrar.",
          effects: { randomRelic: "legendary", nextTargetMultiplier: 1.2 },
        },
      },
      {
        id: "silencio",
        label: "Continuar en silencio",
        hint: "Conservas tu ritmo actual.",
        outcome: {
          resolution: "El Guardian inclina la cabeza. No hay juicio en su mirada.",
          effects: {},
        },
      },
    ],
  },
];

/**
 * Pick a random interlude appropriate for the act that was just finished.
 * Returns null if there are none available (shouldn't happen with current set).
 */
export function rollInterlude(completedActId: ActId): Interlude | null {
  const pool = INTERLUDES.filter((i) => i.afterActs.includes(completedActId));
  if (pool.length === 0) return null;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] ?? null;
}

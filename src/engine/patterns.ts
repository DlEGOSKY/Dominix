import type { ChainState } from "@/types/domino";

export interface PatternResult {
  id: string;
  name: string;
  bonus: number;
  multiplier: number;
}

export interface ComboResult {
  name: string;
  bonus: number;
  multiplier: number;
}

export interface PatternAnalysis {
  patterns: PatternResult[];
  combo: ComboResult | null;
  totalBonus: number;
  totalMultiplier: number;
}

function isDouble(top: number, bottom: number): boolean {
  return top === bottom;
}

function detectCadenaSimple(chain: ChainState): PatternResult | null {
  if (chain.placed.length >= 3) {
    return {
      id: "cadena_simple",
      name: "Cadena Simple",
      bonus: 15,
      multiplier: 1,
    };
  }
  return null;
}

function detectCadenaLarga(chain: ChainState): PatternResult | null {
  if (chain.placed.length >= 5) {
    return {
      id: "cadena_larga",
      name: "Cadena Larga",
      bonus: 0,
      multiplier: 1.5,
    };
  }
  return null;
}

function detectDobleDoble(chain: ChainState): PatternResult | null {
  const doubles = chain.placed.filter((p) =>
    isDouble(p.tile.top, p.tile.bottom)
  );
  if (doubles.length >= 2) {
    return {
      id: "doble_doble",
      name: "Doble Doble",
      bonus: 30,
      multiplier: 1,
    };
  }
  return null;
}

function detectDominio(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 3) return null;

  const connectionCounts: Record<number, number> = {};

  for (const p of chain.placed) {
    connectionCounts[p.exposedLeft] = (connectionCounts[p.exposedLeft] ?? 0) + 1;
    connectionCounts[p.exposedRight] = (connectionCounts[p.exposedRight] ?? 0) + 1;
  }

  const dominantNumber = Object.entries(connectionCounts).find(
    ([_, count]) => count >= 4
  );

  if (dominantNumber) {
    return {
      id: "dominio",
      name: `Dominio del ${dominantNumber[0]}`,
      bonus: 25,
      multiplier: 1,
    };
  }
  return null;
}

function detectCierreExacto(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 2) return null;
  if (chain.leftEnd === chain.rightEnd) {
    return {
      id: "cierre_exacto",
      name: "Cierre Exacto",
      bonus: 0,
      multiplier: 2,
    };
  }
  return null;
}

function detectEscalera(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 4) return null;

  const connections: number[] = [];
  for (const p of chain.placed) {
    connections.push(p.exposedLeft);
  }
  if (chain.placed.length > 0) {
    connections.push(chain.placed[chain.placed.length - 1]!.exposedRight);
  }

  let ascending = 0;
  let descending = 0;
  for (let i = 1; i < connections.length; i++) {
    if (connections[i]! > connections[i - 1]!) ascending++;
    if (connections[i]! < connections[i - 1]!) descending++;
  }

  if (ascending >= 3 || descending >= 3) {
    return {
      id: "escalera",
      name: "Escalera",
      bonus: 35,
      multiplier: 1,
    };
  }
  return null;
}

function detectTripleDoble(chain: ChainState): PatternResult | null {
  const doubles = chain.placed.filter((p) => isDouble(p.tile.top, p.tile.bottom));
  if (doubles.length >= 3) {
    return {
      id: "triple_doble",
      name: "Triple Doble",
      bonus: 50,
      multiplier: 1.2,
    };
  }
  return null;
}

function detectSimetria(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 3) return null;
  if (chain.leftEnd === chain.rightEnd && chain.placed.length % 2 === 1) {
    const mid = Math.floor(chain.placed.length / 2);
    const midTile = chain.placed[mid];
    if (midTile && isDouble(midTile.tile.top, midTile.tile.bottom)) {
      return {
        id: "simetria",
        name: "Simetria",
        bonus: 40,
        multiplier: 1.3,
      };
    }
  }
  return null;
}

function detectSumaExacta(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 3) return null;

  let sum = 0;
  for (const p of chain.placed) {
    sum += p.tile.top + p.tile.bottom;
  }

  if (sum === 21 || sum === 42 || sum === 63) {
    return {
      id: "suma_exacta",
      name: `Suma ${sum}`,
      bonus: 0,
      multiplier: 1.5,
    };
  }
  return null;
}

function detectPuente(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 5) return null;

  const first = chain.placed[0];
  const last = chain.placed[chain.placed.length - 1];
  if (!first || !last) return null;

  const startNum = first.exposedLeft;
  const endNum = last.exposedRight;

  if (Math.abs(startNum - endNum) === 6) {
    return {
      id: "puente",
      name: "Puente 0-6",
      bonus: 45,
      multiplier: 1,
    };
  }
  return null;
}

function detectParejas(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 4) return null;

  let pairs = 0;
  for (let i = 0; i < chain.placed.length - 1; i++) {
    const current = chain.placed[i]!;
    const next = chain.placed[i + 1]!;
    if (current.tile.top + current.tile.bottom === next.tile.top + next.tile.bottom) {
      pairs++;
    }
  }

  if (pairs >= 2) {
    return {
      id: "parejas",
      name: "Parejas",
      bonus: 30,
      multiplier: 1.15,
    };
  }
  return null;
}

function detectRachaAlta(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 3) return null;

  let highCount = 0;
  for (const p of chain.placed) {
    const sum = p.tile.top + p.tile.bottom;
    if (sum >= 9) highCount++;
  }

  if (highCount >= 3) {
    return {
      id: "racha_alta",
      name: "Racha Alta",
      bonus: 40,
      multiplier: 1,
    };
  }
  return null;
}

function detectRachaBaja(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 4) return null;

  let lowCount = 0;
  for (const p of chain.placed) {
    const sum = p.tile.top + p.tile.bottom;
    if (sum <= 4) lowCount++;
  }

  if (lowCount >= 4) {
    return {
      id: "racha_baja",
      name: "Racha Baja",
      bonus: 0,
      multiplier: 1.4,
    };
  }
  return null;
}

function detectAlternancia(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 4) return null;

  let alternating = true;
  for (let i = 0; i < chain.placed.length - 1; i++) {
    const current = chain.placed[i]!;
    const next = chain.placed[i + 1]!;
    const currentIsDouble = isDouble(current.tile.top, current.tile.bottom);
    const nextIsDouble = isDouble(next.tile.top, next.tile.bottom);
    if (currentIsDouble === nextIsDouble) {
      alternating = false;
      break;
    }
  }

  if (alternating) {
    return {
      id: "alternancia",
      name: "Alternancia",
      bonus: 35,
      multiplier: 1.1,
    };
  }
  return null;
}

function detectCadenaMaxima(chain: ChainState): PatternResult | null {
  if (chain.placed.length >= 7) {
    return {
      id: "cadena_maxima",
      name: "Cadena Maxima",
      bonus: 60,
      multiplier: 1.8,
    };
  }
  return null;
}

function detectEspejo(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 4) return null;
  let mirrors = 0;
  for (let i = 0; i < chain.placed.length - 1; i++) {
    const a = chain.placed[i]!;
    const b = chain.placed[i + 1]!;
    if (a.tile.top === b.tile.bottom && a.tile.bottom === b.tile.top) mirrors++;
  }
  if (mirrors >= 2) {
    return { id: "espejo", name: "Espejo", bonus: 35, multiplier: 1.2 };
  }
  return null;
}

function detectTodoDobles(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 3) return null;
  const allDoubles = chain.placed.every((p) => isDouble(p.tile.top, p.tile.bottom));
  if (allDoubles) {
    return { id: "todo_dobles", name: "Todo Dobles", bonus: 0, multiplier: 2.5 };
  }
  return null;
}

function detectZigzag(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 5) return null;
  const connections: number[] = [];
  for (const p of chain.placed) connections.push(p.exposedLeft);
  connections.push(chain.placed[chain.placed.length - 1]!.exposedRight);
  let zigzags = 0;
  for (let i = 2; i < connections.length; i++) {
    const prev = connections[i - 2]!;
    const mid = connections[i - 1]!;
    const curr = connections[i]!;
    if ((mid > prev && mid > curr) || (mid < prev && mid < curr)) zigzags++;
  }
  if (zigzags >= 3) {
    return { id: "zigzag", name: "Zigzag", bonus: 40, multiplier: 1.15 };
  }
  return null;
}

function detectSumaImpar(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 4) return null;
  const allOdd = chain.placed.every((p) => (p.tile.top + p.tile.bottom) % 2 === 1);
  if (allOdd) {
    return { id: "suma_impar", name: "Suma Impar", bonus: 30, multiplier: 1.3 };
  }
  return null;
}

function detectAvalancha(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 4) return null;
  let increasing = true;
  for (let i = 1; i < chain.placed.length; i++) {
    const prevSum = chain.placed[i - 1]!.tile.top + chain.placed[i - 1]!.tile.bottom;
    const currSum = chain.placed[i]!.tile.top + chain.placed[i]!.tile.bottom;
    if (currSum < prevSum) { increasing = false; break; }
  }
  if (increasing) {
    return { id: "avalancha", name: "Avalancha", bonus: 45, multiplier: 1.25 };
  }
  return null;
}

/**
 * Trinidad: 3+ fichas consecutivas que comparten un valor común entre todas.
 * Ejemplo: 3|5, 5|6, 6|3 — no comparte uno, no activa.
 *          4|1, 4|7, 4|2 — comparten 4, activa.
 */
function detectTrinidad(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 3) return null;
  for (let i = 0; i <= chain.placed.length - 3; i++) {
    const t1 = chain.placed[i]!.tile;
    const t2 = chain.placed[i + 1]!.tile;
    const t3 = chain.placed[i + 2]!.tile;
    const vals1 = new Set([t1.top, t1.bottom]);
    const vals2 = new Set([t2.top, t2.bottom]);
    const vals3 = new Set([t3.top, t3.bottom]);
    const common = [...vals1].filter((v) => vals2.has(v) && vals3.has(v));
    if (common.length > 0) {
      return { id: "trinidad", name: "Trinidad", bonus: 45, multiplier: 1.15 };
    }
  }
  return null;
}

/**
 * Fractal: cadena donde TODAS las fichas tienen suma que es potencia de 2 (1,2,4,8).
 * Extremadamente raro pero muy rewarding cuando pasa.
 */
function detectFractal(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 4) return null;
  const validSums = new Set([1, 2, 4, 8]);
  const allFractal = chain.placed.every((p) => validSums.has(p.tile.top + p.tile.bottom));
  if (allFractal) {
    return { id: "fractal", name: "Fractal", bonus: 60, multiplier: 1.2 };
  }
  return null;
}

/**
 * Armonia: la suma total de todos los pips de la cadena es un número primo.
 * Premia cadenas de tamaño intermedio con suma específica.
 */
function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * Constelacion: at least 5 DISTINCT numbers appear across the chain's
 * connections. Rewards diverse builds and careful draws.
 */
function detectConstelacion(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 5) return null;
  const numbers = new Set<number>();
  for (const p of chain.placed) {
    numbers.add(p.tile.top);
    numbers.add(p.tile.bottom);
  }
  if (numbers.size >= 6) {
    return { id: "constelacion", name: "Constelacion", bonus: 55, multiplier: 1.25 };
  }
  return null;
}

/**
 * Diminuendo: 4+ consecutive tiles whose sums are strictly decreasing.
 * The counterpart of Avalancha — rewards "fall" progressions.
 */
function detectDiminuendo(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 4) return null;
  let decreasing = true;
  for (let i = 1; i < chain.placed.length; i++) {
    const prev = chain.placed[i - 1]!.tile;
    const curr = chain.placed[i]!.tile;
    if (curr.top + curr.bottom >= prev.top + prev.bottom) {
      decreasing = false;
      break;
    }
  }
  if (decreasing) {
    return { id: "diminuendo", name: "Diminuendo", bonus: 35, multiplier: 1.3 };
  }
  return null;
}

/**
 * Corona: 3+ doubles whose values form a consecutive run (e.g. 3|3, 4|4, 5|5).
 * Order in chain doesn't matter — only the values.
 */
function detectCorona(chain: ChainState): PatternResult | null {
  const doubleValues = chain.placed
    .filter((p) => isDouble(p.tile.top, p.tile.bottom))
    .map((p) => p.tile.top)
    .sort((a, b) => a - b);
  if (doubleValues.length < 3) return null;
  // Check for any consecutive run of length 3+ in the sorted unique values
  const unique = [...new Set(doubleValues)];
  let runLen = 1;
  let maxRun = 1;
  for (let i = 1; i < unique.length; i++) {
    if (unique[i]! === unique[i - 1]! + 1) {
      runLen++;
      maxRun = Math.max(maxRun, runLen);
    } else {
      runLen = 1;
    }
  }
  if (maxRun >= 3) {
    return { id: "corona", name: "Corona", bonus: 50, multiplier: 1.2 };
  }
  return null;
}

/**
 * Hexagrama: chain of EXACTLY 6 tiles where no number repeats across tiles
 * (each of the 12 halves must be a distinct value — impossible with only 7
 * numbers, so relax: at least 6 distinct values among the 12 halves).
 * Difficult and specific — a legendary condition.
 */
function detectHexagrama(chain: ChainState): PatternResult | null {
  if (chain.placed.length !== 6) return null;
  const numbers = new Set<number>();
  for (const p of chain.placed) {
    numbers.add(p.tile.top);
    numbers.add(p.tile.bottom);
  }
  if (numbers.size >= 6) {
    return { id: "hexagrama", name: "Hexagrama", bonus: 80, multiplier: 1.5 };
  }
  return null;
}

function detectArmonia(chain: ChainState): PatternResult | null {
  if (chain.placed.length < 3) return null;
  const total = chain.placed.reduce((s, p) => s + p.tile.top + p.tile.bottom, 0);
  if (isPrime(total)) {
    return { id: "armonia", name: "Armonia", bonus: 40, multiplier: 1.35 };
  }
  return null;
}

export function analyzePatterns(chain: ChainState): PatternAnalysis {
  const detectors = [
    detectCadenaSimple,
    detectCadenaLarga,
    detectCadenaMaxima,
    detectDobleDoble,
    detectTripleDoble,
    detectDominio,
    detectCierreExacto,
    detectEscalera,
    detectSimetria,
    detectParejas,
    detectRachaAlta,
    detectRachaBaja,
    detectAlternancia,
    detectSumaExacta,
    detectPuente,
    detectEspejo,
    detectTodoDobles,
    detectZigzag,
    detectSumaImpar,
    detectAvalancha,
    detectTrinidad,
    detectFractal,
    detectArmonia,
    detectConstelacion,
    detectDiminuendo,
    detectCorona,
    detectHexagrama,
  ];

  const patterns: PatternResult[] = [];

  for (const detect of detectors) {
    const result = detect(chain);
    if (result) {
      patterns.push(result);
    }
  }

  const patternBonus = patterns.reduce((sum, p) => sum + p.bonus, 0);
  const patternMultiplier = patterns.reduce((mult, p) => mult * p.multiplier, 1);

  const combo = detectCombo(patterns);
  const totalBonus = patternBonus + (combo?.bonus ?? 0);
  const totalMultiplier = patternMultiplier * (combo?.multiplier ?? 1);

  return {
    patterns,
    combo,
    totalBonus,
    totalMultiplier,
  };
}

const COMBO_TIERS: { min: number; name: string; bonus: number; multiplier: number }[] = [
  { min: 2, name: "Doble Combo", bonus: 20, multiplier: 1.15 },
  { min: 3, name: "Triple Combo", bonus: 40, multiplier: 1.3 },
  { min: 4, name: "Mega Combo", bonus: 70, multiplier: 1.5 },
  { min: 5, name: "Ultra Combo", bonus: 100, multiplier: 1.8 },
];

export interface PatternInfo {
  id: string;
  name: string;
  description: string;
  bonus: number;
  multiplier: number;
}

export const ALL_PATTERNS: PatternInfo[] = [
  { id: "cadena_simple", name: "Cadena Simple", description: "Coloca 3+ fichas en la cadena", bonus: 15, multiplier: 1 },
  { id: "cadena_larga", name: "Cadena Larga", description: "Coloca 5+ fichas en la cadena", bonus: 0, multiplier: 1.5 },
  { id: "cadena_maxima", name: "Cadena Maxima", description: "Coloca 7+ fichas en la cadena", bonus: 50, multiplier: 2 },
  { id: "doble_doble", name: "Doble Doble", description: "Juega 2 dobles en la cadena", bonus: 30, multiplier: 1 },
  { id: "triple_doble", name: "Triple Doble", description: "Juega 3 dobles en la cadena", bonus: 0, multiplier: 1.4 },
  { id: "todo_dobles", name: "Todo Dobles", description: "Toda la cadena son dobles (3+)", bonus: 0, multiplier: 2.5 },
  { id: "dominio", name: "Dominio", description: "Un numero aparece en 3+ conexiones", bonus: 25, multiplier: 1.2 },
  { id: "cierre_exacto", name: "Cierre Exacto", description: "Los extremos de la cadena coinciden", bonus: 40, multiplier: 1 },
  { id: "escalera", name: "Escalera", description: "4+ conexiones forman secuencia ascendente", bonus: 35, multiplier: 1.3 },
  { id: "simetria", name: "Simetria", description: "Cadena simetrica con extremos iguales", bonus: 45, multiplier: 1 },
  { id: "parejas", name: "Parejas", description: "3+ pares de fichas consecutivas con misma suma", bonus: 30, multiplier: 1.2 },
  { id: "racha_alta", name: "Racha Alta", description: "3+ fichas consecutivas con suma >= 8", bonus: 25, multiplier: 1.15 },
  { id: "racha_baja", name: "Racha Baja", description: "4+ fichas consecutivas con suma <= 4", bonus: 35, multiplier: 1.25 },
  { id: "alternancia", name: "Alternancia", description: "4+ fichas alternando par/impar en suma", bonus: 30, multiplier: 1.2 },
  { id: "suma_exacta", name: "Suma Exacta", description: "Suma total de la cadena es multiplo de 10", bonus: 50, multiplier: 1 },
  { id: "puente", name: "Puente", description: "5+ fichas donde primera y ultima comparten un valor", bonus: 35, multiplier: 1.3 },
  { id: "espejo", name: "Espejo", description: "3+ fichas consecutivas con valores invertidos", bonus: 40, multiplier: 1.2 },
  { id: "zigzag", name: "Zigzag", description: "5+ conexiones alternando subir/bajar", bonus: 35, multiplier: 1.25 },
  { id: "suma_impar", name: "Suma Impar", description: "4+ fichas donde todas suman impar", bonus: 30, multiplier: 1.2 },
  { id: "avalancha", name: "Avalancha", description: "4+ fichas con sumas crecientes", bonus: 35, multiplier: 1.3 },
  { id: "trinidad", name: "Trinidad", description: "3+ fichas consecutivas con un numero en comun", bonus: 45, multiplier: 1.15 },
  { id: "fractal", name: "Fractal", description: "Cadena donde todas las sumas son potencia de 2 (1,2,4,8)", bonus: 60, multiplier: 1.2 },
  { id: "armonia", name: "Armonia", description: "Suma total de la cadena es un numero primo", bonus: 40, multiplier: 1.35 },
  { id: "constelacion", name: "Constelacion", description: "Cadena de 5+ fichas con 6+ numeros distintos", bonus: 55, multiplier: 1.25 },
  { id: "diminuendo", name: "Diminuendo", description: "4+ fichas con sumas estrictamente decrecientes", bonus: 35, multiplier: 1.3 },
  { id: "corona", name: "Corona", description: "3+ dobles con valores consecutivos (ej 3|3, 4|4, 5|5)", bonus: 50, multiplier: 1.2 },
  { id: "hexagrama", name: "Hexagrama", description: "Cadena exacta de 6 fichas con 6+ numeros distintos", bonus: 80, multiplier: 1.5 },
];

function detectCombo(patterns: PatternResult[]): ComboResult | null {
  const count = patterns.length;
  let best: ComboResult | null = null;
  for (const tier of COMBO_TIERS) {
    if (count >= tier.min) {
      best = { name: tier.name, bonus: tier.bonus, multiplier: tier.multiplier };
    }
  }
  return best;
}

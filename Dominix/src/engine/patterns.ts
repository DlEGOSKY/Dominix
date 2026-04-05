import type { ChainState } from "@/types/domino";

export interface PatternResult {
  id: string;
  name: string;
  bonus: number;
  multiplier: number;
}

export interface PatternAnalysis {
  patterns: PatternResult[];
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
  ];

  const patterns: PatternResult[] = [];

  for (const detect of detectors) {
    const result = detect(chain);
    if (result) {
      patterns.push(result);
    }
  }

  const totalBonus = patterns.reduce((sum, p) => sum + p.bonus, 0);
  const totalMultiplier = patterns.reduce((mult, p) => mult * p.multiplier, 1);

  return {
    patterns,
    totalBonus,
    totalMultiplier,
  };
}

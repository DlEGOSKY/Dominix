import type { Relic } from "@/types/relic";
import type { ChainState } from "@/types/domino";
import type { PatternAnalysis } from "./patterns";

export const ALL_RELICS: Relic[] = [
  {
    id: "eco_par",
    name: "Eco Par",
    description: "Los numeros pares otorgan +5 por aparicion",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: -1, value: 5 },
  },
  {
    id: "pulso_bajo",
    name: "Pulso Bajo",
    description: "Numeros 0-3 otorgan +3 extra cada uno",
    trigger: "on_score",
    effect: { type: "bonus_low_numbers", value: 3 },
  },
  {
    id: "corona_alta",
    name: "Corona Alta",
    description: "Numeros 4-6 otorgan +4 extra cada uno",
    trigger: "on_score",
    effect: { type: "bonus_high_numbers", value: 4 },
  },
  {
    id: "doble_corona",
    name: "Doble Corona",
    description: "Los dobles multiplican x1.3",
    trigger: "on_double",
    effect: { type: "bonus_per_double", value: 15 },
  },
  {
    id: "final_pesado",
    name: "Final Pesado",
    description: "Cierre Exacto otorga +50 extra",
    trigger: "on_pattern",
    effect: { type: "bonus_if_pattern", patternId: "cierre_exacto", value: 50 },
  },
  {
    id: "cadena_tensa",
    name: "Cadena Tensa",
    description: "Cadena Larga otorga x1.2 adicional",
    trigger: "on_pattern",
    effect: { type: "multiplier_if_pattern", patternId: "cadena_larga", value: 1.2 },
  },
  {
    id: "mano_firme",
    name: "Mano Firme",
    description: "+5 puntos por cada ficha jugada",
    trigger: "on_score",
    effect: { type: "bonus_per_tile", value: 5 },
  },
  {
    id: "impulso_inicial",
    name: "Impulso Inicial",
    description: "+25 puntos fijos al score",
    trigger: "passive",
    effect: { type: "bonus_flat", value: 25 },
  },
  {
    id: "precision",
    name: "Precision",
    description: "x1.15 multiplicador global",
    trigger: "passive",
    effect: { type: "multiplier", value: 1.15 },
  },
  {
    id: "seis_dorado",
    name: "Seis Dorado",
    description: "Cada 6 en la cadena otorga +8",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 6, value: 8 },
  },
  {
    id: "cero_vacio",
    name: "Cero Vacio",
    description: "Cada 0 en la cadena otorga +10",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 0, value: 10 },
  },
  {
    id: "dominio_total",
    name: "Dominio Total",
    description: "Patron Dominio otorga +40 extra",
    trigger: "on_pattern",
    effect: { type: "bonus_if_pattern", patternId: "dominio", value: 40 },
  },
  {
    id: "tres_magico",
    name: "Tres Magico",
    description: "Cada 3 en la cadena otorga +7",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 3, value: 7 },
  },
  {
    id: "uno_solitario",
    name: "Uno Solitario",
    description: "Cada 1 en la cadena otorga +6",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 1, value: 6 },
  },
  {
    id: "cuatro_estable",
    name: "Cuatro Estable",
    description: "Cada 4 en la cadena otorga +5",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 4, value: 5 },
  },
  {
    id: "cinco_central",
    name: "Cinco Central",
    description: "Cada 5 en la cadena otorga +6",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 5, value: 6 },
  },
  {
    id: "dos_gemelos",
    name: "Dos Gemelos",
    description: "Cada 2 en la cadena otorga +5",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 2, value: 5 },
  },
  {
    id: "amplificador",
    name: "Amplificador",
    description: "x1.25 multiplicador global",
    trigger: "passive",
    effect: { type: "multiplier", value: 1.25 },
  },
  {
    id: "base_solida",
    name: "Base Solida",
    description: "+40 puntos fijos al score",
    trigger: "passive",
    effect: { type: "bonus_flat", value: 40 },
  },
  {
    id: "cadena_maestra",
    name: "Cadena Maestra",
    description: "+8 puntos por cada ficha jugada",
    trigger: "on_score",
    effect: { type: "bonus_per_tile", value: 8 },
  },
  {
    id: "doble_filo",
    name: "Doble Filo",
    description: "Los dobles otorgan +25 cada uno",
    trigger: "on_double",
    effect: { type: "bonus_per_double", value: 25 },
  },
  {
    id: "simple_efectivo",
    name: "Simple Efectivo",
    description: "Cadena Simple otorga +20 extra",
    trigger: "on_pattern",
    effect: { type: "bonus_if_pattern", patternId: "cadena_simple", value: 20 },
  },
  {
    id: "doble_amenaza",
    name: "Doble Amenaza",
    description: "Doble Doble otorga x1.3 adicional",
    trigger: "on_pattern",
    effect: { type: "multiplier_if_pattern", patternId: "doble_doble", value: 1.3 },
  },
  {
    id: "impar_salvaje",
    name: "Impar Salvaje",
    description: "Numeros impares otorgan +4 cada uno",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: -2, value: 4 },
  },
  {
    id: "escalador",
    name: "Escalador",
    description: "Patron Escalera otorga +45 extra",
    trigger: "on_pattern",
    effect: { type: "bonus_if_pattern", patternId: "escalera", value: 45 },
  },
  {
    id: "parejas_perfectas",
    name: "Parejas Perfectas",
    description: "Patron Parejas otorga x1.4 adicional",
    trigger: "on_pattern",
    effect: { type: "multiplier_if_pattern", patternId: "parejas", value: 1.4 },
  },
  {
    id: "racha_imparable",
    name: "Racha Imparable",
    description: "Racha Alta otorga +50 extra",
    trigger: "on_pattern",
    effect: { type: "bonus_if_pattern", patternId: "racha_alta", value: 50 },
  },
  {
    id: "minimalista",
    name: "Minimalista",
    description: "Racha Baja otorga x1.5 adicional",
    trigger: "on_pattern",
    effect: { type: "multiplier_if_pattern", patternId: "racha_baja", value: 1.5 },
  },
  {
    id: "ritmo_perfecto",
    name: "Ritmo Perfecto",
    description: "Alternancia otorga +40 y x1.2",
    trigger: "on_pattern",
    effect: { type: "bonus_if_pattern", patternId: "alternancia", value: 40 },
  },
  {
    id: "maestro_cadenas",
    name: "Maestro de Cadenas",
    description: "Cadena Maxima otorga x2 adicional",
    trigger: "on_pattern",
    effect: { type: "multiplier_if_pattern", patternId: "cadena_maxima", value: 2 },
  },
];

export function getRandomRelics(count: number, exclude: string[] = []): Relic[] {
  const available = ALL_RELICS.filter((r) => !exclude.includes(r.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export interface RelicBonus {
  bonus: number;
  multiplier: number;
}

export function calculateRelicBonus(
  relics: Relic[],
  chain: ChainState,
  patternAnalysis: PatternAnalysis
): RelicBonus {
  let bonus = 0;
  let multiplier = 1;

  const allNumbers: number[] = [];
  let doubleCount = 0;

  for (const p of chain.placed) {
    allNumbers.push(p.tile.top, p.tile.bottom);
    if (p.tile.top === p.tile.bottom) {
      doubleCount++;
    }
  }

  const patternIds = patternAnalysis.patterns.map((p) => p.id);

  for (const relic of relics) {
    const effect = relic.effect;

    switch (effect.type) {
      case "bonus_flat":
        bonus += effect.value;
        break;

      case "multiplier":
        multiplier *= effect.value;
        break;

      case "bonus_per_tile":
        bonus += chain.placed.length * effect.value;
        break;

      case "bonus_per_double":
        bonus += doubleCount * effect.value;
        break;

      case "bonus_per_number":
        if (effect.number === -1) {
          const evenCount = allNumbers.filter((n) => n % 2 === 0).length;
          bonus += evenCount * effect.value;
        } else if (effect.number === -2) {
          const oddCount = allNumbers.filter((n) => n % 2 === 1).length;
          bonus += oddCount * effect.value;
        } else {
          const count = allNumbers.filter((n) => n === effect.number).length;
          bonus += count * effect.value;
        }
        break;

      case "bonus_low_numbers":
        const lowCount = allNumbers.filter((n) => n <= 3).length;
        bonus += lowCount * effect.value;
        break;

      case "bonus_high_numbers":
        const highCount = allNumbers.filter((n) => n >= 4).length;
        bonus += highCount * effect.value;
        break;

      case "bonus_if_pattern":
        if (patternIds.includes(effect.patternId)) {
          bonus += effect.value;
        }
        break;

      case "multiplier_if_pattern":
        if (patternIds.includes(effect.patternId)) {
          multiplier *= effect.value;
        }
        break;
    }
  }

  return { bonus, multiplier };
}

import type { IconType } from "react-icons";
import { GiSpiralBloom, GiRollingDices, GiPunch, GiPathDistance, GiSprint } from "react-icons/gi";
import type { Relic, RelicRarity, RelicFamily } from "@/types/relic";
import type { ChainState } from "@/types/domino";
import type { PatternAnalysis } from "./patterns";
import { getGlobalRNG } from "./rng";

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
    description: "Cada 6 en la cadena otorga +12",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 6, value: 12 },
  },
  {
    id: "cero_vacio",
    name: "Cero Vacio",
    description: "Cada 0 en la cadena otorga +14",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 0, value: 14 },
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
    description: "Cada 3 en la cadena otorga +10",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 3, value: 10 },
  },
  {
    id: "uno_solitario",
    name: "Uno Solitario",
    description: "Cada 1 en la cadena otorga +9",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 1, value: 9 },
  },
  {
    id: "cuatro_estable",
    name: "Cuatro Estable",
    description: "Cada 4 en la cadena otorga +8",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 4, value: 8 },
  },
  {
    id: "cinco_central",
    name: "Cinco Central",
    description: "Cada 5 en la cadena otorga +9",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 5, value: 9 },
  },
  {
    id: "dos_gemelos",
    name: "Dos Gemelos",
    description: "Cada 2 en la cadena otorga +8",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 2, value: 8 },
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
  {
    id: "reflejo",
    name: "Reflejo",
    description: "Patron Espejo otorga +40 extra",
    trigger: "on_pattern",
    effect: { type: "bonus_if_pattern", patternId: "espejo", value: 40 },
  },
  {
    id: "pureza_doble",
    name: "Pureza Doble",
    description: "Todo Dobles otorga x1.5 adicional",
    trigger: "on_pattern",
    effect: { type: "multiplier_if_pattern", patternId: "todo_dobles", value: 1.5 },
  },
  {
    id: "serpiente",
    name: "Serpiente",
    description: "Patron Zigzag otorga +50 extra",
    trigger: "on_pattern",
    effect: { type: "bonus_if_pattern", patternId: "zigzag", value: 50 },
  },
  {
    id: "avalancha_total",
    name: "Avalancha Total",
    description: "Patron Avalancha otorga x1.4 adicional",
    trigger: "on_pattern",
    effect: { type: "multiplier_if_pattern", patternId: "avalancha", value: 1.4 },
  },
  {
    id: "fortuna",
    name: "Fortuna",
    description: "+60 puntos fijos al score",
    trigger: "passive",
    effect: { type: "bonus_flat", value: 60 },
  },
  {
    id: "supernova",
    name: "Supernova",
    description: "x1.4 multiplicador global",
    trigger: "passive",
    effect: { type: "multiplier", value: 1.4 },
  },
  {
    id: "reloj_arena",
    name: "Reloj de Arena",
    description: "+3 acciones por ronda",
    trigger: "passive",
    effect: { type: "extra_actions", value: 3 },
  },
  {
    id: "mano_larga",
    name: "Mano Larga",
    description: "+1 robo adicional por ronda",
    trigger: "passive",
    effect: { type: "extra_draws", value: 1 },
  },
  {
    id: "filtro",
    name: "Filtro",
    description: "+1 descarte adicional por ronda",
    trigger: "passive",
    effect: { type: "extra_discards", value: 1 },
  },
  {
    id: "reciclador",
    name: "Reciclador",
    description: "+15 puntos por cada ficha descartada",
    trigger: "passive",
    effect: { type: "bonus_per_discard", value: 15 },
  },
  {
    id: "explorador",
    name: "Explorador",
    description: "+20 puntos por cada ficha robada",
    trigger: "passive",
    effect: { type: "bonus_on_draw", value: 20 },
  },
  {
    id: "tactico",
    name: "Tactico",
    description: "+4 acciones por ronda",
    trigger: "passive",
    effect: { type: "extra_actions", value: 4 },
  },
  // ---- Legendarias nuevas (S6) ----
  {
    id: "cascada_patrones",
    name: "Cascada de Patrones",
    description: "x1.15 multiplicador por cada patron activado",
    trigger: "on_pattern",
    effect: { type: "multiplier_per_pattern", value: 0.15 },
    rarity: "legendary",
    family: "patron",
  },
  {
    id: "corona_rota",
    name: "Corona Rota",
    description: "+50 puntos por cada doble en la cadena",
    trigger: "on_double",
    effect: { type: "bonus_per_double", value: 50 },
    rarity: "legendary",
    family: "fuerza",
  },
  {
    id: "sello_firmamento",
    name: "Sello del Firmamento",
    description: "Potencia todas las cartas celestes un 25%",
    trigger: "passive",
    effect: { type: "celestial_boost", value: 0.25 },
    rarity: "legendary",
    family: "patron",
  },
  {
    id: "ampolleta_maestra",
    name: "Ampolleta Maestra",
    description: "+12 puntos por cada ficha jugada (el tiempo es poder)",
    trigger: "on_score",
    effect: { type: "bonus_per_tile", value: 12 },
    rarity: "legendary",
    family: "cadena",
  },
  // ---- S7: reliquias para nuevos patrones y sinergias ----
  {
    id: "dedo_luminoso",
    name: "Dedo Luminoso",
    description: "Constelacion otorga +70 extra",
    trigger: "on_pattern",
    effect: { type: "bonus_if_pattern", patternId: "constelacion", value: 70 },
    rarity: "rare",
    family: "patron",
  },
  {
    id: "caida_prolongada",
    name: "Caida Prolongada",
    description: "Diminuendo otorga x1.5 adicional",
    trigger: "on_pattern",
    effect: { type: "multiplier_if_pattern", patternId: "diminuendo", value: 1.5 },
    rarity: "rare",
    family: "patron",
  },
  {
    id: "coronacion",
    name: "Coronacion",
    description: "Corona otorga +60 extra",
    trigger: "on_pattern",
    effect: { type: "bonus_if_pattern", patternId: "corona", value: 60 },
    rarity: "rare",
    family: "patron",
  },
  {
    id: "hexagrama_sagrado",
    name: "Hexagrama Sagrado",
    description: "Hexagrama otorga x2.0 adicional",
    trigger: "on_pattern",
    effect: { type: "multiplier_if_pattern", patternId: "hexagrama", value: 2.0 },
    rarity: "legendary",
    family: "patron",
  },
  {
    id: "lector_formas",
    name: "Lector de Formas",
    description: "x1.06 multiplicador por cada patron activado",
    trigger: "on_pattern",
    effect: { type: "multiplier_per_pattern", value: 0.06 },
    rarity: "rare",
    family: "patron",
  },
  {
    id: "oraculo_cosmico",
    name: "Oraculo Cosmico",
    description: "Potencia todas las cartas celestes un 18%",
    trigger: "passive",
    effect: { type: "celestial_boost", value: 0.18 },
    rarity: "rare",
    family: "patron",
  },
  {
    id: "disciplina",
    name: "Disciplina",
    description: "x1.10 multiplicador global",
    trigger: "passive",
    effect: { type: "multiplier", value: 1.1 },
    rarity: "common",
    family: "fuerza",
  },
  {
    id: "tres_lineas",
    name: "Tres Lineas",
    description: "Trinidad otorga +40 extra",
    trigger: "on_pattern",
    effect: { type: "bonus_if_pattern", patternId: "trinidad", value: 40 },
    rarity: "common",
    family: "patron",
  },
  {
    id: "eco_roto",
    name: "Eco Roto",
    description: "Fractal otorga +120 extra",
    trigger: "on_pattern",
    effect: { type: "bonus_if_pattern", patternId: "fractal", value: 120 },
    rarity: "legendary",
    family: "patron",
  },
  {
    id: "armonia_divina",
    name: "Armonia Divina",
    description: "Armonia otorga x1.4 adicional",
    trigger: "on_pattern",
    effect: { type: "multiplier_if_pattern", patternId: "armonia", value: 1.4 },
    rarity: "rare",
    family: "patron",
  },
  // ---- S8: nuevas reliquias para variedad de builds ----
  {
    id: "pisada_lobo",
    name: "Pisada del Lobo",
    description: "Cada 1 en la cadena otorga +12 (sigiloso pero feroz)",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 1, value: 12 },
    rarity: "common",
    family: "numero",
  },
  {
    id: "linaje_estable",
    name: "Linaje Estable",
    description: "Los dobles otorgan +18 cada uno",
    trigger: "on_double",
    effect: { type: "bonus_per_double", value: 18 },
    rarity: "common",
    family: "fuerza",
  },
  {
    id: "filo_roto",
    name: "Filo Roto",
    description: "x1.08 multiplicador global. El acero astillado aun corta.",
    trigger: "passive",
    effect: { type: "multiplier", value: 1.08 },
    rarity: "common",
    family: "fuerza",
  },
  {
    id: "estandarte_andante",
    name: "Estandarte Andante",
    description: "+4 puntos por cada ficha jugada",
    trigger: "on_score",
    effect: { type: "bonus_per_tile", value: 4 },
    rarity: "common",
    family: "cadena",
  },
  {
    id: "sangre_pactada",
    name: "Sangre Pactada",
    description: "Los dobles otorgan +35 cada uno (juramento de hierro)",
    trigger: "on_double",
    effect: { type: "bonus_per_double", value: 35 },
    rarity: "rare",
    family: "fuerza",
  },
  {
    id: "reloj_quebrado",
    name: "Reloj Quebrado",
    description: "Alternancia otorga x1.6 adicional",
    trigger: "on_pattern",
    effect: { type: "multiplier_if_pattern", patternId: "alternancia", value: 1.6 },
    rarity: "rare",
    family: "patron",
  },
  {
    id: "mirada_vacio",
    name: "Mirada del Vacio",
    description: "Cada 0 en la cadena otorga +22 (te devuelve la mirada)",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 0, value: 22 },
    rarity: "rare",
    family: "numero",
  },
  {
    id: "eternidad",
    name: "Eternidad",
    description: "x1.18 multiplicador por cada patron activado",
    trigger: "on_pattern",
    effect: { type: "multiplier_per_pattern", value: 0.18 },
    rarity: "legendary",
    family: "patron",
  },
  // ---- S9: nuevas reliquias ----
  // Accion — dan identidad a la familia y suben masa critica para set bonus
  {
    id: "brazalete_tactico",
    name: "Brazalete Tactico",
    description: "+2 acciones y +2 descartes por ronda",
    trigger: "passive",
    effect: { type: "extra_actions", value: 2 },
    rarity: "rare",
    family: "accion",
  },
  {
    id: "bolsa_infinita",
    name: "Bolsa Infinita",
    description: "+2 robos por ronda. La mano nunca se agota.",
    trigger: "passive",
    effect: { type: "extra_draws", value: 2 },
    rarity: "rare",
    family: "accion",
  },
  // Numero — cubren los huecos de 4 y 5 con mas personalidad
  {
    id: "cuatro_cardinal",
    name: "Cuatro Cardinal",
    description: "Cada 4 en la cadena otorga +14 (punto de cruce)",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 4, value: 14 },
    rarity: "common",
    family: "numero",
  },
  {
    id: "cinco_vertice",
    name: "Cinco Vertice",
    description: "Cada 5 en la cadena otorga +14 (centro del tablero)",
    trigger: "on_score",
    effect: { type: "bonus_per_number", number: 5, value: 14 },
    rarity: "common",
    family: "numero",
  },
  // Legendarias con mecanica nueva
  {
    id: "espiral_crescendo",
    name: "Espiral Crescendo",
    description: "Crescendo otorga x2.0 adicional. La escalada no tiene techo.",
    trigger: "on_pattern",
    effect: { type: "multiplier_if_pattern", patternId: "crescendo", value: 2.0 },
    rarity: "legendary",
    family: "patron",
  },
  {
    id: "nudo_ouroboros",
    name: "Nudo Ouroboros",
    description: "Ouroboros otorga +200 extra. El circulo completo.",
    trigger: "on_pattern",
    effect: { type: "bonus_if_pattern", patternId: "ouroboros", value: 200 },
    rarity: "legendary",
    family: "patron",
  },
];

export function getRandomRelics(count: number, exclude: string[] = []): Relic[] {
  const available = ALL_RELICS.filter((r) => !exclude.includes(r.id));
  const shuffled = [...available].sort(() => getGlobalRNG().next() - 0.5);
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

      case "multiplier_per_pattern":
        // Stacks: x(1 + value * patternsCount)
        multiplier *= 1 + effect.value * patternIds.length;
        break;

      case "celestial_boost":
        // No-op here; applied directly inside celestialTotalBonus where the
        // engine can see owned cards. We intentionally ignore it so the score
        // pipeline stays clean.
        break;
    }
  }

  return { bonus, multiplier };
}

// ---- Rarity classification ----
// Legendary: run-defining heavy multipliers / uniquely powerful pattern effects
// Rare: solid multipliers, big flat pattern bonuses
// Common (default): small flat/per-number/per-tile bonuses

const LEGENDARY_IDS = new Set<string>([
  "amplificador",         // x1.25 global
  "maestro_cadenas",      // cadena_maxima x2
  "minimalista",          // racha_baja x1.5
  "parejas_perfectas",    // parejas x1.4
  "cascada_patrones",     // x1.15 per pattern
  "corona_rota",          // +50 per double
  "sello_firmamento",     // +25% celestial
  "ampolleta_maestra",    // +12/tile legendary
  "espiral_crescendo",    // crescendo x2
  "nudo_ouroboros",       // ouroboros +200
]);

const RARE_IDS = new Set<string>([
  "precision",            // x1.15 global
  "doble_corona",         // doubles x1.3
  "doble_amenaza",        // doble_doble x1.3
  "cadena_tensa",         // cadena_larga x1.2
  "final_pesado",         // cierre +50
  "dominio_total",        // dominio +40
  "escalador",            // escalera +45
  "racha_imparable",      // racha_alta +50
  "ritmo_perfecto",       // alternancia +40
  "doble_filo",           // doubles +25
  "cadena_maestra",       // +8/tile
  "base_solida",          // +40 flat
]);

export function getRelicRarity(relic: Relic): RelicRarity {
  if (relic.rarity) return relic.rarity;
  if (LEGENDARY_IDS.has(relic.id)) return "legendary";
  if (RARE_IDS.has(relic.id)) return "rare";
  return "common";
}

// ---- Family classification ----
// Families group relics by playstyle. Owning 3+ of a family grants a set bonus.
//
// Patron: relics that trigger on pattern activation
// Numero: relics that grant bonuses per specific number occurrence
// Fuerza: flat score bonuses and global multipliers
// Cadena: per-tile and double-focused scoring
// Accion: action-economy, draws, discards

const FAMILY_MAP: Record<string, RelicFamily> = {
  // Patron
  final_pesado: "patron",
  cadena_tensa: "patron",
  dominio_total: "patron",
  simple_efectivo: "patron",
  doble_amenaza: "patron",
  escalador: "patron",
  parejas_perfectas: "patron",
  racha_imparable: "patron",
  minimalista: "patron",
  ritmo_perfecto: "patron",
  maestro_cadenas: "patron",
  reflejo: "patron",
  pureza_doble: "patron",
  serpiente: "patron",
  avalancha_total: "patron",

  // Numero
  eco_par: "numero",
  pulso_bajo: "numero",
  corona_alta: "numero",
  seis_dorado: "numero",
  cero_vacio: "numero",
  tres_magico: "numero",
  uno_solitario: "numero",
  cuatro_estable: "numero",
  cinco_central: "numero",
  dos_gemelos: "numero",
  impar_salvaje: "numero",
  cuatro_cardinal: "numero",
  cinco_vertice: "numero",

  // Fuerza
  impulso_inicial: "fuerza",
  base_solida: "fuerza",
  precision: "fuerza",
  amplificador: "fuerza",
  fortuna: "fuerza",
  supernova: "fuerza",

  // Cadena
  mano_firme: "cadena",
  cadena_maestra: "cadena",
  doble_corona: "cadena",
  doble_filo: "cadena",
  ampolleta_maestra: "cadena",

  // Accion
  reloj_arena: "accion",
  mano_larga: "accion",
  filtro: "accion",
  reciclador: "accion",
  explorador: "accion",
  tactico: "accion",
  brazalete_tactico: "accion",
  bolsa_infinita: "accion",
};

export function getRelicFamily(relic: Relic): RelicFamily | null {
  if (relic.family) return relic.family;
  return FAMILY_MAP[relic.id] ?? null;
}

export const FAMILY_META: Record<RelicFamily, { name: string; color: string; icon: IconType; setBonusDescription: string }> = {
  patron: {
    name: "Patron",
    color: "accent-gold",
    icon: GiSpiralBloom,
    setBonusDescription: "3+ reliquias: +25% a todos los bonos de patron",
  },
  numero: {
    name: "Numero",
    color: "blue",
    icon: GiRollingDices,
    setBonusDescription: "3+ reliquias: +30 score fijo por ronda",
  },
  fuerza: {
    name: "Fuerza",
    color: "red",
    icon: GiPunch,
    setBonusDescription: "3+ reliquias: x1.10 multiplicador global adicional",
  },
  cadena: {
    name: "Cadena",
    color: "purple",
    icon: GiPathDistance,
    setBonusDescription: "3+ reliquias: +4 score por ficha jugada",
  },
  accion: {
    name: "Accion",
    color: "green",
    icon: GiSprint,
    setBonusDescription: "3+ reliquias: +1 accion disponible por ronda",
  },
};

export interface FamilySetBonus {
  patronPatternBoost: number;      // multiply bonus_if_pattern / multiplier_if_pattern delta
  numeroFlatBonus: number;         // flat bonus per round
  fuerzaGlobalMultiplier: number;  // extra multiplier applied at end
  cadenaPerTile: number;           // extra per tile played
  accionExtraActions: number;      // extra actions per round
  /** Families currently activated (for UI) */
  activeFamilies: RelicFamily[];
}

/**
 * Given a list of owned relic IDs, compute which families have 3+ relics
 * and return the bonuses to apply. Stackless: one tier only (3+).
 */
export function computeFamilySetBonuses(ownedRelicIds: string[]): FamilySetBonus {
  const counts: Record<RelicFamily, number> = {
    patron: 0, numero: 0, fuerza: 0, cadena: 0, accion: 0,
  };
  for (const id of ownedRelicIds) {
    const family = FAMILY_MAP[id];
    if (family) counts[family]++;
  }
  const activeFamilies: RelicFamily[] = [];
  const result: FamilySetBonus = {
    patronPatternBoost: 0,
    numeroFlatBonus: 0,
    fuerzaGlobalMultiplier: 1,
    cadenaPerTile: 0,
    accionExtraActions: 0,
    activeFamilies,
  };
  if (counts.patron >= 3) { result.patronPatternBoost = 0.25; activeFamilies.push("patron"); }
  if (counts.numero >= 3) { result.numeroFlatBonus = 30; activeFamilies.push("numero"); }
  if (counts.fuerza >= 3) { result.fuerzaGlobalMultiplier = 1.10; activeFamilies.push("fuerza"); }
  if (counts.cadena >= 3) { result.cadenaPerTile = 4; activeFamilies.push("cadena"); }
  if (counts.accion >= 3) { result.accionExtraActions = 1; activeFamilies.push("accion"); }
  return result;
}

/** Count of each family in the owned set (for progress UI). */
export function getFamilyCounts(ownedRelicIds: string[]): Record<RelicFamily, number> {
  const counts: Record<RelicFamily, number> = {
    patron: 0, numero: 0, fuerza: 0, cadena: 0, accion: 0,
  };
  for (const id of ownedRelicIds) {
    const family = FAMILY_MAP[id];
    if (family) counts[family]++;
  }
  return counts;
}


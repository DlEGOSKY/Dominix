/**
 * Maps each pattern id to a game-icons.net icon from react-icons/gi.
 * Icons licensed under CC-BY 3.0 by Lorc, Delapouite and contributors
 * at game-icons.net. Attribution shown in Credits screen.
 */

import type { IconType } from "react-icons";
import {
  GiLinkedRings,
  GiChainMail,
  GiInfinity,
  GiDoubled,
  GiTriforce,
  GiCrystalShine,
  GiConqueror,
  GiClosedDoors,
  GiAscendingBlock,
  GiYinYang,
  GiDualityMask,
  GiThunderStruck,
  GiFeather,
  GiSwapBag,
  GiBullseye,
  GiBridge,
  GiMirrorMirror,
  GiZigzagLeaf,
  GiUnbalanced,
  GiMountainRoad,
  GiTrident,
  GiAbstract024,
  GiHarp,
  GiStarsStack,
  GiFallingStar,
  GiQueenCrown,
  GiPentagramRose,
  GiInterdiction,
  GiUprising,
  GiBookCover,
  GiOuroboros,
} from "react-icons/gi";

/** pattern id -> GameIcons component */
export const PATTERN_ICON_MAP: Record<string, IconType> = {
  cadena_simple: GiLinkedRings,
  cadena_larga: GiChainMail,
  cadena_maxima: GiInfinity,
  doble_doble: GiDoubled,
  triple_doble: GiTriforce,
  todo_dobles: GiCrystalShine,
  dominio: GiConqueror,
  cierre_exacto: GiClosedDoors,
  escalera: GiAscendingBlock,
  simetria: GiYinYang,
  parejas: GiDualityMask,
  racha_alta: GiThunderStruck,
  racha_baja: GiFeather,
  alternancia: GiSwapBag,
  suma_exacta: GiBullseye,
  puente: GiBridge,
  espejo: GiMirrorMirror,
  zigzag: GiZigzagLeaf,
  suma_impar: GiUnbalanced,
  avalancha: GiMountainRoad,
  trinidad: GiTrident,
  fractal: GiAbstract024,
  armonia: GiHarp,
  constelacion: GiStarsStack,
  diminuendo: GiFallingStar,
  corona: GiQueenCrown,
  hexagrama: GiPentagramRose,
  // ---- S8 patterns ----
  triple_filo: GiInterdiction,
  crescendo: GiUprising,
  cuna: GiBookCover,
  ouroboros: GiOuroboros,
};

export function getPatternIcon(patternId: string): IconType | null {
  return PATTERN_ICON_MAP[patternId] ?? null;
}

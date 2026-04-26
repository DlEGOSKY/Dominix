/**
 * Maps achievement icon string keys to react-icons/gi components.
 * Achievement objects in `achievements.ts` store the icon as a string key
 * (e.g. "star", "trophy"); this module resolves them to React components.
 */

import type { IconType } from "react-icons";
import {
  GiStarFormation,
  GiShield,
  GiMedal,
  GiCrown,
  GiTrophyCup,
  GiThunderStruck,
  GiFlame,
  GiLightningTrio,
  GiRecycle,
  GiHeartInside,
  GiInfinity,
  GiEyeball,
  GiCutDiamond,
  GiStoneBlock,
  GiCheckMark,
  GiBookCover,
  GiStarsStack,
  GiSparkles,
  GiCrownedSkull,
  GiCrossedSwords,
  GiSwordSpin,
  GiTwoCoins,
  GiShoppingBag,
  GiShoppingCart,
  GiArchiveResearch,
  GiBullseye,
  GiSun,
  GiMagnifyingGlass,
  GiCompass,
  GiAbstract061,
  GiTrashCan,
} from "react-icons/gi";

const ACHIEVEMENT_ICON_MAP: Record<string, IconType> = {
  star: GiStarFormation,
  shield: GiShield,
  medal: GiMedal,
  crown: GiCrown,
  trophy: GiTrophyCup,
  zap: GiThunderStruck,
  flame: GiFlame,
  bolt: GiLightningTrio,
  repeat: GiRecycle,
  heart: GiHeartInside,
  infinity: GiInfinity,
  eye: GiEyeball,
  gem: GiCutDiamond,
  layers: GiStoneBlock,
  "check-circle": GiCheckMark,
  book: GiBookCover,
  stars: GiStarsStack,
  sparkles: GiSparkles,
  skull: GiCrownedSkull,
  swords: GiCrossedSwords,
  sword: GiSwordSpin,
  coins: GiTwoCoins,
  "shopping-bag": GiShoppingBag,
  "shopping-cart": GiShoppingCart,
  archive: GiArchiveResearch,
  target: GiBullseye,
  boxes: GiStoneBlock,
  sun: GiSun,
  search: GiMagnifyingGlass,
  compass: GiCompass,
  grid: GiAbstract061,
  trash: GiTrashCan,
  eraser: GiTrashCan,
};

export function getAchievementIcon(key: string): IconType {
  return ACHIEVEMENT_ICON_MAP[key] ?? GiStarFormation;
}

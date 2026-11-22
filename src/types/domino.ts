export type TileType = "normal" | "wild" | "golden" | "locked" | "mirror" | "bomb";

export type TileEdition = "foil" | "holo" | "polychrome" | "negative";

export interface Tile {
  id: string;
  top: number;
  bottom: number;
  type?: TileType;
  lockedUntilRound?: number;
  /** Optional visual+mechanical edition layered on top of type */
  edition?: TileEdition;
  /** Pacto Sagrado marker: this tile grants a big score bonus when played */
  pact?: boolean;
}

export type PlacementSide = "left" | "right";

export interface PlacedTile {
  tile: Tile;
  /** Placement chronology, independent of the spatial order of the chain. */
  order?: number;
  /** The value exposed on the left end after placement */
  exposedLeft: number;
  /** The value exposed on the right end after placement */
  exposedRight: number;
}

export interface ChainState {
  placed: PlacedTile[];
  leftEnd: number | null;
  rightEnd: number | null;
}

export type RoundResult = "playing" | "win" | "lose" | "reward" | "event" | "shop" | "boss_intro" | "boss_reward" | "map_select" | "sanctuary";

export interface RunStats {
  roundsCompleted: number;
  totalScore: number;
  patternsActivated: number;
  /** Count of how many times each pattern id was activated during the run. */
  patternBreakdown: Record<string, number>;
  relicsCollected: number;
  tilesPlayed: number;
  highestRoundScore: number;
  bossesDefeated: number;
  defeatedBossIds?: string[];
  shopPurchases: number;
  bestCombo: number;
  goldEarned: number;
  tilesDiscarded: number;
  tilesDrawn: number;
  roundScores: number[];
  /** Actual map depth of each scored combat (noncombat nodes leave no entry). */
  roundNumbers?: number[];
}

export interface GameState {
  /** Permanent run inventory, independent of hand, discards and temporary round effects. */
  runTiles: Tile[];
  /** One-shot points and costs. Never lost when the chain is recalculated. */
  roundBonus?: number;
  roundWinBonus?: number;
  roundScoreFactor?: number;
  roundTargetMultiplier?: number;
  roundSettled?: boolean;
  /** Combat-start budgets, reused across boss phases without replaying event rewards. */
  roundStartResources?: { handSize: number; actions: number; discards: number; draws: number };
  bossRages?: number;
  phaseScore?: number;
  phasePatternIds?: string[];
  pendingRound?: {
    score?: number;
    targetMultiplier?: number;
    hand?: number;
    actions?: number;
    discards?: number;
    draws?: number;
    winBonus?: number;
    scoreFactor?: number;
  };
  hand: Tile[];
  chain: ChainState;
  score: number;
  round: number;
  target: number;
  result: RoundResult;
  relics: string[];
  tilePool: Tile[];
  stats: RunStats;
  actions?: import("@/engine/actions").ActionState;
}

export interface SavedData {
  bestRound: number;
  bestScore: number;
  totalRuns: number;
  totalRoundsPlayed: number;
}

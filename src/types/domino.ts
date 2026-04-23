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
  relicsCollected: number;
  tilesPlayed: number;
  highestRoundScore: number;
  bossesDefeated: number;
  shopPurchases: number;
  bestCombo: number;
  goldEarned: number;
  tilesDiscarded: number;
  tilesDrawn: number;
  roundScores: number[];
}

export interface GameState {
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

export type TileType = "normal" | "wild" | "golden" | "locked";

export interface Tile {
  id: string;
  top: number;
  bottom: number;
  type?: TileType;
  lockedUntilRound?: number;
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

export type RoundResult = "playing" | "win" | "lose" | "reward" | "event" | "shop" | "boss_intro";

export interface RunStats {
  roundsCompleted: number;
  totalScore: number;
  patternsActivated: number;
  relicsCollected: number;
  tilesPlayed: number;
  highestRoundScore: number;
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
}

export interface SavedData {
  bestRound: number;
  bestScore: number;
  totalRuns: number;
  totalRoundsPlayed: number;
}

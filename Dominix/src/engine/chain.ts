import type { Tile, ChainState, PlacedTile, PlacementSide } from "@/types/domino";

export function createEmptyChain(): ChainState {
  return { placed: [], leftEnd: null, rightEnd: null };
}

export function canPlace(chain: ChainState, tile: Tile, side: PlacementSide): boolean {
  if (tile.type === "locked") return false;
  if (chain.placed.length === 0) return true;

  const end = side === "left" ? chain.leftEnd : chain.rightEnd;
  if (end === null) return false;

  // Wild tiles can connect to any number
  if (tile.type === "wild") return true;

  return tile.top === end || tile.bottom === end;
}

export function getValidPlacements(
  chain: ChainState,
  tile: Tile
): PlacementSide[] {
  const sides: PlacementSide[] = [];
  if (canPlace(chain, tile, "left")) sides.push("left");
  if (canPlace(chain, tile, "right")) sides.push("right");
  return sides;
}

export function placeTile(
  chain: ChainState,
  tile: Tile,
  side: PlacementSide
): ChainState {
  if (!canPlace(chain, tile, side)) {
    throw new Error("Invalid placement");
  }

  if (chain.placed.length === 0) {
    const placed: PlacedTile = {
      tile,
      exposedLeft: tile.top,
      exposedRight: tile.bottom,
    };
    return {
      placed: [placed],
      leftEnd: tile.top,
      rightEnd: tile.bottom,
    };
  }

  if (side === "left") {
    const end = chain.leftEnd!;
    const connectingValue = tile.top === end ? tile.top : tile.bottom;
    const exposedValue = tile.top === end ? tile.bottom : tile.top;

    const placed: PlacedTile = {
      tile,
      exposedLeft: exposedValue,
      exposedRight: connectingValue,
    };

    return {
      placed: [placed, ...chain.placed],
      leftEnd: exposedValue,
      rightEnd: chain.rightEnd,
    };
  } else {
    const end = chain.rightEnd!;
    const connectingValue = tile.top === end ? tile.top : tile.bottom;
    const exposedValue = tile.top === end ? tile.bottom : tile.top;

    const placed: PlacedTile = {
      tile,
      exposedLeft: connectingValue,
      exposedRight: exposedValue,
    };

    return {
      placed: [...chain.placed, placed],
      leftEnd: chain.leftEnd,
      rightEnd: exposedValue,
    };
  }
}

export function hasAnyValidMove(chain: ChainState, hand: Tile[]): boolean {
  return hand.some(
    (tile) => canPlace(chain, tile, "left") || canPlace(chain, tile, "right")
  );
}

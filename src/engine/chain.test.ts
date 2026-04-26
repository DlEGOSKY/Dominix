import { describe, it, expect } from "vitest";
import { createEmptyChain, canPlace, placeTile, getValidPlacements, hasAnyValidMove } from "./chain";
import type { Tile } from "@/types/domino";

const tile = (id: string, top: number, bottom: number, extras: Partial<Tile> = {}): Tile => ({
  id,
  top,
  bottom,
  ...extras,
});

describe("chain.canPlace", () => {
  it("accepts any tile when chain is empty", () => {
    const chain = createEmptyChain();
    expect(canPlace(chain, tile("a", 3, 5), "left")).toBe(true);
    expect(canPlace(chain, tile("a", 3, 5), "right")).toBe(true);
  });

  it("rejects locked tiles", () => {
    const chain = createEmptyChain();
    expect(canPlace(chain, tile("a", 3, 5, { type: "locked" }), "left")).toBe(false);
  });

  it("only allows tiles that match the open end", () => {
    let chain = createEmptyChain();
    chain = placeTile(chain, tile("a", 3, 5), "right");
    // now leftEnd=3, rightEnd=5
    expect(canPlace(chain, tile("b", 5, 2), "right")).toBe(true);  // matches 5
    expect(canPlace(chain, tile("b", 3, 2), "left")).toBe(true);   // matches 3
    expect(canPlace(chain, tile("b", 1, 6), "right")).toBe(false); // matches nothing
  });
});

describe("chain.getValidPlacements", () => {
  it("returns both sides when a tile fits both ends", () => {
    let chain = createEmptyChain();
    chain = placeTile(chain, tile("a", 3, 5), "right");
    const sides = getValidPlacements(chain, tile("b", 3, 5));
    expect(sides).toContain("left");
    expect(sides).toContain("right");
  });

  it("returns empty array when no end matches", () => {
    let chain = createEmptyChain();
    chain = placeTile(chain, tile("a", 3, 5), "right");
    expect(getValidPlacements(chain, tile("b", 1, 2))).toEqual([]);
  });
});

describe("chain.placeTile", () => {
  it("updates leftEnd and rightEnd correctly", () => {
    let chain = createEmptyChain();
    chain = placeTile(chain, tile("a", 3, 5), "right");
    expect(chain.leftEnd).toBe(3);
    expect(chain.rightEnd).toBe(5);

    chain = placeTile(chain, tile("b", 5, 2), "right");
    expect(chain.leftEnd).toBe(3);
    expect(chain.rightEnd).toBe(2);

    chain = placeTile(chain, tile("c", 6, 3), "left");
    expect(chain.leftEnd).toBe(6);
    expect(chain.rightEnd).toBe(2);
  });

  it("flips a tile so the matching value sits inward", () => {
    let chain = createEmptyChain();
    chain = placeTile(chain, tile("a", 3, 5), "right");
    chain = placeTile(chain, tile("b", 1, 5), "right");
    const last = chain.placed[chain.placed.length - 1]!;
    // The inward side must be 5 (matching previous rightEnd)
    expect(last.tile.top === 5 || last.tile.bottom === 5).toBe(true);
    expect(chain.rightEnd).toBe(1);
  });

  it("throws when placement is invalid", () => {
    let chain = createEmptyChain();
    chain = placeTile(chain, tile("a", 3, 5), "right");
    expect(() => placeTile(chain, tile("b", 1, 2), "right")).toThrow();
  });
});

describe("chain.hasAnyValidMove", () => {
  it("is true when at least one hand tile fits", () => {
    let chain = createEmptyChain();
    chain = placeTile(chain, tile("a", 3, 5), "right");
    const hand = [tile("h1", 1, 2), tile("h2", 5, 6)];
    expect(hasAnyValidMove(chain, hand)).toBe(true);
  });

  it("is false when no hand tile fits", () => {
    let chain = createEmptyChain();
    chain = placeTile(chain, tile("a", 3, 5), "right");
    const hand = [tile("h1", 1, 2), tile("h2", 4, 6)];
    expect(hasAnyValidMove(chain, hand)).toBe(false);
  });

  it("is true on an empty chain regardless of hand", () => {
    const chain = createEmptyChain();
    expect(hasAnyValidMove(chain, [tile("h1", 1, 2)])).toBe(true);
  });
});

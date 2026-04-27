import { describe, expect, it } from "vitest";
import { getTarget } from "./round";
import { softCapMultiplier } from "./score";

// These tests pin the late-game balance numbers so a future tweak to the
// curve can't silently drift the difficulty. They mirror the values
// documented in docs/BALANCING.md — keep both in sync.

describe("getTarget — fixed early targets (rounds 1-10)", () => {
  const expected: Array<[number, number]> = [
    [1, 80],
    [2, 120],
    [3, 170],
    [4, 240],
    [5, 330],
    [6, 420],
    [7, 510],
    [8, 610],
    [9, 720],
    [10, 850],
  ];

  for (const [round, target] of expected) {
    it(`round ${round} -> ${target}`, () => {
      expect(getTarget(round)).toBe(target);
    });
  }
});

describe("getTarget — Act III parabolic curve (rounds 11+)", () => {
  // Hand-computed from `850 + (round-10) * 150 + (round-10)² * 22`
  const expected: Array<[number, number]> = [
    [11, 1022],
    [13, 1498],
    [15, 2150],
    [18, 3458],
    [20, 4550],
    [25, 8050],
  ];

  for (const [round, target] of expected) {
    it(`round ${round} -> ${target}`, () => {
      expect(getTarget(round)).toBe(target);
    });
  }

  it("is monotonically increasing across the climax", () => {
    let prev = getTarget(10);
    for (let r = 11; r <= 30; r++) {
      const curr = getTarget(r);
      expect(curr).toBeGreaterThan(prev);
      prev = curr;
    }
  });
});

describe("softCapMultiplier — identity below x4", () => {
  for (const raw of [1, 1.5, 2, 3, 3.99, 4]) {
    it(`x${raw} stays unchanged`, () => {
      expect(softCapMultiplier(raw)).toBe(raw);
    });
  }
});

describe("softCapMultiplier — hyperbolic compression above x4", () => {
  // Values keep one decimal of slack to avoid over-fitting the curve;
  // shape matters more than exact digits.
  it("x6  -> ~5.54", () => expect(softCapMultiplier(6)).toBeCloseTo(5.538, 1));
  it("x8  -> ~6.50", () => expect(softCapMultiplier(8)).toBeCloseTo(6.5, 1));
  it("x12 -> ~7.64", () => expect(softCapMultiplier(12)).toBeCloseTo(7.636, 1));
  it("x16 -> ~8.29", () => expect(softCapMultiplier(16)).toBeCloseTo(8.286, 1));
  it("x20 -> ~8.71", () => expect(softCapMultiplier(20)).toBeCloseTo(8.706, 1));

  it("never produces a value larger than the raw input", () => {
    for (const raw of [4, 4.5, 5, 6, 8, 12, 20, 50, 100, 1000]) {
      expect(softCapMultiplier(raw)).toBeLessThanOrEqual(raw);
    }
  });

  it("plateaus around x10.7 for very large inputs", () => {
    // The asymptote is KNEE + 1/STRENGTH = 4 + 1/0.15 ≈ 10.667.
    expect(softCapMultiplier(10000)).toBeLessThan(10.7);
    expect(softCapMultiplier(10000)).toBeGreaterThan(10.5);
  });

  it("is monotonically non-decreasing", () => {
    let prev = softCapMultiplier(0);
    for (let raw = 0.5; raw <= 50; raw += 0.5) {
      const curr = softCapMultiplier(raw);
      expect(curr).toBeGreaterThanOrEqual(prev);
      prev = curr;
    }
  });
});

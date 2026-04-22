const TARGETS: Record<number, number> = {
  1: 80,
  2: 130,
  3: 190,
  4: 260,
  5: 340,
  6: 410,
  7: 480,
  8: 560,
};

export function getTarget(round: number): number {
  if (round <= 8) return TARGETS[round] ?? 80;
  // Diminishing returns: each round beyond 8 adds less incrementally
  const base = 560;
  const extra = round - 8;
  return Math.floor(base + extra * 80 + extra * extra * 5);
}

const TARGETS: Record<number, number> = {
  1: 80,
  2: 120,
  3: 170,
  4: 240,
  5: 330,
  6: 420,
  7: 510,
  8: 610,
  9: 720,
  10: 850,
};

export function getTarget(round: number): number {
  if (round <= 10) return TARGETS[round] ?? 80;
  // Act III onward: parabolic growth so the climax (r11-15) feels demanding
  // and The Echo (r16+) becomes truly punishing.
  const base = 850;
  const extra = round - 10;
  return Math.floor(base + extra * 120 + extra * extra * 10);
}

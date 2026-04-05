const TARGETS: Record<number, number> = {
  1: 80,
  2: 140,
  3: 220,
  4: 320,
};

export function getTarget(round: number): number {
  if (round <= 4) return TARGETS[round] ?? 80;
  return 320 + (round - 4) * 120;
}

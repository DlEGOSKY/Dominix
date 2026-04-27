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
  // and The Echo (r16+) becomes truly punishing. Late-game tuning relies on
  // a real player being able to push x4-x6 multipliers; without a steeper
  // late curve, x10+ stacks (cadena_maxima x2 + cadena_larga x1.5 + small
  // pattern mults) trivialize the climax. Curve sample:
  //   r11 1022 · r13 1498 · r15 2150 · r18 3520 · r20 4550 · r25 8050
  const base = 850;
  const extra = round - 10;
  return Math.floor(base + extra * 150 + extra * extra * 22);
}

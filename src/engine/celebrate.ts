/**
 * Confetti and celebration helpers built on canvas-confetti.
 * Each function is parameterized for a specific in-game milestone so the
 * call-site stays declarative (one line per event).
 */

import confetti from "canvas-confetti";
import type { RelicFamily } from "@/types/relic";

/** Family palette — brighter than the in-UI tints, tuned for confetti contrast. */
const FAMILY_COLORS: Record<RelicFamily, string[]> = {
  patron: ["#fbbf24", "#fcd34d", "#fde68a", "#f59e0b"],
  numero: ["#3b82f6", "#60a5fa", "#93c5fd", "#1d4ed8"],
  fuerza: ["#ef4444", "#f87171", "#fca5a5", "#dc2626"],
  cadena: ["#a855f7", "#c084fc", "#d8b4fe", "#7e22ce"],
  accion: ["#10b981", "#34d399", "#6ee7b7", "#059669"],
};

/** Set bonus activated — fountain-style confetti from below center. */
export function celebrateSetBonus(family: RelicFamily) {
  const colors = FAMILY_COLORS[family];
  // Two staggered bursts from bottom-left and bottom-right
  confetti({
    particleCount: 60,
    spread: 70,
    startVelocity: 55,
    origin: { x: 0.25, y: 0.95 },
    angle: 75,
    colors,
    scalar: 0.9,
    ticks: 200,
  });
  confetti({
    particleCount: 60,
    spread: 70,
    startVelocity: 55,
    origin: { x: 0.75, y: 0.95 },
    angle: 105,
    colors,
    scalar: 0.9,
    ticks: 200,
  });
}

/** Big event (boss defeated, run completed) — large multi-burst. */
export function celebrateBigEvent() {
  const defaults = {
    spread: 360,
    ticks: 240,
    gravity: 0.7,
    decay: 0.94,
    startVelocity: 35,
    colors: ["#fbbf24", "#a855f7", "#ef4444", "#3b82f6", "#10b981", "#ffffff"],
  };
  confetti({ ...defaults, particleCount: 80, scalar: 1.2 });
  setTimeout(() => confetti({ ...defaults, particleCount: 60, scalar: 1, origin: { x: 0.2, y: 0.5 } }), 200);
  setTimeout(() => confetti({ ...defaults, particleCount: 60, scalar: 1, origin: { x: 0.8, y: 0.5 } }), 400);
}

/** Legendary pattern activated — golden focused burst. */
export function celebrateLegendaryPattern() {
  confetti({
    particleCount: 50,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.55 },
    colors: ["#fbbf24", "#fcd34d", "#fde68a", "#ffffff"],
    scalar: 1.1,
    ticks: 180,
  });
}

/** Achievement / skin unlocked — subtle silver/gold sparkle. */
export function celebrateAchievement() {
  confetti({
    particleCount: 35,
    spread: 50,
    startVelocity: 30,
    origin: { x: 0.5, y: 0.4 },
    colors: ["#fbbf24", "#e2e8f0", "#fde68a", "#cbd5e1"],
    scalar: 0.7,
    ticks: 150,
    shapes: ["star"],
  });
}

/** Round complete — quick warm burst at top of screen. */
export function celebrateRoundComplete() {
  confetti({
    particleCount: 40,
    spread: 90,
    startVelocity: 35,
    origin: { x: 0.5, y: 0.3 },
    colors: ["#fbbf24", "#34d399", "#60a5fa", "#ffffff"],
    scalar: 0.85,
    ticks: 160,
  });
}

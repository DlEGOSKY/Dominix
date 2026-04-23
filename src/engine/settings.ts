import { audio } from "./audio";

export interface GameSettings {
  sfxVolume: number;        // 0..1
  muted: boolean;
  reduceMotion: boolean;
  colorblindMode: "off" | "protanopia" | "deuteranopia" | "tritanopia";
  showHints: boolean;
  showPreview: boolean;     // hover preview +X badge
  fastAnimations: boolean;  // shorten non-essential anims
}

const KEY = "dominix_settings_v1";

const DEFAULTS: GameSettings = {
  sfxVolume: 0.5,
  muted: false,
  reduceMotion: false,
  colorblindMode: "off",
  showHints: true,
  showPreview: true,
  fastAnimations: false,
};

let current: GameSettings = { ...DEFAULTS };
const listeners = new Set<(s: GameSettings) => void>();

function readStorage(): GameSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // Migrate legacy muted flag
      const legacyMuted = localStorage.getItem("dominix_muted") === "1";
      return { ...DEFAULTS, muted: legacyMuted };
    }
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

function writeStorage(s: GameSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

function applySideEffects(s: GameSettings) {
  audio.setSfxVolume(s.sfxVolume);
  audio.setMuted(s.muted);
  if (typeof document !== "undefined" && document.body) {
    document.body.classList.toggle("reduce-motion", s.reduceMotion);
    document.body.classList.toggle("fast-anim", s.fastAnimations);
    document.body.classList.remove("cb-protanopia", "cb-deuteranopia", "cb-tritanopia");
    if (s.colorblindMode !== "off") {
      document.body.classList.add(`cb-${s.colorblindMode}`);
    }
  }
}

export function loadSettings(): GameSettings {
  current = readStorage();
  applySideEffects(current);
  return current;
}

export function getSettings(): GameSettings {
  return current;
}

export function updateSettings(patch: Partial<GameSettings>): GameSettings {
  current = { ...current, ...patch };
  writeStorage(current);
  applySideEffects(current);
  for (const l of listeners) l(current);
  return current;
}

export function resetSettings(): GameSettings {
  return updateSettings(DEFAULTS);
}

export function subscribeSettings(fn: (s: GameSettings) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// Initialize on import
loadSettings();

/**
 * i18n — minimal in-house framework.
 *
 * Why no external lib: we only need ~100 UI strings for now and we want
 * zero bundle bloat. When we eventually translate gameplay content
 * (relics, patterns, events, narrative) we can either keep extending this
 * file or migrate to react-i18next at that point.
 *
 * USAGE
 *   import { t, useTranslation } from "@/engine/i18n";
 *   <h1>{t("home.title")}</h1>
 *   const { t, lang, setLang } = useTranslation();
 */

import { useSyncExternalStore } from "react";

export type Language = "es" | "en";

const STORAGE_KEY = "dominix_lang";
const DEFAULT_LANG: Language = "es";

// ---- Translation table ---------------------------------------------------

const STRINGS: Record<string, Record<Language, string>> = {
  // Home / nav
  "home.play": { es: "Jugar", en: "Play" },
  "home.daily": { es: "Diario", en: "Daily" },
  "home.weekly": { es: "Semanal", en: "Weekly" },
  "home.endless": { es: "Infinito", en: "Endless" },
  "home.howToPlay": { es: "Como jugar", en: "How to play" },
  "home.stats": { es: "Estadisticas", en: "Stats" },
  "home.leaderboard": { es: "Ranking", en: "Leaderboard" },
  "home.collection": { es: "Coleccion", en: "Collection" },
  "home.achievements": { es: "Logros", en: "Achievements" },
  "home.codex": { es: "Codice", en: "Codex" },
  "home.talents": { es: "Talentos", en: "Talents" },
  "home.settings": { es: "Ajustes", en: "Settings" },
  "home.skin": { es: "Skin", en: "Skin" },
  "home.level": { es: "Nivel", en: "Level" },

  // Common buttons
  "btn.back": { es: "Volver", en: "Back" },
  "btn.continue": { es: "Continuar", en: "Continue" },
  "btn.cancel": { es: "Cancelar", en: "Cancel" },
  "btn.confirm": { es: "Confirmar", en: "Confirm" },
  "btn.skip": { es: "Saltar", en: "Skip" },
  "btn.next": { es: "Siguiente", en: "Next" },
  "btn.start": { es: "Empezar", en: "Start" },
  "btn.restart": { es: "Reiniciar", en: "Restart" },
  "btn.copy": { es: "Copiar", en: "Copy" },
  "btn.share": { es: "Compartir", en: "Share" },
  "btn.copied": { es: "Copiado!", en: "Copied!" },

  // Settings screen
  "settings.title": { es: "Ajustes", en: "Settings" },
  "settings.language": { es: "Idioma", en: "Language" },
  "settings.audio": { es: "Audio", en: "Audio" },
  "settings.muted": { es: "Silenciado", en: "Muted" },
  "settings.unmuted": { es: "Sonido activado", en: "Sound on" },
  "settings.data": { es: "Datos", en: "Data" },
  "settings.exportSave": { es: "Exportar partida", en: "Export save" },
  "settings.importSave": { es: "Importar partida", en: "Import save" },
  "settings.resetSave": { es: "Borrar partida", en: "Reset save" },
  "settings.exportHint": { es: "Copia tu progreso al portapapeles", en: "Copy your progress to clipboard" },
  "settings.importHint": { es: "Pega un codigo de partida", en: "Paste a save code" },
  "settings.resetWarn": { es: "Esto borra TODO el progreso. Sin vuelta atras.", en: "This wipes ALL progress. No undo." },

  // Game over
  "gameover.epic": { es: "Eternidad", en: "Eternity" },
  "gameover.ritual": { es: "Ritual Consumado", en: "Ritual Complete" },
  "gameover.travesia": { es: "Travesia Cumplida", en: "Journey Complete" },
  "gameover.newBest": { es: "Nuevo record", en: "New best" },

  // Tutorial
  "tutorial.title": { es: "Tutorial", en: "Tutorial" },
  "tutorial.skip": { es: "Saltar", en: "Skip" },
  "tutorial.next": { es: "Siguiente", en: "Next" },
  "tutorial.start": { es: "Empezar", en: "Start" },

  // PWA prompt
  "pwa.title": { es: "Instalar Dominix", en: "Install Dominix" },
  "pwa.subtitle": { es: "Acceso directo, sin barras del navegador.", en: "Quick access, no browser chrome." },
  "pwa.install": { es: "Instalar", en: "Install" },
  "pwa.later": { es: "Luego", en: "Later" },
};

// ---- Language state (subscribable) ---------------------------------------

let currentLang: Language = (() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en") return stored;
  } catch {
    /* ignore */
  }
  // Auto-detect from browser
  if (typeof navigator !== "undefined") {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith("en")) return "en";
  }
  return DEFAULT_LANG;
})();

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): Language {
  return currentLang;
}

export function getLanguage(): Language {
  return currentLang;
}

export function setLanguage(lang: Language): void {
  if (lang === currentLang) return;
  currentLang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  listeners.forEach((cb) => cb());
}

/**
 * Translate a key. If the key is missing in the current language we fall
 * back to Spanish. If it is missing entirely, we return the key itself so
 * UI shows something diagnostic instead of an empty string.
 */
export function t(key: string): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[currentLang] ?? entry.es ?? key;
}

/** React hook: subscribes the component to language changes. */
export function useTranslation() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { t, lang, setLang: setLanguage };
}

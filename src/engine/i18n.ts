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
  "home.stats": { es: "Stats", en: "Stats" },
  "home.leaderboard": { es: "Ranking", en: "Leaderboard" },
  "home.collection": { es: "Coleccion", en: "Collection" },
  "home.achievements": { es: "Logros", en: "Achievements" },
  "home.codex": { es: "Codex", en: "Codex" },
  "home.talents": { es: "Talentos", en: "Talents" },
  "home.settings": { es: "Opciones", en: "Settings" },
  "home.skin": { es: "Skin", en: "Skin" },
  "home.level": { es: "Nivel", en: "Level" },
  "home.tagline": { es: "El ritual del dominio", en: "The ritual of dominion" },
  "home.newRun": { es: "Nueva Run", en: "New Run" },
  "home.dailyChallenge": { es: "Reto Diario", en: "Daily Challenge" },
  "home.dailyComplete": { es: "Diario completado", en: "Daily complete" },
  "home.weeklyChallenge": { es: "Reto Semanal", en: "Weekly Challenge" },
  "home.endlessRun": { es: "Endless", en: "Endless" },
  "home.bestRound": { es: "Mejor ronda", en: "Best round" },
  "home.bestScore": { es: "Mejor score", en: "Best score" },
  "home.totalRuns": { es: "Runs totales", en: "Total runs" },
  "home.totalRounds": { es: "Rondas jugadas", en: "Rounds played" },
  "home.levelN": { es: "Nivel {n}", en: "Level {n}" },
  "home.xp": { es: "XP", en: "XP" },
  "home.nextLevelReward": { es: "Nivel {level}: {reward}", en: "Level {level}: {reward}" },
  "home.nextUnlocks": { es: "Proximos desbloqueos", en: "Next unlocks" },
  "home.ascensionTooltip": { es: "Ascension maxima superada: A{n}", en: "Highest ascension cleared: A{n}" },
  "home.flavor.0": { es: "Cada ficha es un verso.", en: "Every tile is a verse." },
  "home.flavor.1": { es: "El dominio no se impone, se pacta.", en: "Dominion is not imposed; it is pacted." },
  "home.flavor.2": { es: "Toda cadena encuentra su ultimo eco.", en: "Every chain finds its final echo." },
  "home.flavor.3": { es: "Lo que no entra en el ritual, se pierde.", en: "What does not enter the ritual is lost." },
  "home.flavor.4": { es: "Un buen patron no se busca, se reconoce.", en: "A good pattern is not sought; it is recognized." },
  "home.flavor.5": { es: "La ceremonia recuerda a quienes la sostienen.", en: "The ceremony remembers those who sustain it." },

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
  "settings.title": { es: "Opciones", en: "Settings" },
  "settings.back": { es: "Volver", en: "Back" },
  "settings.restore": { es: "Restaurar", en: "Restore" },
  "settings.language": { es: "Idioma", en: "Language" },
  "settings.languageHint": { es: "Español / English", en: "Español / English" },
  "settings.autosaved": { es: "Los cambios se guardan automaticamente", en: "Changes save automatically" },

  // Audio
  "settings.audio": { es: "Audio", en: "Audio" },
  "settings.muted": { es: "Silenciado", en: "Muted" },
  "settings.unmuted": { es: "Sonido activado", en: "Sound on" },
  "settings.sound": { es: "Sonido", en: "Sound" },
  "settings.soundHint": { es: "Activa o silencia todos los efectos", en: "Enable or mute all effects" },
  "settings.sfxVolume": { es: "Volumen SFX", en: "SFX volume" },
  "settings.sfxVolumeHint": { es: "Nivel de efectos de juego", en: "Game effects level" },
  "settings.musicAmbient": { es: "Musica ambient", en: "Ambient music" },
  "settings.musicAmbientHint": { es: "Capas sonoras que cambian con cada acto", en: "Soundscapes that shift between acts" },
  "settings.musicVolume": { es: "Volumen musica", en: "Music volume" },
  "settings.musicVolumeHint": { es: "Nivel del ambient y escenas por acto", en: "Ambient and act-scene level" },

  // Motion
  "settings.motionSection": { es: "Movimiento y efectos", en: "Motion and effects" },
  "settings.reduceMotion": { es: "Reducir movimiento", en: "Reduce motion" },
  "settings.reduceMotionHint": { es: "Desactiva animaciones ambientales y efectos flashy", en: "Disables ambient animations and flashy effects" },
  "settings.fastAnimations": { es: "Animaciones rapidas", en: "Fast animations" },
  "settings.fastAnimationsHint": { es: "Acorta animaciones para un ritmo mas agil", en: "Shorter animations for a snappier pace" },

  // Accessibility
  "settings.accessibilitySection": { es: "Accesibilidad", en: "Accessibility" },
  "settings.colorblindMode": { es: "Modo daltonico", en: "Colorblind mode" },
  "settings.colorblindHint": { es: "Ajusta colores de feedback para distintos tipos de daltonismo", en: "Adjusts feedback colors for different colorblind types" },
  "settings.colorblind.off": { es: "Desactivado", en: "Off" },

  // Gameplay
  "settings.gameplaySection": { es: "Juego", en: "Gameplay" },
  "settings.scorePreview": { es: "Preview de score al pasar", en: "Hover score preview" },
  "settings.scorePreviewHint": { es: "Muestra el bonus estimado al pasar el mouse sobre una ficha", en: "Shows estimated bonus when hovering a tile" },
  "settings.activeHints": { es: "Pistas activas", en: "Active hints" },
  "settings.activeHintsHint": { es: "Muestra sugerencias contextuales durante la partida", en: "Shows contextual hints during play" },

  // Data
  "settings.data": { es: "Datos", en: "Data" },
  "settings.exportSave": { es: "Exportar partida", en: "Export save" },
  "settings.importSave": { es: "Importar partida", en: "Import save" },
  "settings.resetSave": { es: "Borrar partida", en: "Reset save" },
  "settings.exportHint": { es: "Copia tu progreso al portapapeles", en: "Copy your progress to clipboard" },
  "settings.importHint": { es: "Pega un codigo de partida", en: "Paste a save code" },
  "settings.resetWarn": { es: "Esto borra TODO el progreso. Sin vuelta atras.", en: "This wipes ALL progress. No undo." },
  "settings.exportAction": { es: "Exportar", en: "Export" },
  "settings.importAction": { es: "Importar", en: "Import" },
  "settings.importClose": { es: "Cerrar", en: "Close" },
  "settings.importApply": { es: "Aplicar", en: "Apply" },
  "settings.importPlaceholder": { es: "Pega aqui el codigo exportado...", en: "Paste the exported code here..." },
  "settings.resetAction": { es: "Borrar", en: "Reset" },
  "settings.resetConfirm": { es: "Confirmar?", en: "Confirm?" },
  "settings.copiedClipboard": { es: "Copiado al portapapeles", en: "Copied to clipboard" },
  "settings.imported": { es: "Importado ({n} claves). Recarga la pagina.", en: "Imported ({n} keys). Reload the page." },
  "settings.importErr": { es: "No se pudo importar", en: "Could not import" },
  "settings.resetDone": { es: "Borradas {n} claves. Recarga la pagina.", en: "Cleared {n} keys. Reload the page." },
  "settings.exportFallbackPrompt": { es: "Codigo de partida (copia manualmente):", en: "Save code (copy manually):" },

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
 *
 * Supports {var} placeholders. Pass an object as second arg to substitute,
 * e.g. t("settings.imported", { n: 7 }) -> "Imported (7 keys). Reload the page."
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const entry = STRINGS[key];
  let str = entry ? (entry[currentLang] ?? entry.es ?? key) : key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.split(`{${k}}`).join(String(v));
    }
  }
  return str;
}

/** React hook: subscribes the component to language changes. */
export function useTranslation() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { t, lang, setLang: setLanguage };
}

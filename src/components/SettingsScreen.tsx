import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useSettings } from "@/hooks/useSettings";
import { resetSettings, type GameSettings } from "@/engine/settings";
import { audio } from "@/engine/audio";
import { ambient } from "@/engine/ambient";
import { useTranslation, type Language } from "@/engine/i18n";
import { exportSave, importSave, resetAllSaveData } from "@/engine/saveSync";

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [settings, update] = useSettings();
  const [musicMuted, setMusicMuted] = useState(ambient.isMuted());
  const [musicVolume, setMusicVolume] = useState(ambient.getVolume());

  useEffect(() => {
    const unsub = ambient.subscribe(() => {
      setMusicMuted(ambient.isMuted());
      setMusicVolume(ambient.getVolume());
    });
    return () => {
      unsub();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 ambient-grain">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-accent-silver/60 hover:text-white text-sm transition"
          >
            ← Volver
          </button>
          <button
            onClick={() => {
              resetSettings();
              audio.play("button_click");
            }}
            className="text-accent-silver/40 hover:text-accent-gold text-[10px] uppercase tracking-widest transition"
          >
            Restaurar
          </button>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white tracking-tight"
        >
          Opciones
        </motion.h1>

        {/* Audio */}
        <Section title="Audio">
          <ToggleRow
            label="Sonido"
            hint="Activa o silencia todos los efectos"
            value={!settings.muted}
            onChange={(v) => update({ muted: !v })}
          />
          <SliderRow
            label="Volumen SFX"
            hint="Nivel de efectos de juego"
            value={settings.sfxVolume}
            disabled={settings.muted}
            onChange={(v) => {
              update({ sfxVolume: v });
              if (!settings.muted) audio.play("tile_place");
            }}
          />
          <ToggleRow
            label="Musica ambient"
            hint="Capas sonoras que cambian con cada acto"
            value={!musicMuted}
            onChange={(v) => ambient.setMuted(!v)}
          />
          <SliderRow
            label="Volumen musica"
            hint="Nivel del ambient y escenas por acto"
            value={musicVolume}
            disabled={musicMuted}
            onChange={(v) => ambient.setVolume(v)}
          />
        </Section>

        {/* Motion */}
        <Section title="Movimiento y efectos">
          <ToggleRow
            label="Reducir movimiento"
            hint="Desactiva animaciones ambientales y efectos flashy"
            value={settings.reduceMotion}
            onChange={(v) => update({ reduceMotion: v })}
          />
          <ToggleRow
            label="Animaciones rapidas"
            hint="Acorta animaciones para un ritmo mas agil"
            value={settings.fastAnimations}
            onChange={(v) => update({ fastAnimations: v })}
          />
        </Section>

        {/* Accessibility */}
        <Section title="Accesibilidad">
          <SelectRow
            label="Modo daltonico"
            hint="Ajusta colores de feedback para distintos tipos de daltonismo"
            value={settings.colorblindMode}
            options={[
              { value: "off", label: "Desactivado" },
              { value: "protanopia", label: "Protanopia" },
              { value: "deuteranopia", label: "Deuteranopia" },
              { value: "tritanopia", label: "Tritanopia" },
            ]}
            onChange={(v) => update({ colorblindMode: v as GameSettings["colorblindMode"] })}
          />
        </Section>

        {/* Gameplay */}
        <Section title="Juego">
          <ToggleRow
            label="Preview de score al pasar"
            hint="Muestra el bonus estimado al pasar el mouse sobre una ficha"
            value={settings.showPreview}
            onChange={(v) => update({ showPreview: v })}
          />
          <ToggleRow
            label="Pistas activas"
            hint="Muestra sugerencias contextuales durante la partida"
            value={settings.showHints}
            onChange={(v) => update({ showHints: v })}
          />
        </Section>

        {/* Language */}
        <LanguageSection />

        {/* Data export/import */}
        <DataSection />

        <div className="text-[10px] text-accent-silver/30 text-center pt-2">
          Los cambios se guardan automaticamente
        </div>
      </div>
    </div>
  );
}

function LanguageSection() {
  const { t, lang, setLang } = useTranslation();
  return (
    <Section title={t("settings.language")}>
      <Row label={t("settings.language")} hint={"Español / English"}>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Language)}
          className="bg-surface-700 text-white text-sm px-3 py-1.5 rounded-lg border border-surface-600 focus:border-accent-gold focus:outline-none"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </Row>
    </Section>
  );
}

function DataSection() {
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [importValue, setImportValue] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const statusTimer = useRef<number | null>(null);

  const flash = (kind: "ok" | "err", text: string) => {
    setStatus({ kind, text });
    if (statusTimer.current) window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setStatus(null), 2400);
  };

  const handleExport = async () => {
    const blob = exportSave();
    try {
      await navigator.clipboard.writeText(blob);
      flash("ok", "Copiado al portapapeles");
      audio.play("button_click");
    } catch {
      // Fallback: open a textarea so the user can copy manually
      window.prompt("Codigo de partida (copia manualmente):", blob);
    }
  };

  const handleImport = () => {
    const result = importSave(importValue);
    if (result.ok) {
      flash("ok", `Importado (${result.keysImported} claves). Recarga la pagina.`);
      setImportValue("");
      setShowImport(false);
      audio.play("button_click");
    } else {
      flash("err", result.error || "No se pudo importar");
    }
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      window.setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    const removed = resetAllSaveData();
    flash("ok", `Borradas ${removed} claves. Recarga la pagina.`);
    setConfirmReset(false);
    audio.play("button_click");
  };

  return (
    <Section title="Datos">
      <Row label="Exportar partida" hint="Copia tu progreso al portapapeles">
        <button
          onClick={handleExport}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest bg-accent-gold/15 text-accent-gold border border-accent-gold/40 hover:bg-accent-gold/25 transition-colors"
        >
          Exportar
        </button>
      </Row>
      <Row label="Importar partida" hint="Pega un codigo de partida">
        <button
          onClick={() => setShowImport((v) => !v)}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest bg-surface-700 text-accent-silver/80 border border-surface-600 hover:bg-surface-600 transition-colors"
        >
          {showImport ? "Cerrar" : "Importar"}
        </button>
      </Row>
      {showImport && (
        <div className="flex flex-col gap-2 mt-1">
          <textarea
            value={importValue}
            onChange={(e) => setImportValue(e.target.value)}
            placeholder="Pega aqui el codigo exportado..."
            rows={3}
            className="bg-surface-900/50 text-white text-[11px] font-mono px-3 py-2 rounded-lg border border-surface-600 focus:border-accent-gold focus:outline-none resize-none"
          />
          <button
            onClick={handleImport}
            disabled={!importValue.trim()}
            className="self-end px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest bg-accent-gold/20 text-accent-gold border border-accent-gold/40 hover:bg-accent-gold/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Aplicar
          </button>
        </div>
      )}
      <Row label="Borrar partida" hint="Esto borra TODO el progreso. Sin vuelta atras.">
        <button
          onClick={handleReset}
          className={[
            "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest border transition-colors",
            confirmReset
              ? "bg-red-500/30 text-red-200 border-red-400/60 animate-pulse"
              : "bg-surface-700 text-red-300/70 border-red-600/30 hover:bg-red-500/20",
          ].join(" ")}
        >
          {confirmReset ? "Confirmar?" : "Borrar"}
        </button>
      </Row>
      {status && (
        <div
          className={[
            "text-[11px] font-medium px-3 py-2 rounded-lg border",
            status.kind === "ok"
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              : "bg-red-500/15 text-red-300 border-red-500/30",
          ].join(" ")}
        >
          {status.text}
        </div>
      )}
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 rounded-2xl bg-surface-800/40 border border-surface-600/30 p-4"
    >
      <p className="text-[10px] font-bold text-accent-silver/40 uppercase tracking-widest">{title}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </motion.div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm text-white font-medium">{label}</span>
        {hint && <span className="text-[10px] text-accent-silver/40 mt-0.5">{hint}</span>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ToggleRow({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row label={label} hint={hint}>
      <button
        onClick={() => onChange(!value)}
        className={[
          "relative w-11 h-6 rounded-full transition-colors border",
          value ? "bg-accent-gold/30 border-accent-gold/60" : "bg-surface-700 border-surface-600/60",
        ].join(" ")}
        aria-pressed={value}
      >
        <span
          className={[
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform shadow",
            value ? "translate-x-5 bg-accent-gold" : "translate-x-0 bg-surface-500",
          ].join(" ")}
        />
      </button>
    </Row>
  );
}

function SliderRow({ label, hint, value, disabled, onChange }: { label: string; hint?: string; value: number; disabled?: boolean; onChange: (v: number) => void }) {
  return (
    <Row label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-28 accent-accent-gold disabled:opacity-40"
        />
        <span className="text-[10px] font-mono text-accent-silver/50 w-8 text-right">
          {Math.round(value * 100)}
        </span>
      </div>
    </Row>
  );
}

function SelectRow({ label, hint, value, options, onChange }: { label: string; hint?: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <Row label={label} hint={hint}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface-700 text-white text-sm px-3 py-1.5 rounded-lg border border-surface-600 focus:border-accent-gold focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Row>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { GiShare, GiReceiveMoney, GiPapers, GiCheckMark } from "react-icons/gi";

interface ShareRunScreenProps {
  onBack: () => void;
}

interface RunExport {
  version: string;
  timestamp: number;
  seed: string;
  characterId: string;
  modifiers: string[];
  finalRound: number;
  totalScore: number;
  relics: string[];
  achievements: string[];
}

/**
 * Share Run Screen — allows players to export their run as a code
 * and import other players' runs to try the same seed/build.
 */
export default function ShareRunScreen({ onBack }: ShareRunScreenProps) {
  const [exportCode, setExportCode] = useState("");
  const [importCode, setImportCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState("");

  const handleExport = () => {
    // TODO: Get actual run data from storage
    const runData: RunExport = {
      version: "1.0",
      timestamp: Date.now(),
      seed: "example-seed-123",
      characterId: "architect",
      modifiers: [],
      finalRound: 10,
      totalScore: 5000,
      relics: ["impulso_inicial"],
      achievements: [],
    };

    const encoded = btoa(JSON.stringify(runData));
    setExportCode(encoded);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = exportCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImport = () => {
    try {
      const decoded = JSON.parse(atob(importCode));
      // TODO: Validate and load run data
      console.log("Imported run:", decoded);
      setImportError("");
      alert(`Run importada: Ronda ${decoded.finalRound}, Score ${decoded.totalScore}`);
    } catch {
      setImportError("Código inválido. Verifica que hayas copiado el código completo.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="text-accent-silver/60 hover:text-white transition-colors text-sm"
        >
          ← Volver
        </button>
        <div className="flex items-center gap-3">
          <GiShare size={28} className="text-accent-gold" />
          <h1 className="text-2xl font-display font-black bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            Compartir Run
          </h1>
        </div>
        <div className="w-16" />
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 mb-8"
      >
        <p className="text-center text-sm text-accent-silver/80 leading-relaxed">
          Exporta tu run como código para compartirla con otros jugadores, o importa runs de la comunidad para intentar el mismo desafío.
        </p>
      </motion.div>

      {/* Export Section */}
      <div className="w-full mb-8">
        <div className="flex items-center gap-2 mb-4">
          <GiShare size={20} className="text-accent-gold" />
          <h2 className="text-lg font-bold text-white">Exportar tu última run</h2>
        </div>
        <div className="p-6 rounded-xl bg-surface-800/60 border border-surface-600/40">
          <button
            onClick={handleExport}
            className="w-full px-6 py-3 rounded-lg bg-accent-gold hover:bg-accent-gold/90 text-surface-900 font-bold transition-colors mb-4"
          >
            Generar código
          </button>
          {exportCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="p-3 rounded-lg bg-surface-900/60 border border-surface-600/40 font-mono text-xs text-accent-silver/80 break-all">
                {exportCode}
              </div>
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30 transition-colors"
              >
                {copied ? (
                  <>
                    <GiCheckMark size={16} />
                    <span className="text-sm font-medium">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <GiPapers size={16} />
                    <span className="text-sm font-medium">Copiar código</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Import Section */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <GiReceiveMoney size={20} className="text-purple-400" />
          <h2 className="text-lg font-bold text-white">Importar run</h2>
        </div>
        <div className="p-6 rounded-xl bg-surface-800/60 border border-surface-600/40">
          <textarea
            value={importCode}
            onChange={(e) => {
              setImportCode(e.target.value);
              setImportError("");
            }}
            placeholder="Pega aquí el código de la run..."
            className="w-full h-24 px-3 py-2 rounded-lg bg-surface-900/60 border border-surface-600/40 text-accent-silver/80 font-mono text-xs resize-none focus:outline-none focus:border-purple-500/60 transition-colors mb-3"
          />
          {importError && (
            <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {importError}
            </div>
          )}
          <button
            onClick={handleImport}
            disabled={!importCode}
            className="w-full px-6 py-3 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-colors"
          >
            Importar y ver detalles
          </button>
        </div>
      </div>
    </div>
  );
}

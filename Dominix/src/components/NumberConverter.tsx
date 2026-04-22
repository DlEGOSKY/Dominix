import { useState } from "react";
import type { Tile } from "@/types/domino";
import TileView from "./TileView";

interface NumberConverterProps {
  tiles: Tile[];
  onConvert: (tile: Tile, position: "top" | "bottom", newValue: number) => void;
  onCancel: () => void;
}

export default function NumberConverter({
  tiles,
  onConvert,
  onCancel,
}: NumberConverterProps) {
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<"top" | "bottom" | null>(null);

  const handleSelectTile = (tile: Tile) => {
    setSelectedTile(tile);
    setSelectedPosition(null);
  };

  const handleSelectPosition = (position: "top" | "bottom") => {
    setSelectedPosition(position);
  };

  const handleSelectNumber = (num: number) => {
    if (selectedTile && selectedPosition) {
      onConvert(selectedTile, selectedPosition, num);
    }
  };

  if (!selectedTile) {
    return (
      <div className="fixed inset-0 bg-surface-900/95 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-6 max-w-3xl px-6">
          <h2 className="font-display font-bold text-2xl text-accent-gold tracking-tight">
            Convertir numero
          </h2>
          <p className="text-sm text-accent-silver/70">Selecciona la ficha a modificar</p>

          <div className="flex flex-wrap justify-center gap-3 max-h-[50vh] overflow-y-auto p-4">
            {tiles.map((tile) => (
              <TileView
                key={tile.id}
                tile={tile}
                onClick={() => handleSelectTile(tile)}
                highlight
              />
            ))}
          </div>

          <button
            onClick={onCancel}
            className="mt-2 px-4 py-2 text-sm text-accent-silver/50 hover:text-accent-silver transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (!selectedPosition) {
    return (
      <div className="fixed inset-0 bg-surface-900/95 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-6 max-w-xl px-6">
          <h2 className="font-display font-bold text-2xl text-accent-gold tracking-tight">
            Selecciona el lado
          </h2>

          <div className="flex items-center gap-8">
            <TileView tile={selectedTile} disabled />

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSelectPosition("top")}
                className="px-6 py-3 rounded-lg border-2 border-surface-600 bg-surface-800 hover:border-accent-gold transition text-white font-medium"
              >
                Superior: {selectedTile.top}
              </button>
              <button
                onClick={() => handleSelectPosition("bottom")}
                className="px-6 py-3 rounded-lg border-2 border-surface-600 bg-surface-800 hover:border-accent-gold transition text-white font-medium"
              >
                Inferior: {selectedTile.bottom}
              </button>
            </div>
          </div>

          <button
            onClick={() => setSelectedTile(null)}
            className="mt-2 px-4 py-2 text-sm text-accent-silver/50 hover:text-accent-silver transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const currentValue = selectedPosition === "top" ? selectedTile.top : selectedTile.bottom;

  return (
    <div className="fixed inset-0 bg-surface-900/95 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6 max-w-xl px-6">
        <h2 className="font-display font-bold text-2xl text-accent-gold tracking-tight">
          Nuevo valor
        </h2>
        <p className="text-sm text-accent-silver/70">
          Cambiando {selectedPosition === "top" ? "superior" : "inferior"} de {currentValue} a:
        </p>

        <div className="flex gap-3">
          {[0, 1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => handleSelectNumber(num)}
              disabled={num === currentValue}
              className={[
                "w-12 h-12 rounded-lg font-mono font-bold text-xl transition",
                num === currentValue
                  ? "bg-surface-700 text-accent-silver/30 cursor-not-allowed"
                  : "bg-surface-700 border-2 border-surface-600 hover:border-accent-gold text-white",
              ].join(" ")}
            >
              {num}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSelectedPosition(null)}
          className="mt-2 px-4 py-2 text-sm text-accent-silver/50 hover:text-accent-silver transition"
        >
          Volver
        </button>
      </div>
    </div>
  );
}

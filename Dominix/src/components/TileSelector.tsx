import type { Tile } from "@/types/domino";
import TileView from "./TileView";

interface TileSelectorProps {
  tiles: Tile[];
  title: string;
  subtitle: string;
  onSelect: (tile: Tile) => void;
  onCancel: () => void;
}

export default function TileSelector({
  tiles,
  title,
  subtitle,
  onSelect,
  onCancel,
}: TileSelectorProps) {
  return (
    <div className="fixed inset-0 bg-surface-900/95 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6 max-w-3xl px-6">
        <h2 className="font-display font-bold text-2xl text-accent-gold tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-accent-silver/70">{subtitle}</p>

        <div className="flex flex-wrap justify-center gap-3 max-h-[50vh] overflow-y-auto p-4">
          {tiles.map((tile) => (
            <TileView
              key={tile.id}
              tile={tile}
              onClick={() => onSelect(tile)}
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

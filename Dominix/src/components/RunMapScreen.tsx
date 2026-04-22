import { motion } from "framer-motion";
import { useMemo } from "react";
import type { RunMap, MapNode, NodeType } from "@/engine/runMap";
import { getAvailableNodes, nodeLabel, findNode } from "@/engine/runMap";

interface RunMapScreenProps {
  map: RunMap;
  onSelectNode: (node: MapNode) => void;
  onBack?: () => void;
  gold: number;
  round: number;
}

const NODE_W = 64;
const NODE_H = 64;
const COL_GAP = 100;
const ROW_GAP = 110;
const PAD_X = 48;
const PAD_Y = 56;

const NODE_DESCRIPTIONS: { type: NodeType; desc: string; color: string }[] = [
  { type: "normal",   desc: "Ronda de domino. Forma cadenas y alcanza la meta de puntos.", color: "text-accent-silver" },
  { type: "elite",    desc: "Combate dificil con meta mas alta. Recompensas mejores.", color: "text-orange-300" },
  { type: "boss",     desc: "Jefe del acto con restricciones especiales. Superar abre el siguiente acto.", color: "text-red-300" },
  { type: "event",    desc: "Evento aleatorio: bendicion, maldicion o eleccion. Sin combate.", color: "text-blue-300" },
  { type: "shop",     desc: "Tienda. Gasta oro en reliquias, mejoras y utilidades. Sin combate.", color: "text-accent-gold" },
  { type: "sanctuary",desc: "Santuario. Elige mejoras permanentes para tu build. Sin combate.", color: "text-green-300" },
];

export default function RunMapScreen({ map, onSelectNode, gold, round }: RunMapScreenProps) {
  const available = useMemo(() => getAvailableNodes(map), [map]);
  const availableIds = useMemo(() => new Set(available.map((n) => n.id)), [available]);
  const currentNode = map.currentNodeId ? findNode(map, map.currentNodeId) : null;

  // Compute positions
  const maxCols = Math.max(...map.rows.map((r) => r.length));
  const boardWidth = PAD_X * 2 + (maxCols - 1) * COL_GAP + NODE_W;
  const boardHeight = PAD_Y * 2 + (map.rows.length - 1) * ROW_GAP + NODE_H;

  function nodePos(node: MapNode): { x: number; y: number } {
    const rowNodes = map.rows[node.row]!;
    const rowWidth = (rowNodes.length - 1) * COL_GAP;
    const offsetX = (boardWidth - rowWidth - NODE_W) / 2;
    return {
      x: offsetX + node.col * COL_GAP,
      y: PAD_Y + node.row * ROW_GAP,
    };
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Mobile portrait: rotate overlay */}
      <div className="fixed inset-0 z-50 hidden flex-col items-center justify-center gap-4 bg-surface-900 portrait:flex">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-accent-gold animate-spin" style={{ animationDuration: "2s", animationTimingFunction: "ease-in-out", animationIterationCount: 1 }}>
          <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 21h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M17 8l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-white font-bold text-lg">Gira la pantalla</p>
        <p className="text-accent-silver/50 text-sm text-center px-8">Dominix se juega mejor en modo horizontal</p>
      </div>

      {/* Header */}
      <div className="shrink-0 w-full flex items-center justify-between px-6 py-3 border-b border-surface-600/20">
        <div className="flex flex-col">
          <span className="text-[10px] text-accent-silver/40 uppercase tracking-widest">Acto</span>
          <h1 className="text-2xl font-bold text-white">
            <span className="text-accent-gold">{romanize(map.act)}</span>
            <span className="text-accent-silver/40 mx-2 text-lg">·</span>
            <span className="text-sm text-accent-silver/60">Elige tu camino</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-accent-silver/40 uppercase tracking-widest">Ronda</div>
            <div className="text-xl font-mono font-bold text-white">{round}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-accent-silver/40 uppercase tracking-widest">Oro</div>
            <div className="text-xl font-mono font-bold text-accent-gold">{gold}</div>
          </div>
        </div>
      </div>

      {/* Body: map + legend side by side */}
      <div className="flex-1 flex flex-row items-center justify-center gap-6 px-6 py-4 overflow-hidden min-h-0">

      {/* Map board */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl bg-surface-800/40 border border-surface-600/30 backdrop-blur-sm overflow-hidden shrink-0"
        style={{ width: boardWidth, height: boardHeight }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-900/20 to-surface-900/40 pointer-events-none" />

        {/* Paths (SVG) */}
        <svg
          width={boardWidth}
          height={boardHeight}
          className="absolute inset-0 pointer-events-none"
        >
          {map.rows.flatMap((row) =>
            row.flatMap((node) => {
              const from = nodePos(node);
              const fromCX = from.x + NODE_W / 2;
              const fromCY = from.y + NODE_H / 2;
              return node.next.map((targetId) => {
                const target = findNode(map, targetId);
                if (!target) return null;
                const to = nodePos(target);
                const toCX = to.x + NODE_W / 2;
                const toCY = to.y + NODE_H / 2;
                const isActivePath =
                  currentNode?.id === node.id && availableIds.has(target.id);
                const isVisited =
                  map.visitedNodeIds.includes(node.id) &&
                  map.visitedNodeIds.includes(target.id);
                return (
                  <line
                    key={`${node.id}->${targetId}`}
                    x1={fromCX}
                    y1={fromCY + NODE_H / 2 - 4}
                    x2={toCX}
                    y2={toCY - NODE_H / 2 + 4}
                    stroke={
                      isActivePath
                        ? "rgba(234, 179, 8, 0.7)"
                        : isVisited
                          ? "rgba(148, 163, 184, 0.5)"
                          : "rgba(100, 116, 139, 0.2)"
                    }
                    strokeWidth={isActivePath ? 2.5 : 1.5}
                    strokeDasharray={isActivePath ? undefined : isVisited ? undefined : "4 4"}
                  />
                );
              });
            })
          )}
        </svg>

        {/* Nodes */}
        {map.rows.flatMap((row) =>
          row.map((node) => {
            const pos = nodePos(node);
            const isAvailable = availableIds.has(node.id);
            const isCurrent = currentNode?.id === node.id;
            const isVisited = map.visitedNodeIds.includes(node.id);
            return (
              <motion.button
                key={node.id}
                disabled={!isAvailable}
                onClick={() => isAvailable && onSelectNode(node)}
                className={[
                  "absolute flex flex-col items-center justify-center rounded-full transition-all duration-200",
                  "border-2",
                  isAvailable
                    ? "cursor-pointer hover:scale-110 hover:z-10"
                    : "cursor-not-allowed",
                  nodeBgClass(node.type, isAvailable, isCurrent, isVisited),
                  nodeBorderClass(node.type, isAvailable, isCurrent, isVisited),
                ].join(" ")}
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: NODE_W,
                  height: NODE_H,
                }}
                whileHover={isAvailable ? { scale: 1.1 } : undefined}
                whileTap={isAvailable ? { scale: 0.95 } : undefined}
              >
                <NodeIcon type={node.type} />
                {isAvailable && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      boxShadow: `0 0 0 2px ${nodeGlow(node.type)}`,
                    }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                )}
              </motion.button>
            );
          })
        )}
      </motion.div>

      {/* Legend sidebar — always visible on desktop */}
      <div className="flex flex-col gap-3 w-56 shrink-0">
        <p className="text-[10px] text-accent-silver/30 uppercase tracking-widest">Tipos de nodo</p>
        <div className="flex flex-col gap-2">
          {NODE_DESCRIPTIONS.map((nd) => (
            <div
              key={nd.type}
              className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-surface-800/40 border border-surface-600/20"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${nodeBgClass(nd.type, true, false, false)} border ${nodeBorderClass(nd.type, true, false, false)}`}>
                <NodeIcon type={nd.type} tiny />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${nd.color}`}>{nodeLabel(nd.type)}</span>
                <span className="text-[9px] text-accent-silver/45 leading-snug">{nd.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-accent-silver/30 leading-relaxed pt-1 border-t border-surface-600/20">
          Los nodos con brillo son los que puedes elegir ahora
        </p>
      </div>

      </div>
    </div>
  );
}

function NodeIcon({ type, tiny = false }: { type: NodeType; tiny?: boolean }) {
  const size = tiny ? 12 : 28;
  switch (type) {
    case "normal":
      // Two dots like a domino tile
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="4" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
          <circle cx="8" cy="12" r="1.3" fill="currentColor" />
          <circle cx="16" cy="10" r="1" fill="currentColor" />
          <circle cx="16" cy="14" r="1" fill="currentColor" />
        </svg>
      );
    case "elite":
      // Crown
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M4 8l3 3 5-6 5 6 3-3v9H4V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="4" cy="8" r="1.3" fill="currentColor" />
          <circle cx="12" cy="5" r="1.3" fill="currentColor" />
          <circle cx="20" cy="8" r="1.3" fill="currentColor" />
        </svg>
      );
    case "event":
      // Diamond
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3l7 9-7 9-7-9 7-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 7l4 5-4 5-4-5 4-5z" fill="currentColor" opacity="0.3" />
        </svg>
      );
    case "shop":
      // Coin
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">$</text>
        </svg>
      );
    case "sanctuary":
      // Moon
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M16 4a8 8 0 1 0 4 14 7 7 0 0 1-4-14z" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.15" strokeLinejoin="round" />
        </svg>
      );
    case "boss":
      // Skull
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 3a7 7 0 0 0-7 7v4l2 2v3h3v-2h4v2h3v-3l2-2v-4a7 7 0 0 0-7-7z" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.15" />
          <circle cx="9" cy="11" r="1.5" fill="currentColor" />
          <circle cx="15" cy="11" r="1.5" fill="currentColor" />
        </svg>
      );
  }
}

function nodeBgClass(type: NodeType, isAvailable: boolean, isCurrent: boolean, isVisited: boolean): string {
  if (isVisited && !isCurrent) return "bg-surface-700/30 text-accent-silver/25";
  if (isCurrent) return "bg-accent-gold/25 text-accent-gold";
  const base = isAvailable ? "" : "opacity-40 ";
  switch (type) {
    case "normal":
      return base + (isAvailable ? "bg-surface-700/80 text-accent-silver" : "bg-surface-700/30 text-accent-silver/50");
    case "elite":
      return base + (isAvailable ? "bg-orange-500/20 text-orange-300" : "bg-orange-500/10 text-orange-400/50");
    case "event":
      return base + (isAvailable ? "bg-blue-500/20 text-blue-300" : "bg-blue-500/10 text-blue-400/50");
    case "shop":
      return base + (isAvailable ? "bg-accent-gold/20 text-accent-gold" : "bg-accent-gold/10 text-accent-gold/50");
    case "sanctuary":
      return base + (isAvailable ? "bg-green-500/20 text-green-300" : "bg-green-500/10 text-green-400/50");
    case "boss":
      return base + (isAvailable ? "bg-red-500/25 text-red-300" : "bg-red-500/10 text-red-400/50");
  }
}

function nodeBorderClass(type: NodeType, isAvailable: boolean, isCurrent: boolean, isVisited: boolean): string {
  if (isVisited && !isCurrent) return "border-surface-600/30";
  if (isCurrent) return "border-accent-gold";
  if (!isAvailable) return "border-surface-600/30";
  switch (type) {
    case "normal": return "border-accent-silver/40";
    case "elite": return "border-orange-400/60";
    case "event": return "border-blue-400/60";
    case "shop": return "border-accent-gold/70";
    case "sanctuary": return "border-green-400/60";
    case "boss": return "border-red-400/70";
  }
}

function nodeGlow(type: NodeType): string {
  switch (type) {
    case "normal": return "rgba(203, 213, 225, 0.4)";
    case "elite": return "rgba(251, 146, 60, 0.5)";
    case "event": return "rgba(96, 165, 250, 0.5)";
    case "shop": return "rgba(234, 179, 8, 0.5)";
    case "sanctuary": return "rgba(74, 222, 128, 0.5)";
    case "boss": return "rgba(248, 113, 113, 0.6)";
  }
}

function romanize(n: number): string {
  const romans: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let result = "";
  let rem = n;
  for (const [v, s] of romans) {
    while (rem >= v) {
      result += s;
      rem -= v;
    }
  }
  return result || "I";
}

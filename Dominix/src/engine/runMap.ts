/**
 * Run Map System — ramified path of nodes per act.
 * Each act has rows of nodes; player picks one node per row.
 * Final row is always a boss.
 *
 * Generation: start from boss, build backwards ensuring every node
 * in a row connects to at least one node in the next row.
 */

import { getGlobalRNG } from "./rng";

export type NodeType = "normal" | "elite" | "event" | "shop" | "sanctuary" | "boss";

export interface MapNode {
  id: string;
  type: NodeType;
  row: number; // 0 = first row, increasing downward
  col: number; // horizontal position within row
  /** Ids of nodes in the next row this node connects to */
  next: string[];
  /** Round number this node represents in the current act */
  round: number;
}

export interface RunMap {
  /** 1-indexed act number (act 1 = rounds 1..5, act 2 = rounds 6..10, etc) */
  act: number;
  /** Rows x nodes. rows[0] is always size 1 (the entry point). */
  rows: MapNode[][];
  /** Id of currently visited node; null if act just started. */
  currentNodeId: string | null;
  /** Set of node ids the player has already visited in this act */
  visitedNodeIds: string[];
}

export const ROWS_PER_ACT = 5; // 4 choice rows + 1 boss row
const MIN_COLS = 2;
const MAX_COLS = 4;

/** Build a new run map for a given act, based on an already-advanced round offset */
export function generateRunMap(act: number): RunMap {
  const rng = getGlobalRNG();
  const roundOffset = (act - 1) * ROWS_PER_ACT;

  // Decide number of nodes per row (except first and boss)
  const cols: number[] = [1]; // entry row always 1 node
  for (let r = 1; r < ROWS_PER_ACT - 1; r++) {
    const width = MIN_COLS + Math.floor(rng.next() * (MAX_COLS - MIN_COLS + 1));
    cols.push(width);
  }
  cols.push(1); // boss row always 1 node

  // Build nodes
  const rows: MapNode[][] = [];
  for (let r = 0; r < ROWS_PER_ACT; r++) {
    const rowNodes: MapNode[] = [];
    const count = cols[r]!;
    for (let c = 0; c < count; c++) {
      const type: NodeType =
        r === ROWS_PER_ACT - 1
          ? "boss"
          : r === 0
            ? pickFirstRowType(rng.next())
            : pickNodeType(rng.next(), r, act);
      rowNodes.push({
        id: `a${act}-r${r}-c${c}`,
        type,
        row: r,
        col: c,
        next: [],
        round: roundOffset + r + 1,
      });
    }
    rows.push(rowNodes);
  }

  // Connect rows: each node in row r connects to 1-2 nodes in row r+1
  // Ensure every node in row r+1 has at least one incoming edge.
  for (let r = 0; r < ROWS_PER_ACT - 1; r++) {
    const current = rows[r]!;
    const next = rows[r + 1]!;
    const incoming = new Set<string>();

    for (const node of current) {
      // Pick 1-2 targets preferring adjacent columns
      const targets = pickTargets(node, next, rng.next());
      node.next = targets.map((t) => t.id);
      for (const t of targets) incoming.add(t.id);
    }

    // Guarantee connectivity: any node without incoming gets one from the closest prev node
    for (const nextNode of next) {
      if (!incoming.has(nextNode.id)) {
        const closest = current.reduce((best, n) => {
          const dBest = Math.abs(best.col - nextNode.col);
          const dN = Math.abs(n.col - nextNode.col);
          return dN < dBest ? n : best;
        }, current[0]!);
        if (!closest.next.includes(nextNode.id)) {
          closest.next = [...closest.next, nextNode.id];
        }
      }
    }
  }

  return {
    act,
    rows,
    currentNodeId: null,
    visitedNodeIds: [],
  };
}

function pickFirstRowType(roll: number): NodeType {
  // First node is always a gentle normal round (sets expectation)
  if (roll < 0.7) return "normal";
  if (roll < 0.9) return "event";
  return "sanctuary";
}

function pickNodeType(roll: number, row: number, act: number): NodeType {
  // Distribution shifts: more elites in later acts
  const eliteWeight = 0.1 + (act - 1) * 0.05;
  const shopWeight = row >= 2 ? 0.18 : 0.08;
  const sanctuaryWeight = 0.08;
  const eventWeight = 0.22;
  const normalWeight = 1 - eliteWeight - shopWeight - sanctuaryWeight - eventWeight;

  let acc = 0;
  const buckets: Array<[NodeType, number]> = [
    ["normal", normalWeight],
    ["event", eventWeight],
    ["shop", shopWeight],
    ["sanctuary", sanctuaryWeight],
    ["elite", eliteWeight],
  ];
  for (const [type, weight] of buckets) {
    acc += weight;
    if (roll < acc) return type;
  }
  return "normal";
}

function pickTargets(node: MapNode, next: MapNode[], roll: number): MapNode[] {
  // Sort next nodes by horizontal distance from node.col
  const sorted = [...next].sort(
    (a, b) => Math.abs(a.col - node.col) - Math.abs(b.col - node.col)
  );
  const takeTwo = roll < 0.4 && sorted.length >= 2;
  return takeTwo ? sorted.slice(0, 2) : sorted.slice(0, 1);
}

/** Get nodes the player can currently travel to */
export function getAvailableNodes(map: RunMap): MapNode[] {
  // No current node yet → all row 0 nodes are available
  if (!map.currentNodeId) {
    return map.rows[0] ?? [];
  }
  const current = findNode(map, map.currentNodeId);
  if (!current) return [];
  // Boss row has no next
  if (current.row >= map.rows.length - 1) return [];
  return map.rows[current.row + 1]!.filter((n) => current.next.includes(n.id));
}

export function findNode(map: RunMap, nodeId: string): MapNode | null {
  for (const row of map.rows) {
    for (const node of row) {
      if (node.id === nodeId) return node;
    }
  }
  return null;
}

export function visitNode(map: RunMap, nodeId: string): RunMap {
  return {
    ...map,
    currentNodeId: nodeId,
    visitedNodeIds: [...map.visitedNodeIds, nodeId],
  };
}

/** True if the current node is the boss (last row) */
export function isActCompleted(map: RunMap): boolean {
  if (!map.currentNodeId) return false;
  const current = findNode(map, map.currentNodeId);
  return current?.type === "boss";
}

export function nodeLabel(type: NodeType): string {
  switch (type) {
    case "normal":
      return "Ronda";
    case "elite":
      return "Elite";
    case "event":
      return "Evento";
    case "shop":
      return "Tienda";
    case "sanctuary":
      return "Santuario";
    case "boss":
      return "Jefe";
  }
}

export function nodeAccentColor(type: NodeType): string {
  switch (type) {
    case "normal":
      return "text-accent-silver";
    case "elite":
      return "text-orange-400";
    case "event":
      return "text-blue-400";
    case "shop":
      return "text-accent-gold";
    case "sanctuary":
      return "text-green-400";
    case "boss":
      return "text-red-400";
  }
}

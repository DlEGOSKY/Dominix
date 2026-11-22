import type { GameState, Tile } from "@/types/domino";

export interface ActionCue {
  kind: "play" | "draw" | "discard" | "undo" | "close";
  tile?: Pick<Tile, "id" | "top" | "bottom">;
  pool: number;
  score: number;
  outcome?: "win" | "lose";
}

/** Recognize committed results, never button presses or pending animation timers. */
export function getActionCue(before: GameState, after: GameState): ActionCue | null {
  if (before === after || before.round !== after.round || before.result !== "playing"
    || !["playing", "win", "lose"].includes(after.result)) return null;
  const added = after.hand.filter(tile => !before.hand.some(old => old.id === tile.id));
  const removed = before.hand.filter(tile => !after.hand.some(next => next.id === tile.id));
  const outcome = after.result === "win" || after.result === "lose" ? after.result : undefined;
  const cue = (kind: ActionCue["kind"], tile?: Tile): ActionCue => ({kind, tile:tile && {id:tile.id,top:tile.top,bottom:tile.bottom}, pool:after.tilePool.length, score:after.score, outcome});
  if (after.stats.tilesDrawn === before.stats.tilesDrawn + 1 && added.length === 1 && !removed.length
    && after.tilePool.length === before.tilePool.length - 1) return cue("draw", added[0]);
  if (after.stats.tilesDiscarded === before.stats.tilesDiscarded + 1 && removed.length === 1 && !added.length) return cue("discard", removed[0]);
  if (after.stats.tilesPlayed === before.stats.tilesPlayed - 1 && added.length === 1 && !removed.length
    && after.chain.placed.length === before.chain.placed.length - 1) return cue("undo", added[0]);
  if (after.stats.tilesPlayed === before.stats.tilesPlayed + 1 && removed.length === 1 && !added.length
    && after.chain.placed.length === before.chain.placed.length + 1) return cue("play", removed[0]);
  return outcome ? cue("close") : null;
}

/** Native modal inertness does not stop window-level key listeners. */
export function boardShortcutsBlocked(event: Pick<KeyboardEvent, "defaultPrevented" | "repeat" | "altKey" | "ctrlKey" | "metaKey">, modalOpen: boolean, editing: boolean) {
  return event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey || modalOpen || editing;
}

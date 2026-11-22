import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { GameState } from "@/types/domino";
import { getActionCue, type ActionCue } from "@/engine/actionFeedback";
import { useReduceMotion, useSettings } from "./useSettings";

/** Ephemeral UI only. Mounting/resuming starts with no remembered action. */
export function useActionFeedback(game: GameState, board: RefObject<HTMLElement>) {
  const previous = useRef(game);
  const [latest, setLatest] = useState<ActionCue | null>(null);
  const reduced = useReduceMotion();
  const [settings] = useSettings();
  const current = getActionCue(previous.current, game);
  useLayoutEffect(() => {
    const before = previous.current;
    const cue = getActionCue(before, game);
    previous.current = game;
    if (before.round !== game.round || !["playing", "win", "lose"].includes(game.result)) setLatest(null);
    else if (cue) setLatest(cue);
    if (!cue || reduced || !board.current) return;
    const animations: Animation[] = [];
    const animate = (selector: string, frames: Keyframe[], duration: number, id: string) => {
      const target = board.current?.querySelector<HTMLElement>(selector);
      if (!target || typeof target.animate !== "function") return;
      try { const animation=target.animate(frames,{duration,easing:"ease-out"}); animation.id=id; animations.push(animation); } catch { /* The action is already committed. */ }
    };
    const frames = [{transform:"translateY(-3px)",opacity:.4},{transform:"translateY(0)",opacity:1}];
    animate('[data-action-budget="actions"]',frames,settings.fastAnimations?90:170,"dominix-budget");
    if (cue.kind === "draw") animate('[data-action-budget="pool"]',frames,settings.fastAnimations?90:170,"dominix-reserve");
    if (cue.kind === "discard") animate('[data-action-budget="discards"]',frames,settings.fastAnimations?90:170,"dominix-discard-budget");
    if (cue.outcome) animate('.chain-surface',[
      {boxShadow:`inset 0 0 0 1px ${cue.outcome === "win"?"#d4a853aa":"#ef777788"}`},
      {boxShadow:"inset 0 0 0 1px transparent"},
    ],settings.fastAnimations?150:320,"dominix-resolution");
    return () => animations.forEach(animation => animation.cancel());
  },[game,board,reduced,settings.fastAnimations]);
  return current ?? latest;
}

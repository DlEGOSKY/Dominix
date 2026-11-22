import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { ChainState } from "@/types/domino";
import { useReduceMotion, useSettings } from "./useSettings";
import { TileFlightController } from "@/engine/tileFlight";
import { playTileArrival } from "@/engine/tileArrival";

export function useTileFlight(chain: ChainState, result: string, round: number, skin = "default") {
  const boardRef = useRef<HTMLDivElement>(null);
  const controller = useRef<TileFlightController>();
  const reduced = useReduceMotion();
  const [settings] = useSettings();
  const presentation = useRef({ skin, reduced, fast: settings.fastAnimations });
  presentation.current = { skin, reduced, fast: settings.fastAnimations };
  const arrivalCleanup = useRef<(() => void) | undefined>();
  if (!controller.current) controller.current = new TileFlightController((target, arrival) => {
    arrivalCleanup.current?.();
    arrivalCleanup.current = playTileArrival(target, arrival, presentation.current);
  });
  useLayoutEffect(() => { if(reduced)arrivalCleanup.current?.(); controller.current!.sync(boardRef.current, reduced, settings.fastAnimations, new Set(chain.placed.map(p => p.tile.id))); }, [chain, result, round, reduced, settings.fastAnimations]);
  useEffect(() => () => {controller.current!.cancel();arrivalCleanup.current?.();}, []);
  const captureTile = useCallback((id: string, side: "left" | "right" = "right") => {arrivalCleanup.current?.();controller.current!.capture(boardRef.current, id, reduced, side);}, [reduced]);
  return { boardRef, captureTile };
}

import { useEffect, useState } from "react";
import { getSettings, subscribeSettings, updateSettings, type GameSettings } from "@/engine/settings";

export function useSettings(): [GameSettings, (patch: Partial<GameSettings>) => void] {
  const [state, setState] = useState<GameSettings>(() => getSettings());
  useEffect(() => subscribeSettings(setState), []);
  return [state, updateSettings];
}

export function useReduceMotion(): boolean {
  const [s] = useSettings();
  return s.reduceMotion;
}

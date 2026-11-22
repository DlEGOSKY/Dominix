import { useCallback, useEffect, useRef, useState } from "react";
import { copyText } from "@/engine/clipboard";

export function useClipboard() {
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "error">("idle");
  const generation = useRef(0);
  const pending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => { generation.current++; pending.current = false; clearTimeout(timer.current); }, []);
  const copy = useCallback(async (text: string) => {
    if (pending.current) return;
    pending.current = true;
    clearTimeout(timer.current);
    const request = ++generation.current;
    setStatus("copying");
    const ok = await copyText(text);
    if (generation.current !== request) return;
    pending.current = false;
    setStatus(ok ? "copied" : "error");
    if (ok) timer.current = setTimeout(() => setStatus("idle"), 1800);
  }, []);
  return { status, copy };
}

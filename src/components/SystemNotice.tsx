import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Shared stack keeps save errors, updates, install prompts and receipts apart. */
export default function SystemNotice({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    let root = document.getElementById("dominix-notices");
    if (!root) {
      root = document.createElement("div");
      root.id = "dominix-notices";
      root.className = "system-notices";
      document.body.appendChild(root);
    }
    setHost(root);
  }, []);
  return host ? createPortal(children, host) : null;
}

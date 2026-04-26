import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GiSmartphone } from "react-icons/gi";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "dominix_pwa_install_dismissed_v1";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

/**
 * Lightweight, non-intrusive PWA install nudge.
 * - Listens for `beforeinstallprompt`.
 * - Shows a small bottom banner after a short delay (only on touch devices).
 * - User can install or dismiss; dismissal is remembered for 14 days.
 */
export default function PWAInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      // Respect dismissal TTL
      try {
        const raw = localStorage.getItem(DISMISS_KEY);
        if (raw && Date.now() - Number(raw) < DISMISS_TTL_MS) return;
      } catch {
        /* ignore */
      }
      setEvent(e as BeforeInstallPromptEvent);
      // Delay so the banner doesn't pop up at boot
      window.setTimeout(() => setVisible(true), 4000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  const install = async () => {
    if (!event) return;
    try {
      await event.prompt();
      const result = await event.userChoice;
      if (result.outcome === "accepted") {
        setVisible(false);
        setEvent(null);
      } else {
        dismiss();
      }
    } catch {
      dismiss();
    }
  };

  return (
    <AnimatePresence>
      {visible && event && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50"
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800/95 border border-accent-gold/30 shadow-lg shadow-black/40 backdrop-blur-md">
            <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-accent-gold/15 text-accent-gold flex items-center justify-center">
              <GiSmartphone size={20} />
            </span>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-white">Instalar Dominix</span>
              <span className="block text-[11px] text-accent-silver/60 leading-tight">
                Acceso directo, sin barras del navegador.
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={dismiss}
                className="px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest text-accent-silver/50 hover:text-white transition-colors"
              >
                Luego
              </button>
              <button
                onClick={install}
                className="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-accent-gold/20 text-accent-gold border border-accent-gold/40 hover:bg-accent-gold/30 transition-colors"
              >
                Instalar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GiUpgrade } from "react-icons/gi";
import { SAVE_BEFORE_RELOAD_EVENT } from "@/engine/runCheckpoint";
import { useTranslation } from "@/engine/i18n";
import SystemNotice from "./SystemNotice";

/**
 * Listens for the SW posting a `sw-update` message (sent on activate of a
 * new SW version) and shows a small banner offering to reload to apply.
 */
export default function UpdatePrompt() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "sw-update") {
        setVisible(true);
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  const reload = () => {
    if (window.dispatchEvent(new Event(SAVE_BEFORE_RELOAD_EVENT, { cancelable: true }))) window.location.reload();
  };

  return (
    <SystemNotice><AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="pointer-events-auto w-full sm:max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800/95 border border-emerald-400/40 shadow-lg shadow-black/40 backdrop-blur-md">
            <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-400/15 text-emerald-300 flex items-center justify-center">
              <GiUpgrade size={20} />
            </span>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-white">{t("pwa.updateTitle")}</span>
              <span className="block text-[11px] text-accent-silver/60 leading-tight">
                {t("pwa.updateText")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setVisible(false)}
                className="min-h-11 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest text-accent-silver/85 hover:text-white transition-colors"
              >
                {t("pwa.later")}
              </button>
              <button
                onClick={reload}
                className="min-h-11 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-400/30 transition-colors"
              >
                {t("pwa.reload")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence></SystemNotice>
  );
}

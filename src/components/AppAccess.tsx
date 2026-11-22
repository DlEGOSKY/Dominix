import { lazy, Suspense, useEffect, useState } from "react";
import { setLanguage, useTranslation } from "@/engine/i18n";
import { recoverRunJournal } from "@/engine/runCheckpoint";
import { recoverPendingSave } from "@/engine/saveSync";
import { PROFILE_RECOVERY_EVENT } from "@/engine/profileTransaction";

const App = lazy(() => import("../App"));
export const APP_SESSION_LOCK = "dominix-player-session-v1";

/** One writer for this origin, including progression, imports and new runs. */
export default function AppAccess() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"waiting" | "ready" | "unavailable" | "blocked" | "recovery">("waiting");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    try { localStorage.getItem("dominix_lang"); }
    catch { setStatus("blocked"); return; }
    if (!navigator.locks) { setStatus("unavailable"); return; }
    const controller = new AbortController();
    let active = true;
    let release: () => void = () => {};
    const lifetime = new Promise<void>(resolve => { release = resolve; });
    setStatus("waiting");
    void navigator.locks.request(APP_SESSION_LOCK, { signal: controller.signal }, async () => {
      if (!active) return;
      const recovery = await recoverPendingSave();
      if (!active) return;
      if (!recovery.ok) { setStatus("recovery"); return; }
      if (!recovery.skipRunJournal) await recoverRunJournal();
      if (!active) return;
      try {
        const language = localStorage.getItem("dominix_lang");
        if (language === "es" || language === "en") setLanguage(language);
      } catch { /* Access to game storage is checked by the game itself. */ }
      setStatus("ready");
      await lifetime;
    }).catch(error => { if (active) setStatus(error?.name === "SecurityError" ? "blocked" : "unavailable"); });
    const onRecoveryRequired = () => { if (active) setStatus("recovery"); };
    window.addEventListener(PROFILE_RECOVERY_EVENT, onRecoveryRequired);
    // The browser also releases the lock if this document closes or crashes.
    // Do not release on blur: background tabs must keep their save ownership.
    return () => { active = false; controller.abort(); release(); window.removeEventListener(PROFILE_RECOVERY_EVENT, onRecoveryRequired); };
  }, [attempt]);

  if (status === "ready") return <Suspense fallback={<AccessMessage title={t("session.loading")} />}><App /></Suspense>;
  return <AccessMessage title={t(status === "waiting" ? "session.waiting" : status === "blocked" ? "session.blocked" : status === "recovery" ? "session.recovery" : "session.unavailable")}>
    <p className="text-sm text-accent-silver leading-relaxed">{t(status === "waiting" ? "session.explanation" : status === "blocked" ? "session.blockedHelp" : status === "recovery" ? "session.recoveryHelp" : "session.help")}</p>
    {status !== "waiting" && <button type="button" onClick={() => setAttempt(n => n + 1)} className="mt-5 min-h-11 px-5 rounded-xl border border-accent-gold/50 text-accent-gold font-bold">{t("session.retry")}</button>}
  </AccessMessage>;
}

function AccessMessage({ title, children }: { title: string; children?: React.ReactNode }) {
  return <main className="min-h-dvh flex items-center justify-center p-6 bg-surface-900 text-white">
    <section className="w-full max-w-md rounded-2xl border border-surface-600 bg-surface-800/60 p-6 sm:p-8" aria-labelledby="session-title">
      <p className="font-display font-black tracking-tight text-xl mb-6 text-accent-gold">DOMINIX</p>
      <div role="status"><h1 id="session-title" className="text-xl font-bold mb-3">{title}</h1></div>
      {children}
    </section>
  </main>;
}

import type { ActionCue } from "@/engine/actionFeedback";
import { useTranslation } from "@/engine/i18n";

export default function ActionFeedback({ cue }: { cue: ActionCue | null }) {
  const { t } = useTranslation();
  const message = cue ? t(`actionFeedback.${cue.kind}`, {top:cue.tile?.top ?? 0,bottom:cue.tile?.bottom ?? 0,n:cue.pool,score:cue.score}) : "";
  return <p role="status" aria-live="polite" aria-atomic="true" data-action-feedback={cue?.kind}
    className="min-h-8 flex items-center justify-center gap-2 text-center text-[11px] leading-relaxed text-accent-silver/90 w-full max-w-lg px-2">
    {cue && <><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" className={`shrink-0 ${cue.kind==="draw"?"text-blue-300":cue.kind==="discard"?"text-orange-300":"text-accent-gold"}`}>
      {cue.kind === "undo" ? <path d="M4 6h7a5 5 0 0 1 0 10M4 6l4-4M4 6l4 4"/>
        : cue.kind === "draw" ? <><rect x="4" y="2" width="12" height="16" rx="2"/><path d="M10 5v9m-3-3 3 3 3-3"/></>
        : cue.kind === "discard" ? <><path d="M4 5h12M6 5l1 12h6l1-12M8 5V2h4v3m-2 3v6"/></>
        : <path d="m4 10 4 4 8-9"/>}
    </svg><span>{message}{cue.outcome && <> · {t(`actionFeedback.${cue.outcome}`)}</>}</span></>}
  </p>;
}

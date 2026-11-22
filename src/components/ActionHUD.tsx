import { useReduceMotion } from "@/hooks/useSettings";
import { motion } from "framer-motion";
import type { ActionState } from "@/engine/actions";
import { getActionsRemaining } from "@/engine/actions";
import { useTranslation } from "@/engine/i18n";

interface ActionHUDProps {
  actions: ActionState;
  poolSize: number;
}

export default function ActionHUD({ actions, poolSize }: ActionHUDProps) {
  const { t } = useTranslation();
  const reducedMotion = useReduceMotion();
  const remaining = getActionsRemaining(actions);
  const isLow = remaining <= 3;
  const discardsLeft = actions.maxDiscards - actions.usedDiscards;

  return (
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-xl glass-panel">
      {/* Actions */}
      <div role="group" aria-label={t("hud.actions", { n: remaining, max: actions.maxActions })} title={t("hud.actions", { n: remaining, max: actions.maxActions })} className="flex items-center gap-2">
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" className={isLow ? "text-red-400" : "text-accent-gold"}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
        </svg>
        <div className="flex items-center gap-1">
          <motion.div
            className={`w-1.5 h-1.5 rounded-full ${isLow ? "bg-red-400" : "bg-accent-gold/60"}`}
            animate={isLow && !reducedMotion ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : {}}
            transition={isLow && !reducedMotion ? { duration: 1.2, repeat: Infinity } : {}}
          />
          <span data-action-budget="actions" className={`text-xs font-mono font-bold tabular-nums ${isLow ? "text-red-400" : "text-white"}`}>
            {remaining}
          </span>
          <span className="text-[11px] font-mono text-accent-silver/85">/{actions.maxActions}</span>
        </div>
      </div>

      <div className="w-px h-4 bg-surface-600/40" />

      {/* Pool */}
      <div role="group" aria-label={t("hud.pool", { n: poolSize })} title={t("hud.pool", { n: poolSize })} className="flex items-center gap-1.5">
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-blue-300">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="16" cy="8" r="1.5" fill="currentColor" />
          <circle cx="8" cy="16" r="1.5" fill="currentColor" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        </svg>
        <span data-action-budget="pool" className="text-[11px] font-mono text-accent-silver tabular-nums">{poolSize}</span>
      </div>

      <div className="w-px h-4 bg-surface-600/40" />

      {/* Discards */}
      <div role="group" aria-label={t("hud.discards", { n: discardsLeft })} title={t("hud.discards", { n: discardsLeft })} className="flex items-center gap-1.5">
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-orange-300">
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span data-action-budget="discards" className="text-[11px] font-mono text-accent-silver tabular-nums">{discardsLeft}</span>
      </div>
    </div>
  );
}

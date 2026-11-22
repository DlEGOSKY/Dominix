import { useEffect } from "react";
import SystemNotice from "./SystemNotice";
import { useTranslation } from "@/engine/i18n";
export interface Receipt { name:string; replaced?:string; key:number }
export default function RewardReceipt({ receipt, onDismiss }: { receipt:Receipt|null; onDismiss:()=>void }) {
  const { t }=useTranslation();
  useEffect(()=>{ if(!receipt)return;const timer=setTimeout(onDismiss,6000);return()=>clearTimeout(timer); },[receipt,onDismiss]);
  if(!receipt)return null;
  return <SystemNotice><aside className="reward-receipt" aria-label={t("receipt.label")}>
    <div role="status"><p className="font-bold text-accent-gold">{t("receipt.received",{name:receipt.name})}</p>
      {receipt.replaced && <p className="mt-1">{t("receipt.replaced",{name:receipt.replaced})}</p>}
    </div>
    <button type="button" onClick={onDismiss} className="min-h-11 px-2 text-xs text-accent-silver">{t("btn.close")}</button>
  </aside></SystemNotice>;
}

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReduceMotion, useSettings } from "@/hooks/useSettings";
import { useTranslation } from "@/engine/i18n";
import { roundTransitionTiming } from "@/engine/presentationTiming";

export default function RoundTransition({round,isBoss=false,onComplete}:{round:number;isBoss?:boolean;onComplete:()=>void}) {
  const {t}=useTranslation();
  const reduced=useReduceMotion();
  const [settings]=useSettings();
  const [visible,setVisible]=useState(true);
  const callback=useRef(onComplete);callback.current=onComplete;
  const done=useRef<string|null>(null);
  const key=`${round}:${isBoss}`;
  const finish=useCallback(()=>{if(done.current!==key){done.current=key;callback.current();}},[key]);
  useEffect(()=>{
    setVisible(true);
    if(reduced){finish();return;}
    const timing=roundTransitionTiming(isBoss,settings.fastAnimations,reduced);
    let exit:ReturnType<typeof setTimeout>|undefined;
    const timer=setTimeout(()=>{setVisible(false);exit=setTimeout(finish,timing.exit);},timing.hold);
    return()=>{clearTimeout(timer);clearTimeout(exit);};
  },[round,isBoss,reduced,settings.fastAnimations,finish]);
  if(reduced)return null;
  return <AnimatePresence>{visible&&<motion.button type="button" data-round-transition onClick={finish}
    aria-label={t("round.dismiss",{n:round})}
    initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:settings.fastAnimations ? 0.08 : 0.15}}
    className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 ${isBoss?"bg-red-950/95":"bg-surface-900/95"}`}>
    <span className={`text-xs uppercase tracking-[.3em] ${isBoss?"text-red-300":"text-accent-silver"}`}>{t(isBoss?"boss.label":"round.label")}</span>
    <span className={`text-7xl font-black tabular-nums ${isBoss?"text-red-200":"text-white"}`}>{round}</span>
    <span className="w-28 h-px bg-accent-gold/50"/>
    <span className="text-xs text-accent-silver">{t("round.dismissHint")}</span>
  </motion.button>}</AnimatePresence>;
}

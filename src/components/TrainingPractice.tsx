import {useEffect,useRef,useState} from "react";
import {createTraining,trainingAction,EXPECTED_TRAINING_TILE,TRAINING_PHASES} from "@/engine/training";
import {useTranslation} from "@/engine/i18n";
import {analyzePatterns} from "@/engine/patterns";
import {localizePatternById} from "@/engine/i18nContent";
import TileView from "./TileView";
import Chain from "./Chain";
import ActionHUD from "./ActionHUD";
import RelicCard from "./RelicCard";
import "./TrainingPractice.css";

export default function TrainingPractice({onComplete}:{onComplete:()=>void}) {
  const {t}=useTranslation();
  const [state,setState]=useState(createTraining);
  const heading=useRef<HTMLHeadingElement>(null);
  const {game,phase}=state;
  const index=TRAINING_PHASES.indexOf(phase);
  const expected=EXPECTED_TRAINING_TILE[phase];
  const requested=game.hand.find(tile=>tile.id===expected);
  const playing=["open","connect","pattern","extend"].includes(phase);
  const patterns=analyzePatterns(game.chain).patterns;
  useEffect(()=>{heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView({block:"nearest"});},[phase]);
  return <section className="training-practice" data-training-phase={phase}>
    <div className="training-instruction">
      <p className="training-caption">{t("tutorial.step",{current:index+1,total:TRAINING_PHASES.length})}</p>
      <h3 ref={heading} tabIndex={-1}>{t(`training.${phase}.title`)}</h3>
      <p>{t(`training.${phase}.body`)}</p>
    </div>
    <p className="training-safety">{t("training.safe")}</p>
    {phase!=="welcome"&&phase!=="done"&&<p className="training-current-task" aria-hidden="true"><span>{t(`training.${phase}.title`)}</span>{requested&&<strong>{requested.top} | {requested.bottom}</strong>}</p>}
    {phase!=="welcome"&&<>
      <div className="training-score"><output aria-live="polite" aria-label={t("scoreReveal.total")} data-training-score>{game.score}</output><span>{t("training.target",{n:game.target})}</span></div>
      <div className="training-chain"><Chain chain={game.chain}/></div>
      {patterns.length>0&&<p className="training-patterns">{patterns.map(pattern=>`${localizePatternById(pattern.id,pattern.name).name} +${pattern.bonus}`).join(" · ")}</p>}
      {game.result==="playing"&&<>
        <div className="training-budget"><ActionHUD actions={game.actions!} poolSize={game.tilePool.length}/></div>
        <div className="training-hand" aria-label={t("hand.label")}>
          {game.hand.map(tile=><div key={tile.id} className="training-piece" data-expected={expected===tile.id||undefined}>
            <TileView tile={tile} staticView={!playing} animate={false} animateExit={false} highlight={playing&&expected===tile.id} onClick={()=>setState(current=>trainingAction(current,{type:"play",id:tile.id}))}/>
            {phase==="discard"&&<button type="button" className="training-button" onClick={()=>setState(current=>trainingAction(current,{type:"discard",id:tile.id}))}>{t("training.discardButton")}</button>}
          </div>)}
        </div>
      </>}
    </>}
    <p role="status" aria-live="polite" className="training-hint">{state.mistake?t(`training.mistake.${state.mistake}`,{left:game.chain.leftEnd??"—",right:game.chain.rightEnd??"—"}):playing?t("training.choose"):""}</p>
    <div className="training-controls">
      {phase==="welcome"&&<button type="button" className="training-button training-primary" onClick={()=>setState(current=>trainingAction(current,{type:"start"}))}>{t("training.begin")}</button>}
      {phase==="draw"&&<button type="button" className="training-button training-primary" onClick={()=>setState(current=>trainingAction(current,{type:"draw"}))}>{t("board.draw",{n:game.actions!.maxDraws-game.actions!.usedDraws})}</button>}
      {phase==="close"&&<button type="button" className="training-button training-primary" onClick={()=>setState(current=>trainingAction(current,{type:"close"}))}>{t("board.closeChain")}</button>}
      {phase==="reward"&&<><RelicCard relicId="impulso_inicial" size="sm"/><button type="button" className="training-button training-primary" onClick={()=>setState(current=>trainingAction(current,{type:"reward"}))}>{t("training.claim")}</button></>}
      {phase==="done"&&<button type="button" className="training-button training-primary" onClick={onComplete}>{t("training.finish")}</button>}
      {phase!=="welcome"&&<button type="button" className="training-button" onClick={()=>setState(createTraining())}>{t("training.restart")}</button>}
    </div>
  </section>;
}

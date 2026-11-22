import type {GameState, Tile} from "@/types/domino";
import {createActionState} from "./actions";
import {createEmptyChain, placeTile} from "./chain";
import {getCharacter} from "./characters";
import {getTalentBonuses} from "./talents";
import {type RunScoreContext} from "./runScore";
import {playRoundTile, drawRoundTile, discardRoundTile} from "./roundActions";
import {closeRound, getLegalPlacements} from "./roundRules";
import {calculateScore} from "./score";

export const TRAINING_PHASES=["welcome","open","connect","pattern","draw","discard","extend","close","reward","done"] as const;
export type TrainingPhase=typeof TRAINING_PHASES[number];
export interface TrainingState { phase:TrainingPhase; game:GameState; mistake?:"connection"|"instruction" }
export type TrainingAction={type:"start"|"draw"|"close"|"reward"}|{type:"play"|"discard";id:string};
const TRAINING_CONTEXT:RunScoreContext={
  // Merchant's gold passive has no score effect. No run-start grants are used.
  character:getCharacter("merchant"),talents:getTalentBonuses({ranks:{},spent:0}),
  scoreMultiplier:1,patternBonus:1,celestials:[],celestialBoost:1,chaosTwist:null,flatPerTile:0,
};
export const EXPECTED_TRAINING_TILE:Partial<Record<TrainingPhase,string>>={open:"learn-35",connect:"learn-52",pattern:"learn-26",discard:"learn-11",extend:"learn-66"};
export function createTraining():TrainingState {
  const hand:Tile[]=[{id:"learn-35",top:3,bottom:5},{id:"learn-52",top:5,bottom:2},{id:"learn-26",top:2,bottom:6},{id:"learn-11",top:1,bottom:1},{id:"learn-44",top:4,bottom:4}];
  const tilePool:Tile[]=[{id:"learn-66",top:6,bottom:6},{id:"learn-06",top:0,bottom:6}];
  return {phase:"welcome",game:{hand,tilePool,runTiles:[...hand,...tilePool],chain:createEmptyChain(),score:0,target:60,round:1,result:"playing",relics:[],actions:createActionState(1),
    stats:{roundsCompleted:0,totalScore:0,patternsActivated:0,patternBreakdown:{},relicsCollected:0,tilesPlayed:0,highestRoundScore:0,bossesDefeated:0,shopPurchases:0,bestCombo:0,goldEarned:0,tilesDiscarded:0,tilesDrawn:0,roundScores:[]}}};
}

/** Isolated, deterministic exercise. Uses the production engine, never RNG or storage. */
export function trainingAction(state:TrainingState, action:TrainingAction):TrainingState {
  const {phase,game}=state;
  const reject=(mistake:"connection"|"instruction"="instruction")=>({...state,mistake});
  const next=(target:TrainingPhase,updated=game):TrainingState=>({phase:target,game:updated});
  if(action.type==="start"&&phase==="welcome")return next("open");
  if(action.type==="play"){
    const tile=game.hand.find(t=>t.id===action.id);
    if(!tile)return reject();
    if(!getLegalPlacements(game.chain,tile).includes("right"))return reject("connection");
    const following:Partial<Record<TrainingPhase,TrainingPhase>>={open:"connect",connect:"pattern",pattern:"draw",extend:"close"};
    if(!following[phase]||EXPECTED_TRAINING_TILE[phase]!==tile.id)return reject();
    const updated=playRoundTile(game,tile,"right",TRAINING_CONTEXT);
    return updated===game?reject():next(following[phase]!,updated);
  }
  if(action.type==="draw"&&phase==="draw"){
    const updated=drawRoundTile(game,TRAINING_CONTEXT);return updated===game?reject():next("discard",updated);
  }
  if(action.type==="discard"&&phase==="discard"&&action.id===EXPECTED_TRAINING_TILE.discard){
    const tile=game.hand.find(t=>t.id===action.id);if(!tile)return reject();
    const updated=discardRoundTile(game,tile,TRAINING_CONTEXT);return updated===game?reject():next("extend",updated);
  }
  if(action.type==="close"&&phase==="close"){
    const updated=closeRound(game);return updated.result==="win"?next("reward",updated):reject();
  }
  // As in a real reward: retain the closed score; the relic affects future plays.
  if(action.type==="reward"&&phase==="reward")return next("done",{...game,relics:[...game.relics,"impulso_inicial"]});
  return reject();
}

export function trainingChainScore(tiles:readonly Tile[]) {
  const chain=tiles.reduce((chain,tile)=>placeTile(chain,tile,"right"),createEmptyChain());
  return calculateScore(chain).total;
}

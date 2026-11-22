import { type RunCheckpoint, encodeCheckpoint } from "../src/engine/runCheckpoint";
import { ALL_BOSSES } from "../src/engine/boss";
import { ALL_EVENTS } from "../src/engine/events";
import { ALL_CONSUMABLES } from "../src/engine/consumables";
import { ALL_CELESTIAL } from "../src/engine/celestial";
import { INTERLUDES } from "../src/engine/interludes";
import { generateRunMap } from "../src/engine/runMap";
import { generateShopItems } from "../src/engine/shop";
import { generateRewardOptions } from "../src/engine/rewards";
import { getGlobalRNG, setGlobalRNG } from "../src/engine/rng";
import { createEmptyChain, placeTile } from "../src/engine/chain";
import { calculateScore } from "../src/engine/score";

// Artificial mechanical states built with real catalog entries. These do not
// prove that a natural run can reach every encounter or beat every boss.
export function buildCheckpointFixtures(base:RunCheckpoint){
  const fixtures:{name:string;raw:string;data:RunCheckpoint}[]=[];
  function add(name:string,edit:(data:RunCheckpoint)=>void){
    const data=structuredClone(base);setGlobalRNG(data.seed);edit(data);data.rng=getGlobalRNG().snapshot();
    fixtures.push({name,raw:encodeCheckpoint(data),data});
  }
  add("prepared-effects",d=>{
    d.states.wildNextActive=true;d.states.freezeEndActive=true;d.states.doubleNextScoreActive=true;
    d.states.ownedMutationIds=["wild_next"];d.states.mutationStates=[{mutationId:"wild_next",usesLeft:0}];
    d.states.ownedConsumables=[ALL_CONSUMABLES[0]!];d.states.ownedCelestials=ALL_CELESTIAL.slice(0,3);
    d.states.game.pendingRound={score:75,hand:2,actions:3,targetMultiplier:0.85};d.states.runFlatBonusPerTile=12;
    d.states.undoUsesLeft=0;
  });
  add("shop",d=>{d.mode="playing";d.states.game.result="shop";d.states.shopItems=generateShopItems(d.states.game.relics,2);d.states.shopRerolls=2;d.states.runMap=generateRunMap(1);});
  add("map-interlude",d=>{d.mode="playing";d.states.game.result="map_select";d.states.runMap=generateRunMap(2);d.states.pendingInterlude=INTERLUDES[0]!;});
  add("event-choice",d=>{d.mode="playing";d.states.game.result="event";d.states.runMap=generateRunMap(1);d.states.currentEvent=ALL_EVENTS.find(e=>e.effect.type==="choice")!;});
  add("sanctuary",d=>{d.mode="playing";d.states.game.result="sanctuary";d.states.sanctuaryCtx={gold:20,actions:2};d.states.runMap=generateRunMap(1);});
  const boss=ALL_BOSSES.find(b=>(b.phases?.length??0)>1)!;
  add("boss-intro",d=>{d.states.game.round=10;d.states.game.result="boss_intro";d.states.game.target=2000;d.states.currentBoss=boss;});
  add("boss-phase",d=>{
    const g=d.states.game;g.round=10;d.states.currentBoss=boss;d.states.bossPhase=1;
    g.phaseScore=500;g.phasePatternIds=["cadena_simple"];g.target=2000;g.chain=createEmptyChain();
    for(let i=0;i<7;i++){
      const top=i,bottom=(i+1)%7;
      const tile=g.runTiles.find(t=>Math.min(t.top,t.bottom)===Math.min(top,bottom) && Math.max(t.top,t.bottom)===Math.max(top,bottom))!;
      g.chain=placeTile(g.chain,tile,"right");
    }
    const used=new Set(g.chain.placed.map(p=>p.tile.id));g.hand=g.hand.filter(t=>!used.has(t.id));g.tilePool=g.tilePool.filter(t=>!used.has(t.id));
    if(g.actions)g.actions.usedActions=7;
    const scored=calculateScore(g.chain,g.relics);g.score=scored.total;
    const heat=7*12+scored.patternAnalysis.patterns.length*20;
    g.bossRages=Math.floor(heat/100);d.states.bossRageCount=g.bossRages;d.states.bossHeat=heat%100;
  });
  add("boss-reward",d=>{d.states.game.round=10;d.states.game.result="boss_reward";d.states.currentBoss=boss;d.states.bossRewardData={boss};d.claimedRound="10:1";});
  for(const mode of ["remove","duplicate","convert"] as const)add(`mutation-${mode}`,d=>{
    d.states.game.result="reward";d.states.mutationMode=mode;d.states.rewardOptions=generateRewardOptions(d.states.game.relics,undefined,2);
    d.pendingReward={option:{id:mode,name:mode,description:mode,reward:{type:mode==="remove"?"remove_tile":mode==="duplicate"?"duplicate_tile":"convert_number"}},before:{relics:d.states.game.relics,consumables:d.states.ownedConsumables,celestials:d.states.ownedCelestials,mutations:d.states.ownedMutationIds,tiles:d.states.game.runTiles}};
  });
  return fixtures;
}

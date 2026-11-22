import {beforeEach,describe,expect,it} from "vitest";
import {createTraining,trainingAction,trainingChainScore} from "./training";
import {calculateScore} from "./score";
import {analyzePatterns,ALL_PATTERNS} from "./patterns";
import {createEmptyChain,placeTile} from "./chain";
import {getGlobalRNG,setGlobalRNG} from "./rng";
import {roundTransitionTiming} from "./presentationTiming";

beforeEach(()=>{localStorage.clear();setGlobalRNG(5678);});
function throughPattern(){let s=trainingAction(createTraining(),{type:"start"});for(const id of ["learn-35","learn-52","learn-26"])s=trainingAction(s,{type:"play",id});return s;}
function throughClose(){let s=throughPattern();s=trainingAction(s,{type:"draw"});s=trainingAction(s,{type:"discard",id:"learn-11"});s=trainingAction(s,{type:"play",id:"learn-66"});return trainingAction(s,{type:"close"});}
describe("guided practice uses real domino rules",()=>{
  it("teaches a normal 3|5 as ten base points and matching ends, not eight points",()=>{
    const s=trainingAction(trainingAction(createTraining(),{type:"start"}),{type:"play",id:"learn-35"});
    expect(s.game.score).toBe(10);expect(s.game.chain.leftEnd).toBe(3);expect(s.game.chain.rightEnd).toBe(5);
    expect(trainingChainScore([{id:"double",top:6,bottom:6}])).toBe(10);
  });
  it("explains an invalid connection without spending an action or changing the hand",()=>{
    const before=trainingAction(trainingAction(createTraining(),{type:"start"}),{type:"play",id:"learn-35"});
    const rejected=trainingAction(before,{type:"play",id:"learn-11"});
    expect(rejected.mistake).toBe("connection");expect(rejected.game).toBe(before.game);expect(rejected.phase).toBe("connect");
    expect(trainingAction(rejected,{type:"play",id:"learn-52"}).mistake).toBeUndefined();
  });
  it("does not let a legal but unrequested action skip the exercise",()=>{
    const before=trainingAction(createTraining(),{type:"start"});
    for(const action of [{type:"draw"},{type:"close"},{type:"reward"},{type:"play",id:"learn-44"}] as const){const after=trainingAction(before,action);expect(after.game).toBe(before.game);expect(after.phase).toBe("open");}
  });
  it("detects the pattern when placed and derives the displayed total from the engine",()=>{
    const s=throughPattern();expect(s.phase).toBe("draw");expect(analyzePatterns(s.game.chain).patterns).toContainEqual({id:"cadena_simple",name:"Cadena Simple",bonus:20,multiplier:1});
    expect(s.game.score).toBe(calculateScore(s.game.chain).total);
  });
  it("draws and discards with the actual costs and no automatic replacement",()=>{
    const before=throughPattern();const drawn=trainingAction(before,{type:"draw"});
    expect(drawn.game.tilePool.length).toBe(before.game.tilePool.length-1);expect(drawn.game.hand.some(t=>t.id==="learn-66")).toBe(true);
    expect(drawn.game.actions!.usedActions).toBe(before.game.actions!.usedActions+1);expect(drawn.game.actions!.usedDraws).toBe(1);
    const discarded=trainingAction(drawn,{type:"discard",id:"learn-11"});expect(discarded.game.hand.length).toBe(drawn.game.hand.length-1);expect(discarded.game.tilePool).toBe(drawn.game.tilePool);
    expect(discarded.game.actions!.usedDiscards).toBe(1);expect(discarded.game.actions!.usedActions).toBe(drawn.game.actions!.usedActions+1);
  });
  it("requires a real winning close and keeps that score when choosing a future relic",()=>{
    const s=throughClose();expect(s.phase).toBe("reward");expect(s.game.result).toBe("win");expect(s.game.score).toBeGreaterThanOrEqual(s.game.target);
    const awarded=trainingAction(s,{type:"reward"});expect(awarded.phase).toBe("done");expect(awarded.game.relics).toEqual(["impulso_inicial"]);expect(awarded.game.score).toBe(s.game.score);
    expect(trainingAction(awarded,{type:"reward"}).game).toBe(awarded.game);
  });
  it("never changes player storage, consumes RNG, grants XP or alters the next real run",()=>{
    localStorage.setItem("dominix_active_skin","roma_eterna");localStorage.setItem("dominix_progression",'{"xp":493,"level":3,"unlockedRewards":[]}');localStorage.setItem("dominix_active_run_v1","untouched");
    const snapshot=()=>Object.fromEntries(Array.from({length:localStorage.length},(_,i)=>{const key=localStorage.key(i)!;return [key,localStorage.getItem(key)];}));const before=snapshot();const rng=getGlobalRNG().snapshot();const fresh=createTraining();trainingAction(throughClose(),{type:"reward"});
    expect(getGlobalRNG().snapshot()).toEqual(rng);expect(snapshot()).toEqual(before);expect(localStorage.getItem("dominix_active_run_v1")).toBe("untouched");expect(createTraining()).toEqual(fresh);
  });
});
describe("educational pattern metadata matches detection",()=>{
  it.each([
    ["cadena_simple",[[3,5],[5,2],[2,6]]],
    ["dominio",[[5,5],[5,2],[2,5]]],
    ["cierre_exacto",[[1,2],[2,3],[3,1]]],
    ["escalera",[[1,2],[2,3],[3,4],[4,5]]],
  ] as const)("keeps %s bonus and multiplier consistent",(id,tiles)=>{
    const chain=tiles.reduce((chain,[top,bottom],i)=>placeTile(chain,{id:`example-${i}`,top,bottom},"right"),createEmptyChain());
    const detected=analyzePatterns(chain).patterns.find(p=>p.id===id)!;const metadata=ALL_PATTERNS.find(p=>p.id===id)!;
    expect(detected).toBeDefined();expect(metadata.bonus).toBe(detected.bonus);expect(metadata.multiplier).toBe(detected.multiplier);
  });
  it("keeps round introductions brief and omits them with reduced motion",()=>{
    for(const boss of [false,true]){const normal=roundTransitionTiming(boss,false,false),fast=roundTransitionTiming(boss,true,false);expect(normal.hold+normal.exit).toBeLessThanOrEqual(1100);expect(fast.hold+fast.exit).toBeLessThan(normal.hold+normal.exit);expect(roundTransitionTiming(boss,false,true)).toEqual({hold:0,exit:0});}
  });
});

import {readFile,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
const output=process.argv[4],saved=await readFile(`${output}/profile-checkpoint.json`,'utf8');
try {
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5180/');
 const fixtures=await page.evaluate(async saved=>{
  const {encodeCheckpoint,isRunCheckpoint}=await import('/src/engine/runCheckpoint.ts');
  const {generateFullSet}=await import('/src/engine/tiles.ts');
  const {ALL_BOSSES}=await import('/src/engine/boss.ts');
  const {createEmptyChain,placeTile}=await import('/src/engine/chain.ts');
  const {setGlobalRNG,getGlobalRNG}=await import('/src/engine/rng.ts');
  const {generateRunMap}=await import('/src/engine/runMap.ts');
  const {calculateRunScore}=await import('/src/engine/runScore.ts');
  const {getCharacter}=await import('/src/engine/characters.ts');
  const data=JSON.parse(JSON.parse(saved).body);
  data.states.game=structuredClone(data.states.undoSnapshot.game);
  data.states.undoSnapshot=null;data.states.undoUsesLeft=1;data.claimedRound=null;
  data.mode='playing';data.states.game.round=5;data.states.game.target=1;
  data.modifiers.targetMultiplier=data.modifierConfig.targetMultiplier=.001;
  data.modifiers.handSize=data.modifierConfig.handSize=data.handSize=28;
  data.seed=4567;setGlobalRNG(data.seed);
  const tiles=generateFullSet();
  Object.assign(data.states.game,{hand:tiles,runTiles:tiles,tilePool:[],result:'boss_intro',roundStartResources:{handSize:28,actions:12,discards:2,draws:1}});
  data.states.currentBoss=ALL_BOSSES.find(b=>b.id==='sirena');data.states.runMap=generateRunMap(1);data.rng=getGlobalRNG().snapshot();
  const boss=encodeCheckpoint(data);
  const map=structuredClone(data);map.states.game.round=1;map.states.game.result='map_select';map.states.currentBoss=null;
  const stress=JSON.parse(JSON.parse(saved).body);
  let chain=createEmptyChain();for(let i=0;i<30;i++)chain=placeTile(chain,{id:`qa-stress-${i}`,top:i%7,bottom:(i+1)%7,type:'normal'},'right');
  stress.states.game.chain=chain;stress.states.game.runTiles=[...chain.placed.map(p=>p.tile),...stress.states.game.hand,...stress.states.game.tilePool];
  stress.states.game.actions={...stress.states.game.actions,maxActions:40,usedActions:30};stress.states.undoSnapshot=null;
  stress.states.game.stats.tilesPlayed=30;
  stress.states.game.score=calculateRunScore(stress.states.game,{character:getCharacter(stress.characterId),talents:stress.runtime.talentBonuses,scoreMultiplier:1,patternBonus:1,celestials:[],celestialBoost:1,chaosTwist:null,flatPerTile:0}).total;
  for(const fixture of [data,map,stress])if(!isRunCheckpoint(fixture))throw Error('Invalid QA fixture');
  return {boss,map:encodeCheckpoint(map),stress:encodeCheckpoint(stress)};
 },saved);
 for(const [name,value] of Object.entries(fixtures))await writeFile(`${output}/${name}-checkpoint.json`,value);
 console.log('Prepared isolated three-phase boss, map and 30-tile stress fixtures; no player storage exported.');
}finally{await browser.close();}

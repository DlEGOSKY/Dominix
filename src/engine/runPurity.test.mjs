import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import ts from 'typescript';

describe('React replay safety',()=>{
 it('keeps random decisions and other state writes outside replayable game updaters',()=>{
  const source=ts.createSourceFile('GameBoard.tsx',readFileSync(new URL('../components/GameBoard.tsx',import.meta.url),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const random=new Set(['getGlobalRNG','shuffle','startNextRound','startBossPhase','advanceRound','goToShopOrNextRound','generateRewardOptions','generateShopItems','getRandomEvent','rollRandomEdition','rollRandomConsumable','rollRandomCelestial','applyShuffleHand','generateRunMap','rollInterlude','pickRoundQuest','applyEventToRun']);
  const violations=[];
  function inspect(node,insideUpdater=false){
   if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)){
    const name=node.expression.text;
    if(insideUpdater&&(random.has(name)||/^set[A-Z]/.test(name))){
     violations.push({name,line:source.getLineAndCharacterOfPosition(node.getStart()).line+1});
    }
    if(name==='setGame'){
     const recipe=node.arguments[0];
     if(recipe&&(ts.isArrowFunction(recipe)||ts.isFunctionExpression(recipe))){inspect(recipe.body,true);return;}
    }
   }
   ts.forEachChild(node,child=>inspect(child,insideUpdater));
  }
  inspect(source);expect(violations).toEqual([]);
 });
});

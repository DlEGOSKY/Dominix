import { describe, it, expect } from "vitest";
import { rewardWasDelivered, type RewardInventory } from "./rewardFeedback";
import { ALL_RELICS } from "./relics";
import type { Reward } from "@/types/reward";
const inventory=():RewardInventory=>({relics:[],consumables:[],celestials:[],mutations:[],tiles:[{id:"a",top:1,bottom:2}]});
const option=(reward:Reward)=>({id:"choice",name:"Choice",description:"",reward});
describe("reward delivery receipts",()=>{
  it.each(["relic","consumable","celestial","active_mutation","remove_tile","duplicate_tile","convert_number"] as const)("does not confirm an unchanged inventory for %s",type=>{
    const before=inventory();
    const rewards:Record<string,Reward>={relic:{type:"relic",relic:ALL_RELICS[0]!},consumable:{type:"consumable",consumableId:"c"},celestial:{type:"celestial",celestialId:"star"},active_mutation:{type:"active_mutation",mutationId:"m"},remove_tile:{type:"remove_tile"},duplicate_tile:{type:"duplicate_tile"},convert_number:{type:"convert_number"}};
    expect(rewardWasDelivered({option:option(rewards[type]!),before},before)).toBe(false);
  });
  it("confirms the selected relic, not an unrelated addition",()=>{
    const before=inventory(), relic=ALL_RELICS[0]!;
    const pending={option:option({type:"relic",relic}),before};
    expect(rewardWasDelivered(pending,{...before,relics:["other"]})).toBe(false);
    expect(rewardWasDelivered(pending,{...before,relics:[relic.id]})).toBe(true);
  });
  it("confirms a full-slot replacement even when the IDs are identical",()=>{
    const before={...inventory(),consumables:[{id:"c",name:"C"},{id:"c",name:"C"}]};
    expect(rewardWasDelivered({option:option({type:"consumable",consumableId:"c"}),before},{...before,consumables:[...before.consumables]})).toBe(true);
  });
  it("confirms removal, duplication and changed values, excluding a no-op conversion",()=>{
    const before=inventory();
    expect(rewardWasDelivered({option:option({type:"remove_tile"}),before},{...before,tiles:[]})).toBe(true);
    expect(rewardWasDelivered({option:option({type:"duplicate_tile"}),before},{...before,tiles:[...before.tiles,{id:"b",top:1,bottom:2}]})).toBe(true);
    expect(rewardWasDelivered({option:option({type:"convert_number"}),before},{...before,tiles:[{id:"a",top:6,bottom:2}]})).toBe(true);
    expect(rewardWasDelivered({option:option({type:"convert_number"}),before},{...before,tiles:[{...before.tiles[0]!}]})).toBe(false);
  });
});

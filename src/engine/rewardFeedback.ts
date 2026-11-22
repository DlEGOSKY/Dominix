import type { RewardOption } from "@/types/reward";
import type { Tile } from "@/types/domino";
export interface RewardInventory { relics: string[]; consumables: {id:string;name:string}[]; celestials: {id:string}[]; mutations: string[]; tiles: Tile[] }
export interface PendingReward { option: RewardOption; before: RewardInventory }
const count = (ids: string[], id: string) => ids.filter(value=>value===id).length;
/** Confirmation follows an observed inventory change, never the initial click. */
export function rewardWasDelivered({ option, before }: PendingReward, after: RewardInventory): boolean {
  const r=option.reward;
  switch(r.type) {
    case "relic": return count(after.relics,r.relic.id)>count(before.relics,r.relic.id);
    case "consumable": return after.consumables!==before.consumables && after.consumables[after.consumables.length-1]?.id===r.consumableId;
    case "celestial": return count(after.celestials.map(c=>c.id),r.celestialId)>count(before.celestials.map(c=>c.id),r.celestialId);
    case "active_mutation": return count(after.mutations,r.mutationId)>count(before.mutations,r.mutationId);
    case "remove_tile": return after.tiles.length<before.tiles.length;
    case "duplicate_tile": return after.tiles.length>before.tiles.length;
    case "convert_number": return after.tiles.some(tile=>{const old=before.tiles.find(t=>t.id===tile.id);return old && (old.top!==tile.top || old.bottom!==tile.bottom);});
  }
}

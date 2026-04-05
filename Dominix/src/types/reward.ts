import type { Relic } from "./relic";

export type RewardType = "relic" | "remove_tile" | "duplicate_tile" | "convert_number";

export interface RelicReward {
  type: "relic";
  relic: Relic;
}

export interface RemoveTileReward {
  type: "remove_tile";
}

export interface DuplicateTileReward {
  type: "duplicate_tile";
}

export interface ConvertNumberReward {
  type: "convert_number";
}

export type Reward = RelicReward | RemoveTileReward | DuplicateTileReward | ConvertNumberReward;

export interface RewardOption {
  id: string;
  name: string;
  description: string;
  reward: Reward;
}

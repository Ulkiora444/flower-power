export type PlantRarity =
  | 'common'
  | 'rare'
  | 'epic'
  | 'ancient'
  | 'mysterious';
export type SeedRarity = PlantRarity | 'unknown';
export type PlantStatus = 'growing' | 'mature' | 'wilted';
export type PlantStage = 'seed' | 'sprout' | 'bud' | 'bloom' | 'wilted';
export type MarketItemKind = 'seed' | 'flower';

export interface Species {
  id: number;
  code: string;
  name: string;
  description: string;
  rarity: SeedRarity;
  growthMinutes: number;
  waterNeedMinutes: number;
  wiltAfterMinutes: number;
  baseValue: number;
  seedPrice: number;
  color: string;
  emoji: string;
}

export interface PlayerState {
  id: number;
  playerKey: string;
  name: string;
  coins: number;
  potSlots: number;
  maxPotSlots: number;
  nextPotPrice: number | null;
  renameCost: number;
  canClaimDaily: boolean;
  nextDailyAt: string | null;
}

export interface Plant {
  id: number;
  status: PlantStatus;
  stage: PlantStage;
  health: number;
  growthPercent: number;
  waterLevel: number;
  needsWater: boolean;
  canSell: boolean;
  plantedAt: string;
  lastWateredAt: string;
  timeToMatureMinutes: number;
  timeToWaterMinutes: number;
  seedRarity: SeedRarity;
  isRevealed: boolean;
  species: Species;
}

export interface InventoryEntry {
  species: Species;
  quantity: number;
}

export interface SeedInventoryEntry {
  rarity: SeedRarity;
  label: string;
  emoji: string;
  color: string;
  seedPrice: number;
  quantity: number;
}

export interface Inventory {
  seeds: SeedInventoryEntry[];
  flowers: InventoryEntry[];
}

export interface MarketListing {
  id: number;
  kind: MarketItemKind;
  quantity: number;
  pricePerItem: number;
  totalPrice: number;
  seller: {
    id: number;
    name: string;
  };
  species: Species;
  seedRarity: SeedRarity | null;
  createdAt: string;
}

export interface GameState {
  player: PlayerState;
  species: Species[];
  plants: Plant[];
  inventory: Inventory;
  market: MarketListing[];
}

export interface CreateListingPayload {
  kind: MarketItemKind;
  speciesId?: number;
  seedRarity?: SeedRarity;
  quantity: number;
  pricePerItem: number;
}

export interface PlantSalePayload {
  plantId: number;
  pricePerItem: number;
}

export interface BuyListingPayload {
  listingId: number;
  quantity: number;
}

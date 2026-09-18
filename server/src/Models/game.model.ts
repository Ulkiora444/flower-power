import { MarketItemKind } from 'src/Entities/market-listing.entity';
import { PlantRarity, SeedRarity } from 'src/Entities/plant-species.entity';
import { PlayerPlantStatus } from 'src/Entities/player-plant.entity';

export interface CreateOrLoadPlayerModel {
  playerKey?: string;
  name?: string;
}

export interface PlayerActionModel {
  playerKey?: string;
}

export interface RenamePlayerModel extends PlayerActionModel {
  name?: string;
}

export interface PlantSeedModel extends PlayerActionModel {
  rarity?: SeedRarity;
}

export interface PlantActionModel extends PlayerActionModel {
  plantId?: number;
}

export interface CreateListingModel extends PlayerActionModel {
  kind?: MarketItemKind;
  speciesId?: number;
  seedRarity?: SeedRarity;
  quantity?: number;
  pricePerItem?: number;
}

export interface CreatePlantListingModel extends PlayerActionModel {
  plantId?: number;
  pricePerItem?: number;
}

export interface BuyListingModel extends PlayerActionModel {
  listingId?: number;
  quantity?: number;
}

export interface CancelListingModel extends PlayerActionModel {
  listingId?: number;
}

export interface SpeciesView {
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

export interface PlayerView {
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

export interface PlantView {
  id: number;
  status: PlayerPlantStatus;
  stage: 'seed' | 'sprout' | 'bud' | 'bloom' | 'wilted';
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
  species: SpeciesView;
}

export interface InventoryEntryView {
  species: SpeciesView;
  quantity: number;
}

export interface SeedInventoryEntryView {
  rarity: SeedRarity;
  label: string;
  emoji: string;
  color: string;
  seedPrice: number;
  quantity: number;
}

export interface InventoryView {
  seeds: SeedInventoryEntryView[];
  flowers: InventoryEntryView[];
}

export interface MarketListingView {
  id: number;
  kind: MarketItemKind;
  quantity: number;
  pricePerItem: number;
  totalPrice: number;
  seller: {
    id: number;
    name: string;
  };
  species: SpeciesView;
  seedRarity: SeedRarity | null;
  createdAt: string;
}

export interface GameStateView {
  player: PlayerView;
  species: SpeciesView[];
  plants: PlantView[];
  inventory: InventoryView;
  market: MarketListingView[];
}

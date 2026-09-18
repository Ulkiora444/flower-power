import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GameApiService } from '../game-api.service';
import {
  BuyListingPayload,
  CreateListingPayload,
  GameState,
  Plant,
  SeedRarity,
  PlantSalePayload,
} from '../game.models';
import { seedIconUrl } from '../seed-icons';

type GameTab = 'profile' | 'market' | 'garden';

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrl: './game-page.component.css',
})
export class GamePageComponent implements OnInit, OnDestroy {
  state?: GameState;
  activeTab: GameTab = 'garden';
  plantingFormOpen = false;
  selectedPlant?: Plant;
  playerName = '';
  selectedSeedRarity: SeedRarity | null = null;
  loading = true;
  busyAction = '';
  errorMessage = '';
  infoMessage = '';
  infoMessageClosing = false;
  readonly seedIconUrl = seedIconUrl;

  private playerKey = this.getOrCreatePlayerKey();
  private infoMessageTimerId?: number;
  private infoMessageCloseTimerId?: number;

  constructor(private readonly gameApi: GameApiService) {}

  ngOnInit(): void {
    this.loadPlayer();
  }

  ngOnDestroy(): void {
    this.clearInfoMessageTimer();
  }

  get seedInventory() {
    return this.state?.inventory.seeds ?? [];
  }

  get totalSeedCount(): number {
    return this.seedInventory.reduce((sum, item) => sum + item.quantity, 0);
  }

  get canPlant(): boolean {
    if (!this.state || !this.selectedSeedRarity || this.isBusy()) {
      return false;
    }

    return (
      this.state.plants.length < this.state.player.potSlots &&
      this.seedInventory.some(
        (item) => item.rarity === this.selectedSeedRarity,
      )
    );
  }

  loadPlayer(): void {
    this.loading = true;
    this.errorMessage = '';
    this.gameApi.createOrLoadPlayer(this.playerKey, this.playerName).subscribe({
      next: (state) => {
        this.acceptState(state);
        this.loading = false;
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  saveName(name: string): void {
    this.playerName = name;
    this.runAction(
      'name',
      this.gameApi.renamePlayer(this.playerKey, name),
      'Имя изменено.',
    );
  }

  plantSelected(): void {
    if (!this.selectedSeedRarity) {
      return;
    }

    this.runAction(
      'plant',
      this.gameApi.plantSeed(this.playerKey, this.selectedSeedRarity),
      'Семечко посажено.',
      () => {
        this.plantingFormOpen = false;
      },
    );
  }

  plantSeed(rarity: SeedRarity): void {
    this.selectedSeedRarity = rarity;
    this.plantSelected();
  }

  openPlantDetails(plant: Plant): void {
    if (!this.isBusy()) {
      this.selectedPlant = plant;
    }
  }

  closePlantDetails(): void {
    if (!this.isBusy()) {
      this.selectedPlant = undefined;
    }
  }

  buyPotSlot(): void {
    this.runAction(
      'buy-pot',
      this.gameApi.buyPotSlot(this.playerKey),
      'Новый горшок куплен.',
    );
  }

  waterPlant(plantId: number): void {
    this.runAction(
      `water-${plantId}`,
      this.gameApi.waterPlant(this.playerKey, plantId),
      'Цветок полит.',
    );
  }

  listPlantForSale(payload: PlantSalePayload): void {
    this.runAction(
      `sell-plant-${payload.plantId}`,
      this.gameApi.listPlantForSale(this.playerKey, payload),
      'Цветок выставлен на рынок. Горшок свободен.',
    );
  }

  compostPlant(plantId: number): void {
    this.runAction(
      `compost-${plantId}`,
      this.gameApi.compostPlant(this.playerKey, plantId),
      'Горшок освобожден.',
    );
  }

  claimDaily(): void {
    const previousState = this.state;

    this.runAction(
      'daily',
      this.gameApi.claimDaily(this.playerKey),
      (state) => this.describeBonusReward(previousState, state),
    );
  }

  createListing(payload: CreateListingPayload): void {
    this.runAction(
      'listing',
      this.gameApi.createListing(this.playerKey, payload),
      'Лот выставлен на рынок.',
    );
  }

  buyListing(payload: BuyListingPayload): void {
    this.runAction(
      `buy-${payload.listingId}`,
      this.gameApi.buyListing(this.playerKey, payload),
      'Покупка добавлена в инвентарь.',
    );
  }

  cancelListing(listingId: number): void {
    this.runAction(
      `cancel-${listingId}`,
      this.gameApi.cancelListing(this.playerKey, listingId),
      'Лот снят с рынка.',
    );
  }

  setActiveTab(tab: GameTab): void {
    this.activeTab = tab;
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  openPlantingForm(): void {
    if (!this.isBusy()) {
      this.plantingFormOpen = true;
    }
  }

  closePlantingForm(): void {
    if (!this.isBusy()) {
      this.plantingFormOpen = false;
    }
  }

  isActiveTab(tab: GameTab): boolean {
    return this.activeTab === tab;
  }

  isBusy(action?: string): boolean {
    return action ? this.busyAction === action : this.busyAction !== '';
  }

  potSlotIndexes(game: GameState): number[] {
    return Array.from({ length: game.player.maxPotSlots }, (_, index) => index);
  }

  trackByIndex(index: number): number {
    return index;
  }

  isPotUnlocked(slot: number, game: GameState): boolean {
    return slot < game.player.potSlots;
  }

  isNextPotForSale(slot: number, game: GameState): boolean {
    return slot === game.player.potSlots && game.player.nextPotPrice !== null;
  }

  potPrice(slot: number): number | null {
    const prices: Record<number, number> = {
      1: 2500,
      2: 5000,
    };

    return prices[slot] ?? null;
  }

  potStatusLabel(plant: Plant): string {
    if (plant.status === 'wilted') {
      return 'Завял';
    }

    if (plant.needsWater) {
      return 'Нужен полив';
    }

    if (plant.status === 'mature') {
      return 'Вырос';
    }

    return 'Растет';
  }

  private runAction(
    action: string,
    request: Observable<GameState>,
    successMessage: string | ((state: GameState) => string),
    afterSuccess?: () => void,
  ): void {
    if (this.busyAction) {
      return;
    }

    this.busyAction = action;
    this.errorMessage = '';
    this.hideInfoMessage();

    request.subscribe({
      next: (state) => {
        this.acceptState(state);
        this.busyAction = '';
        this.showInfoMessage(
          typeof successMessage === 'function'
            ? successMessage(state)
            : successMessage,
        );
        afterSuccess?.();
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  private acceptState(state: GameState): void {
    this.state = state;
    this.playerKey = state.player.playerKey;
    this.playerName = state.player.name;
    localStorage.setItem('flower-game-player-key', state.player.playerKey);

    const hasSelectedSeed = state.inventory.seeds.some(
      (item) => item.rarity === this.selectedSeedRarity,
    );
    if (!hasSelectedSeed) {
      this.selectedSeedRarity = state.inventory.seeds[0]?.rarity ?? null;
    }

    if (this.selectedPlant) {
      this.selectedPlant = state.plants.find(
        (plant) => plant.id === this.selectedPlant?.id,
      );
    }
  }

  private handleError(error: unknown): void {
    this.loading = false;
    this.busyAction = '';
    this.hideInfoMessage();
    this.errorMessage = this.extractErrorMessage(error);
  }

  private showInfoMessage(message: string): void {
    this.infoMessage = message;
    this.infoMessageClosing = false;
    this.clearInfoMessageTimer();
    this.infoMessageTimerId = window.setTimeout(() => {
      this.infoMessageClosing = true;
      this.clearInfoMessageCloseTimer();
      this.infoMessageCloseTimerId = window.setTimeout(() => {
        this.infoMessage = '';
        this.infoMessageClosing = false;
        this.infoMessageCloseTimerId = undefined;
      }, 260);
    }, 1740);
  }

  private hideInfoMessage(): void {
    this.infoMessage = '';
    this.infoMessageClosing = false;
    this.clearInfoMessageTimer();
    this.clearInfoMessageCloseTimer();
  }

  private clearInfoMessageTimer(): void {
    if (this.infoMessageTimerId !== undefined) {
      window.clearTimeout(this.infoMessageTimerId);
      this.infoMessageTimerId = undefined;
    }
  }

  private clearInfoMessageCloseTimer(): void {
    if (this.infoMessageCloseTimerId !== undefined) {
      window.clearTimeout(this.infoMessageCloseTimerId);
      this.infoMessageCloseTimerId = undefined;
    }
  }

  private extractErrorMessage(error: unknown): string {
    const fallback = 'Не удалось выполнить действие. Проверьте backend и базу данных.';
    if (!error || typeof error !== 'object') {
      return fallback;
    }

    const httpError = error as {
      error?: { message?: string | string[] } | string;
      message?: string;
    };

    if (typeof httpError.error === 'string') {
      return httpError.error;
    }

    const message = httpError.error?.message ?? httpError.message;
    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return message || fallback;
  }

  private describeBonusReward(
    previousState: GameState | undefined,
    nextState: GameState,
  ): string {
    if (!previousState) {
      return 'Еженедельный бонус получен.';
    }

    const coinDelta = nextState.player.coins - previousState.player.coins;
    const seedDelta =
      this.sumInventory(nextState.inventory.seeds) -
      this.sumInventory(previousState.inventory.seeds);

    if (seedDelta > 0) {
      return 'Еженедельный бонус получен: выпало семечко.';
    }

    if (coinDelta > 0) {
      return `Еженедельный бонус получен: +${coinDelta} монет.`;
    }

    return 'Еженедельный бонус получен.';
  }

  private sumInventory(items: Array<{ quantity: number }>): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  private getOrCreatePlayerKey(): string {
    const existing = localStorage.getItem('flower-game-player-key');
    if (existing) {
      return existing;
    }

    const generated =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `player-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem('flower-game-player-key', generated);
    return generated;
  }
}

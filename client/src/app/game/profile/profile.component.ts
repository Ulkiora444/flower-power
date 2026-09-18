import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GameState, InventoryEntry, SeedInventoryEntry } from '../game.models';
import { seedIconUrl } from '../seed-icons';

type InventoryViewMode = 'rows' | 'blocks';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
  @Input({ required: true }) state!: GameState;
  @Input() busy = false;

  @Output() saveName = new EventEmitter<string>();
  @Output() claimDaily = new EventEmitter<void>();

  renameDialogOpen = false;
  renameDraft = '';
  inventoryViewMode: InventoryViewMode = 'rows';
  nowMs = Date.now();
  readonly seedIconUrl = seedIconUrl;
  private timerId?: number;

  ngOnInit(): void {
    this.timerId = window.setInterval(() => {
      this.nowMs = Date.now();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId !== undefined) {
      window.clearInterval(this.timerId);
    }
  }

  get totalSeeds(): number {
    return this.sumQuantity(this.state.inventory.seeds);
  }

  get totalFlowers(): number {
    return this.sumQuantity(this.state.inventory.flowers);
  }

  get activeListings(): number {
    return this.state.market.filter(
      (listing) => listing.seller.id === this.state.player.id,
    ).length;
  }

  get normalizedRenameDraft(): string {
    return this.renameDraft.trim().replace(/\s+/g, ' ');
  }

  get canRename(): boolean {
    return (
      !this.busy &&
      this.normalizedRenameDraft.length > 0 &&
      this.normalizedRenameDraft !== this.state.player.name &&
      this.state.player.coins >= this.state.player.renameCost
    );
  }

  get canOpenRenameDialog(): boolean {
    return !this.busy && this.state.player.coins >= this.state.player.renameCost;
  }

  get renameHint(): string {
    if (this.normalizedRenameDraft.length === 0) {
      return 'Введите имя игрока.';
    }

    if (this.normalizedRenameDraft === this.state.player.name) {
      return 'Новое имя должно отличаться от текущего.';
    }

    if (this.state.player.coins < this.state.player.renameCost) {
      return 'Недостаточно монет для смены имени.';
    }

    return `Смена имени стоит ${this.state.player.renameCost} монет.`;
  }

  get nextDailyText(): string {
    if (this.isWeeklyBonusReady) {
      return 'Доступен сейчас';
    }

    if (!this.state.player.nextDailyAt) {
      return 'Нет таймера';
    }

    const remainingMs =
      new Date(this.state.player.nextDailyAt).getTime() - this.nowMs;

    if (remainingMs <= 0) {
      return 'Доступен сейчас';
    }

    const dayMs = 24 * 60 * 60 * 1000;
    if (remainingMs >= dayMs) {
      const days = Math.ceil(remainingMs / dayMs);
      return `${days} ${this.pluralizeDays(days)}`;
    }

    return this.formatTimeLeft(remainingMs);
  }

  get canClaimWeeklyBonus(): boolean {
    return !this.busy && this.isWeeklyBonusReady;
  }

  private get isWeeklyBonusReady(): boolean {
    if (this.state.player.canClaimDaily) {
      return true;
    }

    if (!this.state.player.nextDailyAt) {
      return false;
    }

    return new Date(this.state.player.nextDailyAt).getTime() <= this.nowMs;
  }

  openRenameDialog(): void {
    if (!this.canOpenRenameDialog) {
      return;
    }

    this.renameDraft = this.state.player.name;
    this.renameDialogOpen = true;
  }

  closeRenameDialog(): void {
    if (!this.busy) {
      this.renameDialogOpen = false;
    }
  }

  confirmRename(): void {
    if (!this.canRename) {
      return;
    }

    this.saveName.emit(this.normalizedRenameDraft);
    this.renameDialogOpen = false;
  }

  setInventoryViewMode(mode: InventoryViewMode): void {
    this.inventoryViewMode = mode;
  }

  trackBySeedRarity(_: number, item: SeedInventoryEntry): string {
    return item.rarity;
  }

  trackBySpeciesId(_: number, item: InventoryEntry): number {
    return item.species.id;
  }

  private sumQuantity(items: Array<{ quantity: number }>): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  private formatTimeLeft(remainingMs: number): string {
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${this.padTime(hours)}:${this.padTime(minutes)}:${this.padTime(seconds)}`;
  }

  private padTime(value: number): string {
    return value.toString().padStart(2, '0');
  }

  private pluralizeDays(days: number): string {
    const lastTwoDigits = days % 100;
    const lastDigit = days % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return 'дней';
    }
    if (lastDigit === 1) {
      return 'день';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'дня';
    }

    return 'дней';
  }
}

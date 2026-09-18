import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CreateListingPayload,
  Inventory,
  InventoryEntry,
  SeedInventoryEntry,
} from '../game.models';
import { seedIconUrl } from '../seed-icons';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent {
  @Input({ required: true }) inventory!: Inventory;
  @Input() busy = false;
  readonly seedIconUrl = seedIconUrl;

  @Output() createListing = new EventEmitter<CreateListingPayload>();

  submitSeed(
    item: SeedInventoryEntry,
    quantityValue: string,
    priceValue: string,
  ): void {
    const quantity = this.clampNumber(quantityValue, 1, item.quantity);
    const pricePerItem = this.clampNumber(priceValue, 1, 99999);

    this.createListing.emit({
      kind: 'seed',
      seedRarity: item.rarity,
      quantity,
      pricePerItem,
    });
  }

  submitFlower(
    item: InventoryEntry,
    quantityValue: string,
    priceValue: string,
  ): void {
    const quantity = this.clampNumber(quantityValue, 1, item.quantity);
    const pricePerItem = this.clampNumber(priceValue, 1, 99999);

    this.createListing.emit({
      kind: 'flower',
      speciesId: item.species.id,
      quantity,
      pricePerItem,
    });
  }

  suggestSeedPrice(item: SeedInventoryEntry): number {
    return Math.max(1, item.seedPrice);
  }

  suggestFlowerPrice(item: InventoryEntry): number {
    return Math.max(1, item.species.baseValue);
  }

  trackBySeedRarity(_: number, item: SeedInventoryEntry): string {
    return item.rarity;
  }

  trackBySpeciesId(_: number, item: InventoryEntry): number {
    return item.species.id;
  }

  private clampNumber(value: string, min: number, max: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return min;
    }

    return Math.min(max, Math.max(min, Math.floor(parsed)));
  }
}

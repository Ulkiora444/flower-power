import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  BuyListingPayload,
  MarketItemKind,
  MarketListing,
  PlayerState,
  SeedRarity,
} from '../game.models';
import { seedIconUrl } from '../seed-icons';

type RarityFilter = SeedRarity | 'all';

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrl: './market.component.css',
})
export class MarketComponent {
  @Input({ required: true }) listings: MarketListing[] = [];
  @Input({ required: true }) player!: PlayerState;
  @Input() busy = false;

  @Output() buy = new EventEmitter<BuyListingPayload>();
  @Output() cancel = new EventEmitter<number>();

  searchTerm = '';
  selectedRarity: RarityFilter = 'all';
  readonly seedIconUrl = seedIconUrl;
  readonly rarityOptions: Array<{ value: RarityFilter; label: string }> = [
    { value: 'all', label: 'Все' },
    { value: 'common', label: 'Обычное' },
    { value: 'rare', label: 'Редкое' },
    { value: 'epic', label: 'Эпическое' },
    { value: 'ancient', label: 'Древнее' },
    { value: 'mysterious', label: 'Таинственное' },
    { value: 'unknown', label: 'Неизвестное' },
  ];

  get filteredListings(): MarketListing[] {
    const query = this.searchTerm.trim().toLocaleLowerCase('ru-RU');

    return this.listings.filter((listing) => {
      const matchesRarity =
        this.selectedRarity === 'all' ||
        this.listingRarity(listing) === this.selectedRarity;
      const searchableText = [
        listing.species.name,
        listing.seller.name,
        this.kindLabel(listing.kind),
        this.rarityLabel(this.listingRarity(listing)),
      ]
        .join(' ')
        .toLocaleLowerCase('ru-RU');

      return matchesRarity && (!query || searchableText.includes(query));
    });
  }

  get hasActiveFilters(): boolean {
    return this.searchTerm.trim().length > 0 || this.selectedRarity !== 'all';
  }

  setRarityFilter(rarity: RarityFilter): void {
    this.selectedRarity = rarity;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRarity = 'all';
  }

  emitBuy(listing: MarketListing, quantityValue: string) {
    const parsed = Number(quantityValue);
    const quantity = Number.isFinite(parsed)
      ? Math.min(listing.quantity, Math.max(1, Math.floor(parsed)))
      : 1;

    this.buy.emit({
      listingId: listing.id,
      quantity,
    });
  }

  isOwnListing(listing: MarketListing): boolean {
    return listing.seller.id === this.player.id;
  }

  kindLabel(kind: MarketItemKind): string {
    return kind === 'seed' ? 'Семя' : 'Цветок';
  }

  listingRarity(listing: MarketListing): SeedRarity {
    return listing.kind === 'seed' && listing.seedRarity
      ? listing.seedRarity
      : listing.species.rarity;
  }

  rarityLabel(rarity: SeedRarity): string {
    const labels: Record<SeedRarity, string> = {
      common: 'Обычное',
      rare: 'Редкое',
      epic: 'Эпическое',
      ancient: 'Древнее',
      mysterious: 'Таинственное',
      unknown: 'Неизвестное',
    };

    return labels[rarity];
  }

  trackByListingId(_: number, listing: MarketListing): number {
    return listing.id;
  }
}

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Plant, PlantSalePayload, SeedRarity } from '../game.models';
import { seedIconUrl } from '../seed-icons';

@Component({
  selector: 'app-plant-card',
  templateUrl: './plant-card.component.html',
  styleUrl: './plant-card.component.css',
})
export class PlantCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) plant!: Plant;
  @Input() busy = false;

  @Output() water = new EventEmitter<number>();
  @Output() listForSale = new EventEmitter<PlantSalePayload>();
  @Output() compost = new EventEmitter<number>();

  nowMs = Date.now();
  salePrice = 1;
  readonly seedIconUrl = seedIconUrl;
  private countdownTimerId?: number;

  ngOnInit(): void {
    this.countdownTimerId = window.setInterval(() => {
      this.nowMs = Date.now();
    }, 1000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['plant'] && this.plant) {
      this.salePrice = Math.max(1, this.plant.species.baseValue);
    }
  }

  ngOnDestroy(): void {
    if (this.countdownTimerId !== undefined) {
      window.clearInterval(this.countdownTimerId);
    }
  }

  get statusLabel(): string {
    if (this.plant.status === 'wilted') {
      return 'Завял';
    }
    if (this.canSellNow) {
      return 'Созрел';
    }
    return 'Растет';
  }

  get matureCountdownText(): string {
    if (this.plant.status === 'wilted') {
      return 'Завял';
    }

    if (this.canSellNow) {
      return 'Готово';
    }

    const remainingSeconds = this.matureRemainingSeconds;

    if (remainingSeconds === 0) {
      return 'Готово';
    }

    return this.formatCountdown(remainingSeconds);
  }

  get canSellNow(): boolean {
    return this.plant.status !== 'wilted' && this.matureRemainingSeconds === 0;
  }

  sellPlant(): void {
    if (!this.canSellNow || this.busy) {
      return;
    }

    const pricePerItem = this.clampPrice(this.salePrice);
    this.salePrice = pricePerItem;
    this.listForSale.emit({
      plantId: this.plant.id,
      pricePerItem,
    });
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

  private get matureAtMs(): number {
    const plantedAtMs = new Date(this.plant.plantedAt).getTime();

    if (Number.isNaN(plantedAtMs)) {
      return this.nowMs + this.plant.timeToMatureMinutes * 60 * 1000;
    }

    return plantedAtMs + this.plant.species.growthMinutes * 60 * 1000;
  }

  private get matureRemainingSeconds(): number {
    if (this.plant.status === 'mature') {
      return 0;
    }

    return Math.max(0, Math.ceil((this.matureAtMs - this.nowMs) / 1000));
  }

  private formatCountdown(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${this.padTime(minutes)}:${this.padTime(seconds)}`;
    }

    return `${minutes}:${this.padTime(seconds)}`;
  }

  private padTime(value: number): string {
    return value.toString().padStart(2, '0');
  }

  private clampPrice(value: number): number {
    if (!Number.isFinite(value)) {
      return Math.max(1, this.plant.species.baseValue);
    }

    return Math.min(99999, Math.max(1, Math.floor(value)));
  }
}

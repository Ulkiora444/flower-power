import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MarketListing } from './market-listing.entity';
import { PlayerFlower } from './player-flower.entity';
import { PlayerPlant } from './player-plant.entity';
import { PlayerSeed } from './player-seed.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  playerKey: string;

  @Column({ default: 'Садовник' })
  name: string;

  @Column({ type: 'int', default: 120 })
  coins: number;

  @Column({ type: 'int', default: 1 })
  potSlots: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastDailyAt: Date | null;

  @OneToMany(() => PlayerPlant, (plant) => plant.player)
  plants: PlayerPlant[];

  @OneToMany(() => PlayerSeed, (seed) => seed.player)
  seeds: PlayerSeed[];

  @OneToMany(() => PlayerFlower, (flower) => flower.player)
  flowers: PlayerFlower[];

  @OneToMany(() => MarketListing, (listing) => listing.seller)
  listings: MarketListing[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

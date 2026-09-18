import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlantSpecies, SeedRarity } from './plant-species.entity';
import { Player } from './player.entity';

export type MarketItemKind = 'seed' | 'flower';
export type MarketListingStatus = 'active' | 'sold' | 'cancelled';

@Entity('market_listings')
export class MarketListing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sellerId: number;

  @ManyToOne(() => Player, (player) => player.listings, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sellerId' })
  seller: Player;

  @Column({ type: 'varchar', length: 16 })
  kind: MarketItemKind;

  @Column({ nullable: true })
  speciesId: number | null;

  @ManyToOne(() => PlantSpecies, { eager: false, nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'speciesId' })
  species: PlantSpecies | null;

  @Column({ type: 'varchar', length: 24, nullable: true })
  seedRarity: SeedRarity | null;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  pricePerItem: number;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status: MarketListingStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

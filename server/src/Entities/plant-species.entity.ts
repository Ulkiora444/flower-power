import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type PlantRarity =
  | 'common'
  | 'rare'
  | 'epic'
  | 'ancient'
  | 'mysterious';

export type SeedRarity = PlantRarity | 'unknown';

@Entity('plant_species')
export class PlantSpecies {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'varchar', length: 24 })
  rarity: PlantRarity;

  @Column({ type: 'int' })
  growthMinutes: number;

  @Column({ type: 'int' })
  waterNeedMinutes: number;

  @Column({ type: 'int' })
  wiltAfterMinutes: number;

  @Column({ type: 'int' })
  baseValue: number;

  @Column({ type: 'int' })
  seedPrice: number;

  @Column()
  color: string;

  @Column()
  emoji: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}

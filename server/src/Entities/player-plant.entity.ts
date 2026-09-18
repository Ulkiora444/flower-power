import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlantSpecies } from './plant-species.entity';
import { SeedRarity } from './plant-species.entity';
import { Player } from './player.entity';

export type PlayerPlantStatus = 'growing' | 'mature' | 'wilted';

@Entity('player_plants')
export class PlayerPlant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  playerId: number;

  @ManyToOne(() => Player, (player) => player.plants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playerId' })
  player: Player;

  @Column()
  speciesId: number;

  @ManyToOne(() => PlantSpecies, { eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'speciesId' })
  species: PlantSpecies;

  @Column({ type: 'varchar', length: 24, default: 'growing' })
  status: PlayerPlantStatus;

  @Column({ type: 'varchar', length: 24, default: 'common' })
  seedRarity: SeedRarity;

  @Column({ type: 'int', default: 100 })
  health: number;

  @Column({ type: 'timestamptz' })
  plantedAt: Date;

  @Column({ type: 'timestamptz' })
  lastWateredAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

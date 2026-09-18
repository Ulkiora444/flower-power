import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlantSpecies, SeedRarity } from './plant-species.entity';
import { Player } from './player.entity';

@Entity('player_seeds')
@Index(['playerId', 'rarity'])
export class PlayerSeed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  playerId: number;

  @ManyToOne(() => Player, (player) => player.seeds, { onDelete: 'CASCADE' })
  player: Player;

  @Column({ type: 'varchar', length: 24, default: 'common' })
  rarity: SeedRarity;

  @Column({ nullable: true })
  speciesId: number | null;

  @ManyToOne(() => PlantSpecies, { eager: false, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'speciesId' })
  species: PlantSpecies | null;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

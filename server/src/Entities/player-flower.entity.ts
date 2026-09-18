import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlantSpecies } from './plant-species.entity';
import { Player } from './player.entity';

@Entity('player_flowers')
@Index(['playerId', 'speciesId'], { unique: true })
export class PlayerFlower {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  playerId: number;

  @ManyToOne(() => Player, (player) => player.flowers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playerId' })
  player: Player;

  @Column()
  speciesId: number;

  @ManyToOne(() => PlantSpecies, { eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'speciesId' })
  species: PlantSpecies;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

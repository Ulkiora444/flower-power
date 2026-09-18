import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketListing } from 'src/Entities/market-listing.entity';
import { PlantSpecies } from 'src/Entities/plant-species.entity';
import { PlayerFlower } from 'src/Entities/player-flower.entity';
import { PlayerPlant } from 'src/Entities/player-plant.entity';
import { PlayerSeed } from 'src/Entities/player-seed.entity';
import { Player } from 'src/Entities/player.entity';
import { GameService } from './game.service';
import { MarketController } from './market/market.controller';
import { MarketGameService } from './market/market.service';
import { PlantController } from './plant/plant.controller';
import { PlantGameService } from './plant/plant.service';
import { PlayerController } from './player/player.controller';
import { PlayerGameService } from './player/player.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Player,
      PlantSpecies,
      PlayerPlant,
      PlayerSeed,
      PlayerFlower,
      MarketListing,
    ]),
  ],
  controllers: [PlayerController, PlantController, MarketController],
  providers: [GameService, PlayerGameService, PlantGameService, MarketGameService],
})
export class GameModule {}

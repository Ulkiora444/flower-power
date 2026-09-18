import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import { MarketListing } from './Entities/market-listing.entity';
import { PlantSpecies } from './Entities/plant-species.entity';
import { PlayerFlower } from './Entities/player-flower.entity';
import { PlayerPlant } from './Entities/player-plant.entity';
import { PlayerSeed } from './Entities/player-seed.entity';
import { Player } from './Entities/player.entity';
import { GameModule } from './game/game.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'flower_game_sayt',
      entities: [
        Player,
        PlantSpecies,
        PlayerPlant,
        PlayerSeed,
        PlayerFlower,
        MarketListing,
      ],
      autoLoadEntities: true,
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, '..', '..', 'public', 'images'),
    }),
    ImagesModule,
    GameModule,
  ],
  providers: [],
})
export class AppModule {}

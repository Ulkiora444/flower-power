import { Injectable } from '@nestjs/common';
import {
  PlantActionModel,
  PlantSeedModel,
} from 'src/Models/game.model';
import { GameService } from '../game.service';

@Injectable()
export class PlantGameService {
  constructor(private readonly gameService: GameService) {}

  plantSeed(body: PlantSeedModel) {
    return this.gameService.plantSeed(body);
  }

  waterPlant(body: PlantActionModel) {
    return this.gameService.waterPlant(body);
  }

  compostPlant(body: PlantActionModel) {
    return this.gameService.compostPlant(body);
  }
}

import { Body, Controller, Post } from '@nestjs/common';
import {
  PlantActionModel,
  PlantSeedModel,
} from 'src/Models/game.model';
import { PlantGameService } from './plant.service';

@Controller('game')
export class PlantController {
  constructor(private readonly plantGameService: PlantGameService) {}

  @Post('actions/plant')
  plantSeed(@Body() body: PlantSeedModel) {
    return this.plantGameService.plantSeed(body);
  }

  @Post('actions/water')
  waterPlant(@Body() body: PlantActionModel) {
    return this.plantGameService.waterPlant(body);
  }

  @Post('actions/compost')
  compostPlant(@Body() body: PlantActionModel) {
    return this.plantGameService.compostPlant(body);
  }
}

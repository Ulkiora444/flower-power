import { Injectable } from '@nestjs/common';
import {
  CreateOrLoadPlayerModel,
  PlayerActionModel,
  RenamePlayerModel,
} from 'src/Models/game.model';
import { GameService } from '../game.service';

@Injectable()
export class PlayerGameService {
  constructor(private readonly gameService: GameService) {}

  createOrLoadPlayer(body: CreateOrLoadPlayerModel) {
    return this.gameService.createOrLoadPlayer(body);
  }

  getState(playerKey: string) {
    return this.gameService.getState(playerKey);
  }

  buyPotSlot(body: PlayerActionModel) {
    return this.gameService.buyPotSlot(body);
  }

  claimDaily(body: PlayerActionModel) {
    return this.gameService.claimDaily(body);
  }

  renamePlayer(body: RenamePlayerModel) {
    return this.gameService.renamePlayer(body);
  }
}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  CreateOrLoadPlayerModel,
  PlayerActionModel,
  RenamePlayerModel,
} from 'src/Models/game.model';
import { PlayerGameService } from './player.service';

@Controller('game')
export class PlayerController {
  constructor(private readonly playerGameService: PlayerGameService) {}

  @Post('player')
  createOrLoadPlayer(@Body() body: CreateOrLoadPlayerModel) {
    return this.playerGameService.createOrLoadPlayer(body);
  }

  @Get('state/:playerKey')
  getState(@Param('playerKey') playerKey: string) {
    return this.playerGameService.getState(playerKey);
  }

  @Post('actions/buy-pot')
  buyPotSlot(@Body() body: PlayerActionModel) {
    return this.playerGameService.buyPotSlot(body);
  }

  @Post('actions/daily')
  claimDaily(@Body() body: PlayerActionModel) {
    return this.playerGameService.claimDaily(body);
  }

  @Post('actions/rename')
  renamePlayer(@Body() body: RenamePlayerModel) {
    return this.playerGameService.renamePlayer(body);
  }
}

import { Injectable } from '@nestjs/common';
import {
  BuyListingModel,
  CancelListingModel,
  CreateListingModel,
  CreatePlantListingModel,
} from 'src/Models/game.model';
import { GameService } from '../game.service';

@Injectable()
export class MarketGameService {
  constructor(private readonly gameService: GameService) {}

  createListing(body: CreateListingModel) {
    return this.gameService.createListing(body);
  }

  createPlantListing(body: CreatePlantListingModel) {
    return this.gameService.createPlantListing(body);
  }

  buyListing(body: BuyListingModel) {
    return this.gameService.buyListing(body);
  }

  cancelListing(body: CancelListingModel) {
    return this.gameService.cancelListing(body);
  }
}

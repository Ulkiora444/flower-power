import { Body, Controller, Post } from '@nestjs/common';
import {
  BuyListingModel,
  CancelListingModel,
  CreateListingModel,
  CreatePlantListingModel,
} from 'src/Models/game.model';
import { MarketGameService } from './market.service';

@Controller('game')
export class MarketController {
  constructor(private readonly marketGameService: MarketGameService) {}

  @Post('market/list')
  createListing(@Body() body: CreateListingModel) {
    return this.marketGameService.createListing(body);
  }

  @Post('market/list-plant')
  createPlantListing(@Body() body: CreatePlantListingModel) {
    return this.marketGameService.createPlantListing(body);
  }

  @Post('market/buy')
  buyListing(@Body() body: BuyListingModel) {
    return this.marketGameService.buyListing(body);
  }

  @Post('market/cancel')
  cancelListing(@Body() body: CancelListingModel) {
    return this.marketGameService.cancelListing(body);
  }
}

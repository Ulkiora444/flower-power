import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { GamePageComponent } from './game/game-page/game-page.component';
import { InventoryComponent } from './game/inventory/inventory.component';
import { MarketComponent } from './game/market/market.component';
import { PlantCardComponent } from './game/plant-card/plant-card.component';
import { ProfileComponent } from './game/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    GamePageComponent,
    PlantCardComponent,
    InventoryComponent,
    MarketComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

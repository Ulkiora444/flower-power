import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BuyListingPayload,
  CreateListingPayload,
  GameState,
  PlantSalePayload,
  SeedRarity,
} from './game.models';

@Injectable({
  providedIn: 'root',
})
export class GameApiService {
  private readonly apiUrl = 'http://localhost:3000/api/game';

  constructor(private readonly http: HttpClient) {}

  createOrLoadPlayer(playerKey: string, name: string): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/player`, {
      playerKey,
      name,
    });
  }

  getState(playerKey: string): Observable<GameState> {
    return this.http.get<GameState>(`${this.apiUrl}/state/${playerKey}`);
  }

  plantSeed(playerKey: string, rarity: SeedRarity): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/actions/plant`, {
      playerKey,
      rarity,
    });
  }

  buyPotSlot(playerKey: string): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/actions/buy-pot`, {
      playerKey,
    });
  }

  waterPlant(playerKey: string, plantId: number): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/actions/water`, {
      playerKey,
      plantId,
    });
  }

  compostPlant(playerKey: string, plantId: number): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/actions/compost`, {
      playerKey,
      plantId,
    });
  }

  claimDaily(playerKey: string): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/actions/daily`, {
      playerKey,
    });
  }

  renamePlayer(playerKey: string, name: string): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/actions/rename`, {
      playerKey,
      name,
    });
  }

  createListing(
    playerKey: string,
    payload: CreateListingPayload,
  ): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/market/list`, {
      playerKey,
      ...payload,
    });
  }

  listPlantForSale(
    playerKey: string,
    payload: PlantSalePayload,
  ): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/market/list-plant`, {
      playerKey,
      ...payload,
    });
  }

  buyListing(
    playerKey: string,
    payload: BuyListingPayload,
  ): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/market/buy`, {
      playerKey,
      ...payload,
    });
  }

  cancelListing(playerKey: string, listingId: number): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/market/cancel`, {
      playerKey,
      listingId,
    });
  }
}

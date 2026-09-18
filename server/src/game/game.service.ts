import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  MarketItemKind,
  MarketListing,
} from 'src/Entities/market-listing.entity';
import {
  PlantRarity,
  PlantSpecies,
  SeedRarity,
} from 'src/Entities/plant-species.entity';
import { PlayerFlower } from 'src/Entities/player-flower.entity';
import { PlayerPlant } from 'src/Entities/player-plant.entity';
import { PlayerSeed } from 'src/Entities/player-seed.entity';
import { Player } from 'src/Entities/player.entity';
import {
  BuyListingModel,
  CancelListingModel,
  CreateListingModel,
  CreateOrLoadPlayerModel,
  CreatePlantListingModel,
  GameStateView,
  InventoryEntryView,
  MarketListingView,
  PlantActionModel,
  PlantSeedModel,
  PlantView,
  PlayerActionModel,
  RenamePlayerModel,
  SeedInventoryEntryView,
  SpeciesView,
} from 'src/Models/game.model';

const MINUTE_MS = 60 * 1000;
const WEEKLY_REWARD_MS = 7 * 24 * 60 * 60 * 1000;
const WEEKLY_COIN_REWARD = 10;
const WEEKLY_SEED_REWARD_CHANCE = 0.15;
const STARTER_SEED_RARITY: SeedRarity = 'common';
const RENAME_COST = 50;
const MAX_POT_SLOTS = 3;
const POT_SLOT_PRICES: Record<number, number> = {
  2: 2500,
  3: 5000,
};

const RARITY_ORDER: PlantRarity[] = [
  'common',
  'rare',
  'epic',
  'ancient',
  'mysterious',
];

const SEED_ORDER: SeedRarity[] = [...RARITY_ORDER, 'unknown'];

const RARITY_META: Record<
  SeedRarity,
  { label: string; seedLabel: string; emoji: string; color: string; seedPrice: number }
> = {
  common: {
    label: 'Обычное',
    seedLabel: 'Обычное семя',
    emoji: '●',
    color: '#7ee68f',
    seedPrice: 12,
  },
  rare: {
    label: 'Редкое',
    seedLabel: 'Редкое семя',
    emoji: '◆',
    color: '#58d8ff',
    seedPrice: 32,
  },
  epic: {
    label: 'Эпическое',
    seedLabel: 'Эпическое семя',
    emoji: '✦',
    color: '#c084fc',
    seedPrice: 110,
  },
  ancient: {
    label: 'Древнее',
    seedLabel: 'Древнее семя',
    emoji: '✹',
    color: '#facc15',
    seedPrice: 360,
  },
  mysterious: {
    label: 'Таинственное',
    seedLabel: 'Таинственное семя',
    emoji: '?',
    color: '#ff4ec7',
    seedPrice: 900,
  },
  unknown: {
    label: 'Неизвестное',
    seedLabel: 'Неизвестное семя',
    emoji: '?',
    color: '#ffffff',
    seedPrice: 120,
  },
};

const UNKNOWN_SEED_RARITY_WEIGHTS: Array<{
  rarity: PlantRarity;
  weight: number;
}> = [
  { rarity: 'common', weight: 55 },
  { rarity: 'rare', weight: 25 },
  { rarity: 'epic', weight: 13 },
  { rarity: 'ancient', weight: 5 },
  { rarity: 'mysterious', weight: 2 },
];

const SEED_SPECIES: Array<Partial<PlantSpecies> & { code: string }> = [
  {
    code: 'sunny-daisy',
    name: 'Солнечная ромашка',
    description: 'Быстро растет, прощает ошибки и дает стабильный старт.',
    rarity: 'common',
    growthMinutes: 10,
    waterNeedMinutes: 90,
    wiltAfterMinutes: 360,
    baseValue: 25,
    seedPrice: 12,
    color: '#f7f0a1',
    emoji: '🌼',
    sortOrder: 10,
  },
  {
    code: 'meadow-poppy',
    name: 'Луговой мак',
    description: 'Простой яркий цветок, который часто вырастает из обычных семян.',
    rarity: 'common',
    growthMinutes: 12,
    waterNeedMinutes: 95,
    wiltAfterMinutes: 360,
    baseValue: 28,
    seedPrice: 12,
    color: '#ff7aa8',
    emoji: '✿',
    sortOrder: 11,
  },
  {
    code: 'ruby-tulip',
    name: 'Рубиновый тюльпан',
    description: 'Редче ромашки, дороже на рынке и требует чуть больше ухода.',
    rarity: 'rare',
    growthMinutes: 18,
    waterNeedMinutes: 120,
    wiltAfterMinutes: 420,
    baseValue: 48,
    seedPrice: 32,
    color: '#fb7185',
    emoji: '🌷',
    sortOrder: 20,
  },
  {
    code: 'azure-hyacinth',
    name: 'Лазурный гиацинт',
    description: 'Редкий прохладный цветок с насыщенным голубым свечением.',
    rarity: 'rare',
    growthMinutes: 22,
    waterNeedMinutes: 130,
    wiltAfterMinutes: 420,
    baseValue: 56,
    seedPrice: 32,
    color: '#38bdf8',
    emoji: '✾',
    sortOrder: 21,
  },
  {
    code: 'moon-orchid',
    name: 'Лунная орхидея',
    description: 'Редкое растение с высоким спросом у коллекционеров.',
    rarity: 'epic',
    growthMinutes: 45,
    waterNeedMinutes: 150,
    wiltAfterMinutes: 480,
    baseValue: 145,
    seedPrice: 110,
    color: '#a5b4fc',
    emoji: '✦',
    sortOrder: 30,
  },
  {
    code: 'crystal-iris',
    name: 'Кристальный ирис',
    description: 'Эпический цветок с прозрачными лепестками и высоким спросом.',
    rarity: 'epic',
    growthMinutes: 52,
    waterNeedMinutes: 160,
    wiltAfterMinutes: 480,
    baseValue: 165,
    seedPrice: 110,
    color: '#c084fc',
    emoji: '✧',
    sortOrder: 31,
  },
  {
    code: 'golden-lotus',
    name: 'Золотой лотос',
    description: 'Древний цветок. Семена появляются редко через бонусы и рынок.',
    rarity: 'ancient',
    growthMinutes: 90,
    waterNeedMinutes: 180,
    wiltAfterMinutes: 540,
    baseValue: 420,
    seedPrice: 360,
    color: '#facc15',
    emoji: '✹',
    sortOrder: 40,
  },
  {
    code: 'elder-lily',
    name: 'Старшая лилия',
    description: 'Древний цветок с тяжелыми лепестками и высокой ценой на рынке.',
    rarity: 'ancient',
    growthMinutes: 105,
    waterNeedMinutes: 190,
    wiltAfterMinutes: 560,
    baseValue: 470,
    seedPrice: 360,
    color: '#fde68a',
    emoji: '✺',
    sortOrder: 41,
  },
  {
    code: 'void-rose',
    name: 'Пустотная роза',
    description: 'Таинственный цветок, который почти невозможно предугадать заранее.',
    rarity: 'mysterious',
    growthMinutes: 150,
    waterNeedMinutes: 210,
    wiltAfterMinutes: 620,
    baseValue: 900,
    seedPrice: 900,
    color: '#ff4ec7',
    emoji: '✶',
    sortOrder: 50,
  },
  {
    code: 'starbell',
    name: 'Звездный колокольчик',
    description: 'Таинственный цветок с мягким сиянием и редким рыночным спросом.',
    rarity: 'mysterious',
    growthMinutes: 165,
    waterNeedMinutes: 220,
    wiltAfterMinutes: 640,
    baseValue: 980,
    seedPrice: 900,
    color: '#f0abfc',
    emoji: '✷',
    sortOrder: 51,
  },
];

@Injectable()
export class GameService implements OnModuleInit {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(PlantSpecies)
    private readonly speciesRepository: Repository<PlantSpecies>,
    @InjectRepository(PlayerPlant)
    private readonly plantRepository: Repository<PlayerPlant>,
    @InjectRepository(PlayerSeed)
    private readonly seedRepository: Repository<PlayerSeed>,
    @InjectRepository(PlayerFlower)
    private readonly flowerRepository: Repository<PlayerFlower>,
    @InjectRepository(MarketListing)
    private readonly listingRepository: Repository<MarketListing>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.seedPlantSpecies();
    await this.migrateSeedInventoryByRarity();
    await this.migrateSeedListingsByRarity();
    await this.migratePlantSeedRarity();
  }

  async createOrLoadPlayer(body: CreateOrLoadPlayerModel) {
    const playerKey = this.normalizeNewPlayerKey(body?.playerKey);
    const requestedName = this.normalizeName(body?.name);
    let player = await this.playerRepository.findOne({
      where: { playerKey },
    });

    if (!player) {
      player = this.playerRepository.create({
        playerKey,
        name: requestedName || 'Садовник',
        coins: 120,
        potSlots: 1,
      });
      player = await this.playerRepository.save(player);

      await this.adjustSeedInventory(STARTER_SEED_RARITY, player.id, 1);
    }

    return this.getState(player.playerKey);
  }

  async renamePlayer(body: RenamePlayerModel) {
    const newName = this.normalizeName(body?.name);
    if (!newName) {
      throw new BadRequestException('Введите имя игрока.');
    }

    const player = await this.getPlayerByKey(body?.playerKey);
    if (newName === player.name) {
      return this.getState(player.playerKey);
    }

    await this.dataSource.transaction(async (manager) => {
      const playerRepository = manager.getRepository(Player);
      const playerToUpdate = await playerRepository.findOne({
        where: { id: player.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!playerToUpdate) {
        throw new NotFoundException('Игрок не найден.');
      }
      if (playerToUpdate.coins < RENAME_COST) {
        throw new BadRequestException('Недостаточно монет для смены имени.');
      }

      playerToUpdate.name = newName;
      playerToUpdate.coins -= RENAME_COST;
      await playerRepository.save(playerToUpdate);
    });

    return this.getState(player.playerKey);
  }

  async getState(playerKey: string): Promise<GameStateView> {
    const player = await this.getPlayerByKey(playerKey);
    const plants = await this.refreshPlantsForPlayer(player.id);

    const [species, seeds, flowers, listings] = await Promise.all([
      this.speciesRepository.find({ order: { sortOrder: 'ASC' } }),
      this.seedRepository.find({
        where: { playerId: player.id },
      }),
      this.flowerRepository.find({
        where: { playerId: player.id },
        relations: ['species'],
      }),
      this.listingRepository.find({
        where: { status: 'active' },
        relations: ['seller', 'species'],
        order: { createdAt: 'DESC' },
      }),
    ]);

    const now = new Date();

    return {
      player: this.serializePlayer(player, now),
      species: species.map((item) => this.serializeSpecies(item)),
      plants: plants.map((plant) => this.serializePlant(plant, now)),
      inventory: {
        seeds: this.serializeSeeds(seeds),
        flowers: this.serializeInventory(flowers),
      },
      market: listings.map((listing) => this.serializeListing(listing)),
    };
  }

  async plantSeed(body: PlantSeedModel) {
    const player = await this.getPlayerByKey(body?.playerKey);
    const rarity = this.normalizeRarity(body?.rarity);
    await this.refreshPlantsForPlayer(player.id);

    const occupiedPots = await this.plantRepository.count({
      where: { playerId: player.id },
    });
    if (occupiedPots >= Math.min(player.potSlots, MAX_POT_SLOTS)) {
      throw new BadRequestException('Свободных горшков нет.');
    }

    await this.dataSource.transaction(async (manager) => {
      await this.adjustSeedInventoryWithManager(
        manager,
        rarity,
        player.id,
        -1,
      );
      const species = await this.pickPlantSpeciesForSeed(rarity, manager);

      const now = new Date();
      await manager.getRepository(PlayerPlant).save(
        manager.getRepository(PlayerPlant).create({
          playerId: player.id,
          speciesId: species.id,
          seedRarity: rarity,
          status: 'growing',
          health: 100,
          plantedAt: now,
          lastWateredAt: now,
        }),
      );
    });

    return this.getState(player.playerKey);
  }

  async buyPotSlot(body: PlayerActionModel) {
    const player = await this.getPlayerByKey(body?.playerKey);

    await this.dataSource.transaction(async (manager) => {
      const playerRepository = manager.getRepository(Player);
      const playerToUpdate = await playerRepository.findOne({
        where: { id: player.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!playerToUpdate) {
        throw new NotFoundException('Игрок не найден.');
      }
      if (playerToUpdate.potSlots >= MAX_POT_SLOTS) {
        throw new BadRequestException('Максимум можно иметь 3 горшка.');
      }

      const nextPotSlots = playerToUpdate.potSlots + 1;
      const price = this.getPotSlotPrice(nextPotSlots);
      if (playerToUpdate.coins < price) {
        throw new BadRequestException('Недостаточно монет для покупки горшка.');
      }

      playerToUpdate.coins -= price;
      playerToUpdate.potSlots = nextPotSlots;
      await playerRepository.save(playerToUpdate);
    });

    return this.getState(player.playerKey);
  }

  async waterPlant(body: PlantActionModel) {
    const player = await this.getPlayerByKey(body?.playerKey);
    const plant = await this.getPlantForPlayer(player.id, body?.plantId);
    const now = new Date();

    this.applyPlantLifecycle(plant, now);
    if (plant.status === 'wilted') {
      await this.plantRepository.save(plant);
      throw new BadRequestException('Цветок уже завял. Освободите горшок.');
    }

    plant.lastWateredAt = now;
    plant.health = Math.min(100, plant.health + 35);
    this.applyPlantLifecycle(plant, now);
    await this.plantRepository.save(plant);

    return this.getState(player.playerKey);
  }

  async compostPlant(body: PlantActionModel) {
    const player = await this.getPlayerByKey(body?.playerKey);
    const plant = await this.getPlantForPlayer(player.id, body?.plantId);

    this.applyPlantLifecycle(plant, new Date());
    if (plant.status !== 'wilted') {
      await this.plantRepository.save(plant);
      throw new BadRequestException('Убирать можно только завядший цветок.');
    }

    await this.plantRepository.delete(plant.id);
    return this.getState(player.playerKey);
  }

  async claimDaily(body: PlayerActionModel) {
    const player = await this.getPlayerByKey(body?.playerKey);
    const now = new Date();
    const nextDailyAt = this.getNextDailyAt(player);

    if (nextDailyAt && nextDailyAt.getTime() > now.getTime()) {
      throw new BadRequestException('Еженедельный бонус еще не готов.');
    }

    const seedWon = Math.random() < WEEKLY_SEED_REWARD_CHANCE;
    const rewardRarity = seedWon ? this.pickWeeklyRewardRarity() : null;

    player.lastDailyAt = now;
    if (!seedWon) {
      player.coins += WEEKLY_COIN_REWARD;
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Player).save(player);

      if (rewardRarity) {
        await this.adjustSeedInventoryWithManager(
          manager,
          rewardRarity,
          player.id,
          1,
        );
      }
    });

    return this.getState(player.playerKey);
  }

  async createListing(body: CreateListingModel) {
    const player = await this.getPlayerByKey(body?.playerKey);
    const kind = this.normalizeMarketKind(body?.kind);
    const quantity = this.toPositiveInt(body?.quantity, 'Укажите количество.');
    const pricePerItem = this.toPositiveInt(
      body?.pricePerItem,
      'Укажите цену.',
    );
    const seedRarity =
      kind === 'seed'
        ? this.normalizeRarity(body?.seedRarity)
        : null;
    const speciesId =
      kind === 'flower'
        ? this.toPositiveInt(body?.speciesId, 'Выберите предмет.')
        : null;

    if (speciesId) {
      await this.getSpeciesById(speciesId);
    }
    if (quantity > 999 || pricePerItem > 99999) {
      throw new BadRequestException('Слишком большое значение для рынка.');
    }

    await this.dataSource.transaction(async (manager) => {
      if (kind === 'seed') {
        await this.adjustSeedInventoryWithManager(
          manager,
          seedRarity,
          player.id,
          -quantity,
        );
      } else {
        await this.adjustFlowerInventoryWithManager(
          manager,
          player.id,
          speciesId,
          -quantity,
        );
      }

      await manager.getRepository(MarketListing).save(
        manager.getRepository(MarketListing).create({
          sellerId: player.id,
          kind,
          speciesId,
          seedRarity,
          quantity,
          pricePerItem,
          status: 'active',
        }),
      );
    });

    return this.getState(player.playerKey);
  }

  async createPlantListing(body: CreatePlantListingModel) {
    const player = await this.getPlayerByKey(body?.playerKey);
    const plantId = this.toPositiveInt(body?.plantId, 'Выберите цветок.');
    const pricePerItem = this.toPositiveInt(
      body?.pricePerItem,
      'Укажите цену.',
    );

    if (pricePerItem > 99999) {
      throw new BadRequestException('Слишком большая цена для рынка.');
    }

    let validationError = '';

    await this.dataSource.transaction(async (manager) => {
      const plantRepository = manager.getRepository(PlayerPlant);
      const listingRepository = manager.getRepository(MarketListing);
      const plant = await plantRepository.findOne({
        where: { id: plantId, playerId: player.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!plant) {
        throw new NotFoundException('Цветок не найден.');
      }

      const species = await manager.getRepository(PlantSpecies).findOne({
        where: { id: plant.speciesId },
      });
      if (!species) {
        throw new NotFoundException('Вид растения не найден.');
      }

      plant.species = species;
      this.applyPlantLifecycle(plant, new Date());
      if (plant.status === 'wilted') {
        await plantRepository.save(plant);
        validationError = 'Завядший цветок нельзя продать. Освободите горшок.';
        return;
      }
      if (plant.status !== 'mature') {
        await plantRepository.save(plant);
        validationError = 'Цветок еще не вырос.';
        return;
      }

      await listingRepository.save(
        listingRepository.create({
          sellerId: player.id,
          kind: 'flower',
          speciesId: plant.speciesId,
          seedRarity: null,
          quantity: 1,
          pricePerItem,
          status: 'active',
        }),
      );
      await plantRepository.delete(plant.id);
    });

    if (validationError) {
      throw new BadRequestException(validationError);
    }

    return this.getState(player.playerKey);
  }

  async buyListing(body: BuyListingModel) {
    const player = await this.getPlayerByKey(body?.playerKey);
    const listingId = this.toPositiveInt(body?.listingId, 'Выберите лот.');
    const requestedQuantity = this.toPositiveInt(
      body?.quantity || 1,
      'Укажите количество.',
    );

    await this.dataSource.transaction(async (manager) => {
      const playerRepository = manager.getRepository(Player);
      const listingRepository = manager.getRepository(MarketListing);
      const listing = await listingRepository.findOne({
        where: { id: listingId },
        relations: ['seller', 'species'],
      });

      if (!listing || listing.status !== 'active' || listing.quantity <= 0) {
        throw new BadRequestException('Этот лот уже недоступен.');
      }
      if (listing.sellerId === player.id) {
        throw new BadRequestException('Нельзя купить собственный лот.');
      }

      const quantity = Math.min(requestedQuantity, listing.quantity);
      const totalPrice = listing.pricePerItem * quantity;
      const buyer = await playerRepository.findOne({
        where: { id: player.id },
      });

      if (!buyer || buyer.coins < totalPrice) {
        throw new BadRequestException('Недостаточно монет.');
      }

      buyer.coins -= totalPrice;
      listing.seller.coins += totalPrice;
      listing.quantity -= quantity;
      if (listing.quantity <= 0) {
        listing.quantity = 0;
        listing.status = 'sold';
      }

      await playerRepository.save([buyer, listing.seller]);
      if (listing.kind === 'seed') {
        await this.adjustSeedInventoryWithManager(
          manager,
          this.getListingSeedRarity(listing),
          buyer.id,
          quantity,
        );
      } else {
        await this.adjustFlowerInventoryWithManager(
          manager,
          buyer.id,
          listing.speciesId,
          quantity,
        );
      }
      await listingRepository.save(listing);
    });

    return this.getState(player.playerKey);
  }

  async cancelListing(body: CancelListingModel) {
    const player = await this.getPlayerByKey(body?.playerKey);
    const listingId = this.toPositiveInt(body?.listingId, 'Выберите лот.');

    await this.dataSource.transaction(async (manager) => {
      const listingRepository = manager.getRepository(MarketListing);
      const listing = await listingRepository.findOne({
        where: { id: listingId },
        relations: ['species'],
      });

      if (!listing || listing.status !== 'active') {
        throw new BadRequestException('Этот лот уже закрыт.');
      }
      if (listing.sellerId !== player.id) {
        throw new BadRequestException('Отменить можно только свой лот.');
      }

      listing.status = 'cancelled';
      await listingRepository.save(listing);
      if (listing.kind === 'seed') {
        await this.adjustSeedInventoryWithManager(
          manager,
          this.getListingSeedRarity(listing),
          player.id,
          listing.quantity,
        );
      } else {
        await this.adjustFlowerInventoryWithManager(
          manager,
          player.id,
          listing.speciesId,
          listing.quantity,
        );
      }
    });

    return this.getState(player.playerKey);
  }

  private async seedPlantSpecies() {
    for (const item of SEED_SPECIES) {
      const existing = await this.speciesRepository.findOne({
        where: { code: item.code },
      });

      if (existing) {
        await this.speciesRepository.save({
          ...existing,
          ...item,
        });
      } else {
        await this.speciesRepository.save(
          this.speciesRepository.create(item),
        );
      }
    }
  }

  private async migrateSeedInventoryByRarity() {
    const seeds = await this.seedRepository.find({ relations: ['species'] });
    if (seeds.length === 0) {
      return;
    }

    const totals = new Map<string, number>();
    for (const seed of seeds) {
      const rarity = seed.species?.rarity ?? seed.rarity ?? 'common';
      const key = `${seed.playerId}:${rarity}`;
      totals.set(key, (totals.get(key) ?? 0) + seed.quantity);
    }

    await this.seedRepository.createQueryBuilder().delete().execute();

    const migratedSeeds = Array.from(totals.entries()).map(([key, quantity]) => {
      const [playerId, rarity] = key.split(':');
      return this.seedRepository.create({
        playerId: Number(playerId),
        rarity: rarity as SeedRarity,
        speciesId: null,
        quantity,
      });
    });

    if (migratedSeeds.length > 0) {
      await this.seedRepository.save(migratedSeeds);
    }
  }

  private async migrateSeedListingsByRarity() {
    const listings = await this.listingRepository.find({
      where: { kind: 'seed' },
      relations: ['species'],
    });
    const changedListings: MarketListing[] = [];

    for (const listing of listings) {
      if (!listing.seedRarity && listing.species) {
        listing.seedRarity = listing.species.rarity;
        changedListings.push(listing);
      }
    }

    if (changedListings.length > 0) {
      await this.listingRepository.save(changedListings);
    }
  }

  private async migratePlantSeedRarity() {
    const plants = await this.plantRepository.find({ relations: ['species'] });
    const changedPlants: PlayerPlant[] = [];

    for (const plant of plants) {
      if (
        !plant.seedRarity ||
        !SEED_ORDER.includes(plant.seedRarity) ||
        (plant.seedRarity === 'common' && plant.species.rarity !== 'common')
      ) {
        plant.seedRarity = plant.species.rarity;
        changedPlants.push(plant);
      }
    }

    if (changedPlants.length > 0) {
      await this.plantRepository.save(changedPlants);
    }
  }

  private async refreshPlantsForPlayer(playerId: number) {
    const plants = await this.plantRepository.find({
      where: { playerId },
      relations: ['species'],
      order: { createdAt: 'ASC' },
    });
    const now = new Date();
    const changedPlants: PlayerPlant[] = [];

    for (const plant of plants) {
      const oldHealth = plant.health;
      const oldStatus = plant.status;
      this.applyPlantLifecycle(plant, now);

      if (oldHealth !== plant.health || oldStatus !== plant.status) {
        changedPlants.push(plant);
      }
    }

    if (changedPlants.length > 0) {
      await this.plantRepository.save(changedPlants);
    }

    return plants;
  }

  private applyPlantLifecycle(plant: PlayerPlant, now: Date) {
    if (plant.status === 'wilted') {
      plant.health = 0;
      return;
    }

    const minutesSinceWater = Math.max(
      0,
      Math.floor(
        (now.getTime() - plant.lastWateredAt.getTime()) / MINUTE_MS,
      ),
    );
    const droughtMinutes = Math.max(
      0,
      minutesSinceWater - plant.species.waterNeedMinutes,
    );

    if (droughtMinutes > 0) {
      const droughtHealth = Math.max(
        0,
        100 -
          Math.ceil(
            (droughtMinutes / plant.species.wiltAfterMinutes) * 100,
          ),
      );
      plant.health = Math.min(plant.health, droughtHealth);
    }

    if (
      plant.health <= 0 ||
      droughtMinutes >= plant.species.wiltAfterMinutes
    ) {
      plant.status = 'wilted';
      plant.health = 0;
      return;
    }

    const growthMinutes = Math.floor(
      (now.getTime() - plant.plantedAt.getTime()) / MINUTE_MS,
    );
    plant.status =
      growthMinutes >= plant.species.growthMinutes ? 'mature' : 'growing';
  }

  private async getPlayerByKey(
    playerKey?: string,
    manager?: EntityManager,
  ) {
    const key = typeof playerKey === 'string' ? playerKey.trim() : '';
    if (!key) {
      throw new BadRequestException('Не найден ключ игрока.');
    }

    const repository = manager
      ? manager.getRepository(Player)
      : this.playerRepository;
    const player = await repository.findOne({ where: { playerKey: key } });

    if (!player) {
      throw new NotFoundException('Игрок не найден.');
    }

    return player;
  }

  private async getPlantForPlayer(playerId: number, plantId?: number) {
    const id = this.toPositiveInt(plantId, 'Выберите цветок.');
    const plant = await this.plantRepository.findOne({
      where: { id, playerId },
      relations: ['species'],
    });

    if (!plant) {
      throw new NotFoundException('Цветок не найден.');
    }

    return plant;
  }

  private async getSpeciesByCode(code: string) {
    const species = await this.speciesRepository.findOne({ where: { code } });
    if (!species) {
      throw new NotFoundException('Вид растения не найден.');
    }
    return species;
  }

  private async getSpeciesById(id: number) {
    const species = await this.speciesRepository.findOne({ where: { id } });
    if (!species) {
      throw new NotFoundException('Вид растения не найден.');
    }
    return species;
  }

  private async adjustSeedInventory(
    rarity: SeedRarity,
    playerId: number,
    delta: number,
  ) {
    await this.adjustSeedInventoryWithManager(
      this.dataSource.manager,
      rarity,
      playerId,
      delta,
    );
  }

  private async adjustSeedInventoryWithManager(
    manager: EntityManager,
    rarity: SeedRarity,
    playerId: number,
    delta: number,
  ) {
    const repository = manager.getRepository(PlayerSeed);
    const items = await repository.find({ where: { playerId, rarity } });
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const nextQuantity = totalQuantity + delta;

    if (nextQuantity < 0) {
      throw new BadRequestException('Недостаточно семян этой редкости.');
    }

    const item =
      items[0] ??
      repository.create({
        playerId,
        rarity,
        speciesId: null,
        quantity: 0,
      });

    item.quantity = nextQuantity;
    item.rarity = rarity;
    item.speciesId = null;
    await repository.save(item);

    const duplicates = items.slice(1).map((duplicate) => duplicate.id);
    if (duplicates.length > 0) {
      await repository.delete(duplicates);
    }
  }

  private async adjustFlowerInventoryWithManager(
    manager: EntityManager,
    playerId: number,
    speciesId: number,
    delta: number,
  ) {
    if (!speciesId) {
      throw new BadRequestException('Выберите цветок.');
    }

    const repository = manager.getRepository(PlayerFlower);
    let item = await repository.findOne({
      where: { playerId, speciesId },
    });

    if (!item && delta < 0) {
      throw new BadRequestException('Недостаточно предметов.');
    }

    if (!item) {
      item = repository.create({
        playerId,
        speciesId,
        quantity: 0,
      });
    }

    item.quantity += delta;
    if (item.quantity < 0) {
      throw new BadRequestException('Недостаточно предметов.');
    }

    await repository.save(item);
  }

  private async pickPlantSpeciesForSeed(
    rarity: SeedRarity,
    manager?: EntityManager,
  ) {
    const plantRarity =
      rarity === 'unknown' ? this.pickUnknownSeedPlantRarity() : rarity;
    const repository = manager
      ? manager.getRepository(PlantSpecies)
      : this.speciesRepository;
    const species = await repository.find({
      where: { rarity: plantRarity },
      order: { sortOrder: 'ASC' },
    });

    if (species.length === 0) {
      throw new BadRequestException('Для этой редкости пока нет цветов.');
    }

    return species[Math.floor(Math.random() * species.length)];
  }

  private pickUnknownSeedPlantRarity(): PlantRarity {
    const totalWeight = UNKNOWN_SEED_RARITY_WEIGHTS.reduce(
      (sum, item) => sum + item.weight,
      0,
    );
    let roll = Math.random() * totalWeight;

    for (const item of UNKNOWN_SEED_RARITY_WEIGHTS) {
      roll -= item.weight;
      if (roll <= 0) {
        return item.rarity;
      }
    }

    return 'common';
  }

  private pickWeeklyRewardRarity(): SeedRarity {
    const roll = Math.random();
    if (roll > 0.995) {
      return 'unknown';
    }
    if (roll > 0.985) {
      return 'mysterious';
    }
    if (roll > 0.94) {
      return 'ancient';
    }
    if (roll > 0.78) {
      return 'epic';
    }
    if (roll > 0.48) {
      return 'rare';
    }
    return 'common';
  }

  private serializePlayer(player: Player, now: Date) {
    const nextDailyAt = this.getNextDailyAt(player);
    const potSlots = Math.min(player.potSlots, MAX_POT_SLOTS);

    return {
      id: player.id,
      playerKey: player.playerKey,
      name: player.name,
      coins: player.coins,
      potSlots,
      maxPotSlots: MAX_POT_SLOTS,
      nextPotPrice:
        potSlots < MAX_POT_SLOTS
          ? this.getPotSlotPrice(potSlots + 1)
          : null,
      renameCost: RENAME_COST,
      canClaimDaily: !nextDailyAt || nextDailyAt.getTime() <= now.getTime(),
      nextDailyAt: nextDailyAt ? nextDailyAt.toISOString() : null,
    };
  }

  private serializePlant(plant: PlayerPlant, now: Date): PlantView {
    const elapsedMinutes = Math.max(
      0,
      (now.getTime() - plant.plantedAt.getTime()) / MINUTE_MS,
    );
    const minutesSinceWater = Math.max(
      0,
      (now.getTime() - plant.lastWateredAt.getTime()) / MINUTE_MS,
    );
    const growthPercent = Math.min(
      100,
      Math.round((elapsedMinutes / plant.species.growthMinutes) * 100),
    );
    const isRevealed = growthPercent >= 100;
    const waterLevel = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          100 - (minutesSinceWater / plant.species.waterNeedMinutes) * 100,
        ),
      ),
    );

    return {
      id: plant.id,
      status: plant.status,
      stage: this.getPlantStage(plant, growthPercent),
      health: plant.health,
      growthPercent,
      waterLevel,
      needsWater: plant.status !== 'wilted' && waterLevel <= 25,
      canSell: plant.status === 'mature',
      plantedAt: plant.plantedAt.toISOString(),
      lastWateredAt: plant.lastWateredAt.toISOString(),
      timeToMatureMinutes: Math.max(
        0,
        Math.ceil(plant.species.growthMinutes - elapsedMinutes),
      ),
      timeToWaterMinutes: Math.max(
        0,
        Math.ceil(plant.species.waterNeedMinutes - minutesSinceWater),
      ),
      seedRarity: plant.seedRarity ?? plant.species.rarity,
      isRevealed,
      species: isRevealed
        ? this.serializeSpecies(plant.species)
        : this.serializeSeedSpecies(
            plant.seedRarity ?? plant.species.rarity,
            plant.species,
          ),
    };
  }

  private getPlantStage(plant: PlayerPlant, growthPercent: number) {
    if (plant.status === 'wilted') {
      return 'wilted';
    }
    if (plant.status === 'mature' || growthPercent >= 100) {
      return 'bloom';
    }
    if (growthPercent >= 65) {
      return 'bud';
    }
    if (growthPercent >= 25) {
      return 'sprout';
    }
    return 'seed';
  }

  private serializeSpecies(species: PlantSpecies): SpeciesView {
    return {
      id: species.id,
      code: species.code,
      name: species.name,
      description: species.description,
      rarity: species.rarity,
      growthMinutes: species.growthMinutes,
      waterNeedMinutes: species.waterNeedMinutes,
      wiltAfterMinutes: species.wiltAfterMinutes,
      baseValue: species.baseValue,
      seedPrice: species.seedPrice,
      color: species.color,
      emoji: species.emoji,
    };
  }

  private serializeSeedSpecies(
    rarity: SeedRarity,
    sourceSpecies?: PlantSpecies,
  ): SpeciesView {
    const meta = RARITY_META[rarity];

    return {
      id: 0,
      code: `${rarity}-seed`,
      name: meta.seedLabel,
      description: 'Какой цветок вырастет, станет известно только после цветения.',
      rarity,
      growthMinutes: sourceSpecies?.growthMinutes ?? 0,
      waterNeedMinutes: sourceSpecies?.waterNeedMinutes ?? 0,
      wiltAfterMinutes: sourceSpecies?.wiltAfterMinutes ?? 0,
      baseValue: sourceSpecies?.baseValue ?? 0,
      seedPrice: meta.seedPrice,
      color: meta.color,
      emoji: meta.emoji,
    };
  }

  private serializeSeeds(items: PlayerSeed[]): SeedInventoryEntryView[] {
    const totals = new Map<SeedRarity, number>();
    for (const item of items) {
      if (item.quantity <= 0) {
        continue;
      }
      totals.set(item.rarity, (totals.get(item.rarity) ?? 0) + item.quantity);
    }

    return SEED_ORDER.filter((rarity) => (totals.get(rarity) ?? 0) > 0).map(
      (rarity) => {
        const meta = RARITY_META[rarity];

        return {
          rarity,
          label: meta.seedLabel,
          emoji: meta.emoji,
          color: meta.color,
          seedPrice: meta.seedPrice,
          quantity: totals.get(rarity) ?? 0,
        };
      },
    );
  }

  private serializeInventory(items: PlayerFlower[]): InventoryEntryView[] {
    return items
      .filter((item) => item.quantity > 0)
      .sort((left, right) => left.species.sortOrder - right.species.sortOrder)
      .map((item) => ({
        species: this.serializeSpecies(item.species),
        quantity: item.quantity,
      }));
  }

  private serializeListing(listing: MarketListing): MarketListingView {
    const seedRarity =
      listing.kind === 'seed' ? this.getListingSeedRarity(listing) : null;

    return {
      id: listing.id,
      kind: listing.kind,
      quantity: listing.quantity,
      pricePerItem: listing.pricePerItem,
      totalPrice: listing.pricePerItem * listing.quantity,
      seller: {
        id: listing.seller.id,
        name: listing.seller.name,
      },
      species:
        listing.kind === 'seed'
          ? this.serializeSeedSpecies(seedRarity)
          : this.serializeSpecies(listing.species),
      seedRarity,
      createdAt: listing.createdAt.toISOString(),
    };
  }

  private getNextDailyAt(player: Player) {
    if (!player.lastDailyAt) {
      return null;
    }

    return new Date(player.lastDailyAt.getTime() + WEEKLY_REWARD_MS);
  }

  private getPotSlotPrice(potSlots: number) {
    const price = POT_SLOT_PRICES[potSlots];
    if (!price) {
      throw new BadRequestException('Такой горшок нельзя купить.');
    }

    return price;
  }

  private normalizeNewPlayerKey(playerKey?: string) {
    const key = typeof playerKey === 'string' ? playerKey.trim() : '';
    if (key.length >= 8) {
      return key.slice(0, 80);
    }

    return randomUUID();
  }

  private normalizeName(name?: string) {
    if (typeof name !== 'string') {
      return '';
    }

    return name.trim().replace(/\s+/g, ' ').slice(0, 24);
  }

  private normalizeMarketKind(kind?: MarketItemKind): MarketItemKind {
    if (kind === 'seed' || kind === 'flower') {
      return kind;
    }

    throw new BadRequestException('Неверный тип предмета.');
  }

  private normalizeRarity(rarity?: SeedRarity): SeedRarity {
    if (rarity && SEED_ORDER.includes(rarity)) {
      return rarity;
    }

    throw new BadRequestException('Выберите редкость семечка.');
  }

  private getListingSeedRarity(listing: MarketListing): SeedRarity {
    if (listing.seedRarity && SEED_ORDER.includes(listing.seedRarity)) {
      return listing.seedRarity;
    }

    if (listing.species?.rarity) {
      return listing.species.rarity;
    }

    throw new BadRequestException('У лота семян не указана редкость.');
  }

  private toPositiveInt(value: unknown, message: string) {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue <= 0) {
      throw new BadRequestException(message);
    }

    return numberValue;
  }
}

import { SeedRarity } from './game.models';

const SEED_ICON_URLS: Record<SeedRarity, string> = {
  common: '/seeds/%D0%9E%D0%B1%D1%8B%D1%87%D0%BD%D0%BE%D0%B5.png',
  rare: '/seeds/%D0%A0%D0%B5%D0%B4%D0%BA%D0%BE%D0%B5.png',
  epic: '/seeds/%D0%AD%D0%BF%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B5.png',
  ancient: '/seeds/%D0%94%D1%80%D0%B5%D0%B2%D0%BD%D0%B5%D0%B5.png',
  mysterious:
    '/seeds/%D0%A2%D0%B0%D0%B8%D0%BD%D1%81%D1%82%D0%B2%D0%B5%D0%BD%D0%BD%D0%BE%D0%B5.png',
  unknown:
    '/seeds/%D0%9D%D0%B5%D0%B8%D0%B7%D0%B2%D0%B5%D1%81%D1%82%D0%BD%D0%BE%D0%B5.png',
};

export function seedIconUrl(rarity: SeedRarity): string {
  return SEED_ICON_URLS[rarity];
}

import categories from "./categories";
import { Zikr } from "./types";

export type { AzkarCategory, Zikr, ZikrContent } from "./types";
export { categories };

const loaders: Record<string, () => { default: Zikr[] }> = {
  morning_azkar: () => require("./adhkar/morning_azkar"),
  evening_azkar: () => require("./adhkar/evening_azkar"),
  prayer_later_azkar: () => require("./adhkar/prayer_later_azkar"),
  sleep_azkar: () => require("./adhkar/sleep_azkar"),
  friday_salawat: () => require("./adhkar/friday_salawat"),
  wake_up_azkar: () => require("./adhkar/wake_up_azkar"),
  adhan_azkar: () => require("./adhkar/adhan_azkar"),
  wudu_azkar: () => require("./adhkar/wudu_azkar"),
  mosque_azkar: () => require("./adhkar/mosque_azkar"),
  home_azkar: () => require("./adhkar/home_azkar"),
  khala_azkar: () => require("./adhkar/khala_azkar"),
  food_azkar: () => require("./adhkar/food_azkar"),
  hajj_and_umrah_azkar: () => require("./adhkar/hajj_and_umrah_azkar"),
  clothing_azkar: () => require("./adhkar/clothing_azkar"),
  distress_azkar: () => require("./adhkar/distress_azkar"),
  nature_azkar: () => require("./adhkar/nature_azkar"),
  travel_azkar: () => require("./adhkar/travel_azkar"),
  prayer_duas: () => require("./adhkar/prayer_duas"),
  repentance_azkar: () => require("./adhkar/repentance_azkar"),
  sickness_azkar: () => require("./adhkar/sickness_azkar"),
  marriage_azkar: () => require("./adhkar/marriage_azkar"),
  daily_life_azkar: () => require("./adhkar/daily_life_azkar"),
  prophetic_duas: () => require("./adhkar/prophetic_duas"),
  quran_duas: () => require("./adhkar/quran_duas"),
  prophets_duas: () => require("./adhkar/prophets_duas"),
  quran_completion_duas: () => require("./adhkar/quran_completion_duas"),
};

const byId = new Map(categories.map((c) => [c.id, c]));
const itemsCache = new Map<string, Zikr[]>();

export const getCategory = (id: string) => byId.get(id);

export function getItems(categoryId: string) {
  let items = itemsCache.get(categoryId);
  if (!items) {
    items = loaders[categoryId]?.().default ?? [];
    itemsCache.set(categoryId, items);
  }
  return items;
}

export function getZikr(key: string) {
  const [categoryId, itemId] = key.split(":");
  const category = byId.get(categoryId);
  if (!category) return undefined;
  const zikr = getItems(categoryId).find((z) => z.id === Number(itemId));
  return zikr ? { category, zikr } : undefined;
}

const featuredCategories = categories.filter((c) => c.featured);

export const isFriday = (date = new Date()) => date.getDay() === 5;

export const dailyCategories = (date = new Date()) =>
  featuredCategories.filter((c) => !c.fridayOnly || isFriday(date));

export const perPrayerCategoryIds = categories
  .filter((c) => c.resetEachPrayer)
  .map((c) => c.id);

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");

export function searchCategories(query: string) {
  const q = normalize(query.trim());
  if (!q) return categories;
  return categories.filter(
    (c) =>
      normalize(c.title.ar).includes(q) || normalize(c.title.en).includes(q),
  );
}

export { normalize };

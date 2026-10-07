import { normalize } from "@/features/azkar/_data";
import hadithIds from "./hadithIds";
import { LocalHadith } from "./types";

export type { LocalHadith } from "./types";

const PART_SIZE = 50;

const parts: (() => { default: LocalHadith[] })[] = [
  () => require("./hadiths/part1"),
  () => require("./hadiths/part2"),
  () => require("./hadiths/part3"),
  () => require("./hadiths/part4"),
  () => require("./hadiths/part5"),
  () => require("./hadiths/part6"),
  () => require("./hadiths/part7"),
  () => require("./hadiths/part8"),
];

const loaded: LocalHadith[][] = [];
const positions = new Map(hadithIds.map((id, i) => [id, i]));

export const HADITH_COUNT = hadithIds.length;

function getPart(part: number) {
  return (loaded[part] ??= parts[part]().default);
}

function getHadithAt(index: number) {
  return getPart(Math.floor(index / PART_SIZE))[index % PART_SIZE];
}

export function getHadiths(end: number) {
  const list: LocalHadith[] = [];
  for (let part = 0; part * PART_SIZE < Math.min(end, HADITH_COUNT); part++) {
    list.push(...getPart(part));
  }
  return list.slice(0, end);
}

export function getHadith(id: string) {
  const index = positions.get(id);
  return index === undefined ? undefined : getHadithAt(index);
}

export function getDailyHadith(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((date.getTime() - start) / 86_400_000);
  return getHadithAt((dayOfYear + date.getFullYear()) % HADITH_COUNT);
}

export function searchLocalHadiths(query: string) {
  const q = normalize(query.trim());
  if (!q) return [];
  return getHadiths(HADITH_COUNT).filter(
    (h) =>
      normalize(h.ar.text).includes(q) || h.en.text.toLowerCase().includes(q),
  );
}

export const hasArabic = (text: string) => /[؀-ۿ]/.test(text);

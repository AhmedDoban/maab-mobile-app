import TEXT_CHUNKS from "@/features/quran/_data/chunks/text";
import TRANSLATION_CHUNKS from "@/features/quran/_data/chunks/translation";

export type SurahSummary = {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: "meccan" | "medinan";
  verses: number;
  page: number;
};

type Verse = {
  text: string;
  translation: string;
  surah: string;
  surahEn: string;
  surahId: number;
  ayah: number;
};

export type AyahRef = { surah: number; ayah: number };

type MushafPageInfo = {
  number: number;
  start: AyahRef;
  end: AyahRef;
  juz: number;
  hizb: number;
};

type RawSurah = {
  id: number;
  name: string;
  en: string;
  meaning: string;
  type: "meccan" | "medinan";
  ayahs: number;
  page: number;
};

type RawPage = [number, number, number, number, number, number];

export const PAGE_COUNT = 604;

let surahs: SurahSummary[] | null = null;
let pages: RawPage[] | null = null;
const texts: string[][] = [];
const translations: string[][] = [];

export const getSurahList = (): SurahSummary[] =>
  (surahs ??= (require("@/features/quran/_data/surahs.json") as RawSurah[]).map(
    (s) => ({
      id: s.id,
      name: s.name,
      transliteration: s.en,
      translation: s.meaning,
      type: s.type,
      verses: s.ayahs,
      page: s.page,
    }),
  ));

export const getSurah = (id: number): SurahSummary | undefined =>
  getSurahList()[id - 1];

const loadPages = () =>
  (pages ??= require("@/features/quran/_data/pages.json") as RawPage[]);

const textOf = (surah: number) =>
  (texts[surah - 1] ??= TEXT_CHUNKS[surah - 1]?.() ?? []);

const translationOf = (surah: number) =>
  (translations[surah - 1] ??= TRANSLATION_CHUNKS[surah - 1]?.() ?? []);

const loadTranslations = () =>
  TRANSLATION_CHUNKS.map((_, i) => translationOf(i + 1));

export const ayahText = (surah: number, ayah: number) =>
  textOf(surah)[ayah - 1] ?? "";

export const ayahTranslation = (surah: number, ayah: number) =>
  translationOf(surah)[ayah - 1] ?? "";

export function getPage(number: number): MushafPageInfo {
  const [s1, a1, s2, a2, juz, hizb] = loadPages()[number - 1];
  return {
    number,
    start: { surah: s1, ayah: a1 },
    end: { surah: s2, ayah: a2 },
    juz,
    hizb,
  };
}

const compare = (a: AyahRef, b: AyahRef) =>
  a.surah - b.surah || a.ayah - b.ayah;

export function pageOf(surah: number, ayah = 1) {
  const list = loadPages();
  const target = { surah, ayah };
  let low = 0;
  let high = list.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (compare({ surah: list[mid][0], ayah: list[mid][1] }, target) <= 0) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return low + 1;
}

export function ayahsOnPage(number: number): AyahRef[] {
  const { start, end } = getPage(number);
  const refs: AyahRef[] = [];
  for (let s = start.surah; s <= end.surah; s++) {
    const first = s === start.surah ? start.ayah : 1;
    const last = s === end.surah ? end.ayah : (getSurah(s)?.verses ?? 0);
    for (let a = first; a <= last; a++) refs.push({ surah: s, ayah: a });
  }
  return refs;
}

export function nextAyah({ surah, ayah }: AyahRef): AyahRef | null {
  const count = getSurah(surah)?.verses ?? 0;
  if (ayah < count) return { surah, ayah: ayah + 1 };
  return surah < 114 ? { surah: surah + 1, ayah: 1 } : null;
}

export const toArabicDigits = (n: number) =>
  String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

let picked: Verse | null = null;

export function getRandomVerse(): Verse {
  if (picked) return picked;
  const verses = require("@/features/quran/_data/daily-verses.json") as [
    number,
    number,
    string,
    string,
  ][];
  const now = new Date();
  const day = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const [surah, ayah, text, translation] = verses[day % verses.length];
  const info = getSurah(surah);
  picked = {
    text,
    translation,
    surah: info?.name ?? "",
    surahEn: info?.transliteration ?? "",
    surahId: surah,
    ayah,
  };
  return picked;
}

export type VerseMatch = {
  surahId: number;
  surah: string;
  ayah: number;
  text: string;
  translation: string;
};

export const normalizeQuran = (text: string) =>
  text
    .toLowerCase()
    .replace(/\ufeff/g, "")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ");

let searchText: string[][] | null = null;
const loadSearchText = () =>
  (searchText ??= require("@/features/quran/_data/search.json") as string[][]);

type SurahIndex = { surah: number; text: string; starts: number[] };

let surahIndex: SurahIndex[] | null = null;

const loadSurahIndex = () =>
  (surahIndex ??= loadSearchText().map((ayahs, s) => {
    const starts: number[] = [];
    let text = " ";
    for (const plain of ayahs) {
      starts.push(text.length);
      text += `${plain} `;
    }
    return { surah: s + 1, text, starts };
  }));

const ayahAt = (starts: number[], offset: number) => {
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (starts[mid] <= offset) low = mid;
    else high = mid - 1;
  }
  return low + 1;
};

const ARABIC = /[\u0600-\u06FF]/;

let englishIndex: { surah: number; ayah: number; key: string }[] | null = null;

const loadEnglishIndex = () =>
  (englishIndex ??= loadTranslations().flatMap((ayahs, s) =>
    ayahs.map((text, i) => ({
      surah: s + 1,
      ayah: i + 1,
      key: text.toLowerCase(),
    })),
  ));

export function searchVerses(query: string, limit = 80): VerseMatch[] {
  const q = normalizeQuran(query.trim()).trim();
  if (q.length < 2) return [];
  const whole: AyahRef[] = [];
  const partial: AyahRef[] = [];
  const seen = new Set<string>();
  const add = (list: AyahRef[], surah: number, ayah: number) => {
    const key = `${surah}:${ayah}`;
    if (seen.has(key)) return;
    seen.add(key);
    list.push({ surah, ayah });
  };

  if (ARABIC.test(q)) {
    const word = ` ${q} `;
    for (const { surah, text, starts } of loadSurahIndex()) {
      for (let i = text.indexOf(word); i >= 0; i = text.indexOf(word, i + 1)) {
        add(whole, surah, ayahAt(starts, i + 1));
      }
      if (whole.length >= limit) break;
    }
    if (whole.length < limit) {
      for (const { surah, text, starts } of loadSurahIndex()) {
        for (let i = text.indexOf(q); i >= 0; i = text.indexOf(q, i + 1)) {
          add(partial, surah, ayahAt(starts, i));
        }
        if (whole.length + partial.length >= limit) break;
      }
    }
  } else {
    for (const { surah, ayah, key } of loadEnglishIndex()) {
      if (key.includes(q)) add(whole, surah, ayah);
      if (whole.length >= limit) break;
    }
  }

  return [...whole, ...partial].slice(0, limit).map(({ surah, ayah }) => ({
    surahId: surah,
    surah: getSurah(surah)?.name ?? "",
    ayah,
    text: ayahText(surah, ayah),
    translation: ayahTranslation(surah, ayah),
  }));
}

export const JUZ_STARTS: AyahRef[] = [
  [1, 1],
  [2, 142],
  [2, 253],
  [3, 93],
  [4, 24],
  [4, 148],
  [5, 82],
  [6, 111],
  [7, 88],
  [8, 41],
  [9, 93],
  [11, 6],
  [12, 53],
  [15, 1],
  [17, 1],
  [18, 75],
  [21, 1],
  [23, 1],
  [25, 21],
  [27, 56],
  [29, 46],
  [33, 31],
  [36, 28],
  [39, 32],
  [41, 47],
  [46, 1],
  [51, 31],
  [58, 1],
  [67, 1],
  [78, 1],
].map(([surah, ayah]) => ({ surah, ayah }));

import { getSurah, toArabicDigits } from "@/features/azkar/_data/quran";
import { getItems } from "@/features/azkar/_data";
import { Locale } from "@/i18n/config";
import { ReminderKind } from "@/store/Slices/SettingsSlice";

const FIRST_HOUR = 7;
const LAST_HOUR = 22;

const MINUTE: Record<ReminderKind, number> = { dhikr: 0, quran: 30 };

const DHIKR_CATEGORIES = [
  "prophetic_duas",
  "prophets_duas",
  "quran_duas",
  "repentance_azkar",
  "distress_azkar",
];

const MAX_DHIKR_LENGTH = 200;

export type ReminderSlot = { hour: number; minute: number };

export type ReminderContent = { title: string; body: string };

export function reminderSlots(kind: ReminderKind, every: number) {
  const slots: ReminderSlot[] = [];
  for (let hour = FIRST_HOUR; hour <= LAST_HOUR; hour += every) {
    slots.push({ hour, minute: MINUTE[kind] });
  }
  return slots;
}

const clean = (text: string) => text.replace(/\s+/g, " ").trim();

const dhikrPools = new Map<Locale, string[]>();

function getDhikrPool(locale: Locale, phrases: string[]) {
  const cached = dhikrPools.get(locale);
  if (cached) return cached;
  const items = DHIKR_CATEGORIES.flatMap(getItems)
    .filter((z) => z.ar.text.length <= MAX_DHIKR_LENGTH && z[locale].text)
    .map((z) => clean(z[locale].text));
  const pool = [...phrases, ...items];
  dhikrPools.set(locale, pool);
  return pool;
}

type Verse = [number, number, string, string];

let verses: Verse[] | null = null;

const getVerses = () =>
  (verses ??= require("@/features/quran/_data/daily-verses.json") as Verse[]);

const dayOfYear = (date: Date) =>
  Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );

export function dhikrContents(
  count: number,
  locale: Locale,
  title: string,
  phrases: string[],
  now = new Date(),
): ReminderContent[] {
  const pool = getDhikrPool(locale, phrases);
  const start = dayOfYear(now) * count;
  return Array.from({ length: count }, (_, i) => ({
    title,
    body: pool[(start + i) % pool.length],
  }));
}

export function quranContents(
  count: number,
  locale: Locale,
  title: (surah: string, ayah: string) => string,
  now = new Date(),
): ReminderContent[] {
  const list = getVerses();
  const start = dayOfYear(now) * count;
  return Array.from({ length: count }, (_, i) => {
    const [surah, ayah, text, translation] = list[(start + i) % list.length];
    const info = getSurah(surah);
    const name =
      (locale === "ar" ? info?.name : info?.transliteration) ?? String(surah);
    const number = locale === "ar" ? toArabicDigits(ayah) : String(ayah);
    return {
      title: title(name, number),
      body: locale === "ar" ? text : translation,
    };
  });
}

import {
  getPage,
  getSurah,
  JUZ_STARTS,
  PAGE_COUNT,
  pageOf,
} from "@/features/azkar/_data/quran";
import type { KhatmaPlan } from "@/store/Slices/SettingsSlice";
import { localDigits } from "./localDigits";

type Wird = { index: number; from: number; to: number };

function juzPages(fromJuz: number, toJuz: number) {
  const start = JUZ_STARTS[fromJuz - 1];
  const from = pageOf(start.surah, start.ayah);
  if (toJuz >= 30) return { from, to: PAGE_COUNT };
  const next = JUZ_STARTS[toJuz];
  const nextPage = pageOf(next.surah, next.ayah);
  const first = getPage(nextPage).start;
  const startsPage = first.surah === next.surah && first.ayah === next.ayah;
  return { from, to: Math.max(from, startsPage ? nextPage - 1 : nextPage) };
}

export const pageCount = (fromJuz: number, toJuz: number) => {
  const { from, to } = juzPages(fromJuz, toJuz);
  return to - from + 1;
};

export function khatmaWirds(plan: KhatmaPlan): Wird[] {
  const { from, to } = juzPages(plan.fromJuz, plan.toJuz);
  const total = to - from + 1;
  const days = Math.max(1, Math.min(plan.days, total));
  return Array.from({ length: days }, (_, i) => {
    const start = from + Math.round((i * total) / days);
    const end = from + Math.round(((i + 1) * total) / days) - 1;
    return { index: i, from: start, to: Math.max(start, end) };
  });
}

const DAY = 24 * 60 * 60 * 1000;

export function scheduledDay(plan: KhatmaPlan, now = new Date()) {
  const start = new Date(plan.startedAt);
  start.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - start.getTime()) / DAY) + 1;
}

export function wirdDate(plan: KhatmaPlan, index: number) {
  const date = new Date(plan.startedAt);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + index);
  return date;
}

export function todayWirdBounds(plan: KhatmaPlan | null) {
  if (!plan) return null;
  const wirds = khatmaWirds(plan);
  if (plan.done >= wirds.length) return null;
  const wird = wirds[plan.done];
  return {
    wird,
    first: getPage(wird.from).start,
    last: getPage(wird.to).end,
  };
}

export function wirdLabel(from: number, to: number, ar: boolean) {
  const start = getPage(from).start;
  const end = getPage(to).end;
  const name = (surah: number) => {
    const s = getSurah(surah);
    return ar ? s?.name : s?.transliteration;
  };
  return {
    start: `${name(start.surah)} ${localDigits(start.ayah, ar)}`,
    end: `${name(end.surah)} ${localDigits(end.ayah, ar)}`,
  };
}

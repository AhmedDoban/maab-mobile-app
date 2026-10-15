import { addDays, PrayerConfig, prayerClock } from "./calculate";
import { HijriDate, toHijri } from "./hijri";
import { DAY_MINUTES, minutesOfDay, toMinutes } from "./time";
import { PrayerName, REMINDER_PRAYERS } from "./types";

export type PrayerStatus = "passed" | "next" | "upcoming";
type PrayerClock = Record<PrayerName, string>;

interface ScheduledPrayer {
  name: PrayerName;
  time: string;
  status: PrayerStatus;
}

interface NextPrayer {
  name: PrayerName;
  time: string;
  minutesLeft: number;
}

export interface PrayerDay {
  times: PrayerClock;
  tomorrow: PrayerClock;
  yesterdayIsha: string;
  hijri: HijriDate;
  city: PrayerConfig["location"]["city"];
}

function getNextPrayer(
  times: PrayerClock,
  tomorrow: PrayerClock,
  now: Date,
): NextPrayer {
  const current = minutesOfDay(now);
  const upcoming = REMINDER_PRAYERS.find((p) => toMinutes(times[p]) > current);
  if (upcoming) {
    return {
      name: upcoming,
      time: times[upcoming],
      minutesLeft: toMinutes(times[upcoming]) - current,
    };
  }
  return {
    name: "Fajr",
    time: tomorrow.Fajr,
    minutesLeft: toMinutes(tomorrow.Fajr) + DAY_MINUTES - current,
  };
}

export function getPrayerStartingNow(times: PrayerClock, now: Date) {
  const current = minutesOfDay(now);
  return REMINDER_PRAYERS.find((p) => toMinutes(times[p]) === current) ?? null;
}

export function getScheduledPrayers(day: PrayerDay, now: Date) {
  const next = getNextPrayer(day.times, day.tomorrow, now);
  const current = minutesOfDay(now);
  const prayers: ScheduledPrayer[] = REMINDER_PRAYERS.map((name) => ({
    name,
    time: day.times[name],
    status:
      name === next.name
        ? "next"
        : toMinutes(day.times[name]) <= current
          ? "passed"
          : "upcoming",
  }));
  return { next, prayers };
}

export function getLastPassedPrayer(day: PrayerDay, now: Date) {
  const passed = getScheduledPrayers(day, now).prayers.filter(
    (p) => p.status === "passed",
  );
  return passed[passed.length - 1]?.name ?? null;
}

export function getPrayerProgress(
  day: PrayerDay,
  prayers: ScheduledPrayer[],
  next: NextPrayer,
  now: Date,
) {
  const current = minutesOfDay(now);
  const passed = prayers.filter((p) => p.status === "passed");
  const previous = passed.length
    ? toMinutes(passed[passed.length - 1].time)
    : toMinutes(day.yesterdayIsha) - DAY_MINUTES;
  const target = current + next.minutesLeft;
  return (current - previous) / Math.max(1, target - previous);
}

let cachedDay: { config: PrayerConfig; key: string; day: PrayerDay } | null =
  null;

export function getPrayerDay(config: PrayerConfig, now: Date): PrayerDay {
  const key = now.toDateString();
  if (
    cachedDay &&
    cachedDay.key === key &&
    cachedDay.config.location === config.location &&
    cachedDay.config.method === config.method &&
    cachedDay.config.asr === config.asr
  ) {
    return cachedDay.day;
  }
  const today = new Date(now);
  const day = {
    times: prayerClock(config, today),
    tomorrow: prayerClock(config, addDays(today, 1)),
    yesterdayIsha: prayerClock(config, addDays(today, -1)).Isha,
    hijri: toHijri(today),
    city: config.location.city,
  };
  cachedDay = { config, key, day };
  return day;
}

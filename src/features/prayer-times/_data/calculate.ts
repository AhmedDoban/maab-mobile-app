import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";
import {
  AsrMethod,
  PrayerMethodSetting,
  resolveAsr,
  resolveMethod,
} from "./methods";
import type { CityName } from "./cityName";
import { PrayerName } from "./types";

export type PrayerLocation = {
  latitude: number;
  longitude: number;
  city: CityName | null;
  cityLookupAt?: number;
};

export type PrayerConfig = {
  location: PrayerLocation;
  method: PrayerMethodSetting;
  asr: AsrMethod;
};

type PrayerDates = Record<PrayerName, Date>;

const pad = (n: number) => String(n).padStart(2, "0");
const toHHMM = (date: Date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export function prayerDates(config: PrayerConfig, day: Date): PrayerDates {
  const params = CalculationMethod[resolveMethod(config.method)]();
  params.madhab =
    resolveAsr(config.asr) === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  const times = new PrayerTimes(
    new Coordinates(config.location.latitude, config.location.longitude),
    day,
    params,
  );
  return {
    Fajr: times.fajr,
    Sunrise: times.sunrise,
    Dhuhr: times.dhuhr,
    Asr: times.asr,
    Maghrib: times.maghrib,
    Isha: times.isha,
  };
}

export function prayerClock(config: PrayerConfig, day: Date) {
  const dates = prayerDates(config, day);
  return Object.fromEntries(
    Object.entries(dates).map(([name, date]) => [name, toHHMM(date)]),
  ) as Record<PrayerName, string>;
}

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

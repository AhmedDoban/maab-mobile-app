import type { PrayerName } from "./types";
import { prayerDates, PrayerConfig } from "./calculate";

export type IqamaSetting =
  { kind: "offset"; minutes: number } | { kind: "fixed"; time: string };

export type Mosque = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  iqama: Record<Exclude<PrayerName, "Sunrise">, IqamaSetting>;
};

export const IQAMA_PRAYERS = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
] as const;

export type IqamaPrayer = (typeof IQAMA_PRAYERS)[number];

export const DEFAULT_IQAMA: Record<IqamaPrayer, IqamaSetting> = {
  Fajr: { kind: "offset", minutes: 20 },
  Dhuhr: { kind: "offset", minutes: 15 },
  Asr: { kind: "offset", minutes: 15 },
  Maghrib: { kind: "offset", minutes: 10 },
  Isha: { kind: "offset", minutes: 20 },
};

export const createMosque = (
  name: string,
  latitude: number,
  longitude: number,
): Mosque => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  name,
  latitude,
  longitude,
  radius: 100,
  iqama: Object.fromEntries(
    Object.entries(DEFAULT_IQAMA).map(([prayer, setting]) => [
      prayer,
      { ...setting },
    ]),
  ) as Mosque["iqama"],
});

export function nextIqama(
  mosque: Mosque,
  config: PrayerConfig,
  now: Date,
): { prayer: IqamaPrayer; at: Date } | null {
  for (let offset = 0; offset < 2; offset += 1) {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    const prayers = prayerDates(config, date);
    for (const prayer of IQAMA_PRAYERS) {
      const setting = mosque.iqama[prayer];
      const at = new Date(prayers[prayer]);
      if (setting.kind === "offset") {
        at.setMinutes(at.getMinutes() + setting.minutes);
      } else {
        const [hours, minutes] = setting.time.split(":").map(Number);
        at.setHours(hours || 0, minutes || 0, 0, 0);
      }
      if (at > now) return { prayer, at };
    }
  }
  return null;
}

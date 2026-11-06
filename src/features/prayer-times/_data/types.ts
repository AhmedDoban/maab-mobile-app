import type { IconKey } from "@/components/ui/Icon";

const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

export type PrayerName = (typeof PRAYERS)[number];

export const REMINDER_PRAYERS = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
] as const satisfies readonly PrayerName[];

export const DISPLAY_PRAYERS = [
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
] as const satisfies readonly PrayerName[];

export const PRAYER_ICONS: Record<PrayerName, IconKey> = {
  Fajr: "fajr",
  Sunrise: "sunrise",
  Dhuhr: "dhuhr",
  Asr: "asr",
  Maghrib: "maghrib",
  Isha: "isha",
};

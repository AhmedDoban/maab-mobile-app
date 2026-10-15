import { CalculationMethod } from "adhan";
import { getLocales } from "expo-localization";

export const PRAYER_METHODS = [
  "UmmAlQura",
  "Egyptian",
  "MuslimWorldLeague",
  "Karachi",
  "Dubai",
  "Kuwait",
  "Qatar",
  "NorthAmerica",
  "MoonsightingCommittee",
  "Singapore",
  "Turkey",
  "Tehran",
] as const satisfies readonly (keyof typeof CalculationMethod)[];

type PrayerMethod = (typeof PRAYER_METHODS)[number];
export type PrayerMethodSetting = PrayerMethod | "auto";
export type AsrMethod = "auto" | "shafi" | "hanafi";

const BY_REGION: Record<string, PrayerMethod> = {
  SA: "UmmAlQura",
  YE: "UmmAlQura",
  BH: "UmmAlQura",
  EG: "Egyptian",
  SD: "Egyptian",
  LY: "Egyptian",
  SY: "Egyptian",
  LB: "Egyptian",
  JO: "Egyptian",
  PS: "Egyptian",
  IQ: "Egyptian",
  AE: "Dubai",
  OM: "Dubai",
  KW: "Kuwait",
  QA: "Qatar",
  PK: "Karachi",
  IN: "Karachi",
  BD: "Karachi",
  AF: "Karachi",
  US: "NorthAmerica",
  CA: "NorthAmerica",
  GB: "MoonsightingCommittee",
  SG: "Singapore",
  MY: "Singapore",
  ID: "Singapore",
  BN: "Singapore",
  TR: "Turkey",
  IR: "Tehran",
};

const HANAFI_REGIONS = new Set(["PK", "IN", "BD", "AF", "TR"]);

const region = () => getLocales()[0]?.regionCode ?? "";

export const isPrayerMethod = (value: unknown): value is PrayerMethodSetting =>
  value === "auto" || PRAYER_METHODS.includes(value as PrayerMethod);

export const isAsrMethod = (value: unknown): value is AsrMethod =>
  value === "auto" || value === "shafi" || value === "hanafi";

export const resolveMethod = (setting: PrayerMethodSetting): PrayerMethod =>
  setting === "auto" ? (BY_REGION[region()] ?? "MuslimWorldLeague") : setting;

export const resolveAsr = (setting: AsrMethod): "shafi" | "hanafi" =>
  setting === "auto"
    ? HANAFI_REGIONS.has(region())
      ? "hanafi"
      : "shafi"
    : setting;

import { requireOptionalNativeModule } from "expo";
import { Platform } from "react-native";

type WidgetPrayer = {
  label: string;
  at: number;
  time: string;
  icon: string;
};

type WidgetDate = { at: number; text: string };

export type WidgetPayload = {
  rtl: boolean;
  color: string;
  mid: string;
  deep: string;
  leftTitle: string;
  hourUnit: string;
  minuteUnit: string;
  nextTitle: string;
  todayTitle: string;
  dhikrTitle: string;
  city: string;
  prayers: WidgetPrayer[];
  dhikr: string[];
  dates: WidgetDate[];
};

type NativePrayerWidgets = { update(payload: string): void };

const native =
  Platform.OS === "android"
    ? requireOptionalNativeModule<NativePrayerWidgets>("PrayerWidgets")
    : null;

export function updatePrayerWidgets(payload: WidgetPayload) {
  try {
    native?.update(JSON.stringify(payload));
  } catch {}
}

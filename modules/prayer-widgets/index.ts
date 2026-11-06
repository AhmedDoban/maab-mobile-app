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
  morningDhikrTitle: string;
  eveningDhikrTitle: string;
  city: string;
  prayers: WidgetPrayer[];
  dhikr: string[];
  morningDhikr: string[];
  eveningDhikr: string[];
  morningSelectedText: string;
  eveningSelectedText: string;
  selectedCategory: string;
  selectedItemId: number;
  selectedItemMax: number;
  morningProgress: string;
  eveningProgress: string;
  dates: WidgetDate[];
  lockScreen: boolean;
  lockChannel: string;
};

type NativePrayerWidgets = { update(payload: string): void };

const native =
  Platform.OS === "web"
    ? null
    : requireOptionalNativeModule<NativePrayerWidgets>("PrayerWidgets");

export function updatePrayerWidgets(payload: WidgetPayload) {
  try {
    native?.update(JSON.stringify(payload));
  } catch {}
}

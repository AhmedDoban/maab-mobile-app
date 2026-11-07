import { brandFor } from "@/constants/palettes";
import { isRTLLocale } from "@/i18n/direction";
import { useAppSelector } from "@/store/Store";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { updatePrayerWidgets } from "../../../../modules/prayer-widgets";
import { contentLocale } from "@/i18n/config";
import { getItems } from "@/features/azkar/_data";
import categories from "@/features/azkar/_data/categories";
import { categoryDone, categoryTotal } from "@/features/azkar/_data/progress";
import {
  addDays,
  PrayerConfig,
  prayerClock,
  prayerDates,
} from "../_data/calculate";
import { toHijri } from "../_data/hijri";
import { shortTime } from "../_data/time";
import { PrayerDay } from "../_data/schedule";
import { DISPLAY_PRAYERS, PRAYER_ICONS } from "../_data/types";
import { IQAMA_PRAYERS, type Mosque } from "../_data/mosques";
import useCityName from "./useCityName";
import useHijriLabel from "./useHijriLabel";
import usePrayerLabels from "./usePrayerLabels";

const WIDGET_DAYS = 7;

export default function usePrayerWidgets(
  config: PrayerConfig | null,
  day: PrayerDay | null,
) {
  const { t, i18n } = useTranslation("prayer");
  const { label } = usePrayerLabels();
  const hijriLabel = useHijriLabel();
  const palette = useAppSelector((s) => s.settings.palette);
  const lockScreen = useAppSelector((s) => s.settings.lockScreenPrayer);
  const azkarProgress = useAppSelector((s) => s.azkar.progress);
  const city = useCityName(day?.city);
  const mosques = useAppSelector((s) => s.mosques.items);

  useEffect(() => {
    if (!config) return;
    const brand = brandFor(palette);
    const start = new Date();
    const days = Array.from({ length: WIDGET_DAYS + 1 }, (_, offset) =>
      addDays(start, offset - 1),
    );
    const dates = days.map((date) => {
      const midnight = new Date(date);
      midnight.setHours(0, 0, 0, 0);
      return {
        at: midnight.getTime(),
        text: hijriLabel.short(toHijri(date)),
      };
    });
    const prayers = days
      .map((date) => {
        const moments = prayerDates(config, date);
        const clock = prayerClock(config, date);
        return DISPLAY_PRAYERS.map((name) => ({
          label: label(name, date.getDay() === 5),
          at: moments[name].getTime(),
          time: shortTime(clock[name]),
          icon: PRAYER_ICONS[name],
        }));
      })
      .flat();
    const locale = contentLocale(i18n.language);
    const morningDhikr = getItems("morning_azkar").map(
      (item) => item[locale].text,
    );
    const eveningDhikr = getItems("evening_azkar").map(
      (item) => item[locale].text,
    );
    const morningItems = getItems("morning_azkar");
    const eveningItems = getItems("evening_azkar");
    const morningCategory = categories.find(
      (item) => item.id === "morning_azkar",
    );
    const eveningCategory = categories.find(
      (item) => item.id === "evening_azkar",
    );
    const selectIncomplete = (
      categoryId: "morning_azkar" | "evening_azkar",
      items: ReturnType<typeof getItems>,
    ) => {
      const category = categories.find((item) => item.id === categoryId);
      const selected =
        items.find((item) => {
          const goal = category?.goals.find((entry) => entry.id === item.id);
          return (
            (azkarProgress[`${categoryId}:${item.id}`] ?? 0) <
            (goal?.count ?? item.count)
          );
        }) ?? items[0];
      return {
        text: selected?.[locale].text ?? "",
        itemId: selected?.id ?? 1,
        max: selected?.count ?? 1,
      };
    };
    const morningSelected = selectIncomplete("morning_azkar", morningItems);
    const eveningSelected = selectIncomplete("evening_azkar", eveningItems);
    const currentPrayerTimes = prayerDates(config, start);
    const now = start.getTime();
    const mosquePayload = mosques.map((mosque: Mosque) => {
      const schedule = [0, 1].flatMap((offset) => {
        const date = addDays(start, offset);
        const moments = prayerDates(config, date);
        return IQAMA_PRAYERS.map((prayer) => {
          const setting = mosque.iqama[prayer];
          const at = new Date(moments[prayer]);
          if (setting.kind === "offset") {
            at.setMinutes(at.getMinutes() + setting.minutes);
          } else {
            const [hours, minutes] = setting.time.split(":").map(Number);
            at.setHours(hours || 0, minutes || 0, 0, 0);
          }
          const clock = `${String(at.getHours()).padStart(2, "0")}:${String(
            at.getMinutes(),
          ).padStart(2, "0")}`;
          return {
            label: label(prayer, date.getDay() === 5),
            at: at.getTime(),
            time: shortTime(clock),
          };
        });
      });
      return {
        id: mosque.id,
        name: mosque.name,
        latitude: mosque.latitude,
        longitude: mosque.longitude,
        next: schedule.find((item) => item.at > now) ?? null,
        schedule,
      };
    });
    const isMorning =
      now >= currentPrayerTimes.Fajr.getTime() &&
      now < currentPrayerTimes.Maghrib.getTime();
    const selected = isMorning ? morningSelected : eveningSelected;
    const selectedCategory = isMorning ? "morning_azkar" : "evening_azkar";
    updatePrayerWidgets({
      rtl: isRTLLocale(i18n.language),
      color: brand.main,
      mid: brand.mid,
      deep: brand.deep,
      leftTitle: t("left"),
      hourUnit: t("hour"),
      minuteUnit: t("minute"),
      nextTitle: t("widget.next"),
      todayTitle: t("widget.today"),
      dhikrTitle: t("widget.dhikr"),
      morningDhikrTitle: t("widget.morning"),
      eveningDhikrTitle: t("widget.evening"),
      city: city ?? "",
      prayers,
      dhikr: t("widget.dhikrList", { returnObjects: true }) as string[],
      morningDhikr,
      eveningDhikr,
      morningSelectedText: morningSelected.text,
      eveningSelectedText: eveningSelected.text,
      selectedCategory,
      selectedItemId: selected.itemId,
      selectedItemMax: selected.max,
      morningSelectedCategory: "morning_azkar",
      morningSelectedItemId: morningSelected.itemId,
      morningSelectedItemMax: morningSelected.max,
      eveningSelectedCategory: "evening_azkar",
      eveningSelectedItemId: eveningSelected.itemId,
      eveningSelectedItemMax: eveningSelected.max,
      morningProgress: t("widget.progress", {
        done: morningCategory
          ? categoryDone(morningCategory, azkarProgress)
          : 0,
        total: morningCategory ? categoryTotal(morningCategory) : 0,
      }),
      eveningProgress: t("widget.progress", {
        done: eveningCategory
          ? categoryDone(eveningCategory, azkarProgress)
          : 0,
        total: eveningCategory ? categoryTotal(eveningCategory) : 0,
      }),
      dates,
      lockScreen,
      lockChannel: t("widget.lockChannel"),
      mosques: mosquePayload,
    });
  }, [
    config,
    day,
    palette,
    city,
    lockScreen,
    i18n.language,
    hijriLabel,
    azkarProgress,
    mosques,
  ]);
}

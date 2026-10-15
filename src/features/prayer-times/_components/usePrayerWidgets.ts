import { brandFor } from "@/constants/palettes";
import { Locale } from "@/i18n/config";
import { isRTLLocale } from "@/i18n/direction";
import { useAppSelector } from "@/store/Store";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { updatePrayerWidgets } from "../../../../modules/prayer-widgets";
import {
  addDays,
  PrayerConfig,
  prayerClock,
  prayerDates,
} from "../_data/calculate";
import { toHijri } from "../_data/hijri";
import { shortTime } from "../_data/time";
import { PrayerDay } from "../_data/schedule";
import { PRAYER_ICONS, REMINDER_PRAYERS } from "../_data/types";
import useCityName from "./useCityName";
import usePrayerLabels from "./usePrayerLabels";

const WIDGET_DAYS = 7;

export default function usePrayerWidgets(
  config: PrayerConfig | null,
  day: PrayerDay | null,
) {
  const { t, i18n } = useTranslation("prayer");
  const { label } = usePrayerLabels();
  const palette = useAppSelector((s) => s.settings.palette);
  const lockScreen = useAppSelector((s) => s.settings.lockScreenPrayer);
  const city = useCityName(day?.city);

  useEffect(() => {
    if (!config) return;
    const brand = brandFor(palette);
    const start = new Date();
    const locale = i18n.language as Locale;
    const comma = locale === "ar" ? "،" : ",";
    const days = Array.from({ length: WIDGET_DAYS + 1 }, (_, offset) =>
      addDays(start, offset - 1),
    );
    const dates = days.map((date) => {
      const hijri = toHijri(date);
      const midnight = new Date(date);
      midnight.setHours(0, 0, 0, 0);
      return {
        at: midnight.getTime(),
        text: `${hijri.weekday[locale]}${comma} ${hijri.day} ${hijri.monthName[locale]} ${hijri.year}`,
      };
    });
    const prayers = days
      .map((date) => {
        const moments = prayerDates(config, date);
        const clock = prayerClock(config, date);
        return REMINDER_PRAYERS.map((name) => ({
          label: label(name, date.getDay() === 5),
          at: moments[name].getTime(),
          time: shortTime(clock[name]),
          icon: PRAYER_ICONS[name],
        }));
      })
      .flat();
    updatePrayerWidgets({
      rtl: isRTLLocale(locale),
      color: brand.main,
      mid: brand.mid,
      deep: brand.deep,
      leftTitle: t("left"),
      hourUnit: t("hour"),
      minuteUnit: t("minute"),
      nextTitle: t("widget.next"),
      todayTitle: t("widget.today"),
      dhikrTitle: t("widget.dhikr"),
      city: city ?? "",
      prayers,
      dhikr: t("widget.dhikrList", { returnObjects: true }) as string[],
      dates,
      lockScreen,
      lockChannel: t("widget.lockChannel"),
    });
  }, [config, day, palette, city, lockScreen, i18n.language]);
}

import { Locale } from "@/i18n/config";
import { useAppSelector } from "@/store/Store";
import { shallowEqual } from "react-redux";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  dhikrContents,
  quranContents,
  reminderSlots,
} from "../_data/reminders";
import {
  ReminderPlan,
  syncReminderNotifications,
} from "./reminderNotifications";

export default function useReminderSync() {
  const { t, i18n } = useTranslation(["settings", "prayer"]);
  const { dhikr, quran } = useAppSelector(
    (s) => ({
      dhikr: s.settings.reminders.dhikr,
      quran: s.settings.reminders.quran,
    }),
    shallowEqual,
  );
  const locale = i18n.language as Locale;

  useEffect(() => {
    const task = requestIdleCallback(() => {
      const plans: ReminderPlan[] = [];
      if (dhikr.enabled) {
        const slots = reminderSlots("dhikr", dhikr.every);
        const phrases = t("prayer:widget.dhikrList", {
          returnObjects: true,
        }) as string[];
        plans.push({
          kind: "dhikr",
          slots,
          contents: dhikrContents(
            slots.length,
            locale,
            t("reminders.dhikrTitle"),
            phrases,
          ),
        });
      }
      if (quran.enabled) {
        const slots = reminderSlots("quran", quran.every);
        plans.push({
          kind: "quran",
          slots,
          contents: quranContents(slots.length, locale, (surah, ayah) =>
            t("reminders.quranTitle", { surah, ayah }),
          ),
        });
      }
      syncReminderNotifications(plans, t("reminders.channel")).catch(() => {});
    });
    return () => cancelIdleCallback(task);
  }, [dhikr, quran, locale]);
}

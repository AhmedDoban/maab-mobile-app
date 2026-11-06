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
  const { dhikr, quran, morning, evening } = useAppSelector(
    (s) => ({
      dhikr: s.settings.reminders.dhikr,
      quran: s.settings.reminders.quran,
      morning: s.settings.reminders.morning,
      evening: s.settings.reminders.evening,
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
      for (const [kind, setting, titleKey] of [
        ["morning", morning, "morningTitle"],
        ["evening", evening, "eveningTitle"],
      ] as const) {
        if (!setting.enabled) continue;
        const [hour, minute] = setting.time.split(":").map(Number);
        const slots = [{ hour, minute }];
        plans.push({
          kind,
          slots,
          contents: dhikrContents(1, locale, t(`reminders.${titleKey}`), []),
        });
      }
      syncReminderNotifications(plans, t("reminders.channel")).catch(() => {});
    });
    return () => cancelIdleCallback(task);
  }, [dhikr, quran, morning, evening, locale]);
}

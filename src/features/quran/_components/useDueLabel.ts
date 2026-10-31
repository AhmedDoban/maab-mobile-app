import type { KhatmaPlan } from "@/store/Slices/SettingsSlice";
import { useTranslation } from "react-i18next";
import { scheduledDay, wirdDate } from "../_data/khatma";
import { localDigits } from "../_data/localDigits";

export default function useDueLabel(plan: KhatmaPlan) {
  const { t, i18n } = useTranslation("azkar");
  const ar = i18n.language === "ar";
  const expected = scheduledDay(plan);
  return (index: number) => {
    const offset = index + 1 - expected;
    const days = Math.abs(offset);
    const title =
      offset === 0
        ? t("wirdToday")
        : offset === 1
          ? t("wirdTomorrow")
          : offset === 2
            ? t("wirdAfterTomorrow")
            : offset === -1
              ? t("wirdYesterday")
              : offset === -2
                ? t("wirdBeforeYesterday")
                : t(offset > 0 ? "wirdIn" : "wirdAgo", {
                    count: days,
                    days: localDigits(days, ar),
                  });
    const date = wirdDate(plan, index).toLocaleDateString(
      ar ? "ar-EG" : i18n.language === "en" ? "en-US" : i18n.language,
      { weekday: "long", day: "numeric", month: "long" },
    );
    return { title, date };
  };
}

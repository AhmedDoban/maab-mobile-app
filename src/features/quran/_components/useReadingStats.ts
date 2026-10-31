import { useClock } from "@/features/prayer-times/_components/usePrayerSchedule";
import { contentLocale } from "@/i18n/config";
import { useAppSelector } from "@/store/Store";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function useReadingStats() {
  const { t, i18n } = useTranslation("azkar");
  const today = useClock((now) => now.toDateString());
  const day = useAppSelector((s) => s.settings.quranToday);
  const lastReadAt = useAppSelector((s) => s.settings.quranLastReadAt);
  const current = day?.day === today ? day : null;

  const lastRead = useMemo(() => {
    if (lastReadAt === null) return "—";
    const date = new Date(lastReadAt);
    if (date.toDateString() === today) return t("readingToday");
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return t("readingYesterday");
    }
    const ar = contentLocale(i18n.language) === "ar";
    return date.toLocaleDateString(ar ? "ar-EG" : i18n.language, {
      day: "numeric",
      month: "short",
    });
  }, [lastReadAt, today, t, i18n.language]);

  return {
    pages: current?.pages.length ?? 0,
    minutes: Math.round((current?.seconds ?? 0) / 60),
    lastRead,
  };
}

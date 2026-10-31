import { getSurah, toArabicDigits } from "@/features/azkar/_data/quran";
import { useAppSelector } from "@/store/Store";
import { useTranslation } from "react-i18next";
import ReadingShortcutCard from "./ReadingShortcutCard";
import { contentLocale } from "@/i18n/config";

export default function BookmarkCard({ title }: { title?: string }) {
  const { t, i18n } = useTranslation("azkar");
  const bookmark = useAppSelector((s) => s.settings.quranBookmark);
  if (!bookmark) return null;

  const ar = contentLocale(i18n.language) === "ar";
  const surah = getSurah(bookmark.surah);
  if (!surah) return null;

  return (
    <ReadingShortcutCard
      icon="bookmarkFill"
      title={title ?? t("continueFromBookmark")}
      subtitle={t("verseRef", {
        surah: ar ? surah.name : surah.transliteration,
        ayah: ar ? toArabicDigits(bookmark.ayah) : bookmark.ayah,
      })}
      surah={surah.id}
      ayah={bookmark.ayah}
    />
  );
}

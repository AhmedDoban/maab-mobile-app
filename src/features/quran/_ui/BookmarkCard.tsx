import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import { getSurah, toArabicDigits } from "@/features/azkar/_data/quran";
import { useAppSelector } from "@/store/Store";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function ContinueReadingCard() {
  const { t, i18n } = useTranslation("azkar");
  const bookmark = useAppSelector((s) => s.settings.quranBookmark);
  if (!bookmark) return null;

  const ar = i18n.language === "ar";
  const surah = getSurah(bookmark.surah);
  if (!surah) return null;

  return (
    <Link
      href={{
        pathname: "/mushaf/[id]",
        params: { id: surah.id, ayah: bookmark.ayah },
      }}
      asChild
    >
      <PressableScale
        scaleTo={0.98}
        className="flex-row items-center gap-3 rounded-2xl bg-main-fill px-5 py-4"
      >
        <Icon name="bookmarkFill" size={24} tintColor="#ffffff" />
        <View className="flex-1">
          <AppText weight="bold" className="text-on-fill">
            {t("continueReading")}
          </AppText>
          <AppText className="text-sm text-on-fill">
            {t("verseRef", {
              surah: ar ? surah.name : surah.transliteration,
              ayah: ar ? toArabicDigits(bookmark.ayah) : bookmark.ayah,
            })}
          </AppText>
        </View>
        <Icon
          name={ar ? "chevronLeft" : "chevronRight"}
          size={20}
          tintColor="#ffffff"
        />
      </PressableScale>
    </Link>
  );
}

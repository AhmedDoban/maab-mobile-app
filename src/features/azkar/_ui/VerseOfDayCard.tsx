import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import useThemeColors from "@/hooks/useThemeColors";
import { contentLocale } from "@/i18n/config";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useSavedAyah from "../_components/useSavedAyah";
import { getRandomVerse, toArabicDigits } from "../_data/quran";

export default memo(function VerseOfDayCard() {
  const { t, i18n } = useTranslation("azkar");
  const verse = getRandomVerse();
  const colors = useThemeColors();
  const english = contentLocale(i18n.language) === "en";
  const { saved, toggle } = useSavedAyah(verse.surahId, verse.ayah);
  const reference = t("verseRef", {
    surah: english ? verse.surahEn : verse.surah,
    ayah: english ? verse.ayah : toArabicDigits(verse.ayah),
  });
  const saveButton = (
    <PressableScale
      hitSlop={10}
      onPress={toggle}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      accessibilityLabel={t(saved ? "unsaveAyah" : "saveAyah")}
    >
      <Icon
        name={saved ? "bookmarkFill" : "bookmark"}
        size={20}
        tintColor={colors.main}
      />
    </PressableScale>
  );

  return (
    <View className="gap-2 rounded-3xl border border-line bg-surface px-4 py-3.5">
      <View className="flex-row items-center gap-2">
        <Icon name="quote" size={16} tintColor={colors.main} />
        <AppText weight="bold" className="flex-1 text-sm text-main">
          {t("verseOfDay")}
        </AppText>
        {saveButton}
      </View>
      {english ? (
        <AppText className="text-base leading-7 text-ink">
          {`“${verse.translation}”`}
        </AppText>
      ) : (
        <AppText
          variant="quran"
          style={{ fontSize: 23, lineHeight: 42, color: colors.ink }}
        >
          {`﴿ ${verse.text} ﴾`}
        </AppText>
      )}
      <AppText className="text-xs text-main-gray">{reference}</AppText>
    </View>
  );
});

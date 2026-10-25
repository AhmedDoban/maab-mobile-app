import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import IconCircle from "@/components/ui/IconCircle";
import PressableScale from "@/components/ui/PressableScale";
import useThemeColors from "@/hooks/useThemeColors";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useSavedAyah from "../_components/useSavedAyah";
import { getRandomVerse, toArabicDigits } from "../_data/quran";
import PaperBackground from "./PaperBackground";

export default memo(function VerseOfDayCard() {
  const { t, i18n } = useTranslation("azkar");
  const verse = getRandomVerse();
  const colors = useThemeColors();
  const english = i18n.language === "en";
  const { saved, toggle } = useSavedAyah(verse.surahId, verse.ayah);

  return (
    <PaperBackground
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.line,
      }}
      baseColor={colors.surface}
      ornamentColor={colors.main}
      spread={0.7}
      tileSize={30}
      intensity={0.5}
      patternTile={40}
      patternOpacity={0.06}
      pattern="girih"
    >
      <View className="gap-3 p-5">
        <View className="flex-row items-center gap-2.5">
          <IconCircle
            icon="bookOpen"
            tintColor={colors.main}
            backgroundColor={colors.mainSoft}
          />
          <AppText weight="bold" className="text-lg text-main">
            {t("verseOfDay")}
          </AppText>
        </View>

        {english ? (
          <AppText
            weight="bold"
            className="text-center text-base leading-7 text-main"
          >
            {`“${verse.translation}”`}
          </AppText>
        ) : (
          <AppText
            variant="quran"
            className="text-center"
            style={{ fontSize: 22, lineHeight: 40, color: colors.main }}
          >
            {`﴿ ${verse.text} ﴾`}
          </AppText>
        )}

        <View className="flex-row items-center justify-between gap-3">
          <AppText className="shrink text-sm text-main-gray">
            {t("verseRef", {
              surah: english ? verse.surahEn : verse.surah,
              ayah: english ? verse.ayah : toArabicDigits(verse.ayah),
            })}
          </AppText>
          <PressableScale
            hitSlop={10}
            onPress={toggle}
            accessibilityRole="button"
            accessibilityState={{ selected: saved }}
            accessibilityLabel={t(saved ? "unsaveAyah" : "saveAyah")}
          >
            <Icon
              name={saved ? "bookmarkFill" : "bookmark"}
              size={22}
              tintColor={colors.main}
            />
          </PressableScale>
        </View>
      </View>
    </PaperBackground>
  );
});

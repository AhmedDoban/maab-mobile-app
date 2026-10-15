import AppText from "@/components/ui/AppText";
import PressableScale from "@/components/ui/PressableScale";
import { SurahSummary } from "@/features/azkar/_data/quran";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { memo } from "react";
import useLocalDigits from "../_components/useLocalDigits";

export default memo(function SurahRow({ surah }: { surah: SurahSummary }) {
  const { t, i18n } = useTranslation("azkar");
  const ar = i18n.language === "ar";
  const num = useLocalDigits();

  return (
    <PressableScale
      scaleTo={0.98}
      accessibilityRole="link"
      onPress={() => {
        router.push(`/mushaf/${surah.id}`);
      }}
      className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-3"
    >
      <View className="items-center justify-center">
        <AppText
          variant={ar ? "quran" : "ui"}
          weight="bold"
          className={ar ? "text-[32px] text-main" : "text-xl text-main"}
        >
          {num(surah.id)}
        </AppText>
      </View>

      <View className="flex-1 gap-0">
        {ar ? (
          <AppText variant="quran" className="text-2xl">
            {t("surahTitle", { name: surah.name })}
          </AppText>
        ) : (
          <>
            <AppText weight="bold" className="text-base" numberOfLines={1}>
              {t("surahTitle", { name: surah.transliteration })}
            </AppText>
            <AppText className="text-sm text-main-gray" numberOfLines={1}>
              {surah.translation}
            </AppText>
          </>
        )}
      </View>

      <View className="items-end gap-0.5">
        <AppText className="text-xs text-main">{t(surah.type)}</AppText>
        <AppText className="text-[11px] text-main-gray">
          {t("versesCount", { count: surah.verses })}
        </AppText>
      </View>
    </PressableScale>
  );
});

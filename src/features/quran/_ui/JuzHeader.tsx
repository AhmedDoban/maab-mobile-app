import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import { getSurah } from "@/features/azkar/_data/quran";
import useThemeColors from "@/hooks/useThemeColors";
import { router } from "expo-router";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useLocalDigits from "../_components/useLocalDigits";
import type { JuzGroupData } from "../_data/juzGroups";

export default memo(function JuzHeader({ group }: { group: JuzGroupData }) {
  const { t, i18n } = useTranslation("azkar");
  const colors = useThemeColors();
  const ar = i18n.language === "ar";
  const num = useLocalDigits();
  const { juz, start, page } = group;
  const first = getSurah(start.surah);

  return (
    <PressableScale
      scaleTo={0.98}
      accessibilityRole="link"
      onPress={() => {
        router.push({
          pathname: "/mushaf/[id]",
          params: { id: start.surah, page },
        });
      }}
      className="flex-row items-center gap-3 rounded-2xl bg-main-soft px-5 py-3"
    >
      <View className="flex-1">
        <AppText weight="bold" className="text-main">
          {t("juzNumber", { juz: num(juz) })}
        </AppText>
        <AppText className="text-xs text-main-gray">
          {`${t("verseRef", {
            surah: ar ? first?.name : first?.transliteration,
            ayah: num(start.ayah),
          })} · ${t("pageNumber", { page: num(page) })}`}
        </AppText>
      </View>
      <Icon
        name={ar ? "chevronLeft" : "chevronRight"}
        size={18}
        tintColor={colors.main}
      />
    </PressableScale>
  );
});

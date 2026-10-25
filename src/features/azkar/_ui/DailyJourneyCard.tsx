import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import useThemeColors from "@/hooks/useThemeColors";
import { Image } from "expo-image";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useDailyJourney from "../_components/useDailyJourney";
import { dailyCategories } from "../_data";
import { JOURNEY_SPRIG } from "../_data/homeArt";
import ProgressBar from "./ProgressBar";

const SPRIG = {
  position: "absolute",
  end: -20,
  top: 0,
  bottom: 0,
  width: 64,
  opacity: 0.5,
} as const;

export default memo(function DailyJourneyCard({ friday }: { friday: boolean }) {
  const { t } = useTranslation("azkar");
  const colors = useThemeColors();
  const daily = useMemo(() => dailyCategories(), [friday]);
  const { done, total } = useDailyJourney(daily);

  return (
    <View className="flex-row items-center gap-3 overflow-hidden rounded-2xl border border-line bg-surface p-4">
      <View className="flex-1 gap-2.5">
        <View className="flex-row items-center gap-2.5">
          <Icon name="chart" size={22} tintColor={colors.main} />
          <View className="flex-1">
            <AppText weight="bold" className="text-[15px] text-ink">
              {t("journeyTitle")}
            </AppText>
            <AppText className="text-xs text-main-gray">
              {t("journeyProgress", { done, count: total })}
            </AppText>
          </View>
        </View>
        <ProgressBar
          progress={total ? done / total : 0}
          color={colors.main}
          track={colors.line}
        />
      </View>

      <View className="flex-1 flex-row items-center justify-center gap-1.5 self-stretch">
        <Image source={JOURNEY_SPRIG} style={SPRIG} contentFit="contain" />
        <Icon name="leaf" size={14} tintColor={colors.main} />
        <AppText className="shrink text-xs text-main-gray" numberOfLines={2}>
          {t("journeyHint")}
        </AppText>
      </View>
    </View>
  );
});

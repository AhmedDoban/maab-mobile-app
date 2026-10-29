import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import useThemeColors from "@/hooks/useThemeColors";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useSecondsUntil from "../_components/useSecondsUntil";

const pad = (n: number) => String(n).padStart(2, "0");

export default memo(function PrayerCountdownText({
  targetMs,
}: {
  targetMs: number;
}) {
  const { t } = useTranslation("prayer");
  const colors = useThemeColors();
  const seconds = useSecondsUntil(targetMs);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <View className="shrink-0 items-center gap-1.5">
      <AppText className="text-xs text-main-gray" numberOfLines={1}>
        {t("untilPrayer")}
      </AppText>
      <View className="flex-row items-center gap-1.5">
        <Icon name="clock" size={18} tintColor={colors.main} />
        <AppText
          weight="bold"
          className="text-lg text-ink"
          style={{ writingDirection: "ltr", fontVariant: ["tabular-nums"] }}
        >
          {`${h}:${pad(m)}:${pad(s)}`}
        </AppText>
      </View>
    </View>
  );
});

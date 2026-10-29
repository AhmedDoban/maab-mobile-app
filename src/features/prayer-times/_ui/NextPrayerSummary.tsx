import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import useThemeColors from "@/hooks/useThemeColors";
import { View } from "react-native";

export default function NextPrayerSummary({
  label,
  time,
}: {
  label: string;
  time: string;
}) {
  const colors = useThemeColors();

  return (
    <View className="shrink flex-row items-center gap-3">
      <View
        className="size-12 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.mainFill }}
      >
        <Icon name="mosque" size={24} tintColor={colors.onFill} />
      </View>
      <View className="shrink">
        <AppText weight="bold" className="text-base text-ink" numberOfLines={1}>
          {label}
        </AppText>
        <AppText
          weight="bold"
          className="text-[32px] leading-[40px] text-main"
          style={{ writingDirection: "ltr" }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {time}
        </AppText>
      </View>
    </View>
  );
}

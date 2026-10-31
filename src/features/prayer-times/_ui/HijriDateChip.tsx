import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import useThemeColors from "@/hooks/useThemeColors";
import { memo, useMemo } from "react";
import { View } from "react-native";
import useHijriLabel from "../_components/useHijriLabel";
import { useClock } from "../_components/usePrayerSchedule";
import { toHijri } from "../_data/hijri";

export default memo(function HijriDateChip() {
  const hijriLabel = useHijriLabel();
  const colors = useThemeColors();
  const day = useClock((now) => now.toDateString());
  const hijri = useMemo(() => toHijri(new Date(day)), [day]);

  return (
    <View className="max-w-full flex-row items-center gap-1.5 self-start rounded-full border border-line bg-surface px-3 py-2">
      <Icon name="calendar" size={15} tintColor={colors.main} />
      <AppText className="shrink text-xs text-ink" numberOfLines={1}>
        {hijriLabel.full(hijri)}
      </AppText>
    </View>
  );
});

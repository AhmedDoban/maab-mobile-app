import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import { PRAYER_ICONS, PrayerName } from "@/features/prayer-times/_data/types";
import useThemeColors from "@/hooks/useThemeColors";
import { memo } from "react";
import useSettingsColors from "../_components/useSettingsColors";

export default memo(function PrayerAdhanRow({
  prayer,
  label,
  sound,
  onPress,
}: {
  prayer: PrayerName;
  label: string;
  sound: string;
  onPress: (prayer: PrayerName) => void;
}) {
  const colors = useThemeColors();
  const palette = useSettingsColors();

  return (
    <PressableScale
      scaleTo={0.98}
      onPress={() => onPress(prayer)}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${sound}`}
      className="flex-row items-center gap-3 py-3"
    >
      <Icon name={PRAYER_ICONS[prayer]} size={22} tintColor={colors.accent} />
      <AppText weight="bold" className="flex-1 text-base">
        {label}
      </AppText>
      <AppText
        className="max-w-[50%] text-sm"
        style={{ color: palette.subtitle }}
        numberOfLines={1}
      >
        {sound}
      </AppText>
      <Icon name="chevronDown" size={16} tintColor={palette.subtitle} />
    </PressableScale>
  );
});

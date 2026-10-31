import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import useThemeColors from "@/hooks/useThemeColors";
import { View } from "react-native";
import useHijriLabel from "../_components/useHijriLabel";
import { HijriDate } from "../_data/hijri";

export default function PrayerDateRow({
  hijri,
  city,
  inline = false,
}: {
  hijri: HijriDate;
  city: string | null;
  inline?: boolean;
}) {
  const hijriLabel = useHijriLabel();
  const colors = useThemeColors();

  return (
    <View
      className={
        inline
          ? "flex-row flex-wrap items-center gap-x-4 gap-y-1"
          : "shrink gap-2"
      }
    >
      {city ? (
        <View className="shrink flex-row items-center gap-1.5">
          <Icon name="location" size={14} tintColor={colors.main} />
          <AppText className="shrink text-xs text-main-gray" numberOfLines={1}>
            {city}
          </AppText>
        </View>
      ) : null}
      <View className="shrink flex-row items-center gap-1.5">
        <Icon name="calendar" size={14} tintColor={colors.main} />
        <AppText
          className="shrink text-xs text-main-gray"
          numberOfLines={inline ? 1 : 2}
        >
          {hijriLabel.full(hijri)}
        </AppText>
      </View>
    </View>
  );
}

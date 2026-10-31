import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import { View } from "react-native";
import useHijriLabel from "../_components/useHijriLabel";
import { HijriDate } from "../_data/hijri";

export default function ClassicPrayerDateRow({
  hijri,
  city,
}: {
  hijri: HijriDate;
  city: string | null;
}) {
  const hijriLabel = useHijriLabel();

  return (
    <View className="flex-row flex-wrap items-center gap-x-1.5 gap-y-1">
      <View className="shrink flex-row items-center gap-1.5">
        <Icon name="calendar" size={13} tintColor="#ffffff" />
        <AppText
          className="shrink text-xs text-white"
          style={{ opacity: 0.85 }}
          numberOfLines={1}
        >
          {hijriLabel.short(hijri)}
        </AppText>
      </View>
      {city ? (
        <View className="shrink flex-row items-center gap-1.5">
          <Icon name="location" size={12} tintColor="#ffffff" />
          <AppText
            className="shrink text-xs text-white"
            style={{ opacity: 0.85 }}
            numberOfLines={1}
          >
            {city}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

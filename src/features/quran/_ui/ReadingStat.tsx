import AppText from "@/components/ui/AppText";
import Icon, { IconKey } from "@/components/ui/Icon";
import useThemeColors from "@/hooks/useThemeColors";
import { View } from "react-native";

export default function ReadingStat({
  icon,
  label,
  value,
}: {
  icon: IconKey;
  label: string;
  value: string;
}) {
  const colors = useThemeColors();

  return (
    <View className="flex-1 flex-row items-center justify-center gap-2 px-1">
      <Icon name={icon} size={20} tintColor={colors.main} />
      <View className="shrink">
        <AppText className="text-[11px] text-main-gray" numberOfLines={1}>
          {label}
        </AppText>
        <AppText weight="bold" className="text-sm text-ink" numberOfLines={1}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

import AppText from "@/components/ui/AppText";
import { IconKey } from "@/components/ui/Icon";
import { View } from "react-native";
import useSettingsColors from "../_components/useSettingsColors";
import SelectableCard from "./SelectableCard";
import SelectionCheck from "./SelectionCheck";
import SettingsIconBadge from "./SettingsIconBadge";

export default function PrayerCardStyleOption({
  icon,
  label,
  hint,
  selected,
  onPress,
}: {
  icon: IconKey;
  label: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
}) {
  const palette = useSettingsColors();

  return (
    <SelectableCard label={label} selected={selected} onPress={onPress}>
      <SettingsIconBadge icon={icon} size={18} />
      <View className="flex-1">
        <AppText weight="bold" className="text-base">
          {label}
        </AppText>
        <AppText className="text-xs" style={{ color: palette.subtitle }}>
          {hint}
        </AppText>
      </View>
      <SelectionCheck selected={selected} idleColor={palette.subtitle} />
    </SelectableCard>
  );
}

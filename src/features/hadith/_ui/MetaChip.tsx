import AppText from "@/components/ui/AppText";
import { View } from "react-native";
import useHadithColors from "../_components/useHadithColors";

export default function MetaChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const p = useHadithColors();

  return (
    <View
      className="max-w-full flex-row gap-1 rounded-full px-3 py-1.5"
      style={{ backgroundColor: p.chip }}
    >
      <AppText className="text-xs" style={{ color: p.muted }}>
        {label}:
      </AppText>
      <AppText
        weight="bold"
        className="shrink text-xs"
        style={{ color: p.ink }}
      >
        {value}
      </AppText>
    </View>
  );
}

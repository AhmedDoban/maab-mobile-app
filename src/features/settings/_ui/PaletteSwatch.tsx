import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import { brandFor, PaletteId } from "@/constants/palettes";
import useThemeColors from "@/hooks/useThemeColors";
import { View } from "react-native";
import useSettingsColors from "../_components/useSettingsColors";

const SIZE = 46;

export default function PaletteSwatch({
  id,
  label,
  selected,
  onPress,
}: {
  id: PaletteId;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { isDark } = useThemeColors();
  const palette = useSettingsColors();
  const brand = brandFor(id);
  const color = isDark ? brand.bright : brand.main;

  return (
    <PressableScale
      scaleTo={0.9}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      className="items-center gap-1.5"
      style={{ width: "20%" }}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: SIZE + 8,
          maxWidth: "100%",
          aspectRatio: 1,
          borderWidth: 2,
          borderColor: selected ? color : "transparent",
        }}
      >
        <View
          className="items-center justify-center overflow-hidden rounded-full"
          style={{ width: SIZE, height: SIZE, backgroundColor: color }}
        >
          <View
            className="absolute bottom-0 end-0 start-0"
            style={{
              height: SIZE / 2,
              backgroundColor: isDark ? brand.deep : brand.mid,
            }}
          />
          {selected ? (
            <Icon
              name="check"
              size={20}
              strokeWidth={2.6}
              tintColor={isDark ? "#0a0a0a" : "#ffffff"}
            />
          ) : null}
        </View>
      </View>
      <AppText
        className="text-[11px]"
        style={{ color: selected ? color : palette.subtitle }}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </PressableScale>
  );
}

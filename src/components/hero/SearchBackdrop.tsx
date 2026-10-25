import useThemeColors from "@/hooks/useThemeColors";
import { useMemo } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";

const FILL = {
  backgroundColor: "rgba(255, 255, 255, 0.18)",
  borderColor: "rgba(255, 255, 255, 0.3)",
  borderWidth: 1,
};

export default function SearchBackdrop({
  size,
  plain = false,
  style,
}: {
  size: number;
  plain?: boolean;
  style: StyleProp<AnimatedStyle<ViewStyle>>;
}) {
  const colors = useThemeColors();
  const fill = useMemo(
    () =>
      plain
        ? {
            backgroundColor: colors.surface,
            borderColor: colors.line,
            borderWidth: 1,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
          }
        : FILL,
    [plain, colors.surface, colors.line],
  );
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          end: 0,
          height: size,
          borderRadius: size / 2,
          pointerEvents: "none",
        },
        fill,
        style,
      ]}
    />
  );
}

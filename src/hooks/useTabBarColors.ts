import useDirection from "./useDirection";
import useThemeColors from "./useThemeColors";

export default function useTabBarColors() {
  const colors = useThemeColors();
  const { isRTL } = useDirection();

  return {
    font: isRTL ? "LamaSans" : "SpaceGrotesk",
    active: colors.isDark ? "#ffffff" : colors.main,
    inactive: colors.gray,
    pill: colors.isDark ? colors.brand.deep : colors.brand.main,
  };
}

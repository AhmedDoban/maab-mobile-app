import { Colors, ThemeColors } from "@/constants/Colors";
import { Brand, brandFor } from "@/constants/palettes";
import { createContext, useContext } from "react";

type Theme = ThemeColors & { isDark: boolean; brand: Brand };

export const ThemeContext = createContext<Theme>({
  ...Colors.light,
  isDark: false,
  brand: brandFor("emerald"),
});

export const useTheme = () => useContext(ThemeContext);

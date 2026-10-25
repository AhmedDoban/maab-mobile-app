import useThemeColors from "@/hooks/useThemeColors";
import { useMemo } from "react";

const LIGHT = {
  frame: "#f3eee2",
  frameEdge: "#e2d8c3",
  gold: "#b8924f",
  goldDeep: "#8a6a35",
  glow: "#ffe7b0",
  leaf: "#4f7a5c",
  leafDeep: "#2f5a43",
};

const DARK = {
  frame: "#1c1b18",
  frameEdge: "#34302a",
  gold: "#c9a96e",
  goldDeep: "#9c7d48",
  glow: "#ffd98a",
  leaf: "#5f8f6c",
  leafDeep: "#3f6b50",
};

export default function useArtColors() {
  const { isDark, brand, main } = useThemeColors();
  return useMemo(
    () => ({
      ...(isDark ? DARK : LIGHT),
      tint: isDark ? brand.bright : main,
      isDark,
    }),
    [isDark, brand.bright, main],
  );
}

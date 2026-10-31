import useImmersiveMode from "@/hooks/useImmersiveMode";
import useThemeColors from "@/hooks/useThemeColors";
import { useAppSelector } from "@/store/Store";
import { NavigationBar } from "expo-navigation-bar";
import { StatusBar, StatusBarStyle } from "expo-status-bar";
import { PropsWithChildren, useState } from "react";
import { StatusBarOverride } from "./StatusBarContext";

export function StatusBarProvider({ children }: PropsWithChildren) {
  const colors = useThemeColors();
  const [override, setOverride] = useState<StatusBarStyle | null>(null);
  const fullScreen = useAppSelector((s) => s.settings.fullScreen);
  useImmersiveMode(fullScreen);

  return (
    <StatusBarOverride.Provider value={setOverride}>
      <StatusBar
        style={override ?? (colors.isDark ? "light" : "dark")}
        hidden={fullScreen}
      />
      <NavigationBar hidden={fullScreen} />
      {children}
    </StatusBarOverride.Provider>
  );
}

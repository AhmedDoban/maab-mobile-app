import { setVisibilityAsync } from "expo-navigation-bar";
import { setStatusBarHidden } from "expo-status-bar";
import { useEffect } from "react";
import { AppState, Platform } from "react-native";

export default function useImmersiveMode(enabled: boolean) {
  useEffect(() => {
    if (Platform.OS !== "android" || !enabled) return;

    const hide = () => {
      setStatusBarHidden(true, "none");
      setVisibilityAsync("hidden").catch(() => {});
    };

    hide();
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") hide();
    });
    return () => appState.remove();
  }, [enabled]);
}

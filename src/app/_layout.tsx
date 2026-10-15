import AppTabs from "@/components/AppTabs";
import AnimatedSplash from "@/components/splash/AnimatedSplash";
import ThemeProvider from "@/components/theme/ThemeProvider";
import "@/css/global.css";
import useAppFonts from "@/hooks/useAppFonts";
import "@/i18n";
import StoreProvider from "@/store/StoreProvider";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCallback, useState } from "react";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: false, duration: 0 });

export const unstable_settings = { initialRouteName: "(azkar)" };

export default function RootLayout() {
  const fontsReady = useAppFonts();
  const [splashDone, setSplashDone] = useState(false);
  const onStoreReady = useCallback(() => SplashScreen.hideAsync(), []);
  const onSplashDone = useCallback(() => setSplashDone(true), []);

  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider onReady={onStoreReady}>
        <ThemeProvider>
          <AppTabs />
          {splashDone ? null : <AnimatedSplash onDone={onSplashDone} />}
        </ThemeProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}

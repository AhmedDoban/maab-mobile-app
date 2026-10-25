import { loadAsync } from "expo-font";
import { useEffect, useState } from "react";

const FONTS = {
  SpaceGrotesk: require("@/assets/fonts/SpaceGrotesk-Regular.ttf"),
  "SpaceGrotesk-Bold": require("@/assets/fonts/SpaceGrotesk-Bold.ttf"),
  LamaSans: require("@/assets/fonts/LamaSans-Regular.ttf"),
  "LamaSans-ExtraBold": require("@/assets/fonts/LamaSans-ExtraBold.ttf"),
  Hafs: require("@/assets/fonts/Hafs.ttf"),
};

export default function useAppFonts() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all(
      Object.entries(FONTS).map(([name, source]) =>
        loadAsync(name, source).catch((error: unknown) => {
          if (__DEV__) console.warn(`Font ${name} failed to load`, error);
        }),
      ),
    ).then(() => setReady(true));
  }, []);

  return ready;
}

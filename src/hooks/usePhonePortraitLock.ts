import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";
import { Dimensions, ScaledSize } from "react-native";

const LARGE_SCREEN_DP = 600;

function applyLock(screen: ScaledSize) {
  const large = Math.min(screen.width, screen.height) >= LARGE_SCREEN_DP;
  const action = large
    ? ScreenOrientation.unlockAsync()
    : ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
  action.catch(() => {});
}

export default function usePhonePortraitLock() {
  useEffect(() => {
    applyLock(Dimensions.get("screen"));
    const subscription = Dimensions.addEventListener("change", ({ screen }) =>
      applyLock(screen),
    );
    return () => subscription.remove();
  }, []);
}

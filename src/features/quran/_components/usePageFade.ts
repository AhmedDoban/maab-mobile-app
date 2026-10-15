import { useCallback } from "react";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const FADE = { duration: 260, easing: Easing.out(Easing.quad) };

export default function usePageFade() {
  const opacity = useSharedValue(1);

  const fadeIn = useCallback(() => {
    opacity.set(0);
    opacity.set(withTiming(1, FADE));
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return { style, fadeIn };
}

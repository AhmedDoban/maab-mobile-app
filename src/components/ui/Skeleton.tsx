import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";

export default function Skeleton({ className }: { className?: string }) {
  const pulse = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      pulse.set(
        withRepeat(
          withTiming(1, { duration: 850, easing: Easing.inOut(Easing.quad) }),
          -1,
          true,
        ),
      );
      return () => {
        cancelAnimation(pulse);
        pulse.set(0);
      };
    }, [pulse]),
  );

  const style = useAnimatedStyle(() => ({
    opacity: 0.45 + pulse.get() * 0.55,
  }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn("rounded-lg bg-surface-muted", className)}
      style={style}
    />
  );
}

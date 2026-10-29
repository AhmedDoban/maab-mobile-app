import { useCallback } from "react";
import {
  type LayoutAnimationFunction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const NOW = { duration: 0 };
const REVEAL = { duration: 200 };
const FALLBACK_MS = 1500;

export default function useRotationCover() {
  const cover = useSharedValue(0);

  const layout = useCallback<LayoutAnimationFunction>(
    (v) => {
      "worklet";
      if (
        Math.abs(v.targetWidth - v.currentWidth) > 1 ||
        Math.abs(v.targetHeight - v.currentHeight) > 1
      ) {
        cover.set(
          withSequence(
            withTiming(1, NOW),
            withDelay(FALLBACK_MS, withTiming(0, REVEAL)),
          ),
        );
      }
      return {
        initialValues: {
          originX: v.targetOriginX,
          originY: v.targetOriginY,
          width: v.targetWidth,
          height: v.targetHeight,
        },
        animations: {
          originX: withTiming(v.targetOriginX, NOW),
          originY: withTiming(v.targetOriginY, NOW),
          width: withTiming(v.targetWidth, NOW),
          height: withTiming(v.targetHeight, NOW),
        },
      };
    },
    [cover],
  );

  const hide = useCallback(() => {
    cover.set(
      withSequence(
        withTiming(1, NOW),
        withDelay(FALLBACK_MS, withTiming(0, REVEAL)),
      ),
    );
  }, [cover]);

  const reveal = useCallback(() => {
    if (cover.get() > 0) cover.set(withTiming(0, REVEAL));
  }, [cover]);

  const coverStyle = useAnimatedStyle(() => ({ opacity: cover.get() }));

  return { layout, coverStyle, hide, reveal };
}

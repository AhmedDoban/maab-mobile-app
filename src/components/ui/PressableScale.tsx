import { useCallback } from "react";
import {
  GestureResponderEvent,
  Insets,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FADE = Platform.OS === "ios" ? 0.12 : 0;
const MAX_DEPTH = 0.03;
const RETENTION: Insets = { top: 48, bottom: 48, left: 48, right: 48 };
const PRESS_IN = { duration: 80, easing: Easing.out(Easing.quad) };
const PRESS_OUT = { duration: 140, easing: Easing.out(Easing.quad) };

type Props = Omit<PressableProps, "style"> & {
  className?: string;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

export default function PressableScale({
  scaleTo = 0.96,
  onPressIn,
  onPressOut,
  pressRetentionOffset = RETENTION,
  style,
  ...props
}: Props) {
  const pressed = useSharedValue(0);
  const depth = Math.min((1 - scaleTo) / 2, MAX_DEPTH);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressed.get() * FADE,
    transform: [{ scale: 1 - pressed.get() * depth }],
  }));

  const handlePressIn = useCallback(
    (e: GestureResponderEvent) => {
      pressed.set(withTiming(1, PRESS_IN));
      onPressIn?.(e);
    },
    [pressed, onPressIn],
  );
  const handlePressOut = useCallback(
    (e: GestureResponderEvent) => {
      pressed.set(withTiming(0, PRESS_OUT));
      onPressOut?.(e);
    },
    [pressed, onPressOut],
  );

  return (
    <AnimatedPressable
      {...props}
      pressRetentionOffset={pressRetentionOffset}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    />
  );
}

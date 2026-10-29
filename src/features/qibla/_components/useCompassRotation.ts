import {
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const SPRING = { stiffness: 300, damping: 35, mass: 1 };

export default function useCompassRotation(
  heading: SharedValue<number>,
  base: number,
) {
  const rotation = useSharedValue(base);
  const last = useSharedValue(base);
  useAnimatedReaction(
    () => base - heading.get(),
    (target) => {
      const delta = (((target - last.get()) % 360) + 360) % 360;
      const next = last.get() + (delta > 180 ? delta - 360 : delta);
      last.set(next);
      rotation.set(withSpring(next, SPRING));
    },
  );
  return useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.get()}deg` }],
  }));
}

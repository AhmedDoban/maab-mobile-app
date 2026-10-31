import AppText from "@/components/ui/AppText";
import Icon, { IconKey } from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import useTabBarColors from "@/hooks/useTabBarColors";
import { memo, useCallback, useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const TIMING = { duration: 220, easing: Easing.out(Easing.cubic) };

export default memo(function AndroidTabItem({
  routeKey,
  icon,
  label,
  focused,
  onPress,
}: {
  routeKey: string;
  icon: IconKey;
  label: string;
  focused: boolean;
  onPress: (routeKey: string, focused: boolean) => void;
}) {
  const tab = useTabBarColors();
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(focused ? 1 : 0, TIMING));
  }, [focused, progress]);

  const slotStyle = useAnimatedStyle(() => ({
    flexGrow: 1 + progress.get() * 1.5,
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ scale: 0.85 + progress.get() * 0.15 }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, progress.get() * 2 - 1),
  }));

  const press = useCallback(
    () => onPress(routeKey, focused),
    [onPress, routeKey, focused],
  );

  return (
    <Animated.View className="basis-0" style={slotStyle}>
      <PressableScale
        scaleTo={0.96}
        onPress={press}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={label}
        className="h-full flex-row items-center justify-center gap-1.5 px-1.5"
      >
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 rounded-full"
          style={[
            {
              backgroundColor: tab.pill,
              boxShadow: "0 4px 12px rgba(9, 43, 56, 0.18)",
            },
            pillStyle,
          ]}
        />
        <Icon
          name={icon}
          size={22}
          strokeWidth={focused ? 2.2 : 1.7}
          tintColor={focused ? "#ffffff" : tab.inactive}
        />
        {focused ? (
          <Animated.View className="shrink" style={labelStyle}>
            <AppText
              weight="bold"
              className="text-[13px] text-white"
              numberOfLines={1}
            >
              {label}
            </AppText>
          </Animated.View>
        ) : null}
      </PressableScale>
    </Animated.View>
  );
});

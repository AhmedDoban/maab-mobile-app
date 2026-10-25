import StatusBarBackdrop from "@/components/StatusBarBackdrop";
import useStatusBarStyle from "@/hooks/useStatusBarStyle";
import AppText from "@/components/ui/AppText";
import useThemeColors from "@/hooks/useThemeColors";
import { memo, useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeroSearchField from "./HeroSearchField";
import type { HeroBar } from "./heroTypes";

const BUTTON = 42;
const BAR = 64;

export default memo(function CompactHeroBar({
  hero,
  visible,
  overImage = true,
}: {
  hero: HeroBar;
  visible: boolean;
  overImage?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const progress = useSharedValue(visible ? 1 : 0);
  const tint = colors.isDark ? colors.brand.deep : colors.brand.main;
  useStatusBarStyle(visible || !overImage ? null : "light");

  useEffect(() => {
    progress.set(
      withTiming(visible ? 1 : 0, {
        duration: 300,
        easing: Easing.out(Easing.back(1.2)),
      }),
    );
  }, [visible, progress]);

  const hidden = -(insets.top + BAR + 24);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: hidden * (1 - progress.get()) }],
  }));

  return (
    <>
      <StatusBarBackdrop visible={visible} />
      <Animated.View
        className="absolute inset-x-3"
        style={[
          { top: insets.top + 6, pointerEvents: visible ? "auto" : "none" },
          style,
        ]}
      >
        <View
          className="flex-row items-center gap-3 overflow-hidden rounded-full pe-2.5 ps-5"
          style={{
            height: BAR,
            backgroundColor: tint,
            boxShadow: "0 10px 24px rgba(9, 43, 56, 0.22)",
          }}
        >
          <AppText
            weight="bold"
            className="shrink text-xl text-white"
            numberOfLines={1}
          >
            {hero.title}
          </AppText>

          <View className="flex-1 flex-row items-center justify-end gap-2">
            {hero.search ? (
              <HeroSearchField
                search={hero.search}
                action={hero.action}
                size={BUTTON}
              />
            ) : null}
          </View>
        </View>
      </Animated.View>
    </>
  );
});

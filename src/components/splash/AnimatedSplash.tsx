import AppText from "@/components/ui/AppText";
import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import useSplashPalette from "./useSplashPalette";
import { contentLocale } from "@/i18n/config";

const ANIMATION = require("@/assets/animations/splash.json");
const SIZE = 300;
const RING_CENTER = (165 / 400) * SIZE;
const FALLBACK_MS = 4000;

export default function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const { t, i18n } = useTranslation(["common", "azkar"]);
  const ar = contentLocale(i18n.language) === "ar";
  const palette = useSplashPalette();
  const opacity = useSharedValue(1);
  const leaving = useRef(false);

  const leave = () => {
    if (leaving.current) return;
    leaving.current = true;
    opacity.set(
      withTiming(0, { duration: 380 }, (finished) => {
        if (finished) scheduleOnRN(onDone);
      }),
    );
  };

  useEffect(() => {
    const timer = setTimeout(leave, FALLBACK_MS);
    return () => clearTimeout(timer);
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: palette.bg, zIndex: 100 },
        style,
      ]}
      className="items-center justify-center"
    >
      <View style={{ width: SIZE, height: SIZE }}>
        <LottieView
          source={ANIMATION}
          autoPlay
          loop={false}
          style={{ width: SIZE, height: SIZE }}
          colorFilters={[
            { keypath: "beads", color: palette.main },
            { keypath: "glow", color: palette.main },
            { keypath: "imam", color: palette.gold },
            { keypath: "tassel", color: palette.gold },
            { keypath: "spark", color: palette.gold },
            { keypath: "halo", color: palette.gold },
          ]}
          onAnimationFinish={() => setTimeout(leave, 250)}
        />
        <Animated.View
          entering={ZoomIn.delay(650).duration(600)}
          className="absolute inset-x-0 items-center justify-center"
          style={{ top: RING_CENTER - 40, height: 80 }}
        >
          <AppText
            variant={ar ? "quran" : "ui"}
            weight="bold"
            className={
              ar ? "text-5xl leading-[80px]" : "text-4xl leading-[80px]"
            }
            style={{ color: palette.main, textAlign: "center" }}
          >
            {t("common:appName")}
          </AppText>
        </Animated.View>
      </View>
      <Animated.View entering={FadeInDown.delay(1300).duration(600)}>
        <AppText
          className="text-sm"
          style={{ color: palette.muted, textAlign: "center" }}
        >
          {t("azkar:tagline")}
        </AppText>
      </Animated.View>
      <Animated.View
        entering={FadeIn.delay(1500).duration(500)}
        className="mt-3 h-1 w-10 rounded-full"
        style={{ backgroundColor: palette.gold }}
      />
    </Animated.View>
  );
}

import useDirection from "@/hooks/useDirection";
import useThemeColors from "@/hooks/useThemeColors";
import { Stack } from "expo-router";
import { type ComponentProps, useMemo } from "react";
import { Platform, View } from "react-native";
import TransitionGuard from "./TransitionGuard";

type ScreenLayout = NonNullable<ComponentProps<typeof Stack>["screenLayout"]>;

const screenLayout: ScreenLayout = ({ navigation, children }) => (
  <TransitionGuard navigation={navigation}>{children}</TransitionGuard>
);

const TAB_ROOTS = ["index", "hadith", "quran", "qibla", "settings"];

export default function StackLayout() {
  const colors = useThemeColors();
  const { isRTL } = useDirection();

  const titleStyle = useMemo(
    () => ({
      fontFamily: isRTL ? "LamaSans-ExtraBold" : "SpaceGrotesk-Bold",
      fontSize: 18,
      color: colors.ink,
    }),
    [isRTL, colors.ink],
  );

  const stack = (
    <Stack
      screenLayout={screenLayout}
      screenOptions={({ route }) => ({
        headerShown: !TAB_ROOTS.includes(route.name),
        freezeOnBlur: true,
        headerShadowVisible: false,
        headerTintColor: colors.isDark ? "#ffffff" : colors.main,
        headerTitleStyle: titleStyle,
        headerStyle: { backgroundColor: colors.bg },
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: colors.bg },
      })}
    />
  );

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, paddingTop: 80, backgroundColor: colors.bg }}>
        {stack}
      </View>
    );
  }

  return stack;
}

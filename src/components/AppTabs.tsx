import AndroidTabBar from "@/components/AndroidTabBar";
import AppEffects from "@/components/AppEffects";
import useDirection from "@/hooks/useDirection";
import useTabBarColors from "@/hooks/useTabBarColors";
import useThemeColors from "@/hooks/useThemeColors";
import { useLocales } from "expo-localization";
import { LocaleProvider, useSegments } from "expo-router";
import {
  Tabs,
  type BottomTabBarProps,
  type BottomTabNavigationOptions,
} from "expo-router/js-tabs";
import { useCallback, useMemo } from "react";
import { NativeTabs } from "expo-router/native-tabs";
import { StatusBarProvider } from "@/components/StatusBarStyle";
import { useTranslation } from "react-i18next";
import { Easing, Platform, View } from "react-native";

const HERO_TABS = new Set(["(azkar)", "(hadith)", "(quran)"]);

const TABS = [
  {
    name: "(azkar)",
    label: "tabs.azkar",
    icon: "tabAzkar",
    image: {
      default: require("@/assets/tab-icons/azkar-default.png"),
      selected: require("@/assets/tab-icons/azkar-selected.png"),
    },
  },
  {
    name: "(hadith)",
    label: "tabs.hadith",
    icon: "tabHadith",
    image: {
      default: require("@/assets/tab-icons/hadith-default.png"),
      selected: require("@/assets/tab-icons/hadith-selected.png"),
    },
  },
  {
    name: "(quran)",
    label: "tabs.quran",
    icon: "tabQuran",
    image: {
      default: require("@/assets/tab-icons/quran-default.png"),
      selected: require("@/assets/tab-icons/quran-selected.png"),
    },
  },
  {
    name: "(qibla)",
    label: "tabs.qibla",
    icon: "tabQibla",
    image: {
      default: require("@/assets/tab-icons/qibla-default.png"),
      selected: require("@/assets/tab-icons/qibla-selected.png"),
    },
  },
  {
    name: "(settings)",
    label: "tabs.settings",
    icon: "tabSettings",
    image: {
      default: require("@/assets/tab-icons/settings-default.png"),
      selected: require("@/assets/tab-icons/settings-selected.png"),
    },
  },
] as const;

const tabTransition: Pick<
  BottomTabNavigationOptions,
  "transitionSpec" | "sceneStyleInterpolator"
> = {
  transitionSpec: {
    animation: "timing",
    config: { duration: 180, easing: Easing.out(Easing.cubic) },
  },
  sceneStyleInterpolator: ({ current }) => ({
    sceneStyle: {
      opacity: current.progress.interpolate({
        inputRange: [-1, -0.4, 0, 0.4, 1],
        outputRange: [0, 0, 1, 0, 0],
      }),
      transform: [
        {
          translateY: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [10, 0, 10],
          }),
        },
      ],
    },
  }),
};

export default function AppTabs() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { direction, isRTL } = useDirection();
  const tabs = useMemo(() => (isRTL ? [...TABS].reverse() : TABS), [isRTL]);
  const tab = useTabBarColors();
  const systemDirection = useLocales()[0]?.textDirection ?? "ltr";
  const segments = useSegments() as string[];
  const hideTabs = segments.includes("mushaf") || segments.includes("surah");
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      ...tabTransition,
      freezeOnBlur: true,
      sceneStyle: { backgroundColor: colors.bg },
    }),
    [colors.bg],
  );
  const tabBar = useCallback(
    (props: BottomTabBarProps) =>
      hideTabs ? null : <AndroidTabBar {...props} tabs={TABS} />,
    [hideTabs],
  );

  return (
    <LocaleProvider direction={systemDirection}>
      <View className="flex-1 bg-main-bg" style={{ direction }}>
        <StatusBarProvider>
          {Platform.OS === "android" ? (
            <Tabs screenOptions={screenOptions} tabBar={tabBar}>
              {TABS.map((tab) => (
                <Tabs.Screen key={tab.name} name={tab.name} />
              ))}
            </Tabs>
          ) : (
            <NativeTabs
              hidden={hideTabs}
              tintColor={tab.active}
              minimizeBehavior="onScrollDown"
              labelStyle={{
                default: { fontFamily: tab.font, color: tab.inactive },
                selected: {
                  fontFamily: tab.font,
                  color:
                    colors.isDark && Platform.OS === "web"
                      ? "#000000"
                      : tab.active,
                },
              }}
              iconColor={{
                default: tab.inactive,
                selected: tab.active,
              }}
            >
              {tabs.map((tab) => (
                <NativeTabs.Trigger
                  key={tab.name}
                  name={tab.name}
                  disableAutomaticContentInsets={HERO_TABS.has(tab.name)}
                >
                  {Platform.OS === "ios" ? (
                    <NativeTabs.Trigger.Icon
                      src={tab.image}
                      renderingMode="template"
                    />
                  ) : null}
                  <NativeTabs.Trigger.Label>
                    {t(tab.label)}
                  </NativeTabs.Trigger.Label>
                </NativeTabs.Trigger>
              ))}
            </NativeTabs>
          )}
          <AppEffects />
        </StatusBarProvider>
      </View>
    </LocaleProvider>
  );
}

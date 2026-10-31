import AndroidTabItem from "@/components/AndroidTabItem";
import type { IconKey } from "@/components/ui/Icon";
import useBottomInset from "@/hooks/useBottomInset";
import useThemeColors from "@/hooks/useThemeColors";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabDef = {
  name: string;
  label: string;
  icon: IconKey;
};

export default function AndroidTabBar({
  state,
  emitter,
  navigateToTab,
  tabs,
}: BottomTabBarProps & { tabs: readonly TabDef[] }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();

  const onTabPress = useCallback(
    (key: string, focused: boolean) => {
      const event = emitter.emit({
        type: "tabPress",
        target: key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) navigateToTab(key);
    },
    [emitter, navigateToTab],
  );

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 bottom-0"
      style={{
        paddingBottom: bottomInset + 16,
        paddingHorizontal: Math.max(insets.left, insets.right) + 14,
      }}
    >
      <View
        className="h-[62px] w-full max-w-xl flex-row gap-1 self-center rounded-full border border-line bg-surface p-[5px]"
        style={{
          boxShadow: colors.isDark
            ? "0 12px 32px rgba(0, 0, 0, 0.5)"
            : "0 12px 32px rgba(9, 43, 56, 0.16)",
        }}
      >
        {state.routes.map((route, index) => {
          const tab = tabs.find((t) => t.name === route.name);
          if (!tab) return null;

          return (
            <AndroidTabItem
              key={route.key}
              routeKey={route.key}
              icon={tab.icon}
              label={t(tab.label as never)}
              focused={state.index === index}
              onPress={onTabPress}
            />
          );
        })}
      </View>
    </View>
  );
}

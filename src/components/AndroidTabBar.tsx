import AndroidTabItem from "@/components/AndroidTabItem";
import type { IconKey } from "@/components/ui/Icon";
import type { BottomTabBarProps } from "expo-router/js-tabs";
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
  navigation,
  tabs,
}: BottomTabBarProps & { tabs: readonly TabDef[] }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-main-bg pt-2"
      style={{
        paddingBottom: insets.bottom + 8,
        paddingLeft: insets.left + 12,
        paddingRight: insets.right + 12,
      }}
    >
      <View
        className="h-[68px] flex-row rounded-3xl border border-line bg-surface"
        style={{ boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)" }}
      >
        {state.routes.map((route, index) => {
          const tab = tabs.find((t) => t.name === route.name);
          if (!tab) return null;
          const focused = state.index === index;

          return (
            <AndroidTabItem
              key={route.key}
              icon={tab.icon}
              label={t(tab.label as never)}
              focused={focused}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

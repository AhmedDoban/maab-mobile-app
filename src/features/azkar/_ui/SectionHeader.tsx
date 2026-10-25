import AppText from "@/components/ui/AppText";
import Icon, { IconKey } from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import useDirection from "@/hooks/useDirection";
import useThemeColors from "@/hooks/useThemeColors";
import { View } from "react-native";

export default function SectionHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: IconKey;
  action?: { label: string; onPress: () => void };
}) {
  const colors = useThemeColors();
  const { isRTL } = useDirection();

  return (
    <View className="flex-row items-center gap-3">
      {icon ? (
        <View className="size-10 items-center justify-center rounded-full border border-main">
          <Icon name={icon} size={20} tintColor={colors.main} />
        </View>
      ) : null}
      <View className="flex-1 gap-0.5">
        <AppText weight="bold" className="text-xl text-main">
          {title}
        </AppText>
        {subtitle ? (
          <AppText className="text-xs text-main-gray">{subtitle}</AppText>
        ) : null}
      </View>
      {action ? (
        <PressableScale
          hitSlop={10}
          onPress={action.onPress}
          accessibilityRole="button"
          className="flex-row items-center gap-1"
        >
          <AppText className="text-sm text-main">{action.label}</AppText>
          <Icon
            name={isRTL ? "chevronLeft" : "chevronRight"}
            size={14}
            tintColor={colors.main}
          />
        </PressableScale>
      ) : null}
    </View>
  );
}

import useSettingsColors from "@/features/settings/_components/useSettingsColors";
import useThemeColors from "@/hooks/useThemeColors";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { View } from "react-native";
import AppText from "./AppText";
import Icon from "./Icon";
import PressableScale from "./PressableScale";

export default function SheetHeader({
  title,
  onClose,
  closeLabel,
  leading,
  className,
}: {
  title: string;
  onClose: () => void;
  closeLabel?: string;
  leading?: ReactNode;
  className?: string;
}) {
  const colors = useThemeColors();
  const palette = useSettingsColors();

  return (
    <View className={cn("flex-row items-center px-1", className)}>
      <View className="min-w-9 flex-1 items-start">{leading}</View>
      <AppText
        weight="bold"
        className="shrink text-lg"
        style={{ color: colors.ink }}
        numberOfLines={1}
      >
        {title}
      </AppText>
      <View className="min-w-9 flex-1 items-end">
        <PressableScale
          onPress={onClose}
          accessibilityLabel={closeLabel}
          className="size-9 items-center justify-center rounded-full"
          style={{ backgroundColor: palette.border }}
        >
          <Icon name="close" size={16} tintColor={colors.ink} />
        </PressableScale>
      </View>
    </View>
  );
}

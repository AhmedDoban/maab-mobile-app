import IconButton from "@/components/Buttons/IconButton";
import useThemeColors from "@/hooks/useThemeColors";
import { View } from "react-native";

export default function CategoryHeaderActions({
  isFavorite,
  canReset,
  canComplete,
  resetLabel,
  completeLabel,
  favoriteLabel,
  onReset,
  onComplete,
  onToggleFavorite,
}: {
  isFavorite: boolean;
  canReset: boolean;
  canComplete: boolean;
  resetLabel: string;
  completeLabel: string;
  favoriteLabel: string;
  onReset: () => void;
  onComplete: () => void;
  onToggleFavorite: () => void;
}) {
  const colors = useThemeColors();
  const background = {
    backgroundColor: colors.isDark ? "#1f1f1f" : colors.surfaceMuted,
  };
  const iconColor = colors.isDark ? "#ffffff" : colors.main;

  return (
    <View className="flex-row gap-2">
      <IconButton
        icon="checkCircle"
        color={iconColor}
        className="size-9"
        style={[background, { opacity: canComplete ? 1 : 0.4 }]}
        accessibilityLabel={completeLabel}
        disabled={!canComplete}
        onPress={onComplete}
      />
      <IconButton
        icon="reset"
        color={iconColor}
        className="size-9"
        style={[background, { opacity: canReset ? 1 : 0.4 }]}
        accessibilityLabel={resetLabel}
        disabled={!canReset}
        onPress={onReset}
      />
      <IconButton
        icon={isFavorite ? "heartFill" : "heart"}
        color={isFavorite ? colors.love : iconColor}
        className="size-9"
        style={background}
        accessibilityLabel={favoriteLabel}
        accessibilityState={{ selected: isFavorite }}
        onPress={onToggleFavorite}
      />
    </View>
  );
}

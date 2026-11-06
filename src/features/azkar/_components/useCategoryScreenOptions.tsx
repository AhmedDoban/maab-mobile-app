import useThemeColors from "@/hooks/useThemeColors";
import { NativeStackNavigationOptions } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import CategoryHeaderActions from "../_ui/CategoryHeaderActions";

export default function useCategoryScreenOptions({
  title,
  isFavorite,
  canReset,
  canComplete,
  onReset,
  onComplete,
  onToggleFavorite,
}: {
  title: string;
  isFavorite: boolean;
  canReset: boolean;
  canComplete: boolean;
  onReset: () => void;
  onComplete: () => void;
  onToggleFavorite: () => void;
}) {
  const { t } = useTranslation("azkar");
  const colors = useThemeColors();

  return useMemo((): NativeStackNavigationOptions => {
    const actions = (
      <CategoryHeaderActions
        isFavorite={isFavorite}
        canReset={canReset}
        canComplete={canComplete}
        resetLabel={t("reset")}
        completeLabel={t("completeAll")}
        favoriteLabel={t("saveZikr")}
        onReset={onReset}
        onComplete={onComplete}
        onToggleFavorite={onToggleFavorite}
      />
    );
    return {
      title,
      headerLargeTitle: false,
      headerRight: Platform.OS === "ios" ? undefined : () => actions,
      unstable_headerRightItems:
        Platform.OS === "ios"
          ? () => [
              {
                type: "button",
                icon: { type: "sfSymbol", name: "checkmark.circle" },
                tintColor: colors.ink,
                disabled: !canComplete,
                label: t("completeAll"),
                onPress: onComplete,
              },
              {
                type: "button",
                icon: {
                  type: "sfSymbol",
                  name: isFavorite ? "heart.fill" : "heart",
                },
                tintColor: isFavorite ? colors.love : colors.ink,
                label: t("saveZikr"),
                onPress: onToggleFavorite,
              },
              {
                type: "button",
                icon: { type: "sfSymbol", name: "arrow.counterclockwise" },
                tintColor: colors.ink,
                disabled: !canReset,
                label: t("reset"),
                onPress: onReset,
              },
            ]
          : undefined,
    };
  }, [
    title,
    isFavorite,
    canReset,
    canComplete,
    colors.love,
    colors.ink,
    t,
    onReset,
    onComplete,
    onToggleFavorite,
  ]);
}

import AppText from "@/components/ui/AppText";
import PressableScale from "@/components/ui/PressableScale";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default memo(function QuranFilterChips({
  byJuz,
  onChange,
}: {
  byJuz: boolean;
  onChange: (byJuz: boolean) => void;
}) {
  const { t } = useTranslation("azkar");
  const options = [
    { value: false, label: t("allSurahs") },
    { value: true, label: t("byJuz") },
  ];

  return (
    <View className="flex-row gap-2">
      {options.map((option) => {
        const selected = byJuz === option.value;
        return (
          <PressableScale
            key={option.label}
            scaleTo={0.96}
            onPress={() => onChange(option.value)}
            accessibilityState={{ selected }}
            className={
              selected
                ? "rounded-full border border-main bg-main-soft px-4 py-1.5"
                : "rounded-full border border-line px-4 py-1.5"
            }
          >
            <AppText
              weight={selected ? "bold" : "regular"}
              className={
                selected ? "text-sm text-main" : "text-sm text-main-gray"
              }
            >
              {option.label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
});

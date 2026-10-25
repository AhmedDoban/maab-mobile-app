import { IconKey } from "@/components/ui/Icon";
import {
  PrayerCardStyle,
  setPrayerCardStyle,
} from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import PrayerCardStyleOption from "./PrayerCardStyleOption";

const STYLES: { value: PrayerCardStyle; icon: IconKey }[] = [
  { value: "modern", icon: "mosque" },
  { value: "classic", icon: "personPraying" },
];

export default function PrayerCardStylePicker() {
  const { t } = useTranslation("settings");
  const dispatch = useAppDispatch();
  const current = useAppSelector((s) => s.settings.prayerCardStyle);

  return (
    <View accessibilityRole="radiogroup" className="gap-3">
      {STYLES.map(({ value, icon }) => (
        <PrayerCardStyleOption
          key={value}
          icon={icon}
          label={t(`prayerCardStyles.${value}.title`)}
          hint={t(`prayerCardStyles.${value}.hint`)}
          selected={current === value}
          onPress={() => {
            if (current === value) return;
            Haptics.selectionAsync();
            dispatch(setPrayerCardStyle(value));
          }}
        />
      ))}
    </View>
  );
}

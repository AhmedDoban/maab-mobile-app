import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import useThemeColors from "@/hooks/useThemeColors";
import { Locale } from "@/i18n/config";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useClock } from "../_components/usePrayerSchedule";
import { toHijri } from "../_data/hijri";

export default memo(function HijriDateChip() {
  const { t, i18n } = useTranslation("prayer");
  const colors = useThemeColors();
  const locale = i18n.language as Locale;
  const day = useClock((now) => now.toDateString());
  const hijri = useMemo(() => toHijri(new Date(day)), [day]);

  return (
    <View className="flex-row items-center gap-1.5 self-start rounded-full border border-line bg-surface px-3 py-2">
      <Icon name="calendar" size={15} tintColor={colors.main} />
      <AppText className="text-xs text-ink" numberOfLines={1}>
        {`${hijri.weekday[locale]} ${hijri.day} ${hijri.monthName[locale]} ${t("hijriYear", { year: hijri.year })}`}
      </AppText>
    </View>
  );
});

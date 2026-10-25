import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import useThemeColors from "@/hooks/useThemeColors";
import { Locale } from "@/i18n/config";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { HijriDate } from "../_data/hijri";

export default function PrayerDateRow({
  hijri,
  city,
}: {
  hijri: HijriDate;
  city: string | null;
}) {
  const { t, i18n } = useTranslation("prayer");
  const colors = useThemeColors();
  const locale = i18n.language as Locale;

  return (
    <View className="shrink gap-2">
      {city ? (
        <View className="flex-row items-center gap-1.5">
          <Icon name="location" size={14} tintColor={colors.main} />
          <AppText className="shrink text-xs text-main-gray" numberOfLines={1}>
            {city}
          </AppText>
        </View>
      ) : null}
      <View className="flex-row items-center gap-1.5">
        <Icon name="calendar" size={14} tintColor={colors.main} />
        <AppText className="shrink text-xs text-main-gray" numberOfLines={2}>
          {`${hijri.weekday[locale]} ${hijri.day} ${hijri.monthName[locale]} ${t("hijriYear", { year: hijri.year })}`}
        </AppText>
      </View>
    </View>
  );
}

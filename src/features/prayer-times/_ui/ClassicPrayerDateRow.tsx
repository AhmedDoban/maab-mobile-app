import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import { Locale } from "@/i18n/config";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { HijriDate } from "../_data/hijri";

export default function ClassicPrayerDateRow({
  hijri,
  city,
}: {
  hijri: HijriDate;
  city: string | null;
}) {
  const { i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const comma = locale === "ar" ? "،" : ",";

  return (
    <View className="flex-row items-center gap-1.5">
      <Icon name="calendar" size={13} tintColor="#ffffff" />
      <AppText
        className="shrink text-xs text-white"
        style={{ opacity: 0.85 }}
        numberOfLines={1}
      >
        {`${hijri.weekday[locale]}${comma} ${hijri.day} ${hijri.monthName[locale]} ${hijri.year}`}
      </AppText>
      {city ? (
        <>
          <Icon name="location" size={12} tintColor="#ffffff" />
          <AppText
            className="shrink text-xs text-white"
            style={{ opacity: 0.85 }}
            numberOfLines={1}
          >
            {city}
          </AppText>
        </>
      ) : null}
    </View>
  );
}

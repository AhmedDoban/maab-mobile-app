import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { HijriDate } from "../_data/hijri";

export default function useHijriLabel() {
  const { t } = useTranslation("prayer");

  return useMemo(() => {
    const weekdays = t("weekdays", { returnObjects: true }) as string[];
    const months = t("hijriMonths", { returnObjects: true }) as string[];
    const comma = t("dateComma");
    return {
      full: (hijri: HijriDate) =>
        `${weekdays[hijri.weekday]} ${hijri.day} ${months[hijri.month - 1]} ${t("hijriYear", { year: hijri.year })}`,
      short: (hijri: HijriDate) =>
        `${weekdays[hijri.weekday]}${comma} ${hijri.day} ${months[hijri.month - 1]} ${hijri.year}`,
    };
  }, [t]);
}

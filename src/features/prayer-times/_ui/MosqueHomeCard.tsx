import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import useThemeColors from "@/hooks/useThemeColors";
import { usePrayerConfig, useClock } from "../_components/usePrayerSchedule";
import { nextIqama } from "../_data/mosques";
import { useAppSelector } from "@/store/Store";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import usePrayerLabels from "../_components/usePrayerLabels";
import { View } from "react-native";

export default function MosqueHomeCard() {
  const colors = useThemeColors();
  const { t } = useTranslation("azkar");
  const { label } = usePrayerLabels();
  const config = usePrayerConfig();
  const nowMs = useClock((now) => now.getTime());
  const { items, activeId, inside } = useAppSelector((state) => state.mosques);
  const mosque = items.find((item) => item.id === activeId) ?? items[0];
  const next = config && mosque ? nextIqama(mosque, config, new Date(nowMs)) : null;
  const minutes = next
    ? Math.max(0, Math.ceil((next.at.getTime() - nowMs) / 60000))
    : null;

  return (
    <PressableScale
      onPress={() =>
        router.push({
          pathname: "/settings/[section]",
          params: { section: "mosques" },
        })
      }
      className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5"
      accessibilityRole="button"
      accessibilityLabel={mosque?.name ?? t("addMosqueCard")}
    >
      <View
        className="size-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: colors.mainSoft }}
      >
        <Icon name="mosque" size={23} tintColor={colors.main} />
      </View>
      <View className="flex-1 gap-1">
        <AppText weight="bold" className="text-base">
          {mosque?.name ?? t("addMosqueCard")}
        </AppText>
        {mosque && next ? (
          <AppText className="text-sm text-main-gray">
            {t(inside ? "insideMosqueCard" : "nextIqamaCard", {
              prayer: label(next.prayer, false),
              minutes,
            })}
          </AppText>
        ) : (
          <AppText className="text-sm text-main-gray">
            {t("addMosqueCardHint")}
          </AppText>
        )}
      </View>
      <Icon name="chevronLeft" size={19} tintColor={colors.gray} />
    </PressableScale>
  );
}

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
import usePrayerLocation from "../_components/usePrayerLocation";
import { distanceKm } from "../_data/geo";
import openMosqueMaps from "@/lib/openMosqueMaps";
import { View } from "react-native";

export default function MosqueHomeCard() {
  const colors = useThemeColors();
  const { t } = useTranslation("azkar");
  const { label } = usePrayerLabels();
  const config = usePrayerConfig();
  const nowMs = useClock((now) => now.getTime());
  const { items, activeId, inside } = useAppSelector((state) => state.mosques);
  const { location } = usePrayerLocation();
  const nearest = location
    ? items.reduce(
        (closest, item) =>
          !closest || distanceKm(location, item) < distanceKm(location, closest)
            ? item
            : closest,
        null as (typeof items)[number] | null,
      )
    : null;
  const mosque =
    nearest ?? items.find((item) => item.id === activeId) ?? items[0];
  const next =
    config && mosque ? nextIqama(mosque, config, new Date(nowMs)) : null;
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
      className="flex-row items-center gap-2 overflow-hidden rounded-2xl border border-line bg-surface px-4 py-3.5"
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
          {mosque ? t("nearestMosqueCard") : t("addMosqueCard")}
        </AppText>
        {mosque ? (
          <>
            <AppText className="text-sm text-main-gray">{mosque.name}</AppText>
            {next ? (
              <AppText className="text-sm text-main-gray">
                {t(
                  inside && mosque.id === activeId
                    ? "insideMosqueCard"
                    : "nextIqamaCard",
                  {
                    prayer: label(next.prayer, false),
                    minutes,
                  },
                )}
              </AppText>
            ) : null}
          </>
        ) : (
          <AppText className="text-sm text-main-gray">
            {t("addMosqueCardHint")}
          </AppText>
        )}
      </View>
      {mosque ? (
        <PressableScale
          onPress={() => openMosqueMaps(mosque)}
          className="size-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: colors.mainSoft, marginVertical: -2 }}
          accessibilityRole="button"
          accessibilityLabel={t("openMosqueLocation")}
        >
          <Icon name="location" size={19} tintColor={colors.main} />
        </PressableScale>
      ) : null}
      <Icon name="chevronLeft" size={19} tintColor={colors.gray} />
    </PressableScale>
  );
}

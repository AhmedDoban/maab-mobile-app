import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import useThemeColors from "@/hooks/useThemeColors";
import { cn } from "@/lib/utils";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import useCityName from "@/features/prayer-times/_components/useCityName";
import type { CityName } from "@/features/prayer-times/_data/cityName";
import Compass from "./Compass";

const deg = (value: number) => Math.round(Math.abs(value));

export default function QiblaView({
  city,
  heading,
  offset,
  aligned,
  accuracy,
  interference,
  bearing,
  distance,
}: {
  city: CityName | null;
  heading: SharedValue<number>;
  offset: number | null;
  aligned: boolean;
  accuracy: number;
  interference: boolean;
  bearing: number;
  distance: number;
}) {
  const { t } = useTranslation("qibla");
  const cityName = useCityName(city);
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const size = Math.min(width - 72, 300);

  const wasAligned = useRef(false);
  useEffect(() => {
    if (aligned && !wasAligned.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    wasAligned.current = aligned;
  }, [aligned]);

  const warning =
    offset === null
      ? null
      : interference
        ? t("interference")
        : accuracy < 2
          ? t("calibrate")
          : null;

  const status =
    offset === null
      ? t("noCompass", { deg: deg(bearing) })
      : aligned
        ? t("facing")
        : t(offset > 0 ? "turnRight" : "turnLeft", { deg: deg(offset) });

  return (
    <View className="gap-6">
      <View className="gap-6 px-1">
        {cityName ? (
          <View className="flex-row items-center justify-center gap-1">
            <Icon name="location" size={12} tintColor={colors.gray} />
            <AppText
              className="shrink text-xs text-main-gray"
              numberOfLines={1}
            >
              {cityName}
            </AppText>
          </View>
        ) : null}

        <View className="items-center gap-1">
          <Icon name="kaaba" size={52} tintColor={colors.main} />
          <Compass
            size={size}
            heading={heading}
            bearing={bearing}
            aligned={aligned}
          />
        </View>

        <View className="items-center gap-1">
          <AppText
            weight="bold"
            className={cn("text-lg", aligned ? "text-main" : "text-ink")}
            style={{ textAlign: "center" }}
          >
            {status}
          </AppText>
          <AppText
            className="text-xs text-main-gray"
            style={{ textAlign: "center" }}
          >
            {`${t("fromNorth", { deg: deg(bearing) })} · ${t("km", {
              value: Math.round(distance).toLocaleString("en-US"),
            })}`}
          </AppText>
        </View>
      </View>

      <AppText
        className={cn(
          "px-6 text-xs",
          warning ? "text-main-orange" : "text-main-gray",
        )}
        style={{ textAlign: "center" }}
      >
        {warning ?? t("hint")}
      </AppText>
    </View>
  );
}

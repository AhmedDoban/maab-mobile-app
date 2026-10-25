import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import useThemeColors from "@/hooks/useThemeColors";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import usePrayerReminder from "../_components/usePrayerReminder";
import { PrayerStatus } from "../_data/schedule";
import { PRAYER_ICONS, PrayerName } from "../_data/types";

function PrayerCell({
  prayer,
  label,
  time,
  status,
  onDenied,
}: {
  prayer: PrayerName;
  label: string;
  time: string;
  status: PrayerStatus;
  onDenied: () => void;
}) {
  const { t } = useTranslation("prayer");
  const colors = useThemeColors();
  const { enabled, toggle } = usePrayerReminder(prayer, onDenied);
  const isNext = status === "next";
  const color = isNext ? colors.onFill : colors.ink;
  const accent = isNext ? colors.onFill : colors.main;

  return (
    <PressableScale
      scaleTo={0.92}
      onPress={toggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      accessibilityLabel={`${label} ${time}, ${t(enabled ? "reminderOn" : "reminderOff")}`}
      className="flex-1 items-center gap-1.5 rounded-2xl py-3"
      style={[
        isNext && { backgroundColor: colors.mainFill },
        status === "passed" && { opacity: 0.55 },
      ]}
    >
      <View>
        <Icon name={PRAYER_ICONS[prayer]} size={24} tintColor={accent} />
        <View
          className="absolute -end-2.5 -top-1.5 size-3.5 items-center justify-center rounded-full"
          style={{
            backgroundColor: isNext ? colors.onFill : colors.mainSoft,
            opacity: enabled ? 1 : 0.7,
          }}
        >
          <Icon
            name={enabled ? "bell" : "bellSlash"}
            size={8}
            tintColor={isNext ? colors.mainFill : colors.main}
          />
        </View>
      </View>
      <AppText
        weight="bold"
        className="text-[13px]"
        style={{ color }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label}
      </AppText>
      <AppText
        weight={isNext ? "bold" : "regular"}
        className="text-[13px]"
        style={{ color, writingDirection: "ltr" }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {time}
      </AppText>
    </PressableScale>
  );
}

export default memo(PrayerCell);

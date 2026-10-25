import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import usePrayerReminder from "../_components/usePrayerReminder";
import { PrayerStatus } from "../_data/schedule";
import { PRAYER_ICONS, PrayerName } from "../_data/types";

const INK = "#0e3a33";
const MINT_FILL = "#dff3ea";

function ClassicPrayerCell({
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
  const { enabled, toggle } = usePrayerReminder(prayer, onDenied);
  const isNext = status === "next";
  const color = isNext ? INK : "#ffffff";

  return (
    <PressableScale
      scaleTo={0.92}
      onPress={toggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      accessibilityLabel={`${label} ${time}, ${t(enabled ? "reminderOn" : "reminderOff")}`}
      className="flex-1 items-center gap-1 rounded-2xl py-3"
      style={[
        isNext && { backgroundColor: MINT_FILL },
        status === "passed" && { opacity: 0.55 },
      ]}
    >
      <AppText
        weight={isNext ? "bold" : "regular"}
        className="text-xs"
        style={{ color }}
        numberOfLines={1}
      >
        {label}
      </AppText>
      <AppText
        weight="bold"
        className="text-[15px]"
        style={{ color, writingDirection: "ltr" }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {time}
      </AppText>
      <View>
        <Icon name={PRAYER_ICONS[prayer]} size={18} tintColor={color} />
        <View
          className="absolute -end-2.5 -top-1.5 size-3.5 items-center justify-center rounded-full"
          style={{
            backgroundColor: isNext ? INK : "#ffffff",
            opacity: enabled ? 1 : 0.7,
          }}
        >
          <Icon
            name={enabled ? "bell" : "bellSlash"}
            size={8}
            tintColor={isNext ? MINT_FILL : INK}
          />
        </View>
      </View>
    </PressableScale>
  );
}

export default memo(ClassicPrayerCell);

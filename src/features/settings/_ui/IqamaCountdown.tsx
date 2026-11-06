import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import { nextIqama, Mosque } from "@/features/prayer-times/_data/mosques";
import { PrayerConfig } from "@/features/prayer-times/_data/calculate";
import { PrayerName } from "@/features/prayer-times/_data/types";
import useThemeColors from "@/hooks/useThemeColors";
import { View } from "react-native";
import { shortTime } from "@/features/prayer-times/_data/time";

export default function IqamaCountdown({
  mosque,
  config,
  now,
  label,
  title,
  active,
  onToggle,
  insideLabel,
}: {
  mosque: Mosque;
  config: PrayerConfig;
  now: Date;
  label: (name: PrayerName, friday: boolean) => string;
  title: string;
  active: boolean;
  onToggle: () => void;
  insideLabel: string;
}) {
  const colors = useThemeColors();
  const next = nextIqama(mosque, config, now);
  if (!next) return null;
  const minutes = Math.max(
    0,
    Math.ceil((next.at.getTime() - now.getTime()) / 60000),
  );
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-3">
        <View
          className="size-11 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.mainFill }}
        >
          <Icon name="mosque" size={22} tintColor={colors.onFill} />
        </View>
        <View className="flex-1 gap-0.5">
          <AppText weight="bold" className="text-lg text-ink">
            {mosque.name}
          </AppText>
          <AppText className="text-xs text-main-gray">{insideLabel}</AppText>
        </View>
        <PressableScale
          onPress={onToggle}
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: active ? colors.mainSoft : colors.surfaceMuted }}
        >
          <Icon
            name={active ? "checkCircle" : "location"}
            size={20}
            tintColor={colors.main}
          />
        </PressableScale>
      </View>
      <View
        className="flex-row items-center gap-3 rounded-2xl p-3"
        style={{ backgroundColor: colors.mainSoft }}
      >
        <View className="flex-1 gap-0.5">
          <AppText className="text-xs text-main-gray">{title}</AppText>
          <View className="flex-row items-center gap-2">
            <AppText weight="bold" className="text-base text-ink">
              {label(next.prayer, false)}
            </AppText>
            <AppText className="text-main-gray">·</AppText>
            <AppText
              weight="bold"
              className="text-xl text-main"
              style={{ writingDirection: "ltr" }}
            >
              {shortTime(
                `${String(next.at.getHours()).padStart(2, "0")}:${String(next.at.getMinutes()).padStart(2, "0")}`,
              )}
            </AppText>
          </View>
        </View>
        <View className="items-end">
          <AppText className="text-xs text-main-gray">بعد</AppText>
          <AppText
            weight="bold"
            className="text-lg text-main"
            style={{ writingDirection: "ltr" }}
          >
            {minutes} د
          </AppText>
        </View>
      </View>
    </View>
  );
}

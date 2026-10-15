import BrandCardBackground from "@/components/ui/BrandCardBackground";
import { PAGE_MOSQUES } from "@/constants/mosques";
import useThemeColors from "@/hooks/useThemeColors";
import { useAppSelector } from "@/store/Store";
import { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import useCityName from "./_components/useCityName";
import usePrayerLabels from "./_components/usePrayerLabels";
import usePrayerSchedule from "./_components/usePrayerSchedule";
import { getPrayerProgress } from "./_data/schedule";
import { shortTime } from "./_data/time";
import ArchWindow from "./_ui/ArchWindow";
import NextPrayerHeader from "./_ui/NextPrayerHeader";
import NotificationPermissionDialog from "./_ui/NotificationPermissionDialog";
import PrayerCell from "./_ui/PrayerCell";
import PrayerDateRow from "./_ui/PrayerDateRow";
import PrayerTimesCardSkeleton from "./_ui/PrayerTimesCardSkeleton";
import PrayerTimesError from "./_ui/PrayerTimesError";
import ReminderHint from "./_ui/ReminderHint";

const WINDOW = 0.26;
const CARD_STYLE = { boxShadow: "0 10px 24px rgba(14, 58, 51, 0.25)" };
const STRIP_BORDER = "rgba(255, 255, 255, 0.16)";

export default function PrayerTimesCard() {
  const { label } = usePrayerLabels();
  const colors = useThemeColors();
  const stripStyle = useMemo(
    () => ({
      backgroundColor: `${colors.brand.deep.slice(0, 7)}E0`,
      borderColor: STRIP_BORDER,
    }),
    [colors.brand.deep],
  );
  const { day, prayers, next, now, isFriday, status, retry } =
    usePrayerSchedule();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [askNotifications, setAskNotifications] = useState(false);
  const city = useCityName(day?.city);
  const hintSeen = useAppSelector((s) => s.settings.reminderHintSeen);
  const onLayout = useCallback(
    (e: LayoutChangeEvent) =>
      setSize({
        w: e.nativeEvent.layout.width,
        h: e.nativeEvent.layout.height,
      }),
    [],
  );
  const openNotifications = useCallback(() => setAskNotifications(true), []);
  const closeNotifications = useCallback(() => setAskNotifications(false), []);

  if (status === "loading") return <PrayerTimesCardSkeleton />;

  if (!day || !next) {
    return <PrayerTimesError denied={status === "denied"} onRetry={retry} />;
  }

  const progress = getPrayerProgress(day, prayers, next, now);
  const windowW = size.w * WINDOW;

  return (
    <View
      className="overflow-hidden rounded-[28px]"
      style={CARD_STYLE}
      onLayout={onLayout}
    >
      <BrandCardBackground id="prayerCard" />

      {size.w > 0 ? (
        <View
          className="absolute bottom-0 end-3 top-3"
          style={{ width: windowW, pointerEvents: "none" }}
        >
          <ArchWindow
            source={PAGE_MOSQUES.prayerCard}
            width={windowW}
            height={size.h - 12 + 2}
          />
        </View>
      ) : null}

      <View className="gap-4 p-4">
        <View className="flex-row">
          <View className="flex-1 gap-4">
            <PrayerDateRow hijri={day.hijri} city={city} />

            <NextPrayerHeader
              prayer={next.name}
              label={label(next.name, isFriday)}
              minutesLeft={next.minutesLeft}
              progress={progress}
            />
          </View>
          <View style={{ width: windowW }} />
        </View>

        <View className="flex-row">
          <View
            className="flex-1 flex-row rounded-3xl border p-1"
            style={stripStyle}
          >
            {prayers.map(({ name, time, status }) => (
              <PrayerCell
                key={name}
                prayer={name}
                label={label(name, isFriday)}
                time={shortTime(time)}
                status={status}
                onDenied={openNotifications}
              />
            ))}
          </View>
          <View style={{ width: windowW * 0.4 }} />
        </View>

        {hintSeen ? null : (
          <View className="flex-row">
            <View className="flex-1">
              <ReminderHint />
            </View>
            <View style={{ width: windowW * 0.4 }} />
          </View>
        )}
      </View>
      <NotificationPermissionDialog
        visible={askNotifications}
        onClose={closeNotifications}
      />
    </View>
  );
}

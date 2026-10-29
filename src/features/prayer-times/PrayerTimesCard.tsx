import { useAppSelector } from "@/store/Store";
import { memo, useCallback, useState } from "react";
import useCityName from "./_components/useCityName";
import usePrayerSchedule from "./_components/usePrayerSchedule";
import ClassicPrayerCard from "./_ui/ClassicPrayerCard";
import ModernPrayerCard from "./_ui/ModernPrayerCard";
import NotificationPermissionDialog from "./_ui/NotificationPermissionDialog";
import PrayerTimesCardSkeleton from "./_ui/PrayerTimesCardSkeleton";
import PrayerTimesError from "./_ui/PrayerTimesError";

export default memo(function PrayerTimesCard() {
  const { day, prayers, next, now, isFriday, status, retry } =
    usePrayerSchedule();
  const [askNotifications, setAskNotifications] = useState(false);
  const city = useCityName(day?.city);
  const hintSeen = useAppSelector((s) => s.settings.reminderHintSeen);
  const classic = useAppSelector(
    (s) => s.settings.prayerCardStyle === "classic",
  );
  const openNotifications = useCallback(() => setAskNotifications(true), []);
  const closeNotifications = useCallback(() => setAskNotifications(false), []);

  if (status === "loading") return <PrayerTimesCardSkeleton />;

  if (!day || !next) {
    return <PrayerTimesError denied={status === "denied"} onRetry={retry} />;
  }

  const Card = classic ? ClassicPrayerCard : ModernPrayerCard;

  return (
    <>
      <Card
        day={day}
        prayers={prayers}
        next={next}
        now={now}
        isFriday={isFriday}
        city={city}
        showHint={!hintSeen}
        onDenied={openNotifications}
      />
      <NotificationPermissionDialog
        visible={askNotifications}
        onClose={closeNotifications}
      />
    </>
  );
});

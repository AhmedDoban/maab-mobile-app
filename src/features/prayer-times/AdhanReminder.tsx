import { today } from "@/store/Slices/AzkarSlice";
import { useAppSelector } from "@/store/Store";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager } from "react-native";
import {
  adhanPlaysNatively,
  configurePrayerNotifications,
  onAdhanEnded,
  onPrayerNotificationOpened,
  stopAdhan,
  syncPrayerNotifications,
} from "./_components/prayerNotifications";
import usePrayerLabels from "./_components/usePrayerLabels";
import usePrayerLocation from "./_components/usePrayerLocation";
import usePrayerWidgets from "./_components/usePrayerWidgets";
import {
  useClock,
  usePrayerConfig,
  usePrayerDay,
} from "./_components/usePrayerSchedule";
import { AdhanSoundId } from "./_data/adhanSounds";
import { addDays, prayerDates } from "./_data/calculate";
import { getPrayerStartingNow } from "./_data/schedule";
import { PrayerName, REMINDER_PRAYERS } from "./_data/types";
import AdhanSplash from "./AdhanSplash";

const ALERT_DAYS = 7;

export default function AdhanReminder() {
  const { t, i18n } = useTranslation(["prayer", "settings"]);
  const { label } = usePrayerLabels();
  usePrayerLocation();
  const config = usePrayerConfig();
  const day = usePrayerDay(config);
  usePrayerWidgets(config, day);
  const startingNow = useClock((now) =>
    day ? getPrayerStartingNow(day.times, now) : null,
  );
  const reminders = useAppSelector((s) => s.settings.prayerReminders);
  const sound = useAppSelector((s) => s.settings.adhanSound);
  const customUri = useAppSelector((s) => s.settings.customAdhan?.uri ?? null);
  const [active, setActive] = useState<{
    prayer: PrayerName;
    nativeAudio: boolean;
  } | null>(null);
  const shown = useRef(new Set<string>());

  const show = (prayer: PrayerName, nativeAudio = false) => {
    const key = `${today()}:${prayer}`;
    if (shown.current.has(key)) {
      if (nativeAudio) {
        setActive((current) =>
          current?.prayer === prayer ? { prayer, nativeAudio } : current,
        );
      }
      return;
    }
    shown.current.add(key);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActive({ prayer, nativeAudio });
  };

  const close = () => {
    stopAdhan();
    setActive(null);
  };

  const channelName = (id: AdhanSoundId) =>
    t("channelName", { sound: t(`settings:sounds.${id}`) });

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      configurePrayerNotifications(channelName);
    });
    return () => task.cancel();
  }, [i18n.language]);

  useEffect(() => {
    if (
      startingNow &&
      reminders[startingNow] !== false &&
      !adhanPlaysNatively()
    ) {
      show(startingNow);
    }
  }, [startingNow, reminders]);

  useEffect(
    () =>
      onPrayerNotificationOpened((prayer, nativeAudio) => {
        if (
          REMINDER_PRAYERS.includes(prayer as (typeof REMINDER_PRAYERS)[number])
        ) {
          show(prayer as PrayerName, nativeAudio);
        }
      }),
    [],
  );

  useEffect(() => onAdhanEnded(() => setActive(null)), []);

  useEffect(() => {
    if (!config) return;
    const start = new Date();
    const alerts = Array.from({ length: ALERT_DAYS }, (_, offset) =>
      prayerDates(config, addDays(start, offset)),
    ).flatMap((dates) =>
      REMINDER_PRAYERS.filter((prayer) => reminders[prayer] !== false).map(
        (prayer) => ({ prayer, date: dates[prayer] }),
      ),
    );
    syncPrayerNotifications({
      alerts,
      sound,
      customUri,
      channelName,
      playbackChannel: t("playbackChannel"),
      stopLabel: t("stopAdhan"),
      title: (prayer, date) =>
        t("notificationTitle", { prayer: label(prayer, date.getDay() === 5) }),
      body: t("notificationBody"),
    });
  }, [config, day, reminders, sound, customUri, i18n.language]);

  return (
    <AdhanSplash
      prayer={active?.prayer ?? null}
      sound={sound}
      nativeAudio={active?.nativeAudio ?? false}
      time={active && day ? day.times[active.prayer] : undefined}
      onClose={close}
    />
  );
}

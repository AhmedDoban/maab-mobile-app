import { today } from "@/store/Slices/AzkarSlice";
import { useAppSelector } from "@/store/Store";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import useStartupNotificationPermission from "./_components/useStartupNotificationPermission";
import {
  useClock,
  usePrayerConfig,
  usePrayerDay,
} from "./_components/usePrayerSchedule";
import { adhanFor, AdhanSoundId } from "./_data/adhanSounds";
import { shallowEqual } from "react-redux";
import { addDays, prayerDates } from "./_data/calculate";
import { getPrayerStartingNow } from "./_data/schedule";
import { PrayerName, REMINDER_PRAYERS } from "./_data/types";
import AdhanSplash from "./AdhanSplash";
import useMosquePresence from "./_components/useMosquePresence";

const ALERT_DAYS = 7;

export default function AdhanReminder({ ready }: { ready: boolean }) {
  const { t, i18n } = useTranslation(["prayer", "settings"]);
  const { label } = usePrayerLabels();
  const notificationsAllowed = useStartupNotificationPermission(ready);
  usePrayerLocation();
  useMosquePresence();
  const config = usePrayerConfig();
  const day = usePrayerDay(config);
  usePrayerWidgets(config, day);
  const startingNow = useClock((now) =>
    day ? getPrayerStartingNow(day.times, now) : null,
  );
  const reminders = useAppSelector((s) => s.settings.prayerReminders);
  const insideMosque = useAppSelector((s) => s.mosques.inside);
  const adhan = useAppSelector(
    (s) => ({
      adhanSound: s.settings.adhanSound,
      customAdhan: s.settings.customAdhan,
      adhanPerPrayer: s.settings.adhanPerPrayer,
      prayerAdhans: s.settings.prayerAdhans,
    }),
    shallowEqual,
  );
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
    const task = requestIdleCallback(() => {
      configurePrayerNotifications(channelName);
    });
    return () => cancelIdleCallback(task);
  }, [i18n.language]);

  useEffect(() => {
    if (
      startingNow &&
      !insideMosque &&
      reminders[startingNow] !== false &&
      !adhanPlaysNatively()
    ) {
      show(startingNow);
    }
  }, [startingNow, reminders, insideMosque]);

  useEffect(
    () =>
      onPrayerNotificationOpened((prayer, nativeAudio) => {
        if (insideMosque) return;
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
    const alerts = insideMosque
      ? []
      : Array.from({ length: ALERT_DAYS }, (_, offset) =>
          prayerDates(config, addDays(start, offset)),
        ).flatMap((dates) =>
          REMINDER_PRAYERS.filter((prayer) => reminders[prayer] !== false).map(
            (prayer) => ({ prayer, date: dates[prayer] }),
          ),
        );
    syncPrayerNotifications({
      alerts,
      adhanFor: (prayer) => adhanFor(adhan, prayer),
      channelName,
      playbackChannel: t("playbackChannel"),
      stopLabel: t("stopAdhan"),
      title: (prayer, date) =>
        t("notificationTitle", { prayer: label(prayer, date.getDay() === 5) }),
      body: (prayer) => {
        switch (prayer) {
          case "Fajr":
            return t("notificationBody.Fajr");
          case "Dhuhr":
            return t("notificationBody.Dhuhr");
          case "Asr":
            return t("notificationBody.Asr");
          case "Maghrib":
            return t("notificationBody.Maghrib");
          case "Isha":
            return t("notificationBody.Isha");
        }
      },
    });
  }, [
    config,
    day,
    reminders,
    adhan,
    i18n.language,
    notificationsAllowed,
    insideMosque,
  ]);

  return (
    <AdhanSplash
      prayer={active?.prayer ?? null}
      adhan={active ? adhanFor(adhan, active.prayer) : null}
      nativeAudio={active?.nativeAudio ?? false}
      time={active && day ? day.times[active.prayer] : undefined}
      onClose={close}
    />
  );
}

import {
  ensureNotificationPermission,
  hasNotificationPermission,
} from "@/features/prayer-times/_components/prayerNotifications";
import { setReminder } from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import { useCallback, useEffect, useState } from "react";

export default function useAzkarReminderSetting(
  kind: "morning" | "evening",
  onDenied: () => void,
) {
  const dispatch = useAppDispatch();
  const setting = useAppSelector((state) => state.settings.reminders[kind]);
  const [granted, setGranted] = useState(true);

  useEffect(() => {
    hasNotificationPermission()
      .then(setGranted)
      .catch(() => {});
  }, []);

  const setEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled && !(await ensureNotificationPermission())) {
        setGranted(false);
        onDenied();
        return;
      }
      setGranted(true);
      dispatch(setReminder({ kind, patch: { enabled } }));
    },
    [dispatch, kind, onDenied],
  );

  const setTime = useCallback(
    (time: string) => {
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) return;
      dispatch({
        type: setReminder.type,
        payload: { kind, patch: { time } },
      });
    },
    [dispatch, kind],
  );

  return {
    enabled: setting.enabled && granted,
    time: setting.time,
    setEnabled,
    setTime,
  };
}

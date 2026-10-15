import { ensureNotificationPermission } from "@/features/prayer-times/_components/prayerNotifications";
import { setLockScreenPrayer } from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import { useCallback } from "react";

export default function useLockScreenPrayer() {
  const dispatch = useAppDispatch();
  const enabled = useAppSelector((s) => s.settings.lockScreenPrayer);

  const toggle = useCallback(
    async (value: boolean) => {
      if (value && !(await ensureNotificationPermission())) return;
      dispatch(setLockScreenPrayer(value));
    },
    [dispatch],
  );

  return { enabled, toggle };
}

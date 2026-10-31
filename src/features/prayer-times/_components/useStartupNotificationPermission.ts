import { useAppSelector } from "@/store/Store";
import { useEffect, useState } from "react";
import { REMINDER_PRAYERS } from "../_data/types";
import { ensureNotificationPermission } from "./prayerNotifications";

export default function useStartupNotificationPermission(ready: boolean) {
  const wanted = useAppSelector((s) =>
    REMINDER_PRAYERS.some((p) => s.settings.prayerReminders[p] !== false),
  );
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (!ready || !wanted) return;
    let active = true;
    ensureNotificationPermission()
      .then((value) => {
        if (active) setGranted(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [ready]);

  return granted;
}

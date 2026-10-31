import {
  useClock,
  usePrayerConfig,
} from "@/features/prayer-times/_components/usePrayerSchedule";
import { prayerDates } from "@/features/prayer-times/_data/calculate";
import { useMemo } from "react";

const THURSDAY = 4;
const FRIDAY = 5;
const FALLBACK_MAGHRIB_HOUR = 18;

export default function useKahfTime() {
  const config = usePrayerConfig();
  const dayKey = useClock((now) => now.toDateString());
  const maghrib = useMemo(
    () =>
      config ? prayerDates(config, new Date(dayKey)).Maghrib.getTime() : null,
    [config, dayKey],
  );

  return useClock((now) => {
    const afterMaghrib =
      maghrib === null
        ? now.getHours() >= FALLBACK_MAGHRIB_HOUR
        : now.getTime() >= maghrib;
    const day = now.getDay();
    return (
      (day === THURSDAY && afterMaghrib) || (day === FRIDAY && !afterMaghrib)
    );
  });
}

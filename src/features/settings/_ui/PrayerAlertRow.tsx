import usePrayerReminder from "@/features/prayer-times/_components/usePrayerReminder";
import type { PrayerName } from "@/features/prayer-times/_data/types";
import { memo } from "react";
import SettingsSwitchRow from "./SettingsSwitchRow";

export default memo(function PrayerAlertRow({
  prayer,
  label,
  onDenied,
}: {
  prayer: PrayerName;
  label: string;
  onDenied: () => void;
}) {
  const { enabled, toggle } = usePrayerReminder(prayer, onDenied);

  return (
    <SettingsSwitchRow title={label} value={enabled} onValueChange={toggle} />
  );
});

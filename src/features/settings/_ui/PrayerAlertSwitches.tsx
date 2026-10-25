import usePrayerLabels from "@/features/prayer-times/_components/usePrayerLabels";
import { REMINDER_PRAYERS } from "@/features/prayer-times/_data/types";
import NotificationPermissionDialog from "@/features/prayer-times/_ui/NotificationPermissionDialog";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import PrayerAlertRow from "./PrayerAlertRow";
import SettingsGroup from "./SettingsGroup";

export default function PrayerAlertSwitches() {
  const { t } = useTranslation("settings");
  const { label } = usePrayerLabels();
  const [denied, setDenied] = useState(false);
  const onDenied = useCallback(() => setDenied(true), []);
  const close = useCallback(() => setDenied(false), []);

  return (
    <SettingsGroup title={t("prayerAlerts")}>
      {REMINDER_PRAYERS.map((prayer, i) => (
        <View
          key={prayer}
          className={i > 0 ? "border-t border-line pt-3" : undefined}
        >
          <PrayerAlertRow
            prayer={prayer}
            label={label(prayer, false)}
            onDenied={onDenied}
          />
        </View>
      ))}
      <NotificationPermissionDialog visible={denied} onClose={close} />
    </SettingsGroup>
  );
}

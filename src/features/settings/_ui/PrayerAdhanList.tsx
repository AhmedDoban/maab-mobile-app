import usePrayerLabels from "@/features/prayer-times/_components/usePrayerLabels";
import { adhanFor } from "@/features/prayer-times/_data/adhanSounds";
import {
  PrayerName,
  REMINDER_PRAYERS,
} from "@/features/prayer-times/_data/types";
import { useAppSelector } from "@/store/Store";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { shallowEqual } from "react-redux";
import useSettingsColors from "../_components/useSettingsColors";
import PrayerAdhanRow from "./PrayerAdhanRow";
import PrayerAdhanSheet from "./PrayerAdhanSheet";
import SettingsGroup from "./SettingsGroup";

export default function PrayerAdhanList() {
  const { t } = useTranslation("settings");
  const { label } = usePrayerLabels();
  const palette = useSettingsColors();
  const [open, setOpen] = useState<PrayerName | null>(null);
  const settings = useAppSelector(
    (s) => ({
      adhanSound: s.settings.adhanSound,
      customAdhan: s.settings.customAdhan,
      adhanPerPrayer: s.settings.adhanPerPrayer,
      prayerAdhans: s.settings.prayerAdhans,
    }),
    shallowEqual,
  );
  const close = useCallback(() => setOpen(null), []);

  return (
    <SettingsGroup title={t("prayerAdhans")}>
      {REMINDER_PRAYERS.map((prayer, i) => {
        const adhan = adhanFor(settings, prayer);
        const sound =
          adhan.sound === "custom"
            ? (adhan.custom?.name ?? t("sounds.custom"))
            : t(`sounds.${adhan.sound}`);
        return (
          <View
            key={prayer}
            className={i > 0 ? "border-t" : undefined}
            style={i > 0 ? { borderColor: palette.border } : undefined}
          >
            <PrayerAdhanRow
              prayer={prayer}
              label={label(prayer, false)}
              sound={sound}
              onPress={setOpen}
            />
          </View>
        );
      })}
      {open ? <PrayerAdhanSheet prayer={open} onClose={close} /> : null}
    </SettingsGroup>
  );
}

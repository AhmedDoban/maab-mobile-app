import { setAdhanPerPrayer } from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import AdhanSoundPicker from "../_ui/AdhanSoundPicker";
import PrayerAdhanList from "../_ui/PrayerAdhanList";
import PrayerAlertSwitches from "../_ui/PrayerAlertSwitches";
import SettingsGroup from "../_ui/SettingsGroup";
import SettingsSwitchRow from "../_ui/SettingsSwitchRow";

export default function AdhanSection() {
  const { t } = useTranslation("settings");
  const dispatch = useAppDispatch();
  const perPrayer = useAppSelector((s) => s.settings.adhanPerPrayer);

  return (
    <>
      <PrayerAlertSwitches />
      <SettingsGroup title={t("adhanSound")}>
        <SettingsSwitchRow
          title={t("sameAdhan.title")}
          subtitle={t("sameAdhan.hint")}
          value={!perPrayer}
          onValueChange={(same) => dispatch(setAdhanPerPrayer(!same))}
        />
      </SettingsGroup>
      {perPrayer ? (
        <PrayerAdhanList />
      ) : (
        <View className="gap-3">
          <AdhanSoundPicker />
        </View>
      )}
    </>
  );
}

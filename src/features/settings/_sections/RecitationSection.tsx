import {
  setRecitationInApp,
  setRecitationLockScreen,
} from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import { useTranslation } from "react-i18next";
import SettingsGroup from "../_ui/SettingsGroup";
import SettingsSwitchRow from "../_ui/SettingsSwitchRow";

export default function RecitationSection() {
  const { t } = useTranslation("settings");
  const dispatch = useAppDispatch();
  const inApp = useAppSelector((s) => s.settings.recitationInApp);
  const lockScreen = useAppSelector((s) => s.settings.recitationLockScreen);

  return (
    <SettingsGroup title={t("playback")}>
      <SettingsSwitchRow
        title={t("recitationInApp.title")}
        subtitle={t("recitationInApp.hint")}
        value={inApp}
        onValueChange={(value) => dispatch(setRecitationInApp(value))}
      />
      <SettingsSwitchRow
        title={t("recitationLockScreen.title")}
        subtitle={t("recitationLockScreen.hint")}
        value={lockScreen}
        onValueChange={(value) => dispatch(setRecitationLockScreen(value))}
      />
    </SettingsGroup>
  );
}

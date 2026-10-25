import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { setShowSplash } from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import { useTranslation } from "react-i18next";
import PalettePicker from "../_ui/PalettePicker";
import PrayerCardStylePicker from "../_ui/PrayerCardStylePicker";
import SettingsGroup from "../_ui/SettingsGroup";
import SettingsSwitchRow from "../_ui/SettingsSwitchRow";

export default function AppearanceSection() {
  const { t } = useTranslation("settings");
  const dispatch = useAppDispatch();
  const showSplash = useAppSelector((s) => s.settings.showSplash);

  return (
    <>
      <SettingsGroup title={t("theme")}>
        <ThemeSwitcher />
      </SettingsGroup>
      <SettingsGroup title={t("appColor")}>
        <PalettePicker />
      </SettingsGroup>
      <SettingsGroup title={t("prayerCardStyle")}>
        <PrayerCardStylePicker />
      </SettingsGroup>
      <SettingsGroup title={t("startup")}>
        <SettingsSwitchRow
          title={t("showSplash.title")}
          subtitle={t("showSplash.hint")}
          value={showSplash}
          onValueChange={(value) => dispatch(setShowSplash(value))}
        />
      </SettingsGroup>
    </>
  );
}

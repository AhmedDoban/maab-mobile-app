import AppText from "@/components/ui/AppText";
import PressableScale from "@/components/ui/PressableScale";
import useCityName from "@/features/prayer-times/_components/useCityName";
import usePrayerLocation from "@/features/prayer-times/_components/usePrayerLocation";
import { resolveAsr } from "@/features/prayer-times/_data/methods";
import { setAsrMethod, setPrayerMethod } from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import useLockScreenPrayer from "../_components/useLockScreenPrayer";
import useSettingsColors from "../_components/useSettingsColors";
import PrayerMethodList from "./PrayerMethodList";
import SettingsCard from "./SettingsCard";
import SettingsIconBadge from "./SettingsIconBadge";
import SettingsSwitchRow from "./SettingsSwitchRow";

export default function PrayerSettings() {
  const { t } = useTranslation("settings");
  const dispatch = useAppDispatch();
  const palette = useSettingsColors();
  const method = useAppSelector((s) => s.settings.prayerMethod);
  const asr = useAppSelector((s) => s.settings.asrMethod);
  const lockScreen = useLockScreenPrayer();
  const { location, status, retry } = usePrayerLocation();
  const city = useCityName(location?.city);
  const loading = status === "loading";

  return (
    <View className="gap-3">
      <SettingsCard>
        <View className="flex-row items-center gap-3">
          <SettingsIconBadge icon="location" size={16} />
          <View className="flex-1 gap-0.5">
            <AppText weight="bold" className="text-[15px]">
              {city ?? (location ? t("savedLocation") : t("locationUnknown"))}
            </AppText>
            <AppText className="text-xs" style={{ color: palette.subtitle }}>
              {t("prayerLocation")}
            </AppText>
          </View>
          <PressableScale
            onPress={retry}
            disabled={loading}
            accessibilityRole="button"
            className="rounded-full px-3.5 py-2"
            style={{
              backgroundColor: palette.track,
              opacity: loading ? 0.5 : 1,
            }}
          >
            <AppText weight="bold" className="text-xs">
              {t("updateLocation")}
            </AppText>
          </PressableScale>
        </View>
        <View className="border-t pt-3" style={{ borderColor: palette.border }}>
          <SettingsSwitchRow
            title={t("hanafiAsr.title")}
            subtitle={t("hanafiAsr.hint")}
            value={resolveAsr(asr) === "hanafi"}
            onValueChange={(value) =>
              dispatch(setAsrMethod(value ? "hanafi" : "shafi"))
            }
          />
        </View>
      </SettingsCard>

      {Platform.OS === "android" ? (
        <SettingsCard>
          <SettingsSwitchRow
            title={t("lockScreenPrayer.title")}
            subtitle={t("lockScreenPrayer.hint")}
            value={lockScreen.enabled}
            onValueChange={lockScreen.toggle}
          />
        </SettingsCard>
      ) : null}

      <AppText
        weight="bold"
        className="px-1 pt-1 text-sm"
        style={{ color: palette.title }}
      >
        {t("prayerMethod")}
      </AppText>
      <PrayerMethodList
        value={method}
        onChange={(value) => dispatch(setPrayerMethod(value))}
      />
    </View>
  );
}

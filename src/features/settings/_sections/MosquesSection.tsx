import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import useThemeColors from "@/hooks/useThemeColors";
import {
  addMosque,
  removeMosque,
  setActiveMosque,
} from "@/store/Slices/MosquesSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { useState } from "react";
import { useEffect } from "react";
import { TextInput, View } from "react-native";
import {
  createMosque,
  IQAMA_PRAYERS,
} from "@/features/prayer-times/_data/mosques";
import usePrayerLabels from "@/features/prayer-times/_components/usePrayerLabels";
import IqamaRow from "../_ui/IqamaRow";
import IqamaCountdown from "../_ui/IqamaCountdown";
import SettingsCard from "../_ui/SettingsCard";
import { useTranslation } from "react-i18next";
import { usePrayerConfig } from "@/features/prayer-times/_components/usePrayerSchedule";
import { distanceKm } from "@/features/prayer-times/_data/geo";
import useLocalDigits from "@/features/quran/_components/useLocalDigits";
import ResetDialog, { ResetDialogContent } from "../_ui/ResetDialog";

export default function MosquesSection() {
  const colors = useThemeColors();
  const { t } = useTranslation("settings");
  const dispatch = useAppDispatch();
  const { label } = usePrayerLabels();
  const mosques = useAppSelector((state) => state.mosques);
  const prayerConfig = usePrayerConfig();
  const localDigits = useLocalDigits();
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [name, setName] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Location.getLastKnownPositionAsync().then((position) => {
      if (active && position) setLocation(position.coords);
    });
    return () => {
      active = false;
    };
  }, []);

  const addCurrent = async () => {
    const mosqueName = name.trim();
    if (!mosqueName) return;
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return;
    const position =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }));
    dispatch(
      addMosque(
        createMosque(
          mosqueName,
          position.coords.latitude,
          position.coords.longitude,
        ),
      ),
    );
    setLocation(position.coords);
    setName("");
    if (Constants.appOwnership !== "expo") {
      Location.requestBackgroundPermissionsAsync().catch((error) => {
        console.warn("Failed to request background location permission", error);
      });
    }
  };

  return (
    <View className="gap-4">
      <SettingsCard className="gap-4">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-main-soft">
            <Icon name="location" size={22} tintColor={colors.main} />
          </View>
          <View className="flex-1 gap-1">
            <AppText weight="bold" className="text-lg">
              {mosques.items.length ? t("addMosque") : t("addFirstMosque")}
            </AppText>
            <AppText className="text-sm text-main-gray">
              {t("saveCurrentMosque")}
            </AppText>
          </View>
        </View>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t("mosqueName")}
          placeholderTextColor={colors.gray}
          className="rounded-2xl border border-line bg-main-bg px-4 text-ink"
          style={{
            writingDirection: "rtl",
            textAlign: "right",
            paddingHorizontal: 16,
            height: 52,
          }}
        />
        <PressableScale
          onPress={addCurrent}
          disabled={!name.trim()}
          className="flex-row items-center justify-center gap-2 rounded-2xl px-4"
          style={{
            backgroundColor: colors.main,
            opacity: name.trim() ? 1 : 0.5,
            paddingHorizontal: 16,
            height: 52,
          }}
        >
          <Icon name="location" size={20} tintColor={colors.onFill} />
          <AppText weight="bold" style={{ color: colors.onFill }}>
            {t("saveCurrentMosque")}
          </AppText>
        </PressableScale>
      </SettingsCard>

      {mosques.items.map((mosque) => {
        const distance = location ? distanceKm(location, mosque) * 1000 : null;
        const distanceText =
          distance === null
            ? undefined
            : distance < 1000
              ? t("distanceFromMosque", {
                  distance: `${localDigits(Math.round(distance))} ${t("meters")}`,
                })
              : t("distanceFromMosque", {
                  distance: `${localDigits(Number((distance / 1000).toFixed(1)))} ${t("kilometers")}`,
                });
        return (
          <SettingsCard
            key={mosque.id}
            className="gap-4"
            style={{
              borderColor:
                mosques.activeId === mosque.id ? colors.main : colors.line,
              borderWidth: mosques.activeId === mosque.id ? 1.5 : 1,
            }}
          >
            {prayerConfig ? (
              <IqamaCountdown
                mosque={mosque}
                config={prayerConfig}
                label={label}
                title={t("nextIqama")}
                active={mosques.activeId === mosque.id}
                onToggle={() =>
                  dispatch(
                    setActiveMosque(
                      mosques.activeId === mosque.id ? null : mosque.id,
                    ),
                  )
                }
                insideLabel={
                  mosques.activeId === mosque.id
                    ? t("insideMosque")
                    : t("markInside")
                }
                distanceText={distanceText}
              />
            ) : null}
            {IQAMA_PRAYERS.map((prayer) => (
              <IqamaRow
                key={prayer}
                mosqueId={mosque.id}
                prayer={prayer}
                label={label(prayer, false)}
              />
            ))}
            <PressableScale
              onPress={() => setPendingDeleteId(mosque.id)}
              className="flex-row items-center justify-center gap-2 rounded-2xl border border-error/30 px-3 py-3"
              style={{ paddingHorizontal: 12, paddingVertical: 12 }}
            >
              <Icon name="resetAll" size={18} tintColor={colors.error} />
              <AppText className="text-error">{t("deleteMosque")}</AppText>
            </PressableScale>
          </SettingsCard>
        );
      })}
      <ResetDialog
        content={
          pendingDeleteId
            ? ({
                icon: "resetAll",
                title: t("confirm.mosque.title"),
                message: t("confirm.mosque.message"),
                confirmLabel: t("confirm.mosque.action"),
                doneText: t("confirm.mosque.done"),
                danger: true,
                onConfirm: () => dispatch(removeMosque(pendingDeleteId)),
              } satisfies ResetDialogContent)
            : null
        }
        onClose={() => setPendingDeleteId(null)}
      />
    </View>
  );
}

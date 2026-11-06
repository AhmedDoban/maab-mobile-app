import AppText from "@/components/ui/AppText";
import PressableScale from "@/components/ui/PressableScale";
import DateTimePicker from "@react-native-community/datetimepicker";
import usePrayerLabels from "@/features/prayer-times/_components/usePrayerLabels";
import SettingsGroup from "./SettingsGroup";
import SettingsSwitchRow from "./SettingsSwitchRow";
import useAzkarReminderSetting from "../_components/useAzkarReminderSetting";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, View } from "react-native";
import { useState } from "react";
import useSettingsColors from "../_components/useSettingsColors";

export default function AzkarReminderCard({
  kind,
  onDenied,
}: {
  kind: "morning" | "evening";
  onDenied: () => void;
}) {
  const { t } = useTranslation("settings");
  const palette = useSettingsColors();
  const { formatTime } = usePrayerLabels();
  const { enabled, time, setEnabled, setTime } = useAzkarReminderSetting(
    kind,
    onDenied,
  );
  const [pickerVisible, setPickerVisible] = useState(false);
  const [hours, minutes] = time.split(":").map(Number);
  const currentTime = new Date();
  currentTime.setHours(hours, minutes, 0, 0);
  const [draftTime, setDraftTime] = useState(currentTime);

  const openPicker = () => {
    setDraftTime(currentTime);
    setPickerVisible(true);
  };

  const saveTime = () => {
    setTime(
      `${String(draftTime.getHours()).padStart(2, "0")}:${String(draftTime.getMinutes()).padStart(2, "0")}`,
    );
    setPickerVisible(false);
  };

  return (
    <SettingsGroup title={t(`reminders.${kind}.group`)}>
      <SettingsSwitchRow
        title={t(`reminders.${kind}.title`)}
        subtitle={t(`reminders.${kind}.hint`)}
        value={enabled}
        onValueChange={setEnabled}
      />
      {enabled ? (
        <View className="flex-row items-center justify-between border-t border-line pt-3">
          <AppText className="text-sm" style={{ color: palette.subtitle }}>
            {t("reminders.time")}
          </AppText>
          <PressableScale
            onPress={openPicker}
            className="w-24 items-center justify-center rounded-xl border border-line bg-main-bg"
            style={{ height: 42 }}
          >
            <AppText
              weight="bold"
              className="text-ink"
              style={{ color: palette.title, writingDirection: "ltr" }}
            >
              {formatTime(time)}
            </AppText>
          </PressableScale>
        </View>
      ) : null}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 px-6"
          onPress={() => setPickerVisible(false)}
        >
          <Pressable
            className="w-full max-w-sm rounded-3xl bg-surface p-4"
            onPress={(event) => event.stopPropagation()}
          >
            <DateTimePicker
              value={draftTime}
              mode="time"
              display="spinner"
              is24Hour={false}
              onChange={(_, value) => {
                if (value) setDraftTime(value);
              }}
            />
            <View className="mt-3 flex-row gap-3">
              <PressableScale
                onPress={() => setPickerVisible(false)}
                className="flex-1 items-center rounded-2xl bg-surface-muted py-3"
              >
                <AppText>{t("cancel")}</AppText>
              </PressableScale>
              <PressableScale
                onPress={saveTime}
                className="flex-1 items-center rounded-2xl bg-main py-3"
              >
                <AppText className="text-white">{t("saveTime")}</AppText>
              </PressableScale>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SettingsGroup>
  );
}

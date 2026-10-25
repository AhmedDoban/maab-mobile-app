import BottomSheet from "@/components/ui/BottomSheet";
import SheetHeader from "@/components/ui/SheetHeader";
import usePrayerLabels from "@/features/prayer-times/_components/usePrayerLabels";
import {
  adhanFor,
  AdhanSoundId,
  CustomAdhan,
} from "@/features/prayer-times/_data/adhanSounds";
import type { PrayerName } from "@/features/prayer-times/_data/types";
import {
  setPrayerAdhan,
  setPrayerCustomAdhan,
} from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { shallowEqual } from "react-redux";
import useAdhanUpload from "../_components/useAdhanUpload";
import AdhanSoundList from "./AdhanSoundList";

export default function PrayerAdhanSheet({
  prayer,
  onClose,
}: {
  prayer: PrayerName;
  onClose: () => void;
}) {
  const { t } = useTranslation("settings");
  const { label } = usePrayerLabels();
  const dispatch = useAppDispatch();
  const adhan = useAppSelector(
    (s) => adhanFor({ ...s.settings, adhanPerPrayer: true }, prayer),
    shallowEqual,
  );
  const custom = useAppSelector(
    (s) => s.settings.prayerAdhans[prayer]?.custom ?? s.settings.customAdhan,
  );
  const onFile = useCallback(
    (file: CustomAdhan) => dispatch(setPrayerCustomAdhan({ prayer, file })),
    [dispatch, prayer],
  );
  const upload = useAdhanUpload(prayer, onFile);
  const select = useCallback(
    (sound: AdhanSoundId) => dispatch(setPrayerAdhan({ prayer, sound })),
    [dispatch, prayer],
  );

  return (
    <BottomSheet
      visible
      onClose={onClose}
      header={
        <SheetHeader
          title={t("prayerAdhanFor", { prayer: label(prayer, false) })}
          onClose={onClose}
        />
      }
    >
      <ScrollView contentContainerClassName="gap-3 pb-2">
        <AdhanSoundList
          selected={adhan.sound}
          custom={custom}
          onSelect={select}
          onUpload={upload}
        />
      </ScrollView>
    </BottomSheet>
  );
}

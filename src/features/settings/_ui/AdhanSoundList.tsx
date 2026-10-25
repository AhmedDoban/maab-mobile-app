import useAdhanPlayer from "@/features/prayer-times/_components/useAdhanPlayer";
import {
  ADHAN_SOUNDS,
  AdhanSoundId,
  CustomAdhan,
} from "@/features/prayer-times/_data/adhanSounds";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdhanSoundCard from "./AdhanSoundCard";

export default function AdhanSoundList({
  selected,
  custom,
  onSelect,
  onUpload,
}: {
  selected: AdhanSoundId;
  custom: CustomAdhan | null;
  onSelect: (id: AdhanSoundId) => void;
  onUpload: () => Promise<void>;
}) {
  const { t } = useTranslation("settings");
  const { current, play, stop } = useAdhanPlayer();

  useFocusEffect(useCallback(() => stop, [stop]));
  useEffect(() => stop, [stop]);

  const toggle = (id: AdhanSoundId) => {
    if (current === id) stop();
    else play(id, custom);
  };

  const select = (id: AdhanSoundId) => {
    Haptics.selectionAsync();
    onSelect(id);
  };

  const upload = () => {
    stop();
    onUpload();
  };

  return ADHAN_SOUNDS.map(({ id, source }) => {
    const previewLabel = t(current === id ? "stopAdhan" : "previewAdhan");
    if (id === "custom") {
      return (
        <AdhanSoundCard
          key={id}
          label={custom?.name ?? t("sounds.custom")}
          hint={t(custom ? "soundHints.customNotice" : "soundHints.custom")}
          selected={selected === id}
          playing={current === id}
          previewLabel={previewLabel}
          onPress={custom ? () => select(id) : upload}
          onPreview={custom ? () => toggle(id) : undefined}
          changeLabel={t("changeFile")}
          onChange={custom ? upload : undefined}
        />
      );
    }
    return (
      <AdhanSoundCard
        key={id}
        label={t(`sounds.${id}`)}
        hint={t(`soundHints.${id === "other" ? "other" : "reciter"}`)}
        selected={selected === id}
        playing={current === id}
        previewLabel={previewLabel}
        onPress={() => select(id)}
        onPreview={source ? () => toggle(id) : undefined}
      />
    );
  });
}

import type {
  AdhanSoundId,
  CustomAdhan,
} from "@/features/prayer-times/_data/adhanSounds";
import { setAdhanSound, setCustomAdhan } from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import { useCallback } from "react";
import useAdhanUpload from "../_components/useAdhanUpload";
import AdhanSoundList from "./AdhanSoundList";

export default function AdhanSoundPicker() {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.settings.adhanSound);
  const custom = useAppSelector((s) => s.settings.customAdhan);
  const onFile = useCallback(
    (file: CustomAdhan) => dispatch(setCustomAdhan(file)),
    [dispatch],
  );
  const upload = useAdhanUpload("all", onFile);
  const select = useCallback(
    (id: AdhanSoundId) => dispatch(setAdhanSound(id)),
    [dispatch],
  );

  return (
    <AdhanSoundList
      selected={selected}
      custom={custom}
      onSelect={select}
      onUpload={upload}
    />
  );
}

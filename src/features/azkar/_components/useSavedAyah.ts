import { toggleSavedAyah } from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";

export default function useSavedAyah(surah: number, ayah: number) {
  const key = `${surah}:${ayah}`;
  const dispatch = useAppDispatch();
  const saved = useAppSelector((s) => s.settings.savedAyahs.includes(key));
  const toggle = useCallback(() => {
    Haptics.selectionAsync();
    dispatch(toggleSavedAyah(key));
  }, [dispatch, key]);

  return { saved, toggle };
}

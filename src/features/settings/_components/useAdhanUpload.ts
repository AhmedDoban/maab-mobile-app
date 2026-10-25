import pickCustomAdhan from "@/features/prayer-times/_components/pickCustomAdhan";
import type { CustomAdhan } from "@/features/prayer-times/_data/adhanSounds";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";

export default function useAdhanUpload(
  slot: string,
  onFile: (file: CustomAdhan) => void,
) {
  return useCallback(async () => {
    try {
      const file = await pickCustomAdhan(slot);
      if (!file) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onFile(file);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [slot, onFile]);
}

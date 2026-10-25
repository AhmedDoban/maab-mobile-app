import { FRAME_IMAGES } from "@/features/quran/_data/frameImages";
import { setSurahFrame } from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { View } from "react-native";
import SurahFramePreview from "./SurahFramePreview";

const FRAME_IDS = Array.from({ length: FRAME_IMAGES.length }, (_, i) => i + 1);

export default function SurahFramePicker() {
  const dispatch = useAppDispatch();
  const current = useAppSelector((s) => s.settings.surahFrame);

  const choose = useCallback(
    (id: number) => {
      Haptics.selectionAsync();
      dispatch(setSurahFrame(id));
    },
    [dispatch],
  );

  return (
    <View className="gap-3">
      {FRAME_IDS.map((id) => (
        <SurahFramePreview
          key={id}
          id={id}
          selected={id === current}
          onPress={choose}
        />
      ))}
    </View>
  );
}

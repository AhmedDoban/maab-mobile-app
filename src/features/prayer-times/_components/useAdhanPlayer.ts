import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { useAppSelector } from "@/store/Store";
import { useCallback, useEffect, useState } from "react";
import { adhanSource, AdhanSoundId, CustomAdhan } from "../_data/adhanSounds";

export default function useAdhanPlayer() {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const custom = useAppSelector((s) => s.settings.customAdhan);
  const [current, setCurrent] = useState<AdhanSoundId | null>(null);

  useEffect(() => {
    if (status.didJustFinish) setCurrent(null);
  }, [status.didJustFinish]);

  const play = useCallback(
    (id: AdhanSoundId, file?: CustomAdhan | null) => {
      const source = adhanSource(id, file ?? custom);
      if (!source) return;
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
      try {
        player.replace(source);
        player.seekTo(0);
        player.play();
        setCurrent(id);
      } catch {}
    },
    [player, custom],
  );

  const stop = useCallback(() => {
    try {
      player.pause();
    } catch {}
    setCurrent(null);
  }, [player]);

  return { current, play, stop };
}

import type { AudioPlayer, AudioStatus } from "expo-audio";
import { useEffect, useState } from "react";

type Flags = { playing: boolean; didJustFinish: boolean };

const flagsOf = (status: AudioStatus): Flags => ({
  playing: status.playing,
  didJustFinish: status.didJustFinish,
});

const merge = (old: Flags, status: AudioStatus) =>
  old.playing === status.playing && old.didJustFinish === status.didJustFinish
    ? old
    : flagsOf(status);

export default function useAudioFlags(player: AudioPlayer) {
  const [flags, setFlags] = useState(() => flagsOf(player.currentStatus));

  useEffect(() => {
    setFlags((old) => merge(old, player.currentStatus));
    const subscription = player.addListener("playbackStatusUpdate", (status) =>
      setFlags((old) => merge(old, status)),
    );
    return () => subscription.remove();
  }, [player]);

  return flags;
}

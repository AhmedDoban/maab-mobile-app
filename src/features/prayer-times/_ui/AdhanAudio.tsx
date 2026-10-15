import { useEffect, useRef } from "react";
import useAdhanPlayer from "../_components/useAdhanPlayer";
import { AdhanSoundId } from "../_data/adhanSounds";

export default function AdhanAudio({
  sound,
  onEnd,
}: {
  sound: AdhanSoundId;
  onEnd: () => void;
}) {
  const { current, play, stop } = useAdhanPlayer();
  const started = useRef(false);

  useEffect(() => {
    play(sound);
    return stop;
  }, []);

  useEffect(() => {
    if (current) started.current = true;
    else if (started.current) onEnd();
  }, [current]);

  return null;
}

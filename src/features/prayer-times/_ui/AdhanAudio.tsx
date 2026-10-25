import { useEffect, useRef } from "react";
import useAdhanPlayer from "../_components/useAdhanPlayer";
import { AdhanChoice } from "../_data/adhanSounds";

export default function AdhanAudio({
  adhan,
  onEnd,
}: {
  adhan: AdhanChoice;
  onEnd: () => void;
}) {
  const { current, play, stop } = useAdhanPlayer();
  const started = useRef(false);

  useEffect(() => {
    play(adhan.sound, adhan.custom);
    return stop;
  }, []);

  useEffect(() => {
    if (current) started.current = true;
    else if (started.current) onEnd();
  }, [current]);

  return null;
}

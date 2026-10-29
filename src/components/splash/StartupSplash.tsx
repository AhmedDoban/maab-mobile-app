import { useAppSelector } from "@/store/Store";
import { useState } from "react";
import { useReducedMotion } from "react-native-reanimated";
import AnimatedSplash from "./AnimatedSplash";

export default function StartupSplash({ onDone }: { onDone: () => void }) {
  const enabled = useAppSelector((s) => s.settings.showSplash);
  const reducedMotion = useReducedMotion();
  const [show] = useState(enabled && !reducedMotion);

  return show ? <AnimatedSplash onDone={onDone} /> : null;
}

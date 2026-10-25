import { useAppSelector } from "@/store/Store";
import { useState } from "react";
import AnimatedSplash from "./AnimatedSplash";

export default function StartupSplash({ onDone }: { onDone: () => void }) {
  const enabled = useAppSelector((s) => s.settings.showSplash);
  const [show] = useState(enabled);

  return show ? <AnimatedSplash onDone={onDone} /> : null;
}

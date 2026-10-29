import AppText from "@/components/ui/AppText";
import { PAGE_COUNT } from "@/features/azkar/_data/quran";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import useLocalDigits from "../_components/useLocalDigits";
import useMushafColors from "../_components/useMushafColors";

const THUMB_W = 64;
const HEIGHT = 30;

export default function PageSlider({
  page,
  onChange,
}: {
  page: number;
  onChange: (page: number) => void;
}) {
  const c = useMushafColors();
  const num = useLocalDigits();
  const width = useSharedValue(0);
  const progress = useSharedValue((page - 1) / (PAGE_COUNT - 1));
  const dragging = useSharedValue(false);
  const shown = useSharedValue(0);
  const [label, setLabel] = useState(page);

  useEffect(() => {
    if (dragging.get()) return;
    progress.set((page - 1) / (PAGE_COUNT - 1));
    setLabel(page);
  }, [page, dragging, progress]);

  const pan = useMemo(() => {
    const pageAt = (x: number) => {
      "worklet";
      const usable = Math.max(width.get() - THUMB_W, 1);
      const p = 1 - Math.min(1, Math.max(0, (x - THUMB_W / 2) / usable));
      progress.set(p);
      return Math.round(p * (PAGE_COUNT - 1)) + 1;
    };
    const show = (x: number) => {
      "worklet";
      const next = pageAt(x);
      if (next === shown.get()) return;
      shown.set(next);
      scheduleOnRN(setLabel, next);
    };

    return Gesture.Pan()
      .minDistance(0)
      .onBegin((e) => {
        dragging.set(true);
        shown.set(0);
        show(e.x);
      })
      .onUpdate((e) => show(e.x))
      .onEnd((e) => scheduleOnRN(onChange, pageAt(e.x)))
      .onFinalize(() => dragging.set(false));
  }, [width, progress, dragging, shown, onChange]);

  const thumb = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: (1 - progress.get()) * Math.max(width.get() - THUMB_W, 0),
      },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View
        className="flex-1 justify-center"
        style={{ height: HEIGHT + 10, direction: "ltr" }}
        onLayout={(e) => width.set(e.nativeEvent.layout.width)}
        accessibilityRole="adjustable"
        accessibilityValue={{ min: 1, max: PAGE_COUNT, now: page }}
      >
        <View
          className="h-3 rounded-full"
          style={{ backgroundColor: c.frameFill }}
        />
        <Animated.View
          className="absolute items-center justify-center rounded-full"
          style={[
            { width: THUMB_W, height: HEIGHT, backgroundColor: c.accent },
            thumb,
          ]}
        >
          <AppText weight="bold" style={{ color: "#ffffff" }}>
            {num(label)}
          </AppText>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

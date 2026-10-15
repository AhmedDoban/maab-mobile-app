import { ALL_ORIENTATIONS } from "@/constants/orientations";
import useSettingsColors from "@/features/settings/_components/useSettingsColors";
import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

const ROOT = { flex: 1, justifyContent: "flex-end" } as const;
const BACKDROP = [
  StyleSheet.absoluteFill,
  { backgroundColor: "rgba(0,0,0,0.35)" },
];

export default function BottomSheet({
  visible,
  onClose,
  header,
  children,
  closeLabel,
  className = "max-h-[85%] gap-3",
  direction,
}: {
  visible: boolean;
  onClose: () => void;
  header: ReactNode;
  children: ReactNode;
  closeLabel?: string;
  className?: string;
  direction?: ViewStyle["direction"];
}) {
  const palette = useSettingsColors();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const screenHeight = useWindowDimensions().height;
  const progress = useSharedValue(0);
  const drag = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      drag.set(0);
      progress.set(withTiming(1, { duration: 280 }));
    } else {
      progress.set(
        withTiming(0, { duration: 200 }, (finished) => {
          if (finished) scheduleOnRN(setMounted, false);
        }),
      );
    }
  }, [visible, progress, drag]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - progress.get()) * screenHeight + drag.get() },
    ],
  }));

  const dragDown = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(8)
        .onUpdate((e) => {
          drag.set(Math.max(0, e.translationY));
        })
        .onEnd((e) => {
          if (e.translationY > 120 || e.velocityY > 900) {
            scheduleOnRN(onClose);
          } else {
            drag.set(withTiming(0, { duration: 180 }));
          }
        }),
    [drag, onClose],
  );

  const rootStyle = useMemo(
    () => (direction ? { ...ROOT, direction } : ROOT),
    [direction],
  );

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      supportedOrientations={ALL_ORIENTATIONS}
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={rootStyle}>
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <Pressable
            style={BACKDROP}
            onPress={onClose}
            accessibilityLabel={closeLabel}
          />
        </Animated.View>
        <Animated.View
          className={cn(
            "w-full max-w-2xl self-center rounded-t-3xl px-4 pt-4",
            className,
          )}
          style={[
            {
              backgroundColor: palette.card,
              paddingBottom: insets.bottom + 12,
            },
            sheetStyle,
          ]}
        >
          <GestureDetector gesture={dragDown}>
            <View>
              <View className="items-center pb-3">
                <View
                  className="h-1.5 w-11 rounded-full"
                  style={{ backgroundColor: palette.border }}
                />
              </View>
              {header}
            </View>
          </GestureDetector>
          {children}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

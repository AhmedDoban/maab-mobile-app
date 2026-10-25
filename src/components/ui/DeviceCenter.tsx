import { PropsWithChildren, useRef, useState } from "react";
import { useWindowDimensions, View, type ViewInstance } from "react-native";

export default function DeviceCenter({ children }: PropsWithChildren) {
  const { height: screenHeight } = useWindowDimensions();
  const box = useRef<ViewInstance>(null);
  const [boxTop, setBoxTop] = useState<number | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const top =
    boxTop === null
      ? 0
      : Math.max(0, screenHeight / 2 - boxTop - contentHeight / 2);

  return (
    <View
      ref={box}
      className="flex-1"
      onLayout={() => box.current?.measureInWindow((_x, y) => setBoxTop(y))}
    >
      <View
        className="absolute inset-x-0"
        style={{ top, opacity: boxTop === null || !contentHeight ? 0 : 1 }}
        onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
      >
        {children}
      </View>
    </View>
  );
}

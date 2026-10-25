import { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent } from "react-native";

const RATIO = 1.5;
const MAX_HEIGHT = 150;
const WIDE_FROM = 2.2;

export default function useArtCardSize() {
  const [width, setWidth] = useState(0);
  const height = width ? Math.min(width / RATIO, MAX_HEIGHT) : 0;
  const wide = height > 0 && width / height >= WIDE_FROM;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.width);
    setWidth((current) => (current === next ? current : next));
  }, []);

  const style = useMemo(
    () => (height ? { height } : { aspectRatio: RATIO }),
    [height],
  );

  return { style, wide, onLayout };
}

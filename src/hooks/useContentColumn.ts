import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_WIDTH = 768;
const GUTTER = 16;

export default function useContentColumn() {
  const { width } = useWindowDimensions();
  const { left, right } = useSafeAreaInsets();
  const overlap = Math.max(left, right) - GUTTER;
  const maxWidth = overlap > 0 ? Math.min(MAX_WIDTH, width - overlap * 2) : 0;

  return useMemo(() => (maxWidth ? { maxWidth } : undefined), [maxWidth]);
}

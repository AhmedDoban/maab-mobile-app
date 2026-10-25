import { useCallback, useState } from "react";
import { LayoutChangeEvent, useWindowDimensions } from "react-native";

const GAP = 10;
const MAX_CONTENT = 768;
const GUTTER = 32;

const columnsFor = (width: number) => (width < 560 ? 2 : width < 840 ? 3 : 4);

export default function useGridColumns() {
  const window = useWindowDimensions().width;
  const [measured, setMeasured] = useState(0);
  const width = measured || Math.min(window - GUTTER, MAX_CONTENT);
  const columns = columnsFor(width);
  const itemWidth = Math.floor((width - GAP * (columns - 1)) / columns);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.width);
    setMeasured((current) => (current === next ? current : next));
  }, []);

  return { columns, itemWidth, gap: GAP, onLayout };
}

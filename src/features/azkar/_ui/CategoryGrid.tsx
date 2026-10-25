import { memo, useMemo } from "react";
import { View } from "react-native";
import useGridColumns from "../_components/useGridColumns";
import { AzkarCategory } from "../_data";
import CategoryTile from "./CategoryTile";

export default memo(function CategoryGrid({
  categories,
  rows,
  showProgress = true,
}: {
  categories: AzkarCategory[];
  rows?: number;
  showProgress?: boolean;
}) {
  const { columns, itemWidth, gap, onLayout } = useGridColumns();
  const visible = rows ? categories.slice(0, rows * columns) : categories;
  const cell = useMemo(() => ({ width: itemWidth }), [itemWidth]);

  return (
    <View className="flex-row flex-wrap" style={{ gap }} onLayout={onLayout}>
      {visible.map((category) => (
        <View key={category.id} style={cell}>
          <CategoryTile category={category} showProgress={showProgress} />
        </View>
      ))}
    </View>
  );
});

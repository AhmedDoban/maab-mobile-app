import { memo, ReactNode } from "react";
import { View } from "react-native";

export default memo(function MushafPagerSlot({
  page,
  width,
  height,
  renderPage,
}: {
  page: number;
  width: number;
  height: number;
  renderPage?: (page: number) => ReactNode;
}) {
  return <View style={{ width, height }}>{renderPage?.(page)}</View>;
});

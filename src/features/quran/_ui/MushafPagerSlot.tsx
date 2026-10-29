import { memo, ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export default memo(function MushafPagerSlot({
  page,
  renderPage,
}: {
  page: number;
  renderPage?: (page: number) => ReactNode;
}) {
  return <View style={styles.slot}>{renderPage?.(page)}</View>;
});

const styles = StyleSheet.create({ slot: { flex: 1 } });

import { AyahRef } from "@/features/azkar/_data/quran";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import type { PageGeometry } from "../_components/usePageGeometry";
import type { PageAyah } from "../_data/pageAyahs";
import type { PageMeta } from "../_data/pageMeta";
import AyahOverlays from "./AyahOverlays";
import PageMarkers from "./PageMarkers";

export default memo(function PageUnderlay({
  meta,
  ayahs,
  active,
  toBox,
}: {
  meta: PageMeta;
  ayahs: PageAyah[];
  active: AyahRef | null;
  toBox: PageGeometry["toBox"];
}) {
  return (
    <View pointerEvents="none" style={styles.layer}>
      <AyahOverlays ayahs={ayahs} active={active} toBox={toBox} />
      <PageMarkers meta={meta} toBox={toBox} />
    </View>
  );
});

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    direction: "ltr",
  },
});

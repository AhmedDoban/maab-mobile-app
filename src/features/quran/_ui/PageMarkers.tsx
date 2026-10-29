import { memo } from "react";
import { StyleSheet } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import type { PageGeometry } from "../_components/usePageGeometry";
import useMushafColors from "../_components/useMushafColors";
import { markerGroups } from "../_data/markerGroups";
import type { PageMeta } from "../_data/pageMeta";

export default memo(function PageMarkers({
  meta,
  toBox,
}: {
  meta: PageMeta;
  toBox: PageGeometry["toBox"];
}) {
  const c = useMushafColors();

  return markerGroups(meta).map(({ x, y, width, height, markers }) => (
    <Svg
      key={`${x}-${y}`}
      style={[styles.marker, toBox(x, y, width, height)]}
      viewBox={`${x} ${y} ${width} ${height}`}
    >
      <G transform={meta.transform} color={c.accent}>
        {markers.map(([transform, d, evenOdd], i) => (
          <G key={i} transform={transform}>
            <Path
              d={meta.ds[d]}
              fill="currentColor"
              fillRule={evenOdd ? "evenodd" : "nonzero"}
            />
          </G>
        ))}
      </G>
    </Svg>
  ));
});

const styles = StyleSheet.create({ marker: { position: "absolute" } });

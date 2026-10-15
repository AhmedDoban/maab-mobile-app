import { memo } from "react";
import { StyleSheet } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import useMushafColors from "../_components/useMushafColors";
import type { PageMeta } from "../_data/pageMeta";

export default memo(function PageMarkers({
  meta,
  preserveAspectRatio,
}: {
  meta: PageMeta;
  preserveAspectRatio: string;
}) {
  const c = useMushafColors();

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox={meta.viewBox}
      preserveAspectRatio={preserveAspectRatio}
    >
      <G transform={meta.transform} color={c.accent}>
        {meta.markers.map(([transform, d, evenOdd], i) => (
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
  );
});

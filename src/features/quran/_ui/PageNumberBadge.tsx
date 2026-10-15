import AppText from "@/components/ui/AppText";
import { toArabicDigits } from "@/features/azkar/_data/quran";
import { memo } from "react";
import { View } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import useMushafColors from "../_components/useMushafColors";
import {
  AYAH_MARKER_PATH,
  PAGE_BADGE_TRANSFORM,
  PAGE_BADGE_VIEWBOX,
} from "../_data/ayahMarker";

const HEIGHT = 32;
const WIDTH = HEIGHT * 1.75;

export default memo(function PageNumberBadge({ page }: { page: number }) {
  const c = useMushafColors();

  return (
    <View
      style={{ width: WIDTH, height: HEIGHT }}
      className="items-center justify-center"
    >
      <Svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={PAGE_BADGE_VIEWBOX}
        preserveAspectRatio="none"
        style={{ position: "absolute" }}
      >
        <G transform={PAGE_BADGE_TRANSFORM}>
          <Path d={AYAH_MARKER_PATH} fill={c.accent} />
        </G>
      </Svg>
      <AppText
        arabic
        weight="bold"
        className="text-[11px]"
        style={{ color: c.accent }}
        numberOfLines={1}
      >
        {toArabicDigits(page)}
      </AppText>
    </View>
  );
});

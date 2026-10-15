import { AyahRef } from "@/features/azkar/_data/quran";
import { memo } from "react";
import { StyleSheet } from "react-native";
import Svg from "react-native-svg";
import type { PageAyah } from "../_data/pageAyahs";
import type { PageMeta } from "../_data/pageMeta";
import AyahOverlays from "./AyahOverlays";
import SurahFrame from "./SurahFrame";

export default memo(function PageUnderlay({
  meta,
  ayahs,
  active,
  preserveAspectRatio,
}: {
  meta: PageMeta;
  ayahs: PageAyah[];
  active: AyahRef | null;
  preserveAspectRatio: string;
}) {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox={meta.viewBox}
      preserveAspectRatio={preserveAspectRatio}
    >
      <AyahOverlays ayahs={ayahs} active={active} />
      {meta.titles.map(([surah, x, y, width, height]) => (
        <SurahFrame
          key={`${surah}-${y}`}
          x={x}
          y={y}
          width={width}
          height={height}
        />
      ))}
    </Svg>
  );
});

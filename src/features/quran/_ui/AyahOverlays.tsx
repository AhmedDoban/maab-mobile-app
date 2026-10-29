import { AyahRef } from "@/features/azkar/_data/quran";
import { useAppSelector } from "@/store/Store";
import { useMemo } from "react";
import { View } from "react-native";
import type { PageGeometry } from "../_components/usePageGeometry";
import useMushafColors from "../_components/useMushafColors";
import { AYAH_COLORS } from "../_data/ayahColors";
import { todayWirdBounds } from "../_data/khatma";
import type { PageAyah } from "../_data/pageAyahs";

const same = (shape: PageAyah, ref: AyahRef | null | undefined) =>
  !!ref && ref.surah === shape.surah && ref.ayah === shape.ayah;

export default function AyahOverlays({
  ayahs,
  active,
  toBox,
}: {
  ayahs: PageAyah[];
  active: AyahRef | null;
  toBox: PageGeometry["toBox"];
}) {
  const c = useMushafColors();
  const saved = useAppSelector((s) => s.settings.ayahColors);
  const bookmark = useAppSelector((s) => s.settings.quranBookmark);
  const khatma = useAppSelector((s) => s.settings.khatma);
  const wird = useMemo(() => todayWirdBounds(khatma), [khatma]);

  const fills = ayahs.flatMap((shape) => {
    const layers: { key: string; color: string; opacity: number }[] = [];
    const color = saved[`${shape.surah}:${shape.ayah}`];
    if (color !== undefined) {
      layers.push({ key: "c", color: AYAH_COLORS[color], opacity: 0.45 });
    }
    if (same(shape, wird?.first) || same(shape, wird?.last)) {
      layers.push({ key: "w", color: c.gold, opacity: 0.22 });
    }
    if (same(shape, bookmark)) {
      layers.push({ key: "b", color: c.accent, opacity: 0.12 });
    }
    if (same(shape, active)) {
      layers.push({ key: "h", color: c.highlight, opacity: 1 });
    }
    return layers.flatMap(({ key, color, opacity }) =>
      shape.boxes.map(([x0, y0, x1, y1], i) => (
        <View
          key={`${key}${shape.surah}:${shape.ayah}:${i}`}
          style={[
            { position: "absolute", backgroundColor: color, opacity },
            toBox(x0, y0, x1 - x0, y1 - y0),
          ]}
        />
      )),
    );
  });

  return fills;
}

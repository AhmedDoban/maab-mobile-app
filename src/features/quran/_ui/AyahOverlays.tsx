import { AyahRef } from "@/features/azkar/_data/quran";
import { useAppSelector } from "@/store/Store";
import { useMemo } from "react";
import { Path } from "react-native-svg";
import useMushafColors from "../_components/useMushafColors";
import { AYAH_COLORS } from "../_data/ayahColors";
import { todayWirdBounds } from "../_data/khatma";

type Shape = { surah: number; ayah: number; d: string };

const same = (shape: Shape, ref: AyahRef | null | undefined) =>
  !!ref && ref.surah === shape.surah && ref.ayah === shape.ayah;

export default function AyahOverlays({
  ayahs,
  active,
}: {
  ayahs: Shape[];
  active: AyahRef | null;
}) {
  const c = useMushafColors();
  const saved = useAppSelector((s) => s.settings.ayahColors);
  const bookmark = useAppSelector((s) => s.settings.quranBookmark);
  const khatma = useAppSelector((s) => s.settings.khatma);
  const wird = useMemo(() => todayWirdBounds(khatma), [khatma]);

  return (
    <>
      {ayahs.map((shape, i) => {
        const color = saved[`${shape.surah}:${shape.ayah}`];
        return color !== undefined ? (
          <Path
            key={`c${i}`}
            d={shape.d}
            fill={AYAH_COLORS[color]}
            fillOpacity={0.45}
          />
        ) : null;
      })}
      {ayahs.map((shape, i) =>
        same(shape, wird?.first) || same(shape, wird?.last) ? (
          <Path key={`w${i}`} d={shape.d} fill={c.gold} fillOpacity={0.22} />
        ) : null,
      )}
      {ayahs.map((shape, i) =>
        same(shape, bookmark) ? (
          <Path key={`b${i}`} d={shape.d} fill={c.accent} fillOpacity={0.12} />
        ) : null,
      )}
      {ayahs.map((shape, i) =>
        same(shape, active) ? (
          <Path key={`h${i}`} d={shape.d} fill={c.highlight} />
        ) : null,
      )}
    </>
  );
}

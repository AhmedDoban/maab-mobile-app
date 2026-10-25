import { useAppSelector } from "@/store/Store";
import { Image } from "expo-image";
import { memo } from "react";
import { FRAME_IMAGES } from "../_data/frameImages";
import type { PageMeta } from "../_data/pageMeta";

type Box = { left: number; top: number; width: number; height: number };

export default memo(function SurahFrames({
  titles,
  toBox,
}: {
  titles: PageMeta["titles"];
  toBox: (x: number, y: number, w: number, h: number) => Box;
}) {
  const id = useAppSelector((s) => s.settings.surahFrame);
  const source = FRAME_IMAGES[id - 1] ?? FRAME_IMAGES[0];

  return titles.map(([surah, x, y, width, height]) => {
    const h = height * 1.2;
    const box = toBox(x, y + height / 2 - h / 2, width, h);
    return (
      <Image
        key={`${surah}-${y}`}
        source={source}
        style={{ position: "absolute", ...box }}
        contentFit="fill"
        transition={0}
      />
    );
  });
});

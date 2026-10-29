import AYAH_BOX_CHUNKS from "./chunks/ayahBoxes";
import { spaceBoxes } from "./pageLines";

type Box = [number, number, number, number];

export type PageAyah = { surah: number; ayah: number; boxes: Box[] };

const cache: PageAyah[][] = [];

export const getPageAyahs = (page: number) =>
  (cache[page - 1] ??= (AYAH_BOX_CHUNKS[page - 1]?.() ?? []).map(
    ([surah, ayah, boxes]) => ({
      surah,
      ayah,
      boxes: spaceBoxes(page, boxes),
    }),
  ));

export const ayahAt = (page: number, x: number, y: number) =>
  getPageAyahs(page).find(({ boxes }) =>
    boxes.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1),
  ) ?? null;

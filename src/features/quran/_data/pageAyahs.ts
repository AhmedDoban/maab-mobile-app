import AYAH_BOX_CHUNKS from "./chunks/ayahBoxes";

type Box = [number, number, number, number];

export type PageAyah = { surah: number; ayah: number; d: string; boxes: Box[] };

const rectPath = (boxes: Box[]) =>
  boxes.map(([x0, y0, x1, y1]) => `M${x0} ${y0}H${x1}V${y1}H${x0}Z`).join("");

const cache: PageAyah[][] = [];

export const getPageAyahs = (page: number) =>
  (cache[page - 1] ??= (AYAH_BOX_CHUNKS[page - 1]?.() ?? []).map(
    ([surah, ayah, boxes]) => ({ surah, ayah, boxes, d: rectPath(boxes) }),
  ));

export const ayahAt = (page: number, x: number, y: number) =>
  getPageAyahs(page).find(({ boxes }) =>
    boxes.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1),
  ) ?? null;

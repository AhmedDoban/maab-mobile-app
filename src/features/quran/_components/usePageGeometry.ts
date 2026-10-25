import { useMemo } from "react";
import { PAGE } from "./pageLayout";

const PAGE_RATIO = 550 / 345;

type PageGeometry = {
  scroll: boolean;
  textW: number;
  textH: number;
  stretch: boolean;
  toViewBox: (x: number, y: number, scrollY: number) => [number, number];
  toBox: (
    x: number,
    y: number,
    w: number,
    h: number,
  ) => { left: number; top: number; width: number; height: number };
};

const viewBoxSize = (viewBox: string | undefined) => {
  if (!viewBox) return { vbX: 0, vbY: 0, vbW: 345, vbH: 550 };
  const [vbX, vbY, vbW, vbH] = viewBox.split(/\s+/).map(Number);
  return { vbX, vbY, vbW, vbH };
};

export default function usePageGeometry(
  page: number,
  width: number,
  height: number,
  viewBox: string | undefined,
): PageGeometry {
  return useMemo(() => {
    const { vbX, vbY, vbW, vbH } = viewBoxSize(viewBox);
    const textW = width - PAGE.paddingX * 2;
    const fitH =
      height -
      PAGE.paddingTop -
      PAGE.paddingBottom -
      PAGE.topRow -
      PAGE.bottomRow -
      PAGE.gap * 2;
    const scroll = width > height;
    const textH = scroll ? textW * (vbH / vbW || PAGE_RATIO) : fitH;
    const stretch = !scroll && page > 2;
    const s = Math.min(textW / vbW, textH / vbH);
    const offX = PAGE.paddingX;
    const offY = PAGE.paddingTop + PAGE.topRow + PAGE.gap;
    const ox = stretch ? offX : offX + (textW - vbW * s) / 2;
    const oy = stretch ? offY : offY + (textH - vbH * s) / 2;
    const sx = stretch ? textW / vbW : s;
    const sy = stretch ? textH / vbH : s;
    const bx = ox - offX;
    const by = oy - offY;
    return {
      scroll,
      textW,
      textH,
      stretch,
      toViewBox: (x, y, scrollY) => [(x - ox) / sx, (y + scrollY - oy) / sy],
      toBox: (x, y, w, h) => ({
        left: bx + (x - vbX) * sx,
        top: by + (y - vbY) * sy,
        width: w * sx,
        height: h * sy,
      }),
    };
  }, [page, width, height, viewBox]);
}

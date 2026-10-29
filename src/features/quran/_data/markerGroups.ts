import type { PageMeta } from "./pageMeta";

export type MarkerGroup = {
  x: number;
  y: number;
  width: number;
  height: number;
  markers: PageMeta["markers"];
};

const PAD = 0.4;

const overlaps = (a: MarkerGroup, x: number, y: number, w: number, h: number) =>
  x < a.x + a.width && x + w > a.x && y < a.y + a.height && y + h > a.y;

const cache = new WeakMap<PageMeta, MarkerGroup[]>();

export function markerGroups(meta: PageMeta) {
  const cached = cache.get(meta);
  if (cached) return cached;
  const groups: MarkerGroup[] = [];
  for (const marker of meta.markers) {
    const [, , , x, y, w, h] = marker;
    const group = groups.find((g) => overlaps(g, x, y, w, h));
    if (!group) {
      groups.push({ x, y, width: w, height: h, markers: [marker] });
      continue;
    }
    const x1 = Math.max(group.x + group.width, x + w);
    const y1 = Math.max(group.y + group.height, y + h);
    group.x = Math.min(group.x, x);
    group.y = Math.min(group.y, y);
    group.width = x1 - group.x;
    group.height = y1 - group.y;
    group.markers.push(marker);
  }
  const padded = groups.map((g) => ({
    ...g,
    x: g.x - PAD,
    y: g.y - PAD,
    width: g.width + PAD * 2,
    height: g.height + PAD * 2,
  }));
  cache.set(meta, padded);
  return padded;
}

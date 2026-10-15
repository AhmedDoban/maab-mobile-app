import PAGE_META_CHUNKS from "./chunks/pageMeta";

export type PageMeta = {
  viewBox: string;
  transform: string;
  ds: string[];
  markers: [transform: string, d: number, evenOdd: 0 | 1][];
  titles: [
    surah: number,
    x: number,
    y: number,
    width: number,
    height: number,
  ][];
};

const cache: PageMeta[] = [];

export const getPageMeta = (page: number) =>
  (cache[page - 1] ??= PAGE_META_CHUNKS[page - 1]());

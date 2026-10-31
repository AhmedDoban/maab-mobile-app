export type ReadingSpot = { surah: number; ayah?: number; page: number };

export const mushafHref = ({ surah, ayah, page }: ReadingSpot) => ({
  pathname: "/mushaf/[id]" as const,
  params: ayah ? { id: surah, ayah } : { id: surah, page },
});

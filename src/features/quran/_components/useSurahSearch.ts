import { getSurahList, normalizeQuran } from "@/features/azkar/_data/quran";
import { useMemo } from "react";

export default function useSurahSearch(query: string) {
  return useMemo(() => {
    if (!query) return [];
    return getSurahList().filter(
      (s) =>
        normalizeQuran(s.name).includes(query) ||
        s.transliteration.toLowerCase().includes(query) ||
        s.translation.toLowerCase().includes(query) ||
        String(s.id) === query,
    );
  }, [query]);
}

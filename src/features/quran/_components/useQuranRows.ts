import { getSurahList } from "@/features/azkar/_data/quran";
import { useMemo } from "react";
import { getJuzGroups } from "../_data/juzGroups";
import type { QuranRow } from "../_data/quranRows";

export default function useQuranRows() {
  const surahRows = useMemo<QuranRow[]>(
    () => getSurahList().map((surah) => ({ kind: "surah", surah })),
    [],
  );
  const juzRows = useMemo<QuranRow[]>(
    () =>
      getJuzGroups().flatMap((group): QuranRow[] => [
        { kind: "juz", group },
        ...group.surahs.map((surah) => surahRows[surah.id - 1]),
      ]),
    [surahRows],
  );
  return { surahRows, juzRows };
}

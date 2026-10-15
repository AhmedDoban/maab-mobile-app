import type { SurahSummary } from "@/features/azkar/_data/quran";
import type { JuzGroupData } from "./juzGroups";

export type QuranRow =
  { kind: "surah"; surah: SurahSummary } | { kind: "juz"; group: JuzGroupData };

export const quranRowKey = (row: QuranRow) =>
  row.kind === "surah" ? `s${row.surah.id}` : `j${row.group.juz}`;

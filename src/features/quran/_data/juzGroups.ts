import { AyahRef, getSurah, SurahSummary } from "@/features/azkar/_data/quran";

export type JuzGroupData = {
  juz: number;
  start: AyahRef;
  page: number;
  surahs: SurahSummary[];
};

type RawJuz = [number, number, number, number, number[]];

let groups: JuzGroupData[] | null = null;

export const getJuzGroups = () =>
  (groups ??= (require("./juzList.json") as RawJuz[]).map(
    ([juz, surah, ayah, page, surahs]) => ({
      juz,
      start: { surah, ayah },
      page,
      surahs: surahs.map((id) => getSurah(id)!),
    }),
  ));

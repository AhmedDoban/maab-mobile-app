import { AyahRef, ayahTranslation } from "@/features/azkar/_data/quran";
import { useTranslation } from "react-i18next";
import MUYASSAR_CHUNKS from "../_data/chunks/muyassar";

type Tafsir = { text: string; source: string; arabic: boolean };

const muyassar: string[][] = [];

const tafsirOf = (surah: number) =>
  (muyassar[surah - 1] ??= MUYASSAR_CHUNKS[surah - 1]?.() ?? []);

export const preloadTafsir = (ar: boolean, surah: number) =>
  ar ? tafsirOf(surah) : ayahTranslation(surah, 1);

export default function useTafsir(ref: AyahRef | null): Tafsir | null {
  const { t, i18n } = useTranslation("azkar");
  if (!ref) return null;
  if (i18n.language !== "ar") {
    const text = ayahTranslation(ref.surah, ref.ayah);
    return text
      ? { text, source: t("translationSource"), arabic: false }
      : null;
  }
  const text = tafsirOf(ref.surah)[ref.ayah - 1];
  return text ? { text, source: t("tafsirSource"), arabic: true } : null;
}

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { surahName } from "../_data/surahName";
import { contentLocale } from "@/i18n/config";

export default function useSurahName() {
  const { i18n } = useTranslation();
  const ar = contentLocale(i18n.language) === "ar";
  return useCallback((id: number) => surahName(id, ar), [ar]);
}

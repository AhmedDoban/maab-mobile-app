import { useAppSelector } from "@/store/Store";

export default function useHasSavedAyahs() {
  return useAppSelector(
    (s) =>
      s.settings.quranBookmark !== null || s.settings.savedAyahs.length > 0,
  );
}

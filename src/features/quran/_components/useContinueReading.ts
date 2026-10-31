import { getPage, pageOf } from "@/features/azkar/_data/quran";
import { useAppSelector } from "@/store/Store";
import { useMemo } from "react";
import { khatmaWirds } from "../_data/khatma";
import type { ReadingSpot } from "../_data/mushafHref";

export default function useContinueReading() {
  const lastPage = useAppSelector((s) => s.settings.quranLastPage);
  const bookmark = useAppSelector((s) => s.settings.quranBookmark);
  const plan = useAppSelector((s) => s.settings.khatma);

  return useMemo(() => {
    const marked: ReadingSpot | null = bookmark
      ? { ...bookmark, page: pageOf(bookmark.surah, bookmark.ayah) }
      : null;
    const sharePage = marked !== null && marked.page === lastPage;
    const last: ReadingSpot | null =
      lastPage === null || sharePage
        ? null
        : { surah: getPage(lastPage).start.surah, page: lastPage };
    const wird = plan && plan.done < khatmaWirds(plan).length ? plan : null;
    return { wird, last, marked, sharePage };
  }, [lastPage, bookmark, plan]);
}

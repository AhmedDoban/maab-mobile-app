import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getHadiths, HADITH_COUNT } from "../_data";

const BATCH = 10;

export default function useHadithPagination() {
  const [count, setCount] = useState(BATCH);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasMore = count < HADITH_COUNT;
  const visible = useMemo(() => getHadiths(count), [count]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    timer.current = setTimeout(() => {
      setCount((c) => Math.min(c + BATCH, HADITH_COUNT));
      setLoading(false);
    }, 400);
  }, [loading, hasMore]);

  return { visible, hasMore, loading, loadMore };
}

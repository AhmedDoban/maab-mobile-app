import { useAppSelector } from "@/store/Store";
import { useMemo } from "react";
import type { AzkarCategory } from "../_data";

export default function useMostUsed(list: AzkarCategory[]) {
  const usage = useAppSelector((s) => s.azkar.categoryUsage);

  return useMemo(
    () =>
      list
        .map((category, index) => ({ category, index }))
        .sort(
          (a, b) =>
            (usage[b.category.id] ?? 0) - (usage[a.category.id] ?? 0) ||
            a.index - b.index,
        )
        .map(({ category }) => category),
    [list, usage],
  );
}

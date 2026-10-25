import { useAppSelector } from "@/store/Store";
import { AzkarCategory } from "../_data";
import { categoryDone, categoryTotal } from "../_data/progress";

export default function useCategoryProgress(category: AzkarCategory) {
  const done = useAppSelector((state) =>
    categoryDone(category, state.azkar.progress),
  );
  const total = categoryTotal(category);

  return { done, total, complete: done >= total };
}

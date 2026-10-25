import { useAppSelector } from "@/store/Store";
import { AzkarCategory } from "../_data";
import { categoryDone, categoryTotal } from "../_data/progress";

export default function useDailyJourney(daily: AzkarCategory[]) {
  const done = useAppSelector(
    (state) =>
      daily.filter(
        (category) =>
          categoryDone(category, state.azkar.progress) >=
          categoryTotal(category),
      ).length,
  );

  return { done, total: daily.length };
}

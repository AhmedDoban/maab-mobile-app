import { progressKey } from "@/store/Slices/AzkarSlice";
import type { AzkarCategory } from "./types";

export const categoryTotal = (category: AzkarCategory) =>
  category.goals.length === 1 ? category.goals[0].count : category.goals.length;

export function categoryDone(
  category: AzkarCategory,
  progress: Record<string, number>,
) {
  const counted = (id: number) => progress[progressKey(category.id, id)] ?? 0;
  if (category.goals.length === 1) {
    const [item] = category.goals;
    return Math.min(counted(item.id), item.count);
  }
  return category.goals.filter((item) => counted(item.id) >= item.count).length;
}

import { toArabicDigits } from "@/features/azkar/_data/quran";

const QUARTERS = ["الحزب", "ربع الحزب", "نصف الحزب", "ثلاثة أرباع الحزب"];

let quarters: number[] | null = null;
const pageQuarter = (page: number) =>
  (quarters ??= require("./pageQuarters.json") as number[])[page - 1] ?? 1;

export function hizbLabel(page: number) {
  const quarter = pageQuarter(page);
  const hizb = Math.ceil(quarter / 4);
  return `${QUARTERS[(quarter - 1) % 4]} ${toArabicDigits(hizb)}`;
}

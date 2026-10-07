import { Locale } from "@/i18n/config";

export interface ZikrContent {
  title?: string;
  prefix: string;
  text: string;
  suffix: string;
  virtue: string;
  source: string;
}

export interface Zikr extends Record<Locale, ZikrContent> {
  id: number;
  count: number;
}

interface ZikrGoal {
  id: number;
  count: number;
}

export interface AzkarCategory {
  id: string;
  title: Record<Locale, string>;
  featured: boolean;
  resetEachPrayer?: boolean;
  fridayOnly?: boolean;
  goals: ZikrGoal[];
}

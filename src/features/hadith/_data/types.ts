import { ContentLocale } from "@/i18n/config";

interface HadithContent {
  source: string;
  chapter: string;
  text: string;
}

export interface LocalHadith extends Record<ContentLocale, HadithContent> {
  id: string;
  number: number;
}

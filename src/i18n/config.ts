export type Locale = (typeof locales)[number];

export const locales = [
  "ar",
  "en",
  "ur",
  "id",
  "bn",
  "tr",
  "fa",
  "ms",
  "fr",
] as const;
export const defaultLocale: Locale = "ar";

export const rtlLocales: readonly Locale[] = ["ar", "ur", "fa"];

export type ContentLocale = "ar" | "en";

export const contentLocale = (locale: string): ContentLocale =>
  rtlLocales.includes(locale as Locale) ? "ar" : "en";

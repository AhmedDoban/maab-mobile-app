import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { defaultLocale, Locale } from "@/i18n/config";
import {
  PrayerName,
  REMINDER_PRAYERS,
} from "@/features/prayer-times/_data/types";
import {
  AdhanSoundId,
  AdhanChoice,
  CustomAdhan,
  DEFAULT_ADHAN,
  isAdhanSound,
} from "@/features/prayer-times/_data/adhanSounds";
import type { PrayerLocation } from "@/features/prayer-times/_data/calculate";
import { toCityName } from "@/features/prayer-times/_data/cityName";
import {
  AsrMethod,
  isAsrMethod,
  isPrayerMethod,
  PrayerMethodSetting,
} from "@/features/prayer-times/_data/methods";

import { DEFAULT_PALETTE, isPaletteId, PaletteId } from "@/constants/palettes";
import {
  DEFAULT_RECITER,
  isReciterId,
  ReciterId,
} from "@/features/quran/_data/reciters";

type AyahBookmark = { surah: number; ayah: number };

const isAyahBookmark = (value: unknown): value is AyahBookmark =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as AyahBookmark).surah === "number" &&
  typeof (value as AyahBookmark).ayah === "number";

export type QuranReadingDay = { day: string; pages: number[]; seconds: number };

const isQuranReadingDay = (value: unknown): value is QuranReadingDay =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as QuranReadingDay).day === "string" &&
  Array.isArray((value as QuranReadingDay).pages) &&
  typeof (value as QuranReadingDay).seconds === "number";

const readingDay = (
  state: { quranToday: QuranReadingDay | null },
  day: string,
): QuranReadingDay =>
  state.quranToday?.day === day
    ? state.quranToday
    : { day, pages: [], seconds: 0 };

export type KhatmaPlan = {
  fromJuz: number;
  toJuz: number;
  days: number;
  startedAt: string;
  done: number;
};

const isKhatmaPlan = (value: unknown): value is KhatmaPlan =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as KhatmaPlan).days === "number" &&
  typeof (value as KhatmaPlan).done === "number";

export type ThemePreference = "system" | "light" | "dark";
type TextSize = number;
export const TEXT_SIZE = { min: 18, max: 40, step: 2, default: 24 } as const;

const LEGACY_TEXT_SIZES: Record<string, number> = { sm: 20, md: 24, lg: 30 };

const clampTextSize = (value: unknown): number => {
  const size = typeof value === "string" ? LEGACY_TEXT_SIZES[value] : value;
  if (typeof size !== "number" || !Number.isFinite(size))
    return TEXT_SIZE.default;
  return Math.min(TEXT_SIZE.max, Math.max(TEXT_SIZE.min, Math.round(size)));
};

export interface ReadingSettings {
  hapticOnComplete: boolean;
  hapticOnTap: boolean;
  hideCompleted: boolean;
  showPrefix: boolean;
  showSuffix: boolean;
  showVirtue: boolean;
  showSource: boolean;
}

const DEFAULT_READING: ReadingSettings = {
  hapticOnComplete: true,
  hapticOnTap: true,
  hideCompleted: false,
  showPrefix: true,
  showSuffix: true,
  showVirtue: true,
  showSource: true,
};

export type ReminderKind = "dhikr" | "quran";

export const REMINDER_INTERVALS = [1, 2, 3, 4, 6, 12] as const;

export type ReminderInterval = (typeof REMINDER_INTERVALS)[number];

interface ReminderSetting {
  enabled: boolean;
  every: ReminderInterval;
}

const DEFAULT_REMINDER: ReminderSetting = { enabled: false, every: 2 };

const isReminderInterval = (value: unknown): value is ReminderInterval =>
  REMINDER_INTERVALS.includes(value as ReminderInterval);

const toReminder = (
  value: Partial<ReminderSetting> | undefined,
  fallback: ReminderSetting,
): ReminderSetting => ({
  enabled:
    typeof value?.enabled === "boolean" ? value.enabled : fallback.enabled,
  every: isReminderInterval(value?.every) ? value.every : fallback.every,
});

export type PrayerCardStyle = "modern" | "classic";

const isPrayerCardStyle = (value: unknown): value is PrayerCardStyle =>
  value === "modern" || value === "classic";

const toPrayerAdhans = (
  value: unknown,
): Partial<Record<PrayerName, AdhanChoice>> => {
  if (!value || typeof value !== "object") return {};
  const out: Partial<Record<PrayerName, AdhanChoice>> = {};
  for (const prayer of REMINDER_PRAYERS) {
    const item = (value as Record<string, Partial<AdhanChoice>>)[prayer];
    if (!item || !isAdhanSound(item.sound)) continue;
    const custom =
      item.custom && typeof item.custom.uri === "string"
        ? { uri: item.custom.uri, name: String(item.custom.name ?? "") }
        : null;
    if (item.sound === "custom" && !custom) continue;
    out[prayer] = { sound: item.sound, custom };
  }
  return out;
};

export interface SettingsState {
  locale: Locale;
  theme: ThemePreference;
  palette: PaletteId;
  textSize: TextSize;
  quranBookmark: AyahBookmark | null;
  quranLastPage: number | null;
  quranLastReadAt: number | null;
  quranToday: QuranReadingDay | null;
  savedAyahs: string[];
  khatma: KhatmaPlan | null;
  surahFrame: number;
  ayahColors: Record<string, number>;
  reciter: ReciterId;
  prayerReminders: Partial<Record<PrayerName, boolean>>;
  reminderHintSeen: boolean;
  lockScreenPrayer: boolean;
  prayerCardStyle: PrayerCardStyle;
  showSplash: boolean;
  fullScreen: boolean;
  recitationInApp: boolean;
  recitationLockScreen: boolean;
  adhanSound: AdhanSoundId;
  customAdhan: CustomAdhan | null;
  adhanPerPrayer: boolean;
  prayerAdhans: Partial<Record<PrayerName, AdhanChoice>>;
  prayerLocation: PrayerLocation | null;
  prayerMethod: PrayerMethodSetting;
  asrMethod: AsrMethod;
  reading: ReadingSettings;
  reminders: Record<ReminderKind, ReminderSetting>;
}

const defaultSettings = (locale: Locale = defaultLocale): SettingsState => ({
  locale,
  theme: "system",
  palette: DEFAULT_PALETTE,
  textSize: TEXT_SIZE.default,
  quranBookmark: null,
  quranLastPage: null,
  quranLastReadAt: null,
  quranToday: null,
  savedAyahs: [],
  khatma: null,
  surahFrame: 1,
  ayahColors: {},
  reciter: DEFAULT_RECITER,
  prayerReminders: Object.fromEntries(REMINDER_PRAYERS.map((p) => [p, true])),
  reminderHintSeen: false,
  lockScreenPrayer: false,
  prayerCardStyle: "modern",
  showSplash: true,
  fullScreen: true,
  recitationInApp: false,
  recitationLockScreen: true,
  adhanSound: DEFAULT_ADHAN,
  customAdhan: null,
  adhanPerPrayer: false,
  prayerAdhans: {},
  prayerLocation: null,
  prayerMethod: "auto",
  asrMethod: "auto",
  reading: { ...DEFAULT_READING },
  reminders: { dhikr: { ...DEFAULT_REMINDER }, quran: { ...DEFAULT_REMINDER } },
});

const initialState: SettingsState = defaultSettings();

export const SettingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
    setTheme(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload;
    },
    setPrayerCardStyle(state, action: PayloadAction<PrayerCardStyle>) {
      state.prayerCardStyle = action.payload;
    },
    setShowSplash(state, action: PayloadAction<boolean>) {
      state.showSplash = action.payload;
    },
    setFullScreen(state, action: PayloadAction<boolean>) {
      state.fullScreen = action.payload;
    },
    setRecitationInApp(state, action: PayloadAction<boolean>) {
      state.recitationInApp = action.payload;
    },
    setRecitationLockScreen(state, action: PayloadAction<boolean>) {
      state.recitationLockScreen = action.payload;
    },
    setReminder(
      state,
      action: PayloadAction<{
        kind: ReminderKind;
        patch: Partial<ReminderSetting>;
      }>,
    ) {
      const { kind, patch } = action.payload;
      state.reminders[kind] = toReminder(patch, state.reminders[kind]);
    },
    setPalette(state, action: PayloadAction<PaletteId>) {
      state.palette = action.payload;
    },
    setTextSize(state, action: PayloadAction<TextSize>) {
      state.textSize = clampTextSize(action.payload);
    },
    setQuranBookmark(state, action: PayloadAction<AyahBookmark | null>) {
      state.quranBookmark = action.payload;
    },
    setQuranLastPage: {
      reducer(
        state,
        action: PayloadAction<{ page: number; day: string; at: number }>,
      ) {
        const { page, day, at } = action.payload;
        const today = readingDay(state, day);
        if (!today.pages.includes(page)) today.pages.push(page);
        state.quranToday = today;
        state.quranLastPage = page;
        state.quranLastReadAt = at;
      },
      prepare: (page: number) => ({
        payload: { page, day: new Date().toDateString(), at: Date.now() },
      }),
    },
    addQuranReadingTime: {
      reducer(state, action: PayloadAction<{ seconds: number; day: string }>) {
        const today = readingDay(state, action.payload.day);
        today.seconds += action.payload.seconds;
        state.quranToday = today;
      },
      prepare: (seconds: number) => ({
        payload: { seconds, day: new Date().toDateString() },
      }),
    },
    startKhatma(
      state,
      action: PayloadAction<Omit<KhatmaPlan, "done" | "startedAt">>,
    ) {
      state.khatma = {
        ...action.payload,
        startedAt: new Date().toISOString(),
        done: 0,
      };
    },
    completeWird(state) {
      if (state.khatma && state.khatma.done < state.khatma.days) {
        state.khatma.done += 1;
      }
    },
    undoWird(state) {
      if (state.khatma && state.khatma.done > 0) state.khatma.done -= 1;
    },
    setSurahFrame(state, action: PayloadAction<number>) {
      state.surahFrame = action.payload;
    },
    endKhatma(state) {
      state.khatma = null;
    },
    toggleSavedAyah(state, action: PayloadAction<string>) {
      const key = action.payload;
      state.savedAyahs = state.savedAyahs.includes(key)
        ? state.savedAyahs.filter((item) => item !== key)
        : [key, ...state.savedAyahs];
    },
    setAyahColor(
      state,
      action: PayloadAction<{ key: string; color: number | null }>,
    ) {
      const { key, color } = action.payload;
      if (color === null) delete state.ayahColors[key];
      else state.ayahColors[key] = color;
    },
    setReciter(state, action: PayloadAction<ReciterId>) {
      state.reciter = action.payload;
    },
    setReadingOption(
      state,
      action: PayloadAction<{ key: keyof ReadingSettings; value: boolean }>,
    ) {
      state.reading[action.payload.key] = action.payload.value;
    },
    togglePrayerReminder(state, action: PayloadAction<PrayerName>) {
      const name = action.payload;
      state.prayerReminders[name] = !(state.prayerReminders[name] ?? true);
      state.reminderHintSeen = true;
    },
    setAdhanSound(state, action: PayloadAction<AdhanSoundId>) {
      state.adhanSound = action.payload;
    },
    setAdhanPerPrayer(state, action: PayloadAction<boolean>) {
      state.adhanPerPrayer = action.payload;
    },
    setPrayerAdhan(
      state,
      action: PayloadAction<{ prayer: PrayerName; sound: AdhanSoundId }>,
    ) {
      const { prayer, sound } = action.payload;
      const custom =
        state.prayerAdhans[prayer]?.custom ??
        (sound === "custom" ? state.customAdhan : null);
      state.prayerAdhans[prayer] = { sound, custom };
    },
    setPrayerCustomAdhan(
      state,
      action: PayloadAction<{ prayer: PrayerName; file: CustomAdhan }>,
    ) {
      const { prayer, file } = action.payload;
      state.prayerAdhans[prayer] = { sound: "custom", custom: file };
    },
    setCustomAdhan(state, action: PayloadAction<CustomAdhan>) {
      state.customAdhan = action.payload;
      state.adhanSound = "custom";
    },
    setPrayerLocation(state, action: PayloadAction<PrayerLocation>) {
      state.prayerLocation = action.payload;
    },
    setPrayerMethod(state, action: PayloadAction<PrayerMethodSetting>) {
      state.prayerMethod = action.payload;
    },
    setAsrMethod(state, action: PayloadAction<AsrMethod>) {
      state.asrMethod = action.payload;
    },
    setLockScreenPrayer(state, action: PayloadAction<boolean>) {
      state.lockScreenPrayer = action.payload;
    },
    resetQuranData(state) {
      state.quranBookmark = null;
      state.quranLastPage = null;
      state.quranLastReadAt = null;
      state.quranToday = null;
      state.savedAyahs = [];
      state.ayahColors = {};
      state.khatma = null;
    },
    resetSettings(state) {
      return {
        ...defaultSettings(state.locale),
        prayerLocation: state.prayerLocation,
        quranBookmark: state.quranBookmark,
        quranLastPage: state.quranLastPage,
        quranLastReadAt: state.quranLastReadAt,
        quranToday: state.quranToday,
        savedAyahs: state.savedAyahs,
        khatma: state.khatma,
        ayahColors: state.ayahColors,
      };
    },
    hydrateSettings(state, action: PayloadAction<Partial<SettingsState>>) {
      return {
        ...state,
        ...action.payload,
        textSize: clampTextSize(action.payload.textSize ?? state.textSize),
        palette: isPaletteId(action.payload.palette)
          ? action.payload.palette
          : state.palette,
        reciter: isReciterId(action.payload.reciter)
          ? action.payload.reciter
          : state.reciter,
        adhanSound: isAdhanSound(action.payload.adhanSound)
          ? action.payload.adhanSound
          : state.adhanSound,
        customAdhan: action.payload.customAdhan ?? state.customAdhan,
        adhanPerPrayer:
          typeof action.payload.adhanPerPrayer === "boolean"
            ? action.payload.adhanPerPrayer
            : state.adhanPerPrayer,
        prayerAdhans: toPrayerAdhans(action.payload.prayerAdhans),
        prayerLocation: action.payload.prayerLocation
          ? {
              ...action.payload.prayerLocation,
              city: toCityName(action.payload.prayerLocation.city),
            }
          : state.prayerLocation,
        prayerMethod: isPrayerMethod(action.payload.prayerMethod)
          ? action.payload.prayerMethod
          : state.prayerMethod,
        asrMethod: isAsrMethod(action.payload.asrMethod)
          ? action.payload.asrMethod
          : state.asrMethod,
        showSplash:
          typeof action.payload.showSplash === "boolean"
            ? action.payload.showSplash
            : state.showSplash,
        fullScreen:
          typeof action.payload.fullScreen === "boolean"
            ? action.payload.fullScreen
            : state.fullScreen,
        recitationInApp:
          typeof action.payload.recitationInApp === "boolean"
            ? action.payload.recitationInApp
            : state.recitationInApp,
        recitationLockScreen:
          typeof action.payload.recitationLockScreen === "boolean"
            ? action.payload.recitationLockScreen
            : state.recitationLockScreen,
        prayerCardStyle: isPrayerCardStyle(action.payload.prayerCardStyle)
          ? action.payload.prayerCardStyle
          : state.prayerCardStyle,
        lockScreenPrayer:
          typeof action.payload.lockScreenPrayer === "boolean"
            ? action.payload.lockScreenPrayer
            : state.lockScreenPrayer,
        prayerReminders: {
          ...state.prayerReminders,
          ...action.payload.prayerReminders,
        },
        reading: { ...state.reading, ...action.payload.reading },
        reminders: {
          dhikr: toReminder(
            action.payload.reminders?.dhikr,
            state.reminders.dhikr,
          ),
          quran: toReminder(
            action.payload.reminders?.quran,
            state.reminders.quran,
          ),
        },
        ayahColors: { ...state.ayahColors, ...action.payload.ayahColors },
        quranBookmark: isAyahBookmark(action.payload.quranBookmark)
          ? action.payload.quranBookmark
          : null,
        quranLastPage:
          typeof action.payload.quranLastPage === "number" &&
          action.payload.quranLastPage >= 1 &&
          action.payload.quranLastPage <= 604
            ? action.payload.quranLastPage
            : state.quranLastPage,
        quranLastReadAt:
          typeof action.payload.quranLastReadAt === "number"
            ? action.payload.quranLastReadAt
            : state.quranLastReadAt,
        quranToday: isQuranReadingDay(action.payload.quranToday)
          ? action.payload.quranToday
          : state.quranToday,
        surahFrame:
          typeof action.payload.surahFrame === "number" &&
          action.payload.surahFrame >= 1 &&
          action.payload.surahFrame <= 10
            ? action.payload.surahFrame
            : state.surahFrame,
        khatma: isKhatmaPlan(action.payload.khatma)
          ? action.payload.khatma
          : state.khatma,
        savedAyahs: Array.isArray(action.payload.savedAyahs)
          ? action.payload.savedAyahs
          : state.savedAyahs,
      };
    },
  },
});

export const {
  setLocale,
  setTheme,
  setPrayerCardStyle,
  setShowSplash,
  setFullScreen,
  setRecitationInApp,
  setRecitationLockScreen,
  setPalette,
  setReminder,
  setTextSize,
  setQuranBookmark,
  setQuranLastPage,
  addQuranReadingTime,
  toggleSavedAyah,
  startKhatma,
  completeWird,
  undoWird,
  endKhatma,
  setSurahFrame,
  setAyahColor,
  setReciter,
  togglePrayerReminder,
  setAdhanSound,
  setCustomAdhan,
  setAdhanPerPrayer,
  setPrayerAdhan,
  setPrayerCustomAdhan,
  setPrayerLocation,
  setPrayerMethod,
  setAsrMethod,
  setReadingOption,
  resetSettings,
  resetQuranData,
  hydrateSettings,
  setLockScreenPrayer,
} = SettingsSlice.actions;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DorarHadith } from "@/features/hadith/_components/parseDorar";
import { MOVED_FROM, MOVED_TO } from "@/features/azkar/_data/movedAdhkar";

export type SavedHadith = { key: string } & (
  { kind: "local"; id: string } | { kind: "dorar"; hadith: DorarHadith }
);

export interface AzkarState {
  favorites: string[];
  favoriteAdhkar: string[];
  favoriteHadiths: SavedHadith[];
  progress: Record<string, number>;
  categoryUsage: Record<string, number>;
  progressDate: string;
  prayerPeriod: string;
}

export const today = () => new Date().toLocaleDateString("en-CA");
export const progressKey = (categoryId: string, itemId: number) =>
  `${categoryId}:${itemId}`;

const initialState: AzkarState = {
  favorites: [],
  favoriteAdhkar: [],
  favoriteHadiths: [],
  progress: {},
  categoryUsage: {},
  progressDate: today(),
  prayerPeriod: "",
};

const movedKey = (key: string) => {
  const [categoryId, itemId] = key.split(":");
  const target = categoryId === MOVED_FROM ? MOVED_TO[Number(itemId)] : null;
  return target ? progressKey(target, Number(itemId)) : key;
};

const usageFromProgress = (progress: Record<string, number>) => {
  const usage: Record<string, number> = {};
  for (const [key, count] of Object.entries(progress)) {
    if (count <= 0) continue;
    const categoryId = key.split(":")[0];
    usage[categoryId] = (usage[categoryId] ?? 0) + 1;
  }
  return usage;
};

export const AzkarSlice = createSlice({
  name: "azkar",
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.favorites = state.favorites.includes(id)
        ? state.favorites.filter((f) => f !== id)
        : [...state.favorites, id];
    },
    toggleFavoriteZikr(state, action: PayloadAction<string>) {
      const key = action.payload;
      state.favoriteAdhkar = state.favoriteAdhkar.includes(key)
        ? state.favoriteAdhkar.filter((k) => k !== key)
        : [...state.favoriteAdhkar, key];
    },
    toggleFavoriteHadith(state, action: PayloadAction<SavedHadith>) {
      const { key } = action.payload;
      state.favoriteHadiths = state.favoriteHadiths.some((h) => h.key === key)
        ? state.favoriteHadiths.filter((h) => h.key !== key)
        : [...state.favoriteHadiths, action.payload];
    },
    startNewDay(state) {
      if (state.progressDate === today()) return;
      state.progress = {};
      state.progressDate = today();
    },
    startNewPrayer(
      state,
      action: PayloadAction<{ period: string; categoryIds: string[] }>,
    ) {
      const { period, categoryIds } = action.payload;
      if (state.prayerPeriod === period) return;
      state.prayerPeriod = period;
      const prefixes = categoryIds.map((id) => `${id}:`);
      for (const key of Object.keys(state.progress)) {
        if (prefixes.some((prefix) => key.startsWith(prefix))) {
          delete state.progress[key];
        }
      }
    },
    incrementCount(
      state,
      action: PayloadAction<{
        categoryId: string;
        itemId: number;
        max: number;
      }>,
    ) {
      const { categoryId, itemId, max } = action.payload;
      if (state.progressDate !== today()) {
        state.progress = {};
        state.progressDate = today();
      }
      const key = progressKey(categoryId, itemId);
      const before = state.progress[key] ?? 0;
      state.progress[key] = Math.min(before + 1, max);
      if (before < max && state.progress[key] === max) {
        state.categoryUsage[categoryId] =
          (state.categoryUsage[categoryId] ?? 0) + 1;
      }
    },
    completeCategory(
      state,
      action: PayloadAction<{
        categoryId: string;
        goals: { id: number; count: number }[];
      }>,
    ) {
      if (state.progressDate !== today()) {
        state.progress = {};
        state.progressDate = today();
      }
      const { categoryId, goals } = action.payload;
      for (const goal of goals) {
        const key = progressKey(categoryId, goal.id);
        const before = state.progress[key] ?? 0;
        state.progress[key] = goal.count;
        if (before < goal.count) {
          state.categoryUsage[categoryId] =
            (state.categoryUsage[categoryId] ?? 0) + 1;
        }
      }
    },
    recordCategoryOpen(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.categoryUsage[id] = (state.categoryUsage[id] ?? 0) + 1;
    },
    resetCategory(state, action: PayloadAction<string>) {
      const prefix = `${action.payload}:`;
      for (const key of Object.keys(state.progress)) {
        if (key.startsWith(prefix)) delete state.progress[key];
      }
    },
    resetAzkarData() {
      return { ...initialState, progressDate: today() };
    },
    resetAllProgress(state) {
      state.progress = {};
      state.progressDate = today();
    },
    hydrateAzkar(state, action: PayloadAction<Partial<AzkarState>>) {
      const next = { ...state, ...action.payload };
      next.favorites = (next.favorites ?? []).filter(
        (f) => typeof f === "string" && f !== MOVED_FROM,
      );
      next.favoriteAdhkar = (next.favoriteAdhkar ?? []).map(movedKey);
      next.progress = Object.fromEntries(
        Object.entries(next.progress ?? {}).map(([key, count]) => [
          movedKey(key),
          count,
        ]),
      );
      const usage = action.payload.categoryUsage;
      next.categoryUsage =
        typeof usage === "object" &&
        usage !== null &&
        Object.keys(usage).length > 0
          ? usage
          : usageFromProgress(next.progress);
      if (next.progressDate !== today()) {
        next.progress = {};
        next.progressDate = today();
      }
      return next;
    },
  },
});

export const {
  toggleFavorite,
  toggleFavoriteZikr,
  toggleFavoriteHadith,
  incrementCount,
  completeCategory,
  startNewDay,
  startNewPrayer,
  recordCategoryOpen,
  resetCategory,
  resetAllProgress,
  resetAzkarData,
  hydrateAzkar,
} = AzkarSlice.actions;

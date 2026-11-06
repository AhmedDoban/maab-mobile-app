import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Mosque } from "@/features/prayer-times/_data/mosques";

export type MosquesState = {
  items: Mosque[];
  activeId: string | null;
  inside: boolean;
  automaticDetection: boolean;
};

const initialState: MosquesState = {
  items: [],
  activeId: null,
  inside: false,
  automaticDetection: true,
};

export const MosquesSlice = createSlice({
  name: "mosques",
  initialState,
  reducers: {
    addMosque(state, action: PayloadAction<Mosque>) {
      state.items.push(action.payload);
    },
    updateMosque(state, action: PayloadAction<Mosque>) {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id,
      );
      if (index >= 0) state.items[index] = action.payload;
    },
    removeMosque(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (state.activeId === action.payload) {
        state.activeId = null;
        state.inside = false;
      }
    },
    setActiveMosque(state, action: PayloadAction<string | null>) {
      state.activeId = action.payload;
      state.inside = action.payload !== null;
    },
    setMosqueInside(state, action: PayloadAction<boolean>) {
      state.inside = action.payload;
    },
    setAutomaticMosqueDetection(state, action: PayloadAction<boolean>) {
      state.automaticDetection = action.payload;
    },
    hydrateMosques(state, action: PayloadAction<Partial<MosquesState>>) {
      return {
        ...state,
        ...action.payload,
        items: Array.isArray(action.payload.items)
          ? action.payload.items
          : state.items,
      };
    },
  },
});

export const {
  addMosque,
  updateMosque,
  removeMosque,
  setActiveMosque,
  setMosqueInside,
  setAutomaticMosqueDetection,
  hydrateMosques,
} = MosquesSlice.actions;

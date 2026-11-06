import AsyncStorage from "@react-native-async-storage/async-storage";
import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import {
  SettingsSlice,
  SettingsState,
  hydrateSettings,
} from "./Slices/SettingsSlice";
import { AzkarSlice, AzkarState, hydrateAzkar } from "./Slices/AzkarSlice";
import {
  hydrateMosques,
  MosquesSlice,
  MosquesState,
} from "./Slices/MosquesSlice";

const STORAGE_KEY = "MAAB_STATE_V1";
const LEGACY_STORAGE_KEY = "AZKAR_STATE_V1";

interface PersistedState {
  settings?: Partial<SettingsState>;
  azkar?: Partial<AzkarState>;
  mosques?: Partial<MosquesState>;
}

const persisted = isAnyOf(
  ...Object.values(SettingsSlice.actions),
  ...Object.values(AzkarSlice.actions),
  ...Object.values(MosquesSlice.actions),
);

export const persistMiddleware = createListenerMiddleware();

persistMiddleware.startListening({
  predicate: (action, current, original) => {
    if (!persisted(action)) return false;
    if (hydrateSettings.match(action) || hydrateAzkar.match(action)) {
      return false;
    }
    const now = current as Required<PersistedState>;
    const before = original as Required<PersistedState>;
    return (
      now.settings !== before.settings ||
      now.azkar !== before.azkar ||
      now.mosques !== before.mosques
    );
  },
  effect: async (_action, api) => {
    api.cancelActiveListeners();
    await api.delay(400);

    await savePersistedState(api.getState() as Required<PersistedState>);
  },
});

export async function savePersistedState({
  settings,
  azkar,
  mosques,
}: PersistedState) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ settings, azkar, mosques }),
    );
  } catch (error) {
    console.warn("Failed to persist state", error);
  }
}

export async function loadPersistedState(): Promise<PersistedState> {
  try {
    const raw =
      (await AsyncStorage.getItem(STORAGE_KEY)) ??
      (await AsyncStorage.getItem(LEGACY_STORAGE_KEY));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export { hydrateAzkar, hydrateSettings };

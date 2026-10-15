import { setPrayerLocation } from "@/store/Slices/SettingsSlice";
import {
  AppDispatch,
  Store,
  useAppDispatch,
  useAppSelector,
} from "@/store/Store";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import type { PrayerLocation } from "../_data/calculate";
import { lookupCityName } from "../_data/cityName";
import { distanceKm } from "../_data/geo";

type LocationStatus = "loading" | "ready" | "denied" | "error";

const MOVED_KM = 5;
const LOOKUP_RETRY = 7 * 24 * 60 * 60 * 1000;
let refresh: Promise<LocationStatus> | null = null;
let pending = false;

function startLocate(
  dispatch: AppDispatch,
  saved: PrayerLocation | null,
  force: boolean,
) {
  if (!refresh || (force && !pending)) {
    pending = true;
    refresh = locate(dispatch, saved).then((status) => {
      pending = false;
      if (status !== "ready") refresh = null;
      return status;
    });
  }
  return refresh;
}

async function locate(
  dispatch: AppDispatch,
  saved: PrayerLocation | null,
): Promise<LocationStatus> {
  let Location: typeof import("expo-location");
  try {
    Location = await import("expo-location");
  } catch {
    return saved ? "ready" : "error";
  }

  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) return saved ? "ready" : "denied";

  try {
    const fix =
      (await Location.getLastKnownPositionAsync()) ??
      (await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }));
    const next = {
      latitude: fix.coords.latitude,
      longitude: fix.coords.longitude,
      city: saved?.city ?? null,
    };
    const moved = !saved || distanceKm(saved, next) > MOVED_KM;
    const untranslated = !saved?.city || saved.city.ar === saved.city.en;
    const due =
      !saved?.cityLookupAt || Date.now() - saved.cityLookupAt > LOOKUP_RETRY;
    if (moved || (untranslated && due)) {
      const found = await lookupCityName(next, Location);
      const city = found ?? (moved ? null : (saved?.city ?? null));
      const base = moved || !saved ? next : saved;
      dispatch(setPrayerLocation({ ...base, city, cityLookupAt: Date.now() }));
    }
    return "ready";
  } catch {
    return saved ? "ready" : "error";
  }
}

export default function usePrayerLocation() {
  const dispatch = useAppDispatch();
  const location = useAppSelector((s) => s.settings.prayerLocation);
  const [status, setStatus] = useState<LocationStatus>(
    location ? "ready" : "loading",
  );

  const run = useCallback(
    (force: boolean) => {
      startLocate(dispatch, location, force).then(setStatus);
    },
    [dispatch, location],
  );

  useEffect(() => {
    run(false);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active" || Store.getState().settings.prayerLocation) {
        return;
      }
      startLocate(dispatch, null, true).then(setStatus);
    });
    return () => subscription.remove();
  }, []);

  const retry = useCallback(() => {
    setStatus("loading");
    run(true);
  }, [run]);

  return { location, status: location ? "ready" : status, retry };
}

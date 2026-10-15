import type * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import {
  CityName,
  lookupCityName,
} from "@/features/prayer-times/_data/cityName";
import { Store } from "@/store/Store";
import { distanceToKaaba, normalize180, qiblaBearing } from "../_data/qibla";

type Status = "loading" | "denied" | "error" | "ready";
type Reading = { offset: number; aligned: boolean };
type Coords = { latitude: number; longitude: number };

const ALIGNED_WITHIN = 5;
const THROTTLE_MS = 100;

const sameReading = (a: Reading, b: Reading) =>
  a.offset === b.offset && a.aligned === b.aligned;

export default function useQibla() {
  const [saved] = useState(() => Store.getState().settings.prayerLocation);
  const [status, setStatus] = useState<Status>(saved ? "ready" : "loading");
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [coords, setCoords] = useState<Coords | null>(saved);
  const [city, setCity] = useState<CityName | null>(saved?.city ?? null);
  const heading = useSharedValue(0);
  const [reading, setReading] = useState<Reading | null>(null);
  const [accuracy, setAccuracy] = useState(3);
  const [attempt, setAttempt] = useState(0);
  const bearing = useMemo(
    () => (coords ? qiblaBearing(coords) : null),
    [coords],
  );
  const distance = useMemo(
    () => (coords ? distanceToKaaba(coords) : null),
    [coords],
  );
  const bearingRef = useRef(bearing);
  const rawHeading = useRef<number | null>(null);
  const report = useRef<((value: number) => void) | null>(null);

  useEffect(() => {
    bearingRef.current = bearing;
    if (rawHeading.current !== null) report.current?.(rawHeading.current);
  }, [bearing]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!saved) setStatus("loading");
      let Location: typeof import("expo-location");
      try {
        Location = await import("expo-location");
      } catch {
        if (!cancelled) setStatus("error");
        return;
      }
      const permission = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (!permission.granted) {
        setCanAskAgain(permission.canAskAgain);
        setStatus("denied");
        return;
      }

      let fix: Coords | null = saved;
      try {
        const last = await Location.getLastKnownPositionAsync();
        if (last && !cancelled) {
          fix = last.coords;
          setCoords(last.coords);
          setStatus("ready");
        }
      } catch {}

      try {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        fix = current.coords;
        setCoords(current.coords);
        setStatus("ready");
      } catch {
        if (!cancelled && !fix) setStatus("error");
      }

      if (fix && (fix !== saved || !saved?.city)) {
        const name = await lookupCityName(fix, Location);
        if (!cancelled) setCity((old) => name ?? old);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useFocusEffect(
    useCallback(() => {
      if (status !== "ready" || Platform.OS === "web") return;
      let cancelled = false;
      let subscription: Location.LocationSubscription | undefined;
      let shown: Reading | null = null;
      let pending: Reading | null = null;
      let shownAt = 0;
      let lastAccuracy: number | null = null;
      let timer: ReturnType<typeof setTimeout> | undefined;

      const flush = () => {
        timer = undefined;
        if (!pending) return;
        shown = pending;
        pending = null;
        shownAt = Date.now();
        setReading(shown);
      };

      report.current = (value: number) => {
        const target = bearingRef.current;
        if (target === null) return;
        const exact = normalize180(target - value);
        const next = {
          offset: Math.sign(exact) * Math.round(Math.abs(exact)),
          aligned: Math.abs(exact) <= ALIGNED_WITHIN,
        };
        if (shown && sameReading(shown, next)) {
          pending = null;
          return;
        }
        pending = next;
        const elapsed = Date.now() - shownAt;
        if (
          !shown ||
          shown.aligned !== next.aligned ||
          elapsed >= THROTTLE_MS
        ) {
          clearTimeout(timer);
          flush();
        } else if (!timer) {
          timer = setTimeout(flush, THROTTLE_MS - elapsed);
        }
      };

      (async () => {
        try {
          const Location = await import("expo-location");
          const next = await Location.watchHeadingAsync((h) => {
            const value = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
            rawHeading.current = value;
            heading.set(value);
            report.current?.(value);
            if (h.accuracy !== lastAccuracy) {
              lastAccuracy = h.accuracy;
              setAccuracy(h.accuracy);
            }
          });
          if (cancelled) next.remove();
          else subscription = next;
        } catch {}
      })();

      return () => {
        cancelled = true;
        subscription?.remove();
        clearTimeout(timer);
        report.current = null;
        rawHeading.current = null;
        heading.set(0);
        setReading(null);
      };
    }, [status, heading]),
  );

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return {
    status,
    canAskAgain,
    city,
    heading,
    offset: reading?.offset ?? null,
    aligned: reading?.aligned ?? false,
    accuracy,
    bearing,
    distance,
    retry,
  };
}

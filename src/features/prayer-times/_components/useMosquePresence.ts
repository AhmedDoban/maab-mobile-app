import { setActiveMosque, setMosqueInside } from "@/store/Slices/MosquesSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import { useEffect } from "react";
import { AppState } from "react-native";
import { distanceKm } from "../_data/geo";
import { loadMosquePresence, syncMosqueGeofences } from "./mosqueGeofence";

const CHECK_INTERVAL = 60_000;

export default function useMosquePresence() {
  const dispatch = useAppDispatch();
  const { items, activeId, automaticDetection } = useAppSelector(
    (state) => state.mosques,
  );

  useEffect(() => {
    syncMosqueGeofences(items, automaticDetection).catch(() => {});
    loadMosquePresence()
      .then((presence) => {
        if (!presence) return;
        dispatch(setMosqueInside(presence.inside));
        if (presence.mosqueId) dispatch(setActiveMosque(presence.mosqueId));
      })
      .catch(() => {});
  }, [automaticDetection, dispatch, items]);

  useEffect(() => {
    if (!automaticDetection || items.length === 0) return;
    let active = true;

    const check = async () => {
      try {
        const Location = await import("expo-location");
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted || !active) return;
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const mosque = items.find(
          (item) =>
            distanceKm(item, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }) *
              1000 <=
            item.radius,
        );
        if (mosque?.id !== activeId) {
          dispatch(setMosqueInside(mosque !== undefined));
          if (mosque) dispatch(setActiveMosque(mosque.id));
        }
      } catch {
        return;
      }
    };

    check();
    const timer = setInterval(check, CHECK_INTERVAL);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => {
      active = false;
      clearInterval(timer);
      subscription.remove();
    };
  }, [automaticDetection, dispatch, items, activeId]);
}

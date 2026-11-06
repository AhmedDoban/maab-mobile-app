import { setActiveMosque, setMosqueInside } from "@/store/Slices/MosquesSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import { useEffect } from "react";
import { AppState } from "react-native";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { distanceKm } from "../_data/geo";
import { loadMosquePresence, syncMosqueGeofences } from "./mosqueGeofence";

const CHECK_INTERVAL = 300_000;

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
        const background = await Location.getBackgroundPermissionsAsync();
        if (Constants.appOwnership !== "expo" && background.granted) {
          return;
        }
        const permission = await Location.getForegroundPermissionsAsync();
        if (!permission.granted || !active) return;
        const position =
          (await Location.getLastKnownPositionAsync()) ??
          (await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }));
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

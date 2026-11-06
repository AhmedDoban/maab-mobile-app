import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";
import { scheduleAdhanAlarms } from "../../../../modules/adhan-alarm";
import type { Mosque } from "../_data/mosques";

export const MOSQUE_GEOFENCE_TASK = "maab-mosque-geofence";
const PRESENCE_KEY = "MAAB_MOSQUE_PRESENCE";

type Presence = { inside: boolean; mosqueId: string | null };

async function setPresence(presence: Presence) {
  await AsyncStorage.setItem(PRESENCE_KEY, JSON.stringify(presence));
  if (!presence.inside) return;
  scheduleAdhanAlarms([]);
  try {
    const Notifications = await import("expo-notifications");
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((item) => item.identifier.startsWith("prayer-"))
        .map((item) =>
          Notifications.cancelScheduledNotificationAsync(item.identifier),
        ),
    );
  } catch {
    return;
  }
}

if (Platform.OS !== "web") {
  if (TaskManager.isTaskDefined(MOSQUE_GEOFENCE_TASK)) {
    TaskManager.unregisterTaskAsync(MOSQUE_GEOFENCE_TASK).catch(() => {});
  }

  TaskManager.defineTask(MOSQUE_GEOFENCE_TASK, async ({ data, error }) => {
    if (error || !data) return;
    const event = data as {
      eventType: Location.GeofencingEventType;
      region: { identifier: string };
    };
    const region = event.region;
    const entered = event.eventType === Location.GeofencingEventType.Enter;
    await setPresence({
      inside: entered,
      mosqueId: entered ? region.identifier : null,
    });
  });
}

export async function syncMosqueGeofences(mosques: Mosque[], enabled: boolean) {
  if (
    Platform.OS === "web" ||
    Constants.appOwnership === "expo" ||
    !enabled ||
    mosques.length === 0
  ) {
    await Location.stopGeofencingAsync(MOSQUE_GEOFENCE_TASK).catch(() => {});
    return;
  }
  const permission = await Location.getBackgroundPermissionsAsync();
  if (!permission.granted) return;
  await Location.startGeofencingAsync(
    MOSQUE_GEOFENCE_TASK,
    mosques.map((mosque) => ({
      identifier: mosque.id,
      latitude: mosque.latitude,
      longitude: mosque.longitude,
      radius: mosque.radius,
      notifyOnEnter: true,
      notifyOnExit: true,
    })),
  );
}

export async function loadMosquePresence(): Promise<Presence | null> {
  const raw = await AsyncStorage.getItem(PRESENCE_KEY);
  return raw ? JSON.parse(raw) : null;
}

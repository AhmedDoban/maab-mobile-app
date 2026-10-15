import { isRunningInExpoGo } from "expo";
import { AppState, Platform } from "react-native";
import {
  AdhanSoundId,
  BUNDLED_SOUNDS,
  channelId,
  notificationSound,
} from "../_data/adhanSounds";
import { PrayerName } from "../_data/types";
import {
  adhanAlarmAvailable,
  addAdhanEndListener,
  addAdhanListener,
  consumeAdhanLaunch,
  dismissAdhanAlarm,
  scheduleAdhanAlarms,
  stopAdhanAlarm,
} from "../../../../modules/adhan-alarm";

const ID_PREFIX = "prayer-";
const supported =
  Platform.OS !== "web" && !(Platform.OS === "android" && isRunningInExpoGo());
const Notifications: typeof import("expo-notifications") | null = supported
  ? require("expo-notifications")
  : null;

let configured: Promise<void> | null = null;
let channelNames = "";
let handlerSet = false;

export function configurePrayerNotifications(
  channelName: (id: AdhanSoundId) => string,
) {
  if (!Notifications) return Promise.resolve();
  const names = BUNDLED_SOUNDS.map(({ id }) => channelName(id)).join("|");
  if (configured && names === channelNames) return configured;
  channelNames = names;

  if (!handlerSet) {
    handlerSet = true;
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => ({
        shouldShowBanner: false,
        shouldShowList: true,
        shouldPlaySound: !String(
          notification.request.content.sound ?? "",
        ).startsWith("adhan_"),
        shouldSetBadge: false,
      }),
    });
  }

  configured = createChannels(channelName);
  return configured;
}

function createChannels(channelName: (id: AdhanSoundId) => string) {
  if (!Notifications) return Promise.resolve();
  const channels =
    Platform.OS === "android"
      ? BUNDLED_SOUNDS.map(({ id }) =>
          Notifications.setNotificationChannelAsync(channelId(id), {
            name: channelName(id),
            importance: Notifications.AndroidImportance.MAX,
            sound: notificationSound(id, false),
            vibrationPattern: [0, 400, 200, 400],
          }).catch(() => null),
        )
      : [];
  return Promise.all(channels).then(() => {});
}

export async function hasNotificationPermission() {
  if (!Notifications) return false;
  return (await Notifications.getPermissionsAsync()).granted;
}

export async function ensureNotificationPermission() {
  if (!Notifications) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

type PrayerAlert = { prayer: PrayerName; date: Date };

type SyncOptions = {
  alerts: PrayerAlert[];
  sound: AdhanSoundId;
  customUri: string | null;
  channelName: (id: AdhanSoundId) => string;
  playbackChannel: string;
  stopLabel: string;
  title: (prayer: PrayerName, date: Date) => string;
  body: string;
};

const SYNC_DELAY = 500;
let generation = 0;
let pendingSync: ReturnType<typeof setTimeout> | undefined;

const signature = (value: string) => {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
};

export function syncPrayerNotifications(options: SyncOptions) {
  if (!Notifications) return;
  clearTimeout(pendingSync);
  const run = ++generation;
  pendingSync = setTimeout(() => {
    reschedule(options, run).catch(() => {});
  }, SYNC_DELAY);
}

async function reschedule(
  {
    alerts,
    sound,
    customUri,
    channelName,
    playbackChannel,
    stopLabel,
    title,
    body,
  }: SyncOptions,
  run: number,
) {
  if (!Notifications) return;
  const stale = () => run !== generation;
  await configurePrayerNotifications(channelName);
  if (stale()) return;
  if (!(await Notifications.getPermissionsAsync()).granted || stale()) return;

  const now = Date.now();
  const wanted = new Map<
    string,
    { prayer: PrayerName; date: Date; title: string }
  >();
  for (const { prayer, date } of alerts) {
    if (date.getTime() <= now) continue;
    const text = title(prayer, date);
    const id = `${ID_PREFIX}${date.getTime()}-${prayer}-${signature(
      `${sound}|${text}|${body}`,
    )}`;
    wanted.set(id, { prayer, date, title: text });
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  if (stale()) return;

  if (adhanAlarmAvailable) {
    await Promise.all(
      scheduled
        .map((item) => item.identifier)
        .filter((id) => id.startsWith(ID_PREFIX))
        .map((id) =>
          Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
        ),
    );
    if (stale()) return;
    scheduleAdhanAlarms(
      [...wanted].map(([id, { prayer, date, title: text }]) => ({
        id,
        at: date.getTime(),
        prayer,
        title: text,
        body,
        channelId: channelId(sound),
        sound: channelId(sound),
        soundUri: sound === "custom" ? (customUri ?? "") : "",
        channelName: playbackChannel,
        stopLabel,
      })),
    );
    return;
  }

  const existing = new Set(
    scheduled
      .map((item) => item.identifier)
      .filter((id) => id.startsWith(ID_PREFIX)),
  );

  await Promise.all(
    [...existing]
      .filter((id) => !wanted.has(id))
      .map((id) =>
        Notifications.cancelScheduledNotificationAsync(id).catch(() => {}),
      ),
  );

  for (const [identifier, { prayer, date, title: text }] of wanted) {
    if (stale()) return;
    if (existing.has(identifier)) continue;
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: text,
        body,
        sound: notificationSound(sound, Platform.OS === "ios"),
        data: { prayer },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: channelId(sound),
      },
    }).catch(() => {});
  }
}

export const stopAdhan = () => stopAdhanAlarm();

export const adhanPlaysNatively = () =>
  adhanAlarmAvailable && AppState.currentState !== "active";

export function onAdhanEnded(onEnd: () => void) {
  const sub = addAdhanEndListener(onEnd);
  return () => sub?.remove();
}

export function onPrayerNotificationOpened(
  onOpen: (prayer: unknown, nativeAudio: boolean) => void,
) {
  if (adhanAlarmAvailable) {
    const open = (
      launch: {
        prayer: string;
        id: string;
        at: number;
        native: boolean;
      } | null,
    ) => {
      if (!launch) return;
      if (!launch.native) dismissAdhanAlarm(launch.id);
      if (Date.now() - launch.at > 30 * 60 * 1000) return;
      onOpen(launch.prayer, launch.native);
    };
    open(consumeAdhanLaunch());
    const sub = addAdhanListener(open);
    return () => sub?.remove();
  }
  if (!Notifications) return () => {};
  Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (!response) return;
      const opened = response.notification.request;
      if (!opened.identifier.startsWith(ID_PREFIX)) return;
      if (Date.now() - response.notification.date > 30 * 60 * 1000) return;
      onOpen(opened.content.data?.prayer, false);
    })
    .catch(() => {});
  const sub = Notifications.addNotificationResponseReceivedListener(
    (response) =>
      onOpen(response.notification.request.content.data?.prayer, false),
  );
  return () => sub.remove();
}

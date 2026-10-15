import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import type { EventSubscription } from "expo-modules-core";

export type AdhanAlarm = {
  id: string;
  at: number;
  prayer: string;
  title: string;
  body: string;
  channelId: string;
  sound: string;
  soundUri: string;
  channelName: string;
  stopLabel: string;
};

export type AdhanLaunch = {
  prayer: string;
  id: string;
  at: number;
  native: boolean;
};

type NativeAdhanAlarm = {
  schedule(alarms: AdhanAlarm[]): void;
  consumeLaunch(): AdhanLaunch | null;
  dismiss(id: string): void;
  stop(): void;
  addListener(
    event: "onAdhan",
    listener: (launch: AdhanLaunch) => void,
  ): EventSubscription;
  addListener(
    event: "onAdhanEnd",
    listener: (event: { id: string | null }) => void,
  ): EventSubscription;
};

const native =
  Platform.OS === "android"
    ? requireOptionalNativeModule<NativeAdhanAlarm>("AdhanAlarm")
    : null;

export const adhanAlarmAvailable = native !== null;

export const scheduleAdhanAlarms = (alarms: AdhanAlarm[]) =>
  native?.schedule(alarms);

export const consumeAdhanLaunch = () => native?.consumeLaunch() ?? null;

export const dismissAdhanAlarm = (id: string) => native?.dismiss(id);

export const stopAdhanAlarm = () => native?.stop();

export const addAdhanListener = (listener: (launch: AdhanLaunch) => void) =>
  native?.addListener("onAdhan", listener) ?? null;

export const addAdhanEndListener = (listener: () => void) =>
  native?.addListener("onAdhanEnd", listener) ?? null;

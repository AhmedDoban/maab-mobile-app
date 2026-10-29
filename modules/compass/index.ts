import { Platform } from "react-native";
import { requireOptionalNativeModule, type EventSubscription } from "expo";

export type CompassReading = {
  heading: number;
  accuracy: number;
  interference?: boolean;
};

type NativeCompass = {
  isAvailable(): boolean;
  setLocation(latitude: number, longitude: number): void;
  addListener(
    event: "onHeading",
    listener: (reading: CompassReading) => void,
  ): EventSubscription;
};

const native =
  Platform.OS === "android"
    ? requireOptionalNativeModule<NativeCompass>("Compass")
    : null;

export const compassAvailable = (() => {
  try {
    return native?.isAvailable() ?? false;
  } catch {
    return false;
  }
})();

export function watchCompass(
  coords: { latitude: number; longitude: number },
  listener: (reading: CompassReading) => void,
) {
  if (!native || !compassAvailable) return null;
  native.setLocation(coords.latitude, coords.longitude);
  return native.addListener("onHeading", listener);
}

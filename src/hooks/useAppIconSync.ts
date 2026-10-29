import { appIconName, iconAlias, ICON_ALIASES } from "@/constants/appIcons";
import { savePersistedState } from "@/store/persist";
import { Store, useAppSelector } from "@/store/Store";
import { requireOptionalNativeModule } from "expo";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import {
  androidAppIconAvailable,
  setAndroidAppIcon,
} from "../../modules/app-icon";

type AlternateIcons = typeof import("expo-alternate-app-icons");

const loadIosIcons = (): AlternateIcons | null =>
  Platform.OS === "ios" && requireOptionalNativeModule("ExpoAlternateAppIcons")
    ? require("expo-alternate-app-icons")
    : null;

const saveState = () => savePersistedState(Store.getState());

export default function useAppIconSync() {
  const palette = useAppSelector((s) => s.settings.palette);
  const launched = useRef(false);

  useEffect(() => {
    const changed = launched.current;
    launched.current = true;
    if (Platform.OS === "ios") {
      const icons = loadIosIcons();
      if (!icons?.supportsAlternateIcons) return;
      const target = appIconName(palette);
      if (icons.getAppIconName() === target) return;
      saveState()
        .then(() => icons.setAlternateAppIcon(target))
        .catch(() => {});
      return;
    }

    if (!androidAppIconAvailable) return;
    const target = iconAlias(palette);
    if (!changed) {
      setAndroidAppIcon(target, ICON_ALIASES);
      return;
    }
    saveState().then(() => setAndroidAppIcon(target, ICON_ALIASES));
  }, [palette]);
}

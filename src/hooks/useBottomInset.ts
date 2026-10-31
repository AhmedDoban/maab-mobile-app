import { useAppSelector } from "@/store/Store";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function useBottomInset() {
  const insets = useSafeAreaInsets();
  const fullScreen = useAppSelector((s) => s.settings.fullScreen);
  return Platform.OS === "android" && fullScreen ? 0 : insets.bottom;
}

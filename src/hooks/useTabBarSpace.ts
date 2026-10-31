import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useBottomInset from "./useBottomInset";

export default function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  return Platform.OS === "ios" ? insets.bottom : bottomInset + 88;
}

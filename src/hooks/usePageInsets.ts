import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useFloatingTabBarSpace from "./useFloatingTabBarSpace";

export default function usePageInsets() {
  const insets = useSafeAreaInsets();
  const tabBarSpace = useFloatingTabBarSpace();
  return {
    paddingTop: (Platform.OS === "ios" ? 0 : insets.top) + 4,
    paddingBottom: 16 + tabBarSpace,
  };
}

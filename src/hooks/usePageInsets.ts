import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTabBarSpace from "./useTabBarSpace";

export default function usePageInsets() {
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  return {
    paddingTop: (Platform.OS === "ios" ? 0 : insets.top) + 4,
    paddingBottom: 16 + tabBarSpace,
  };
}

import { Platform } from "react-native";
import useTabBarSpace from "./useTabBarSpace";

export default function useFloatingTabBarSpace() {
  const tabBarSpace = useTabBarSpace();
  return Platform.OS === "android" ? tabBarSpace : 0;
}

import { View } from "react-native";

export default function PrayerConnector({ hidden }: { hidden: boolean }) {
  return (
    <View className="w-2 items-center self-center">
      <View
        className="h-8 w-px rounded-full bg-line"
        style={{ opacity: hidden ? 0 : 1 }}
      />
    </View>
  );
}

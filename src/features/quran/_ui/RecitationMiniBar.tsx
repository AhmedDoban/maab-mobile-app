import { pageOf } from "@/features/azkar/_data/quran";
import useBottomInset from "@/hooks/useBottomInset";
import { router } from "expo-router";
import { useCallback } from "react";
import { Platform, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useRecitationPlayer from "../_components/useRecitationPlayer";
import { mushafHref } from "../_data/mushafHref";
import RecitationPlayer from "./RecitationPlayer";

const TAB_BAR = Platform.OS === "android" ? 62 + 16 : 56;
const SHADOW = { boxShadow: "0 8px 24px rgba(9, 43, 56, 0.16)" };

export default function RecitationMiniBar({ hidden }: { hidden: boolean }) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
  const { current, playing, loading, pause, resume, stop } =
    useRecitationPlayer();
  const open = useCallback(() => {
    if (!current) return;
    router.push(
      mushafHref({ ...current, page: pageOf(current.surah, current.ayah) }),
    );
  }, [current]);
  if (hidden || !current) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutDown.duration(180)}
      pointerEvents="box-none"
      className="absolute inset-x-0 items-center"
      style={{
        bottom: bottomInset + TAB_BAR + 10,
        paddingHorizontal: Math.max(insets.left, insets.right) + 14,
      }}
    >
      <View className="w-full max-w-xl rounded-full" style={SHADOW}>
        <RecitationPlayer
          current={current}
          playing={playing}
          loading={loading}
          onPlay={resume}
          onPause={pause}
          onStop={stop}
          onOpen={open}
        />
      </View>
    </Animated.View>
  );
}

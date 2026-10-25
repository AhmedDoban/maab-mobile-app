import PressableScale from "@/components/ui/PressableScale";
import useMushafColors from "@/features/quran/_components/useMushafColors";
import useThemeColors from "@/hooks/useThemeColors";
import { FRAME_IMAGES } from "@/features/quran/_data/frameImages";
import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, View } from "react-native";

export default memo(function SurahFramePreview({
  id,
  selected,
  onPress,
}: {
  id: number;
  selected: boolean;
  onPress: (id: number) => void;
}) {
  const colors = useThemeColors();
  const mushaf = useMushafColors();

  return (
    <PressableScale
      scaleTo={0.97}
      onPress={() => onPress(id)}
      accessibilityState={{ selected }}
      className="rounded-2xl border-2 px-3 py-2"
      style={{
        borderColor: selected ? colors.main : "transparent",
        backgroundColor: mushaf.page,
      }}
    >
      <View
        style={{ aspectRatio: 6.4 }}
        className="items-center justify-center"
      >
        <Image
          source={FRAME_IMAGES[id - 1]}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          transition={0}
        />
      </View>
    </PressableScale>
  );
});

import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

export default function HeroScene({ source }: { source: ImageSourcePropType }) {
  return (
    <>
      <Image
        source={source}
        resizeMode="cover"
        style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
        accessibilityIgnoresInvertColors
      />
      <Svg
        style={StyleSheet.absoluteFill}
        preserveAspectRatio="none"
        viewBox="0 0 1 1"
      >
        <Defs>
          <LinearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000" stopOpacity="0.45" />
            <Stop offset="0.3" stopColor="#000" stopOpacity="0" />
            <Stop offset="0.5" stopColor="#000" stopOpacity="0.05" />
            <Stop offset="1" stopColor="#000" stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        <Rect width="1" height="1" fill="url(#heroFade)" />
      </Svg>
    </>
  );
}

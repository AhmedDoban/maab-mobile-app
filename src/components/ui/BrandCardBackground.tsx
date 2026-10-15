import useThemeColors from "@/hooks/useThemeColors";
import { Image, StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

const DECOR = require("@/assets/images/NextPray_bg.webp");
const styles = StyleSheet.create({
  decor: { ...StyleSheet.absoluteFill, width: "100%", height: "100%" },
});

export default function BrandCardBackground({ id }: { id: string }) {
  const colors = useThemeColors();

  return (
    <>
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.brand.mid} />
            <Stop offset="1" stopColor={colors.brand.deep} />
          </LinearGradient>
        </Defs>
        <Rect width="1" height="1" fill={`url(#${id})`} />
      </Svg>
      <Image source={DECOR} resizeMode="cover" style={styles.decor} />
    </>
  );
}

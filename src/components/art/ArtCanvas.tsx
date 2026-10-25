import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import Svg from "react-native-svg";

export const ART_W = 260;
export const ART_H = 200;

export default function ArtCanvas({ children }: PropsWithChildren) {
  return (
    <View style={{ width: "100%", aspectRatio: ART_W / ART_H }}>
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${ART_W} ${ART_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {children}
      </Svg>
    </View>
  );
}

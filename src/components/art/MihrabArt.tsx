import useArtColors from "@/hooks/useArtColors";
import { memo } from "react";
import {
  Circle,
  ClipPath,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import ArtCanvas from "./ArtCanvas";
import ArtLantern from "./ArtLantern";
import ArtLeaves from "./ArtLeaves";

const OUTER = "M70 200V96C70 60 100 40 130 14C160 40 190 60 190 96V200Z";
const INNER = "M84 200V100C84 70 108 54 130 32C152 54 176 70 176 100V200Z";
const LATTICE = [-60, -30, 0, 30, 60, 90, 120];

export default memo(function MihrabArt() {
  const c = useArtColors();

  return (
    <ArtCanvas>
      <Defs>
        <LinearGradient id="mihrabGlass" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c.tint} stopOpacity={0.18} />
          <Stop offset="1" stopColor={c.tint} stopOpacity={0.38} />
        </LinearGradient>
        <ClipPath id="mihrabInner">
          <Path d={INNER} />
        </ClipPath>
      </Defs>

      <Circle cx={60} cy={120} r={56} fill={c.tint} opacity={0.06} />
      <Circle cx={198} cy={92} r={56} fill={c.tint} opacity={0.05} />

      <Path d={OUTER} fill={c.frame} stroke={c.frameEdge} strokeWidth={1.5} />
      <Path d={INNER} fill="url(#mihrabGlass)" />
      <G clipPath="url(#mihrabInner)" opacity={0.35}>
        {LATTICE.map((offset) => (
          <G key={offset}>
            <Line
              x1={84 + offset}
              y1={30}
              x2={176 + offset}
              y2={200}
              stroke={c.frame}
              strokeWidth={1}
            />
            <Line
              x1={176 - offset}
              y1={30}
              x2={84 - offset}
              y2={200}
              stroke={c.frame}
              strokeWidth={1}
            />
          </G>
        ))}
        <Path d="M130 32V200" stroke={c.frame} strokeWidth={1.2} />
      </G>

      <ArtLantern x={218} chain={58} />
      <ArtLeaves x={52} y={186} scale={1.2} />
    </ArtCanvas>
  );
});

import useArtColors from "@/hooks/useArtColors";
import { memo } from "react";
import { Circle, G, Path } from "react-native-svg";
import ArtCanvas from "./ArtCanvas";
import ArtLantern from "./ArtLantern";
import ArtLeaves from "./ArtLeaves";
import ArtStar from "./ArtStar";

const LINES = [0, 1, 2, 3, 4, 5];

export default memo(function HadithArt() {
  const c = useArtColors();

  return (
    <ArtCanvas>
      <Circle cx={130} cy={110} r={78} fill={c.tint} opacity={0.07} />
      <Circle cx={60} cy={70} r={34} fill={c.tint} opacity={0.05} />

      <Path
        d="M40 168C80 150 110 154 130 170C150 154 180 150 220 168V190C180 172 150 176 130 192C110 176 80 172 40 190Z"
        fill={c.tint}
        opacity={0.3}
      />
      <Path
        d="M44 82C82 66 112 70 130 88V172C112 156 82 152 44 168Z"
        fill={c.frame}
        stroke={c.frameEdge}
        strokeWidth={1.5}
      />
      <Path
        d="M216 82C178 66 148 70 130 88V172C148 156 178 152 216 168Z"
        fill={c.frame}
        stroke={c.frameEdge}
        strokeWidth={1.5}
      />
      <Path d="M130 88V172" stroke={c.goldDeep} strokeWidth={1.5} />
      {LINES.map((i) => (
        <G key={i} opacity={0.55}>
          <Path
            d={`M58 ${96 + i * 11}C80 ${90 + i * 11} 100 ${92 + i * 11} 120 ${102 + i * 11}`}
            stroke={c.tint}
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M202 ${96 + i * 11}C180 ${90 + i * 11} 160 ${92 + i * 11} 140 ${102 + i * 11}`}
            stroke={c.tint}
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      ))}
      <ArtStar cx={130} cy={66} size={16} color={c.gold} filled />

      <ArtLantern x={226} chain={30} scale={0.85} />
      <ArtLeaves x={28} y={184} scale={1} />
    </ArtCanvas>
  );
});

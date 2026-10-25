import useArtColors from "@/hooks/useArtColors";
import { Circle, G, Line, Path, Rect } from "react-native-svg";

export default function ArtLantern({
  x,
  chain,
  scale = 1,
}: {
  x: number;
  chain: number;
  scale?: number;
}) {
  const c = useArtColors();

  return (
    <G transform={`translate(${x} 0) scale(${scale})`}>
      <Line x1={0} y1={0} x2={0} y2={chain} stroke={c.gold} strokeWidth={1} />
      <G transform={`translate(0 ${chain})`}>
        <Circle
          cx={0}
          cy={2}
          r={3}
          fill="none"
          stroke={c.gold}
          strokeWidth={1.2}
        />
        <Path d="M-9 12L0 5L9 12Z" fill={c.goldDeep} />
        <Rect x={-11} y={12} width={22} height={3} rx={1.5} fill={c.gold} />
        <Path d="M-9 15H9L11 40H-11Z" fill={c.goldDeep} />
        <Path d="M-6 18H6L7.5 37H-7.5Z" fill={c.glow} opacity={0.95} />
        <Line
          x1={0}
          y1={18}
          x2={0}
          y2={37}
          stroke={c.goldDeep}
          strokeWidth={1}
        />
        <Rect x={-13} y={40} width={26} height={3} rx={1.5} fill={c.gold} />
        <Path d="M-8 43H8L0 54Z" fill={c.goldDeep} />
        <Circle cx={0} cy={56} r={2} fill={c.gold} />
      </G>
    </G>
  );
}

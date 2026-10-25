import useArtColors from "@/hooks/useArtColors";
import { G, Path } from "react-native-svg";

const LEAF = "M0 0C7-9 22-10 30 0C22 10 7 9 0 0Z";
const LEAVES: [number, number, number, number][] = [
  [10, -34, -62, 0.9],
  [4, -58, -100, 0.8],
  [14, -16, -20, 1],
  [-2, -46, -150, 0.85],
  [20, -2, 12, 0.95],
];

export default function ArtLeaves({
  x,
  y,
  scale = 1,
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
}) {
  const c = useArtColors();

  return (
    <G
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}
    >
      <Path
        d="M0 0C6-20 8-42 2-70"
        stroke={c.leafDeep}
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
      />
      {LEAVES.map(([lx, ly, angle, size]) => (
        <G
          key={`${lx}-${ly}`}
          transform={`translate(${lx} ${ly}) rotate(${angle}) scale(${size})`}
        >
          <Path d={LEAF} fill={c.leaf} />
          <Path
            d="M2 0L27 0"
            stroke={c.leafDeep}
            strokeWidth={0.8}
            opacity={0.6}
          />
        </G>
      ))}
    </G>
  );
}

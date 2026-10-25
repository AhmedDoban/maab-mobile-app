import { G, Rect } from "react-native-svg";

export default function ArtStar({
  cx,
  cy,
  size,
  color,
  filled = false,
}: {
  cx: number;
  cy: number;
  size: number;
  color: string;
  filled?: boolean;
}) {
  const half = size / 2;
  const square = {
    x: cx - half,
    y: cy - half,
    width: size,
    height: size,
    fill: filled ? color : "none",
    stroke: color,
    strokeWidth: 1.6,
    strokeLinejoin: "round" as const,
  };

  return (
    <G>
      <Rect {...square} />
      <Rect {...square} transform={`rotate(45 ${cx} ${cy})`} />
    </G>
  );
}

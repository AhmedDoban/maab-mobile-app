import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import AppText from "@/components/ui/AppText";
import Icon, { IconKey } from "@/components/ui/Icon";

const STROKE = 4;

export default function ProgressRing({
  progress,
  color,
  track,
  checkColor = "#ffffff",
  size = 44,
  icon,
}: {
  progress: number;
  color: string;
  track: string;
  checkColor?: string;
  size?: number;
  icon?: IconKey;
}) {
  const r = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * r;
  const complete = progress >= 1;

  if (complete) {
    return (
      <View
        className="items-center justify-center rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      >
        <Icon name="check" size={18} tintColor={checkColor} />
      </View>
    );
  }

  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center"
    >
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </Svg>
      {icon ? (
        <Icon name={icon} size={size / 2} tintColor={color} />
      ) : (
        <AppText
          weight="bold"
          className="text-[11px]"
          style={{ color, textAlign: "center" }}
        >
          {`${Math.round(progress * 100)}%`}
        </AppText>
      )}
    </View>
  );
}

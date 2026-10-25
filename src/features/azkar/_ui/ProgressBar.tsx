import { cn } from "@/lib/utils";
import { View } from "react-native";

export default function ProgressBar({
  progress,
  color,
  track,
  className,
}: {
  progress: number;
  color: string;
  track: string;
  className?: string;
}) {
  const width = `${Math.min(1, Math.max(0, progress)) * 100}%` as const;

  return (
    <View
      className={cn("h-1.5 overflow-hidden rounded-full", className)}
      style={{ backgroundColor: track }}
    >
      <View
        className="h-full rounded-full"
        style={{ width, backgroundColor: color }}
      />
    </View>
  );
}

import AppText from "@/components/ui/AppText";
import Icon, { IconKey } from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import useDirection from "@/hooks/useDirection";
import useThemeColors from "@/hooks/useThemeColors";
import { Href, Link } from "expo-router";
import { View } from "react-native";
import ProgressBar from "./ProgressBar";

export default function WirdRowCard({
  href,
  icon,
  title,
  subtitle,
  progress,
}: {
  href: Href;
  icon: IconKey;
  title: string;
  subtitle: string;
  progress?: number;
}) {
  const colors = useThemeColors();
  const { isRTL } = useDirection();

  return (
    <Link href={href} asChild>
      <PressableScale className="flex-1 flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3">
        <Icon name={icon} size={26} tintColor={colors.main} />
        <View className="flex-1 gap-1">
          <AppText
            weight="bold"
            className="text-[15px] text-ink"
            numberOfLines={2}
          >
            {title}
          </AppText>
          <AppText className="text-xs text-main-gray" numberOfLines={2}>
            {subtitle}
          </AppText>
          {progress === undefined ? null : (
            <ProgressBar
              progress={progress}
              color={colors.main}
              track={colors.line}
              className="mt-1"
            />
          )}
        </View>
        <Icon
          name={isRTL ? "chevronLeft" : "chevronRight"}
          size={16}
          tintColor={colors.gray}
        />
      </PressableScale>
    </Link>
  );
}

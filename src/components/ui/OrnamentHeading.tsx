import useThemeColors from "@/hooks/useThemeColors";
import { View } from "react-native";
import AppText from "./AppText";
import Icon, { IconKey } from "./Icon";
import Ornament from "./Ornament";

export default function OrnamentHeading({
  title,
  subtitle,
  showOrnament,
  icon,
}: {
  title: string;
  subtitle?: string;
  showOrnament?: boolean;
  icon?: IconKey;
}) {
  const colors = useThemeColors();

  return (
    <View className="w-full flex-row items-start gap-3 py-3">
      {icon && <Icon name={icon} size={30} tintColor={colors.main} />}
      <View className="w-full items-start gap-3">
        <View className="w-full flex-row items-center gap-3">
          {showOrnament && <Ornament />}
          <AppText weight="bold" className="text-[24px] text-main">
            {title}
          </AppText>
          {showOrnament && <Ornament flip />}
        </View>
        {subtitle ? (
          <AppText
            className="text-sm text-main-gray"
            style={{ textAlign: showOrnament ? "center" : "auto" }}
          >
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

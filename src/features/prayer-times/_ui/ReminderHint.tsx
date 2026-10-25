import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import useThemeColors from "@/hooks/useThemeColors";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const ENTERING = FadeIn.duration(300);
const EXITING = FadeOut.duration(250);

export default memo(function ReminderHint() {
  const { t } = useTranslation("prayer");
  const colors = useThemeColors();

  return (
    <Animated.View
      entering={ENTERING}
      exiting={EXITING}
      className="flex-row items-center gap-2 self-start rounded-full bg-main-soft px-3 py-1.5"
    >
      <View
        className="size-5 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.mainFill }}
      >
        <Icon name="bell" size={11} tintColor={colors.onFill} />
      </View>
      <AppText className="shrink text-xs text-main">
        {t("reminderHint")}
      </AppText>
    </Animated.View>
  );
});

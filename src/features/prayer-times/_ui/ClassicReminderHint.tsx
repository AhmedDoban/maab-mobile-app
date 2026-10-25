import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const ENTERING = FadeIn.duration(300);
const EXITING = FadeOut.duration(250);
const HINT_STYLE = { backgroundColor: "rgba(255, 255, 255, 0.14)" };

export default memo(function ClassicReminderHint() {
  const { t } = useTranslation("prayer");

  return (
    <Animated.View
      entering={ENTERING}
      exiting={EXITING}
      className="flex-row items-center gap-2 self-start rounded-full px-3 py-1.5"
      style={HINT_STYLE}
    >
      <View className="size-5 items-center justify-center rounded-full bg-white">
        <Icon name="bell" size={11} tintColor="#0e3a33" />
      </View>
      <AppText className="shrink text-xs" style={{ color: "#ffffff" }}>
        {t("reminderHint")}
      </AppText>
    </Animated.View>
  );
});

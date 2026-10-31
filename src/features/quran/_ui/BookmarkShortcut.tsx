import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import useDirection from "@/hooks/useDirection";
import useThemeColors from "@/hooks/useThemeColors";
import { Link } from "expo-router";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useLocalDigits from "../_components/useLocalDigits";
import useSurahName from "../_components/useSurahName";
import { mushafHref, ReadingSpot } from "../_data/mushafHref";

export default memo(function BookmarkShortcut({ spot }: { spot: ReadingSpot }) {
  const { t } = useTranslation("azkar");
  const colors = useThemeColors();
  const { isRTL } = useDirection();
  const num = useLocalDigits();
  const surahName = useSurahName();

  return (
    <Link href={mushafHref(spot)} asChild>
      <PressableScale
        scaleTo={0.98}
        className="flex-row items-center gap-2.5 rounded-2xl bg-main-bg px-3.5 py-2.5"
      >
        <View className="size-8 items-center justify-center rounded-full bg-main-soft">
          <Icon name="bookmarkFill" size={16} tintColor={colors.main} />
        </View>
        <View className="flex-1 gap-0.5">
          <AppText weight="bold" className="text-sm text-ink">
            {t("yourBookmark")}
          </AppText>
          <AppText className="text-xs text-main-gray" numberOfLines={1}>
            {t("verseRef", {
              surah: surahName(spot.surah),
              ayah: num(spot.ayah ?? 1),
            })}
          </AppText>
        </View>
        <Icon
          name={isRTL ? "chevronLeft" : "chevronRight"}
          size={18}
          tintColor={colors.gray}
        />
      </PressableScale>
    </Link>
  );
});

import MushafArt from "@/components/art/MushafArt";
import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import ProgressBar from "@/components/ui/ProgressBar";
import { PAGE_COUNT } from "@/features/azkar/_data/quran";
import useDirection from "@/hooks/useDirection";
import useThemeColors from "@/hooks/useThemeColors";
import { Link } from "expo-router";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useLocalDigits from "../_components/useLocalDigits";
import useReadingStats from "../_components/useReadingStats";
import { mushafHref, ReadingSpot } from "../_data/mushafHref";
import BookmarkShortcut from "./BookmarkShortcut";
import ReadingStat from "./ReadingStat";

export default memo(function ReadingProgressCard({
  spot,
  bookmark,
}: {
  spot: ReadingSpot;
  bookmark: ReadingSpot | null;
}) {
  const { t } = useTranslation("azkar");
  const colors = useThemeColors();
  const { isRTL } = useDirection();
  const num = useLocalDigits();
  const { pages, minutes, lastRead } = useReadingStats();
  const progress = pages / PAGE_COUNT;
  const percent = pages > 0 ? Math.max(1, Math.round(progress * 100)) : 0;

  return (
    <View
      className="gap-2.5 overflow-hidden rounded-3xl border border-line bg-surface p-3.5"
      style={{ boxShadow: "0 6px 18px rgba(9, 43, 56, 0.07)" }}
    >
      <View className="flex-row items-center">
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-1.5 self-start rounded-full bg-main-soft px-2.5 py-1">
            <Icon name="chart" size={13} tintColor={colors.main} />
            <AppText weight="bold" className="text-[11px] text-main">
              {t("readingTracker")}
            </AppText>
          </View>
          <View className="flex-row items-center gap-2.5">
            <View className="size-10 items-center justify-center rounded-full bg-main-soft">
              <Icon name="bookOpen" size={20} tintColor={colors.main} />
            </View>
            <View className="flex-1">
              <AppText
                weight="bold"
                className="text-xs text-ink"
                numberOfLines={1}
              >
                {t("readToday")}
              </AppText>
              <AppText
                weight="bold"
                className="text-base leading-6 text-ink"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {t("pagesCount", { count: pages, num: num(pages) })}
              </AppText>
            </View>
          </View>
        </View>
        <View className="w-[28%]">
          <MushafArt />
        </View>
      </View>

      <View className="gap-2 rounded-2xl bg-main-bg px-3.5 py-2.5">
        <View className="flex-row items-center justify-between gap-2">
          <AppText className="shrink text-xs text-main-gray" numberOfLines={1}>
            {`${t("outOfPrefix")} `}
            <AppText weight="bold" className="text-xs text-main">
              {num(PAGE_COUNT)}
            </AppText>
            {` ${t("outOfSuffix")}`}
          </AppText>
          <AppText weight="bold" className="text-xs text-main">
            {t("approxPercent", { percent: num(percent) })}
          </AppText>
        </View>
        <ProgressBar
          progress={progress}
          color={colors.main}
          track={colors.line}
          className="h-1.5"
        />
      </View>

      <View className="flex-row items-center">
        <ReadingStat
          icon="clock"
          label={t("timeSpent")}
          value={t("minutesCount", { count: minutes, num: num(minutes) })}
        />
        <View className="h-8 w-px bg-line" />
        <ReadingStat icon="calendar" label={t("lastRead")} value={lastRead} />
      </View>

      <Link href={mushafHref(spot)} asChild>
        <PressableScale
          scaleTo={0.98}
          className="flex-row items-center justify-center gap-1.5 rounded-full bg-main-fill py-2.5"
        >
          <AppText weight="bold" className="text-sm text-on-fill">
            {t("continueNow")}
          </AppText>
          <Icon
            name={isRTL ? "chevronLeft" : "chevronRight"}
            size={16}
            tintColor="#ffffff"
          />
        </PressableScale>
      </Link>

      {bookmark ? <BookmarkShortcut spot={bookmark} /> : null}
    </View>
  );
});

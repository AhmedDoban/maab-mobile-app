import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import ProgressBar from "@/components/ui/ProgressBar";
import { getPage } from "@/features/azkar/_data/quran";
import useDirection from "@/hooks/useDirection";
import useThemeColors from "@/hooks/useThemeColors";
import { completeWird, type KhatmaPlan } from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useDueLabel from "../_components/useDueLabel";
import useLocalDigits from "../_components/useLocalDigits";
import { khatmaWirds } from "../_data/khatma";
import { mushafHref } from "../_data/mushafHref";

export default function KhatmaWirdCard({ plan }: { plan: KhatmaPlan }) {
  const { t } = useTranslation("azkar");
  const colors = useThemeColors();
  const { isRTL } = useDirection();
  const dispatch = useAppDispatch();
  const num = useLocalDigits();
  const due = useDueLabel(plan);
  const lastPage = useAppSelector((s) => s.settings.quranLastPage);
  const wirds = khatmaWirds(plan);
  const today = wirds[Math.min(plan.done, wirds.length - 1)];
  const page =
    lastPage !== null && lastPage >= today.from && lastPage <= today.to
      ? lastPage
      : today.from;
  const progress = plan.done / wirds.length;

  const complete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch(completeWird());
  }, [dispatch]);

  return (
    <View
      className="gap-2.5 rounded-3xl border border-line bg-surface p-3.5"
      style={{ boxShadow: "0 6px 18px rgba(9, 43, 56, 0.07)" }}
    >
      <View className="flex-row items-center gap-1.5 self-start rounded-full bg-main-soft px-2.5 py-1">
        <Icon name="quran" size={13} tintColor={colors.main} />
        <AppText weight="bold" className="text-[11px] text-main">
          {t("khatmaTab")}
        </AppText>
      </View>

      <View className="flex-row items-center gap-2.5">
        <View className="size-10 items-center justify-center rounded-full bg-main-soft">
          <Icon name="quran" size={20} tintColor={colors.main} />
        </View>
        <View className="flex-1">
          <AppText weight="bold" className="text-xs text-ink" numberOfLines={1}>
            {due(plan.done).title}
          </AppText>
          <AppText
            weight="bold"
            className="text-base leading-6 text-ink"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {t("khatmaPages", { from: num(today.from), to: num(today.to) })}
          </AppText>
        </View>
      </View>

      <View className="gap-2 rounded-2xl bg-main-bg px-3.5 py-2.5">
        <View className="flex-row items-center justify-between gap-2">
          <AppText className="shrink text-xs text-main-gray" numberOfLines={1}>
            {t("khatmaDay", {
              day: num(plan.done + 1),
              days: num(wirds.length),
            })}
          </AppText>
          <AppText weight="bold" className="text-xs text-main">
            {t("approxPercent", { percent: num(Math.round(progress * 100)) })}
          </AppText>
        </View>
        <ProgressBar
          progress={progress}
          color={colors.main}
          track={colors.line}
          className="h-1.5"
        />
      </View>

      <View className="flex-row gap-2.5">
        <Link
          href={mushafHref({ surah: getPage(page).start.surah, page })}
          asChild
        >
          <PressableScale
            scaleTo={0.98}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-full bg-main-fill py-2.5"
          >
            <AppText weight="bold" className="text-sm text-on-fill">
              {t("continueShort")}
            </AppText>
            <Icon
              name={isRTL ? "chevronLeft" : "chevronRight"}
              size={16}
              tintColor="#ffffff"
            />
          </PressableScale>
        </Link>
        <PressableScale
          scaleTo={0.98}
          onPress={complete}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-full border border-main py-2.5"
        >
          <Icon name="check" size={16} tintColor={colors.main} />
          <AppText weight="bold" className="text-sm text-main">
            {t("khatmaMarkDone")}
          </AppText>
        </PressableScale>
      </View>
    </View>
  );
}

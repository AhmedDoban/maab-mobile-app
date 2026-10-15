import ContentActions from "@/components/ui/ContentActions";
import PressableScale from "@/components/ui/PressableScale";
import useHadithColors from "@/features/hadith/_components/useHadithColors";
import useDirection from "@/hooks/useDirection";
import { Locale } from "@/i18n/config";
import {
  incrementCount,
  progressKey,
  toggleFavoriteZikr,
} from "@/store/Slices/AzkarSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import * as Haptics from "expo-haptics";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import { Zikr } from "../_data";
import ZikrBody from "./ZikrBody";
import ZikrCardBackdrop from "./ZikrCardBackdrop";
import ZikrCounter from "./ZikrCounter";

type Props = {
  categoryId: string;
  zikr: Zikr;
  counting?: boolean;
};

const CARD_SHADOW =
  Platform.OS === "ios"
    ? { boxShadow: "0 4px 14px rgba(9, 43, 56, 0.07)" }
    : { elevation: 2, shadowColor: "rgba(9, 43, 56, 0.35)" };
const BUTTON_SHADOW =
  Platform.OS === "ios"
    ? { boxShadow: "0 2px 8px rgba(9, 43, 56, 0.1)" }
    : { elevation: 2, shadowColor: "rgba(9, 43, 56, 0.4)" };

export default memo(function ZikrCard({
  categoryId,
  zikr,
  counting = true,
}: Props) {
  const { t, i18n } = useTranslation("azkar");
  const locale = i18n.language as Locale;
  const p = useHadithColors();
  const dispatch = useAppDispatch();
  const { isRTL } = useDirection();
  const hapticOnTap = useAppSelector((s) => s.settings.reading.hapticOnTap);
  const hapticOnComplete = useAppSelector(
    (s) => s.settings.reading.hapticOnComplete,
  );
  const key = progressKey(categoryId, zikr.id);
  const counted = useAppSelector((s) => s.azkar.progress[key] ?? 0);
  const loved = useAppSelector((s) => s.azkar.favoriteAdhkar.includes(key));
  const content = zikr[locale];
  const shareText = useMemo(
    () =>
      [
        content.title,
        [content.prefix, content.text, content.suffix]
          .filter(Boolean)
          .join("\n"),
        content.source,
      ]
        .filter(Boolean)
        .join("\n\n"),
    [content],
  );
  const done = counting && counted >= zikr.count;
  const buttonStyle = useMemo(
    () => ({ backgroundColor: p.card, ...BUTTON_SHADOW }),
    [p.card],
  );

  const onCount = () => {
    if (done) return;
    const finishing = counted + 1 >= zikr.count;
    if (finishing && hapticOnComplete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (hapticOnTap) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    dispatch(incrementCount({ categoryId, itemId: zikr.id, max: zikr.count }));
  };

  return (
    <PressableScale
      scaleTo={0.98}
      onPress={counting ? onCount : undefined}
      className="gap-3 overflow-hidden rounded-3xl border px-4 pb-4 pt-3"
      style={{
        borderColor: done ? p.accent : p.line,
        backgroundColor: p.card,
        ...CARD_SHADOW,
      }}
    >
      <ZikrCardBackdrop
        top={p.card}
        bottom={p.paper}
        wave={p.chip}
        ornament={p.accent}
        rtl={isRTL}
      />

      <ZikrBody content={content} arabic={locale === "ar"} />

      <View className="flex-row items-center gap-2 pt-1">
        {counting ? (
          <ZikrCounter counted={counted} count={zikr.count} done={done} />
        ) : null}

        <View className="flex-1" />

        <ContentActions
          text={shareText}
          loved={loved}
          loveLabel={t("saveZikr")}
          onToggleLove={() => dispatch(toggleFavoriteZikr(key))}
          idleColor={p.muted}
          activeColor={p.accent}
          buttonClassName="size-11 rounded-full"
          buttonStyle={buttonStyle}
        />
      </View>
    </PressableScale>
  );
});

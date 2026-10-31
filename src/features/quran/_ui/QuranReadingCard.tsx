import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import { getPage, getSurah } from "@/features/azkar/_data/quran";
import useThemeColors from "@/hooks/useThemeColors";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useContinueReading from "../_components/useContinueReading";
import useLocalDigits from "../_components/useLocalDigits";
import { mushafHref } from "../_data/mushafHref";

export default function QuranReadingCard() {
  const { t } = useTranslation("azkar");
  const colors = useThemeColors();
  const num = useLocalDigits();
  const { last, marked } = useContinueReading();
  const spot = last ?? marked;
  if (!spot) return null;

  const bookmark = last ? marked : null;
  const page = getPage(spot.page);
  const surah = getSurah(spot.surah);

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
      <Link href={mushafHref(spot)} asChild>
        <PressableScale scaleTo={0.98} className="flex-1 gap-0.5">
          <AppText className="text-xs text-main-gray">
            {t("continueReading")}
          </AppText>
          <AppText
            variant="quran"
            weight="bold"
            className="text-base text-ink"
            numberOfLines={1}
          >
            {t("surahTitle", { name: surah?.name ?? "", lng: "ar" })}
          </AppText>
          <AppText className="text-xs text-main-gray" numberOfLines={1}>
            {`${t("pageNumber", { page: num(page.number) })} · ${t("juzNumber", { juz: num(page.juz) })}`}
          </AppText>
        </PressableScale>
      </Link>
      {bookmark ? (
        <Link href={mushafHref(bookmark)} asChild>
          <PressableScale
            scaleTo={0.94}
            accessibilityLabel={t("goToBookmark")}
            hitSlop={6}
            className="size-9 items-center justify-center rounded-full bg-main-soft"
          >
            <Icon name="bookmarkFill" size={16} tintColor={colors.main} />
          </PressableScale>
        </Link>
      ) : null}
      <Link href={mushafHref(spot)} asChild>
        <PressableScale
          scaleTo={0.96}
          className="rounded-full bg-main-fill px-4 py-2"
        >
          <AppText weight="bold" className="text-xs text-on-fill">
            {t("continueShort")}
          </AppText>
        </PressableScale>
      </Link>
    </View>
  );
}

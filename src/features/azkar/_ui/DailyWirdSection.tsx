import { memo, ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useGridColumns from "../_components/useGridColumns";
import useMostUsed from "../_components/useMostUsed";
import { dailyCategories } from "../_data";
import { WIRD_ART } from "../_data/homeArt";
import SectionHeader from "./SectionHeader";
import WirdArtCard from "./WirdArtCard";
import WirdCategoryRow from "./WirdCategoryRow";
import WirdRowCard from "./WirdRowCard";

export default memo(function DailyWirdSection({ kahf }: { kahf: boolean }) {
  const { t } = useTranslation("azkar");
  const daily = dailyCategories();
  const art = useMostUsed(
    useMemo(() => daily.filter((c) => WIRD_ART[c.id]), [daily]),
  );
  const rows = useMostUsed(
    useMemo(() => daily.filter((c) => !WIRD_ART[c.id]), [daily]),
  );
  const { columns, itemWidth, gap, onLayout } = useGridColumns();

  const cards = useMemo(() => {
    const list: { key: string; node: ReactNode }[] = rows.map((category) => ({
      key: category.id,
      node: <WirdCategoryRow category={category} />,
    }));
    list.push({
      key: "mulk",
      node: (
        <WirdRowCard
          href="/surah/67"
          icon="quran"
          title={t("surahMulk")}
          subtitle={t("mulkHint")}
        />
      ),
    });
    if (kahf) {
      list.push({
        key: "kahf",
        node: (
          <WirdRowCard
            href="/surah/18"
            icon="quran"
            title={t("surahKahf")}
            subtitle={t("fridaySunnah")}
          />
        ),
      });
    }
    return list;
  }, [rows, kahf, t]);

  const fullWidth = itemWidth * columns + gap * (columns - 1);
  const leftover = cards.length % columns;
  const lastRowStart = cards.length - leftover;
  const widthAt = (index: number) =>
    leftover && index >= lastRowStart
      ? (fullWidth - gap * (leftover - 1)) / leftover
      : itemWidth;

  return (
    <View className="gap-3">
      <SectionHeader title={t("featured")} subtitle={t("featuredHint")} />

      <View className="flex-row" style={{ gap }}>
        {art.map((category) => (
          <View key={category.id} className="flex-1">
            <WirdArtCard category={category} art={WIRD_ART[category.id]} />
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap" style={{ gap }} onLayout={onLayout}>
        {cards.map((card, index) => (
          <View key={card.key} style={{ width: widthAt(index) }}>
            {card.node}
          </View>
        ))}
      </View>
    </View>
  );
});

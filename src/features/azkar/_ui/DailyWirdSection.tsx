import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useGridColumns from "../_components/useGridColumns";
import { dailyCategories } from "../_data";
import { WIRD_ART } from "../_data/homeArt";
import SectionHeader from "./SectionHeader";
import WirdArtCard from "./WirdArtCard";
import WirdCategoryRow from "./WirdCategoryRow";
import WirdRowCard from "./WirdRowCard";

export default memo(function DailyWirdSection({ friday }: { friday: boolean }) {
  const { t } = useTranslation("azkar");
  const daily = useMemo(() => dailyCategories(), [friday]);
  const art = daily.filter((c) => WIRD_ART[c.id]);
  const rows = daily.filter((c) => !WIRD_ART[c.id]);
  const { itemWidth, gap, onLayout } = useGridColumns();
  const cell = useMemo(() => ({ width: itemWidth }), [itemWidth]);

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
        {rows.map((category) => (
          <View key={category.id} style={cell}>
            <WirdCategoryRow category={category} />
          </View>
        ))}
        <View style={cell}>
          <WirdRowCard
            href="/surah/67"
            icon="quran"
            title={t("surahMulk")}
            subtitle={t("mulkHint")}
          />
        </View>
        {friday ? (
          <View style={cell}>
            <WirdRowCard
              href="/surah/18"
              icon="quran"
              title={t("surahKahf")}
              subtitle={t("fridaySunnah")}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
});

import AppText from "@/components/ui/AppText";
import PressableScale from "@/components/ui/PressableScale";
import { Locale } from "@/i18n/config";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import useArtCardSize from "../_components/useArtCardSize";
import useCategoryProgress from "../_components/useCategoryProgress";
import { AzkarCategory } from "../_data";
import type { WirdArt } from "../_data/homeArt";
import ProgressBar from "./ProgressBar";

const WHITE = "#ffffff";
const TRACK = "rgba(255, 255, 255, 0.3)";
const SHADE = { backgroundColor: "rgba(0, 0, 0, 0.12)" };

export default memo(function WirdArtCard({
  category,
  art,
}: {
  category: AzkarCategory;
  art: WirdArt;
}) {
  const { t, i18n } = useTranslation("azkar");
  const { done, total, complete } = useCategoryProgress(category);
  const { style, wide, onLayout } = useArtCardSize();

  return (
    <Link href={`/category/${category.id}`} asChild>
      <PressableScale
        className="overflow-hidden rounded-2xl"
        style={style}
        onLayout={onLayout}
      >
        <Image
          source={wide ? art.wide : art.card}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={0}
        />
        <View style={[StyleSheet.absoluteFill, SHADE]} />
        <View className="flex-1 justify-end gap-1.5 p-3.5">
          <AppText
            weight="bold"
            className="text-lg leading-none"
            style={{ color: WHITE }}
            numberOfLines={1}
          >
            {category.title[i18n.language as Locale]}
          </AppText>
          <AppText className="text-xs" style={{ color: WHITE }}>
            {complete ? t("done") : t("progressCount", { done, count: total })}
          </AppText>
          <ProgressBar
            progress={total ? done / total : 0}
            color={WHITE}
            track={TRACK}
            className="w-3/4"
          />
        </View>
      </PressableScale>
    </Link>
  );
});

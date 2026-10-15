import AppText from "@/components/ui/AppText";
import {
  getPage,
  getSurah,
  toArabicDigits,
} from "@/features/azkar/_data/quran";
import { memo } from "react";
import { View } from "react-native";
import { PAGE } from "../_components/pageLayout";
import useMushafColors from "../_components/useMushafColors";

export default memo(function MushafPageHeader({ page }: { page: number }) {
  const c = useMushafColors();
  const info = getPage(page);
  const firstSurah = getSurah(info.start.surah);

  return (
    <View
      className="flex-row items-center justify-between"
      style={{ height: PAGE.topRow, marginBottom: PAGE.gap }}
    >
      <AppText arabic className="text-xs" style={{ color: c.gold }}>
        {`الجزء ${toArabicDigits(info.juz)}`}
      </AppText>
      <AppText variant="quran" className="text-sm" style={{ color: c.gold }}>
        {firstSurah ? `سورة ${firstSurah.name}` : ""}
      </AppText>
    </View>
  );
});

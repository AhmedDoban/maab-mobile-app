import EmptyState from "@/components/ui/EmptyState";
import OrnamentHeading from "@/components/ui/OrnamentHeading";
import type { SurahSummary, VerseMatch } from "@/features/azkar/_data/quran";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import SurahRow from "./SurahRow";
import VerseResultRow from "./VerseResultRow";

export default memo(function QuranSearchResults({
  surahs,
  verses,
}: {
  surahs: SurahSummary[];
  verses: VerseMatch[];
}) {
  const { t } = useTranslation("azkar");

  if (!surahs.length && !verses.length) {
    return <EmptyState icon="search" title={t("noResults")} />;
  }
  return (
    <>
      {surahs.length ? (
        <View className="gap-3">
          <OrnamentHeading title={t("surahsHeading")} />
          <View className="gap-2.5">
            {surahs.map((surah) => (
              <SurahRow key={surah.id} surah={surah} />
            ))}
          </View>
        </View>
      ) : null}
      {verses.length ? (
        <View className="gap-3">
          <OrnamentHeading title={t("versesHeading")} />
          <View className="gap-2.5">
            {verses.map((verse) => (
              <VerseResultRow
                key={`${verse.surahId}:${verse.ayah}`}
                verse={verse}
              />
            ))}
          </View>
        </View>
      ) : null}
    </>
  );
});

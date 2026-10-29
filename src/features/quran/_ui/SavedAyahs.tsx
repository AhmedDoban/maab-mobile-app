import OrnamentHeading from "@/components/ui/OrnamentHeading";
import { getSurah } from "@/features/azkar/_data/quran";
import { useAppSelector } from "@/store/Store";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import VerseResultRow from "./VerseResultRow";

export default function SavedAyahs() {
  const { t } = useTranslation("azkar");
  const saved = useAppSelector((s) => s.settings.savedAyahs);
  if (!saved.length) return null;

  return (
    <View className="gap-3">
      <OrnamentHeading title={t("savedAyahs")} />
      <View className="gap-2.5">
        {saved.map((key) => {
          const [surahId, ayah] = key.split(":").map(Number);
          return (
            <VerseResultRow
              key={key}
              verse={{
                surahId,
                surah: getSurah(surahId)?.name ?? "",
                ayah,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

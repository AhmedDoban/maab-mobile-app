import useContinueReading from "@/features/quran/_components/useContinueReading";
import QuranContinueSection from "@/features/quran/_ui/QuranContinueSection";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import SectionHeader from "./SectionHeader";

export default memo(function QuranSection() {
  const { t } = useTranslation("azkar");
  const { wird, last, marked } = useContinueReading();
  if (!wird && !last && !marked) return null;

  return (
    <View className="gap-3">
      <SectionHeader
        title={t("quranSectionTitle")}
        subtitle={t("quranSectionHint")}
      />
      <QuranContinueSection />
    </View>
  );
});

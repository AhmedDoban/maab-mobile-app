import { memo } from "react";
import AppText from "@/components/ui/AppText";
import useArabicTextStyle from "@/hooks/useArabicTextStyle";
import { contentLocale } from "@/i18n/config";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { savedLocal } from "../_data/hadithKey";
import useHadithColors from "../_components/useHadithColors";
import { LocalHadith } from "../_data";
import HadithDivider from "./HadithDivider";
import HadithActions from "./HadithActions";
import HadithNumberMark from "./HadithNumberMark";
import HadithPaper from "./HadithPaper";

export default memo(function LocalHadithCard({
  hadith,
}: {
  hadith: LocalHadith;
}) {
  const { i18n } = useTranslation("hadith");
  const p = useHadithColors();
  const locale = contentLocale(i18n.language);
  const content = hadith[locale];
  const arabic = locale === "ar";
  const textStyle = useArabicTextStyle(arabic ? 0.85 : 0.75);

  return (
    <HadithPaper>
      <View className="flex-row items-center gap-2">
        <HadithNumberMark value={String(hadith.number)} />
        <View className="flex-1">
          <AppText
            weight="bold"
            className="text-sm"
            style={{ color: p.accent }}
            numberOfLines={1}
          >
            {content.source}
          </AppText>
          <AppText
            className="text-xs"
            style={{ color: p.muted }}
            numberOfLines={1}
          >
            {content.chapter}
          </AppText>
        </View>
      </View>

      <AppText
        variant={arabic ? "quran" : "ui"}
        style={[textStyle, { color: p.ink }]}
        selectable
      >
        {content.text}
      </AppText>

      <HadithDivider />

      <View className="flex-row justify-center">
        <HadithActions
          text={`${content.text}\n\n${content.source} — ${hadith.number}`}
          saved={savedLocal(hadith.id)}
        />
      </View>
    </HadithPaper>
  );
});

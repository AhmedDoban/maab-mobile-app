import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import { contentLocale } from "@/i18n/config";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { savedLocal } from "../_data/hadithKey";
import useHadithColors from "../_components/useHadithColors";
import { getDailyHadith } from "../_data";
import HadithDivider from "./HadithDivider";
import HadithActions from "./HadithActions";

export default function DailyHadithCard() {
  const { t, i18n } = useTranslation("hadith");
  const p = useHadithColors();
  const hadith = getDailyHadith();
  const locale = contentLocale(i18n.language);
  const content = hadith[locale];
  const arabic = locale === "ar";

  return (
    <View
      className="items-center gap-4 rounded-3xl border-[1.5px] px-5 pb-4 pt-12"
      style={{
        backgroundColor: p.paper,
        borderColor: p.accent,
        boxShadow: "0 8px 20px rgba(9, 43, 56, 0.1)",
      }}
    >
      <View
        className="absolute inset-1.5 rounded-[20px] border"
        style={{ borderColor: p.line, pointerEvents: "none" }}
      />

      <View
        className="absolute top-0 flex-row items-center gap-1.5 rounded-b-2xl px-4 pb-1.5 pt-1"
        style={{ backgroundColor: p.accent }}
      >
        <Icon name="quote" size={13} tintColor={p.onAccent} />
        <AppText
          weight="bold"
          className="text-xs"
          style={{ color: p.onAccent }}
        >
          {t("dailyHadith")}
        </AppText>
      </View>

      <AppText
        variant={arabic ? "quran" : "ui"}
        className={
          arabic
            ? "text-center text-xl leading-[40px]"
            : "text-center text-base leading-7"
        }
        style={{ color: p.ink }}
        selectable
      >
        {content.text}
      </AppText>

      <HadithDivider />

      <AppText className="text-center text-xs" style={{ color: p.muted }}>
        {content.source} · {t("hadithNo", { number: hadith.number })}
      </AppText>

      <HadithActions
        text={`${content.text}\n\n${content.source} — ${hadith.number}`}
        saved={savedLocal(hadith.id)}
      />
    </View>
  );
}

import AppText from "@/components/ui/AppText";
import {
  AyahRef,
  ayahsOnPage,
  ayahText,
  ayahTranslation,
  getSurah,
  pageOf,
} from "@/features/azkar/_data/quran";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import useLocalDigits from "../_components/useLocalDigits";
import usePopupColors from "../_components/usePopupColors";
import useSurahName from "../_components/useSurahName";
import { contentLocale } from "@/i18n/config";

export default function AyahPlayUntil({
  ayah,
  onPlay,
}: {
  ayah: AyahRef;
  onPlay: (until: AyahRef | null) => void;
}) {
  const { t, i18n } = useTranslation("azkar");
  const ar = contentLocale(i18n.language) === "ar";
  const c = usePopupColors();
  const num = useLocalDigits();
  const surahName = useSurahName();

  const surah = getSurah(ayah.surah);
  const page = pageOf(ayah.surah, ayah.ayah);
  const pageAyahs = ayahsOnPage(page);
  const after = pageAyahs.filter(
    (a) =>
      a.surah > ayah.surah || (a.surah === ayah.surah && a.ayah >= ayah.ayah),
  );
  const pageEnd = pageAyahs[pageAyahs.length - 1];
  const surahEnd = { surah: ayah.surah, ayah: surah?.verses ?? ayah.ayah };

  return (
    <View className="gap-4">
      <View
        className="overflow-hidden rounded-2xl"
        style={{ backgroundColor: c.page }}
      >
        {[
          {
            title: t("endOfPage"),
            value: t("pageNumber", { page: num(page) }),
            stop: pageEnd,
          },
          {
            title: t("endOfSurah"),
            value: surahName(ayah.surah),
            stop: surahEnd,
          },
          { title: t("continuous"), value: "∞", stop: null },
        ].map((row, i) => (
          <Pressable
            key={row.title}
            onPress={() => onPlay(row.stop)}
            className="flex-row items-center justify-between px-4 py-4"
            style={i > 0 ? { borderTopWidth: 1, borderColor: c.frame } : null}
          >
            <AppText weight="bold" style={{ color: c.ink }}>
              {row.title}
            </AppText>
            <AppText style={{ color: c.gold }}>{row.value}</AppText>
          </Pressable>
        ))}
      </View>

      <View
        className="overflow-hidden rounded-2xl"
        style={{ backgroundColor: c.page }}
      >
        {after.map((ref, i) => (
          <Pressable
            key={`${ref.surah}:${ref.ayah}`}
            onPress={() => onPlay(ref)}
            className="gap-2 px-4 py-3"
            style={i > 0 ? { borderTopWidth: 1, borderColor: c.frame } : null}
          >
            <View className="flex-row items-center justify-between">
              <AppText weight="bold" style={{ color: c.ink }}>
                {t("ayahRef", {
                  surah: surahName(ref.surah),
                  ayah: num(ref.ayah),
                })}
              </AppText>
              <AppText style={{ color: c.gold }}>{num(page)}</AppText>
            </View>
            <AppText
              variant={ar ? "quran" : "ui"}
              className={ar ? "text-xl" : "text-sm"}
              style={{ color: c.gold }}
              numberOfLines={1}
            >
              {ar
                ? ayahText(ref.surah, ref.ayah)
                : ayahTranslation(ref.surah, ref.ayah)}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

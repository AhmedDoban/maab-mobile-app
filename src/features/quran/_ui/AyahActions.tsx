import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import {
  AyahRef,
  ayahText,
  ayahTranslation,
  toArabicDigits,
} from "@/features/azkar/_data/quran";
import {
  completeWird,
  setQuranBookmark,
  toggleSavedAyah,
} from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { Share, View } from "react-native";
import usePopupColors from "../_components/usePopupColors";
import useSurahName from "../_components/useSurahName";
import { todayWirdBounds } from "../_data/khatma";
import AyahActionTile from "./AyahActionTile";
import AyahColorPicker from "./AyahColorPicker";
import AyahSectionTitle from "./AyahSectionTitle";
import AyahTafsir from "./AyahTafsir";
import { contentLocale } from "@/i18n/config";

export default function AyahActions({
  ayah,
  tafsirOpen,
  tafsirLines,
  onTafsirToggle,
  onTafsirLines,
  onPlay,
  onPlayUntil,
  onClose,
}: {
  ayah: AyahRef;
  tafsirOpen: boolean;
  tafsirLines: number;
  onTafsirToggle: () => void;
  onTafsirLines: (lines: number) => void;
  onPlay: () => void;
  onPlayUntil: () => void;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation(["azkar", "common"]);
  const ar = contentLocale(i18n.language) === "ar";
  const c = usePopupColors();
  const surahName = useSurahName();
  const dispatch = useAppDispatch();
  const bookmark = useAppSelector((s) => s.settings.quranBookmark);
  const savedAyahs = useAppSelector((s) => s.settings.savedAyahs);
  const khatma = useAppSelector((s) => s.settings.khatma);

  const key = `${ayah.surah}:${ayah.ayah}`;
  const isBookmark =
    bookmark?.surah === ayah.surah && bookmark.ayah === ayah.ayah;
  const isSaved = savedAyahs.includes(key);
  const wird = todayWirdBounds(khatma);
  const endsWird =
    !!wird && wird.last.surah === ayah.surah && wird.last.ayah === ayah.ayah;
  const shareText = ar
    ? `${ayahText(ayah.surah, ayah.ayah)}\n\n﴿${surahName(ayah.surah)} ${toArabicDigits(ayah.ayah)}﴾`
    : `${ayahText(ayah.surah, ayah.ayah)}\n\n${ayahTranslation(ayah.surah, ayah.ayah)}\n\n(${t("ayahRef", { surah: surahName(ayah.surah), ayah: ayah.ayah })})`;

  return (
    <View className="gap-4">
      {endsWird ? (
        <PressableScale
          scaleTo={0.98}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            dispatch(completeWird());
            onClose();
          }}
          className="flex-row items-center justify-center gap-2 rounded-2xl py-4"
          style={{ backgroundColor: c.accent }}
        >
          <Icon name="checkCircle" size={22} tintColor="#ffffff" />
          <AppText
            weight="bold"
            className="text-base"
            style={{ color: "#ffffff" }}
          >
            {t("khatmaFinishWird")}
          </AppText>
        </PressableScale>
      ) : null}
      <AyahSectionTitle>{t("bookmarksTitle")}</AyahSectionTitle>
      <View className="flex-row gap-3">
        <AyahActionTile
          icon={isBookmark ? "bookmarkFill" : "bookmark"}
          label={t(isBookmark ? "removeBookmark" : "readingMark")}
          onPress={() => {
            Haptics.selectionAsync();
            dispatch(setQuranBookmark(isBookmark ? null : ayah));
          }}
        />
        <AyahActionTile
          icon={isSaved ? "heartFill" : "heart"}
          label={t(isSaved ? "unsaveAyah" : "saveAyah")}
          onPress={() => {
            Haptics.selectionAsync();
            dispatch(toggleSavedAyah(key));
          }}
        />
      </View>

      <AyahSectionTitle>{t("recitationTitle")}</AyahSectionTitle>
      <View className="flex-row gap-3">
        <AyahActionTile icon="play" label={t("play")} onPress={onPlay} />
        <AyahActionTile
          icon="play"
          label={t("playUntil")}
          chevron
          onPress={onPlayUntil}
        />
      </View>

      <AyahSectionTitle>{t("tafsirTitle")}</AyahSectionTitle>
      <AyahTafsir
        ayah={ayah}
        open={tafsirOpen}
        lines={tafsirLines}
        onToggle={onTafsirToggle}
        onLines={onTafsirLines}
      />

      <AyahSectionTitle>{t("sharingTitle")}</AyahSectionTitle>
      <View className="flex-row gap-3">
        <AyahActionTile
          icon="copy"
          label={t("common:copy")}
          onPress={async () => {
            await Clipboard.setStringAsync(shareText);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
        />
        <AyahActionTile
          icon="share"
          label={t("common:share")}
          onPress={() => Share.share({ message: shareText })}
        />
      </View>

      <AyahSectionTitle>{t("highlightTitle")}</AyahSectionTitle>
      <AyahColorPicker ayahKey={key} />
    </View>
  );
}

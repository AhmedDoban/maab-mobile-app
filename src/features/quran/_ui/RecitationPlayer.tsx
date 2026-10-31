import AppText from "@/components/ui/AppText";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import { AyahRef } from "@/features/azkar/_data/quran";
import { useAppSelector } from "@/store/Store";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import useLocalDigits from "../_components/useLocalDigits";
import useMushafColors from "../_components/useMushafColors";
import useSurahName from "../_components/useSurahName";
import { getReciter } from "../_data/reciters";
import ReciterPicker from "./ReciterPicker";
import { contentLocale } from "@/i18n/config";

export default function RecitationPlayer({
  current,
  playing,
  loading,
  onPlay,
  onPause,
  onStop,
  onOpen,
}: {
  current: AyahRef | null;
  playing: boolean;
  loading: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onOpen?: () => void;
}) {
  const { t, i18n } = useTranslation("azkar");
  const c = useMushafColors();
  const reciterId = useAppSelector((s) => s.settings.reciter);
  const reciter = getReciter(reciterId);
  const [picking, setPicking] = useState(false);
  const ar = contentLocale(i18n.language) === "ar";
  const num = useLocalDigits();
  const surahName = useSurahName();
  const closePicker = useCallback(() => setPicking(false), []);

  return (
    <View
      className="flex-row items-center gap-3 rounded-full border px-2 py-2"
      style={{
        backgroundColor: c.page,
        borderColor: c.frame,
        direction: "rtl",
      }}
    >
      <PressableScale
        onPress={playing ? onPause : onPlay}
        accessibilityLabel={t(playing ? "pause" : "play")}
        className="size-11 items-center justify-center rounded-full"
        style={{ backgroundColor: c.accent }}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Icon
            name={playing ? "pause" : "play"}
            size={20}
            tintColor="#ffffff"
          />
        )}
      </PressableScale>

      <PressableScale
        scaleTo={0.98}
        onPress={() => setPicking(true)}
        accessibilityLabel={t("chooseReciter")}
        className="flex-1 flex-row items-center gap-2"
      >
        <View className="flex-1">
          <AppText weight="bold" numberOfLines={1}>
            {ar ? reciter.ar : reciter.en}
          </AppText>
          {current ? (
            <AppText className="text-xs" style={{ color: c.gold }}>
              {t("verseRef", {
                surah: surahName(current.surah),
                ayah: num(current.ayah),
              })}
            </AppText>
          ) : null}
        </View>
        <Icon name="chevronDown" size={16} tintColor={c.gold} />
      </PressableScale>

      {current && onOpen ? (
        <PressableScale
          onPress={onOpen}
          accessibilityLabel={t("openCurrentPage")}
          className="size-11 items-center justify-center rounded-full"
          style={{ backgroundColor: c.frameFill }}
        >
          <Icon name="bookOpen" size={18} tintColor={c.ink} />
        </PressableScale>
      ) : null}

      {current ? (
        <PressableScale
          onPress={onStop}
          accessibilityLabel={t("stop")}
          className="size-11 items-center justify-center rounded-full"
          style={{ backgroundColor: c.frameFill }}
        >
          <Icon name="stop" size={18} tintColor={c.ink} />
        </PressableScale>
      ) : null}

      <ReciterPicker visible={picking} onClose={closePicker} />
    </View>
  );
}

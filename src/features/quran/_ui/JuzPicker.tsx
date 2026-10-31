import AppText from "@/components/ui/AppText";
import Dialog from "@/components/ui/Dialog";
import Icon from "@/components/ui/Icon";
import PressableScale from "@/components/ui/PressableScale";
import useSettingsColors from "@/features/settings/_components/useSettingsColors";
import { getSurah, JUZ_STARTS } from "@/features/azkar/_data/quran";
import useThemeColors from "@/hooks/useThemeColors";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import useLocalDigits from "../_components/useLocalDigits";
import { contentLocale } from "@/i18n/config";

export default function JuzPicker({
  visible,
  title,
  value,
  min = 1,
  max = 30,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  value: number;
  min?: number;
  max?: number;
  onSelect: (juz: number) => void;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation("azkar");
  const colors = useThemeColors();
  const palette = useSettingsColors();
  const ar = contentLocale(i18n.language) === "ar";
  const num = useLocalDigits();

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      closeLabel={t("close")}
      className="px-6"
      cardClassName="max-h-[80%] max-w-md p-5"
    >
      <View className="flex-row items-center justify-between">
        <AppText weight="bold" className="text-lg">
          {title}
        </AppText>
        <PressableScale
          onPress={onClose}
          accessibilityLabel={t("close")}
          className="size-9 items-center justify-center rounded-full"
          style={{ backgroundColor: palette.track }}
        >
          <Icon name="close" size={16} tintColor={colors.ink} />
        </PressableScale>
      </View>
      <ScrollView>
        <View className="flex-row flex-wrap justify-between gap-y-2.5">
          {JUZ_STARTS.map((start, i) => {
            const juz = i + 1;
            const selected = juz === value;
            const disabled = juz < min || juz > max;
            const surah = getSurah(start.surah);
            return (
              <PressableScale
                key={juz}
                disabled={disabled}
                scaleTo={0.95}
                onPress={() => {
                  Haptics.selectionAsync();
                  onSelect(juz);
                  onClose();
                }}
                accessibilityState={{ selected, disabled }}
                className={
                  selected
                    ? "w-[31.5%] items-center gap-0.5 rounded-2xl border border-main bg-main-fill py-3"
                    : "w-[31.5%] items-center gap-0.5 rounded-2xl border border-line py-3"
                }
                style={{ opacity: disabled ? 0.35 : 1 }}
              >
                <AppText
                  weight="bold"
                  className={
                    selected ? "text-lg text-on-fill" : "text-lg text-main"
                  }
                >
                  {num(juz)}
                </AppText>
                <AppText
                  className={
                    selected
                      ? "text-[11px] text-on-fill"
                      : "text-[11px] text-main-gray"
                  }
                  numberOfLines={1}
                >
                  {ar ? surah?.name : surah?.transliteration}
                </AppText>
              </PressableScale>
            );
          })}
        </View>
      </ScrollView>
    </Dialog>
  );
}

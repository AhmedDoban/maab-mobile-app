import GlassSlider from "@/components/Inputs/GlassSlider";
import AppText from "@/components/ui/AppText";
import useArabicTextStyle from "@/hooks/useArabicTextStyle";
import useDirection from "@/hooks/useDirection";
import { setTextSize, TEXT_SIZE } from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import useSettingsColors from "../_components/useSettingsColors";
import { contentLocale } from "@/i18n/config";

export default function TextSizeSetting() {
  const { t, i18n } = useTranslation("settings");
  const ar = contentLocale(i18n.language) === "ar";
  const dispatch = useAppDispatch();
  const palette = useSettingsColors();
  const textSize = useAppSelector((s) => s.settings.textSize);
  const { isRTL } = useDirection();
  const sizeGlyph = t("textSizeGlyph");
  const previewStyle = useArabicTextStyle();

  return (
    <>
      <View className="flex-row items-center gap-3">
        <AppText
          weight="bold"
          className="text-sm"
          style={{ color: palette.subtitle }}
        >
          {sizeGlyph}
        </AppText>
        <View className="flex-1">
          <GlassSlider
            value={textSize}
            min={TEXT_SIZE.min}
            max={TEXT_SIZE.max}
            step={TEXT_SIZE.step}
            rtl={isRTL}
            onChange={(size) => dispatch(setTextSize(size))}
            accessibilityLabel={t("textSize")}
          />
        </View>
        <AppText
          weight="bold"
          className="text-2xl"
          style={{ color: palette.subtitle }}
        >
          {sizeGlyph}
        </AppText>
      </View>
      <View className="flex-row items-center justify-between gap-3">
        <AppText
          variant={ar ? "quran" : "ui"}
          className="flex-1"
          style={previewStyle}
          numberOfLines={2}
        >
          {t("textSizePreview")}
        </AppText>
        <View className="rounded-full bg-accent-soft px-3 py-1">
          <AppText weight="bold" className="text-sm text-accent">
            {textSize}
          </AppText>
        </View>
      </View>
    </>
  );
}

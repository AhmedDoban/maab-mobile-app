import { isRTLLocale } from "@/i18n/direction";
import { Locale } from "@/i18n/config";
import { setLocale } from "@/store/Slices/SettingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/Store";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
  FLAG_BD,
  FLAG_FR,
  FLAG_ID,
  FLAG_IR,
  FLAG_MY,
  FLAG_PK,
  FLAG_SA,
  FLAG_TR,
  FLAG_US,
} from "../_data/flags";
import LanguageCard from "./LanguageCard";

const LANGUAGES: {
  locale: Locale;
  flag: string;
  label: string;
}[] = [
  { locale: "ar", flag: FLAG_SA, label: "العربية" },
  { locale: "en", flag: FLAG_US, label: "English" },
  { locale: "ur", flag: FLAG_PK, label: "اردو" },
  { locale: "id", flag: FLAG_ID, label: "Bahasa Indonesia" },
  { locale: "bn", flag: FLAG_BD, label: "বাংলা" },
  { locale: "tr", flag: FLAG_TR, label: "Türkçe" },
  { locale: "fa", flag: FLAG_IR, label: "فارسی" },
  { locale: "ms", flag: FLAG_MY, label: "Bahasa Melayu" },
  { locale: "fr", flag: FLAG_FR, label: "Français" },
];

export default function LanguageSwitcher() {
  const { t } = useTranslation("settings");
  const dispatch = useAppDispatch();
  const locale = useAppSelector((s) => s.settings.locale);

  return (
    <View accessibilityRole="radiogroup" className="gap-3">
      {LANGUAGES.map((lang) => (
        <LanguageCard
          key={lang.locale}
          flag={lang.flag}
          label={lang.label}
          hint={t(`languageNames.${lang.locale}`)}
          arabic={isRTLLocale(lang.locale)}
          selected={locale === lang.locale}
          onPress={() => {
            if (locale === lang.locale) return;
            Haptics.selectionAsync();
            dispatch(setLocale(lang.locale));
          }}
        />
      ))}
    </View>
  );
}

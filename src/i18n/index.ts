import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { defaultLocale } from "./config";
import en from "@/messages/en/en";
import ar from "@/messages/ar/ar";
import ur from "@/messages/ur/ur";
import id from "@/messages/id/id";
import bn from "@/messages/bn/bn";
import tr from "@/messages/tr/tr";
import fa from "@/messages/fa/fa";
import ms from "@/messages/ms/ms";
import fr from "@/messages/fr/fr";

const resources = { en, ar, ur, id, bn, tr, fa, ms, fr } as const;

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLocale,
  fallbackLng: { ar: ["ar"], default: ["en"] },
  defaultNS: "common",
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;

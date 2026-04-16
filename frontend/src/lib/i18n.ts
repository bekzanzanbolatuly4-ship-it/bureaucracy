import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import ru from "@/locales/ru.json";
import kz from "@/locales/kz.json";
import en from "@/locales/en.json";

export const i18n = i18next.createInstance();

const initialLang =
  (typeof window !== "undefined" ? window.localStorage.getItem("lang") : null) ||
  (typeof navigator !== "undefined" ? navigator.language.toLowerCase().startsWith("kk") ? "kz" : "ru" : "ru");

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    kz: { translation: kz },
    en: { translation: en },
  },
  lng: (initialLang === "kz" || initialLang === "en" ? initialLang : "ru") as string,
  fallbackLng: "ru",
  interpolation: { escapeValue: false },
});


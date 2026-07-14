import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "./locales/en";
import ru from "./locales/ru";

const STORAGE_KEY = "formware-lang";

export const locales = {
  en: { label: "EN", name: "English", messages: en },
  ru: { label: "RU", name: "Русский", messages: ru },
};

const I18nContext = createContext(null);

function detectLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && locales[stored]) return stored;

  const browser = navigator.language?.slice(0, 2).toLowerCase();
  if (browser && locales[browser]) return browser;

  return "en";
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage);

  const setLang = (next) => {
    if (!locales[next]) return;
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({
    lang,
    setLang,
    t: locales[lang].messages,
    locales: Object.entries(locales).map(([code, { label, name }]) => ({ code, label, name })),
  }), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = value.t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", value.t.meta.description);
  }, [lang, value.t.meta]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}

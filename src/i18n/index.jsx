import React, { createContext, useContext, useEffect, useMemo } from "react";
import en from "./locales/en";

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const value = useMemo(() => ({ t: en }), []);

  useEffect(() => {
    document.documentElement.lang = "en";
    document.title = en.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", en.meta.description);
  }, []);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}

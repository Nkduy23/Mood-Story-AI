"use client";

// lib/i18n/context.tsx
import { createContext, useContext, useState, type FC, type ReactNode } from "react";
import { translations, type Locale } from "./translations";

interface I18nContextValue {
  locale: Locale;
  t: typeof translations.en;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Đọc từ localStorage nếu có
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ms-locale") as Locale | null;
      if (saved && saved in translations) return saved;
    }
    return "vi"; // default tiếng Việt
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("ms-locale", newLocale);
    }
  };

  return <I18nContext.Provider value={{ locale, t: translations[locale], setLocale }}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

"use client";

import { createContext, useContext, useState, useEffect, type FC, type ReactNode } from "react";
import { translations, type Locale } from "./translations";

interface I18nContextValue {
  locale: Locale;
  t: typeof translations.en;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // QUAN TRỌNG: luôn khởi tạo với "vi" — không đọc localStorage trong useState
  // để tránh hydration mismatch (server không biết localStorage)
  const [locale, setLocaleState] = useState<Locale>("vi");

  // Đọc localStorage SAU khi mount (client-only)
  useEffect(() => {
    const saved = localStorage.getItem("ms-locale") as Locale | null;
    if (saved && saved in translations) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("ms-locale", newLocale);
  };

  return <I18nContext.Provider value={{ locale, t: translations[locale], setLocale }}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

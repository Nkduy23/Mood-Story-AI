"use client";

import { useEffect, type FC, type ReactNode } from "react";
import { useSettingsStore } from "@/store/settingsStore";

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const darkMode = useSettingsStore((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return <>{children}</>;
};

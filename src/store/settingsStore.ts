"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      darkMode: true,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: "ms-settings" },
  ),
);

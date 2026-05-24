"use client";

import { create } from "zustand";

export type Platform = "instagram" | "tiktok" | "facebook" | "download";

interface ExportStore {
  status: "idle" | "rendering" | "done" | "error";
  progress: number;
  outputBlob: Blob | null;
  outputUrl: string | null;
  selectedPlatform: Platform;
  error: string | null;

  startRender: () => void;
  updateProgress: (progress: number) => void;
  setOutput: (blob: Blob) => void;
  setError: (error: string) => void;
  selectPlatform: (platform: Platform) => void;
  reset: () => void;
}

export const useExportStore = create<ExportStore>((set, get) => ({
  status: "idle",
  progress: 0,
  outputBlob: null,
  outputUrl: null,
  selectedPlatform: "instagram",
  error: null,

  startRender: () => set({ status: "rendering", progress: 0, error: null }),

  updateProgress: (progress) => set({ progress }),

  setOutput: (blob) => {
    const { outputUrl } = get();
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    const url = URL.createObjectURL(blob);
    set({ status: "done", outputBlob: blob, outputUrl: url, progress: 100 });
  },

  setError: (error) => set({ status: "error", error }),

  selectPlatform: (platform) => set({ selectedPlatform: platform }),

  reset: () => {
    const { outputUrl } = get();
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    set({ status: "idle", progress: 0, outputBlob: null, outputUrl: null, error: null });
  },
}));

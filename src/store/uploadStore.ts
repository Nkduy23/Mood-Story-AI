"use client";

import { create } from "zustand";
import type { StoryType } from "@/features/mood-engine";
import { uuid } from "@/lib/utils";

export interface UploadedFile {
  id: string;
  file: File;
  url: string; // Cloudinary URL hoặc object URL (mock)
  publicId: string; // Cloudinary public ID
  type: "image" | "video";
  width: number;
  height: number;
  duration?: number; // giây, chỉ với video
  thumbnailUrl?: string;
  uploadProgress: number; // 0-100
  status: "uploading" | "done" | "error";
  error?: string;
}

interface UploadStore {
  files: UploadedFile[];
  storyType: StoryType | null;

  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  updateFileProgress: (id: string, progress: number) => void;
  updateFile: (id: string, updates: Partial<UploadedFile>) => void;
  setStoryType: (type: StoryType) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  files: [],
  storyType: null,

  addFiles: (newFiles) =>
    set((state) => ({
      files: [
        ...state.files,
        ...newFiles.map(
          (file): UploadedFile => ({
            id: uuid(),
            file,
            url: URL.createObjectURL(file), // preview local trước
            publicId: "",
            type: file.type.startsWith("video") ? "video" : "image",
            width: 0,
            height: 0,
            uploadProgress: 0,
            status: "uploading",
          }),
        ),
      ],
    })),

  removeFile: (id) =>
    set((state) => {
      const file = state.files.find((f) => f.id === id);
      if (file?.url.startsWith("blob:")) URL.revokeObjectURL(file.url);
      return { files: state.files.filter((f) => f.id !== id) };
    }),

  reorderFiles: (from, to) =>
    set((state) => {
      const files = [...state.files];
      const [moved] = files.splice(from, 1);
      files.splice(to, 0, moved);
      return { files };
    }),

  updateFileProgress: (id, progress) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, uploadProgress: progress } : f)),
    })),

  updateFile: (id, updates) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  setStoryType: (storyType) => set({ storyType }),

  reset: () => {
    get().files.forEach((f) => {
      if (f.url.startsWith("blob:")) URL.revokeObjectURL(f.url);
    });
    set({ files: [], storyType: null });
  },
}));

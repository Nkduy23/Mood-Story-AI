"use client";

import { useCallback } from "react";
import { useUploadStore } from "@/store/uploadStore";
import type { StoryType } from "@/features/mood-engine";

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES: Record<string, boolean> = {
  "image/jpeg": true,
  "image/png": true,
  "image/webp": true,
  "video/mp4": true,
  "video/quicktime": true, // .mov
};

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "mp4", "mov"];

const MAX_FILES_BY_TYPE: Record<StoryType, number> = {
  moment: 2,
  journey: 5,
  vibe: 3,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMediaDimensions(file: File): Promise<{ width: number; height: number; duration?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);

    if (file.type.startsWith("video")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve({ width: video.videoWidth, height: video.videoHeight, duration: video.duration });
        URL.revokeObjectURL(url);
      };
      video.onerror = () => {
        resolve({ width: 0, height: 0, duration: 0 });
        URL.revokeObjectURL(url);
      };
      video.src = url;
    } else {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  });
}

function simulateUploadProgress(id: string, updateFileProgress: (id: string, progress: number) => void): Promise<void> {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      // Tăng nhanh lên 80%, rồi chậm lại
      const increment = progress < 80 ? Math.random() * 20 + 10 : Math.random() * 8 + 2;
      progress = Math.min(progress + increment, 99);
      updateFileProgress(id, Math.floor(progress));

      if (progress >= 99) {
        clearInterval(interval);
        setTimeout(() => resolve(), 150);
      }
    }, 120);
  });
}

// ── Validate ─────────────────────────────────────────────────────────────────

export interface ValidationError {
  file: string;
  reason: string;
}

function validateFiles(newFiles: File[], currentCount: number, maxFiles: number): { valid: File[]; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  const valid: File[] = [];
  const slotsLeft = maxFiles - currentCount;

  for (const file of newFiles) {
    // Check slots
    if (valid.length >= slotsLeft) {
      errors.push({ file: file.name, reason: `Tối đa ${maxFiles} file` });
      continue;
    }

    // Check type
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_TYPES[file.type] && !ALLOWED_EXTENSIONS.includes(ext)) {
      errors.push({ file: file.name, reason: "Chỉ hỗ trợ JPG, PNG, WEBP, MP4, MOV" });
      continue;
    }

    // Check size
    if (file.size > MAX_FILE_SIZE) {
      errors.push({ file: file.name, reason: "File tối đa 50MB" });
      continue;
    }

    valid.push(file);
  }

  return { valid, errors };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export interface UseUploadReturn {
  files: ReturnType<typeof useUploadStore.getState>["files"];
  storyType: StoryType | null;
  maxFiles: number;
  canAddMore: boolean;
  addFiles: (files: File[]) => Promise<ValidationError[]>;
  removeFile: (id: string) => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
}

export function useUpload(): UseUploadReturn {
  const files = useUploadStore((s) => s.files);
  const storyType = useUploadStore((s) => s.storyType);
  const addFilesToStore = useUploadStore((s) => s.addFiles);
  const removeFile = useUploadStore((s) => s.removeFile);
  const reorderFiles = useUploadStore((s) => s.reorderFiles);
  const updateFileProgress = useUploadStore((s) => s.updateFileProgress);
  const updateFile = useUploadStore((s) => s.updateFile);

  const maxFiles = storyType ? MAX_FILES_BY_TYPE[storyType] : 5;
  const canAddMore = files.length < maxFiles;

  const addFiles = useCallback(
    async (newFiles: File[]): Promise<ValidationError[]> => {
      const { valid, errors } = validateFiles(newFiles, files.length, maxFiles);
      if (valid.length === 0) return errors;

      // Thêm vào store trước (status: uploading, url: object URL)
      addFilesToStore(valid);

      // Lấy IDs vừa được thêm (cuối store)
      const currentFiles = useUploadStore.getState().files;
      const newEntries = currentFiles.slice(currentFiles.length - valid.length);

      // Process từng file song song
      await Promise.all(
        newEntries.map(async (entry, i) => {
          const file = valid[i];

          try {
            // Chạy song song: get dimensions + simulate progress
            const [dims] = await Promise.all([getMediaDimensions(file), simulateUploadProgress(entry.id, updateFileProgress)]);

            // Mock: dùng object URL làm "Cloudinary URL"
            updateFile(entry.id, {
              width: dims.width,
              height: dims.height,
              duration: dims.duration,
              uploadProgress: 100,
              status: "done",
              // Trong V2: thay bằng Cloudinary URL thật
              url: entry.url, // giữ nguyên object URL
              publicId: `mock-${entry.id}`,
            });
          } catch {
            updateFile(entry.id, {
              status: "error",
              error: "Upload thất bại, thử lại",
            });
          }
        }),
      );

      return errors;
    },
    [files.length, maxFiles, addFilesToStore, updateFileProgress, updateFile],
  );

  return {
    files,
    storyType,
    maxFiles,
    canAddMore,
    addFiles,
    removeFile,
    reorderFiles,
  };
}

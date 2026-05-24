import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes với conditional logic */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Sleep helper cho mock delays */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Format duration: 15 → "15s" */
export function formatDuration(seconds: number): string {
  return `${seconds}s`;
}

/** Thay thế {placeholder} trong string */
export function interpolate(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

/** Clamp số trong khoảng */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Generate random UUID */
export function uuid(): string {
  return crypto.randomUUID();
}

/** Format file size: 1048576 → "1 MB" */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Kiểm tra file type hợp lệ */
export function isValidMediaFile(file: File): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"];
  return validTypes.includes(file.type);
}

/** Max file size: 50MB */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/** Allowed output durations */
export const ALLOWED_DURATIONS = [10, 15, 20, 25] as const;
export type AllowedDuration = (typeof ALLOWED_DURATIONS)[number];

"use client";

import { type FC, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { StoryType } from "@/features/mood-engine";
import type { ValidationError } from "../hooks/useUpload";

// ── Icons ────────────────────────────────────────────────────────────────────

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const PhotoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const VideoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="7" width="15" height="10" rx="2" />
    <path d="M17 9l5-2v10l-5-2V9z" />
  </svg>
);

// ── Types ────────────────────────────────────────────────────────────────────

interface UploadZoneProps {
  fileCount: number;
  maxFiles: number;
  storyType: StoryType | null;
  onFilesSelected: (files: File[]) => Promise<ValidationError[]>;
  className?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const ACCEPT = ".jpg,.jpeg,.png,.webp,.mp4,.mov,image/jpeg,image/png,image/webp,video/mp4,video/quicktime";

const STORY_TYPE_HINTS: Record<string, string> = {
  moment: "1–2 ảnh · 1 khoảnh khắc",
  journey: "3–5 ảnh/video · kể câu chuyện",
  vibe: "1–3 clip · loop ngắn",
};

// ── Component ────────────────────────────────────────────────────────────────

const UploadZone: FC<UploadZoneProps> = ({ fileCount, maxFiles, storyType, onFilesSelected, className }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const isFull = fileCount >= maxFiles;

  const handleFiles = useCallback(
    async (files: File[]) => {
      setErrors([]);
      const errs = await onFilesSelected(files);
      if (errs.length > 0) setErrors(errs);
    },
    [onFilesSelected],
  );

  // ── Input change ──
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) handleFiles(files);
    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  };

  // ── Drag events ──
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFull) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isFull) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFiles(files);
  };

  // ── Empty state (no files yet) ──
  if (fileCount === 0) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <button
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4",
            "w-full rounded-3xl border-2 border-dashed",
            "py-14 px-6",
            "transition-all duration-200",
            isDragOver
              ? "border-[var(--brand-purple)] bg-[var(--brand-purple-dim)] scale-[1.01]"
              : "border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[var(--brand-purple-border)] hover:bg-[var(--bg-elevated)]",
            "active:scale-[0.99]",
          )}
        >
          {/* Glow blob */}
          {isDragOver && (
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, rgba(155,124,244,0.15) 0%, transparent 70%)",
              }}
            />
          )}

          {/* Upload icon */}
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center",
              "transition-all duration-200",
              isDragOver ? "bg-[var(--brand-purple)] text-white" : "bg-[var(--bg-elevated)] text-[var(--text-muted)]",
            )}
          >
            <UploadIcon />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{isDragOver ? "Thả vào đây" : "Tap để chọn ảnh / video"}</p>
            <p className="text-xs text-[var(--text-muted)]">{storyType ? STORY_TYPE_HINTS[storyType] : "JPG, PNG, WEBP, MP4, MOV · max 50MB"}</p>
          </div>

          {/* Format badges */}
          <div className="flex items-center gap-2">
            <span
              className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium", "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]", "text-[var(--text-muted)]")}
            >
              <PhotoIcon /> Ảnh
            </span>
            <span
              className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium", "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]", "text-[var(--text-muted)]")}
            >
              <VideoIcon /> Video
            </span>
          </div>
        </button>

        {/* Errors */}
        <ErrorList errors={errors} />

        <input ref={inputRef} type="file" accept={ACCEPT} multiple={maxFiles > 1} className="hidden" onChange={handleInputChange} />
      </div>
    );
  }

  // ── Has files state — compact add more button ──
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* File count indicator */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)] font-mono">
          {fileCount} / {maxFiles} file
        </span>

        {/* Slot dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: maxFiles }).map((_, i) => (
            <span key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", i < fileCount ? "bg-[var(--brand-purple)]" : "bg-[var(--border-card)]")} />
          ))}
        </div>
      </div>

      {/* Add more button — chỉ hiện khi chưa đủ max */}
      {!isFull && (
        <button
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex items-center justify-center gap-2",
            "w-full rounded-2xl border border-dashed py-3 px-4",
            "transition-all duration-200",
            isDragOver ? "border-[var(--brand-purple)] bg-[var(--brand-purple-dim)]" : "border-[var(--border-card)] hover:border-[var(--brand-purple-border)] hover:bg-[var(--bg-elevated)]",
            "text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
            "active:scale-[0.98]",
          )}
        >
          <span className="text-[var(--brand-purple)]">
            <PlusIcon />
          </span>
          Thêm file ({maxFiles - fileCount} còn lại)
        </button>
      )}

      {isFull && <p className="text-[10px] text-center text-[var(--text-muted)] font-mono py-1">đã đủ {maxFiles} file ✓</p>}

      {/* Errors */}
      <ErrorList errors={errors} />

      <input ref={inputRef} type="file" accept={ACCEPT} multiple={maxFiles > 1} className="hidden" onChange={handleInputChange} />
    </div>
  );
};

// ── Error list ────────────────────────────────────────────────────────────────

function ErrorList({ errors }: { errors: ValidationError[] }) {
  if (errors.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      {errors.map((err, i) => (
        <div key={i} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl", "bg-red-950/40 border border-red-500/20", "text-xs text-red-400")}>
          <span className="shrink-0">⚠</span>
          <span className="truncate font-medium">{err.file}</span>
          <span className="shrink-0 text-red-500/70">— {err.reason}</span>
        </div>
      ))}
    </div>
  );
}

export { UploadZone };
export type { UploadZoneProps };

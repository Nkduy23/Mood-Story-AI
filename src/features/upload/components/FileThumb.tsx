"use client";

import { type FC } from "react";
import { cn } from "@/lib/utils";
import type { UploadedFile } from "@/store/uploadStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── Icons ────────────────────────────────────────────────────────────────────

const XIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const VideoIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15 10l4.553-2.569A1 1 0 0121 8.382v7.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
  </svg>
);

const DragIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="5" r="1.5" />
    <circle cx="15" cy="5" r="1.5" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="19" r="1.5" />
    <circle cx="15" cy="19" r="1.5" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}:${String(s % 60).padStart(2, "0")}` : `${s}s`;
}

// ── Component ────────────────────────────────────────────────────────────────

interface FileThumbProps {
  file: UploadedFile;
  index: number;
  isDraggable?: boolean;
  onRemove: (id: string) => void;
}

const FileThumb: FC<FileThumbProps> = ({ file, isDraggable = false, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.id,
    disabled: !isDraggable,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const isUploading = file.status === "uploading";
  const isError = file.status === "error";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        // aspect-square: compact, nhìn thấy nhiều ảnh hơn trong 1 màn hình
        "relative aspect-square rounded-xl overflow-hidden",
        "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]",
        "transition-all duration-200",
        isDragging && "opacity-50 scale-95 z-50 shadow-xl shadow-[rgba(155,124,244,0.4)]",
        isError && "border-red-500/40",
      )}
    >
      {/* ── Thumbnail ── */}
      {file.type === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={file.url} alt="preview" className="w-full h-full object-cover" draggable={false} />
      ) : (
        <video src={file.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
      )}

      {/* ── Upload progress overlay ── */}
      {isUploading && (
        <div className="absolute inset-0 bg-[var(--bg-base)]/75 flex flex-col items-center justify-center gap-1.5">
          <div className="relative w-8 h-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="var(--brand-purple)"
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 15}`}
                strokeDashoffset={`${2 * Math.PI * 15 * (1 - file.uploadProgress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-[var(--text-primary)]">{file.uploadProgress}%</span>
          </div>
        </div>
      )}

      {/* ── Error overlay ── */}
      {isError && (
        <div className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center gap-1 p-2">
          <span className="text-red-400">
            <ErrorIcon />
          </span>
          <p className="text-[8px] text-red-300 text-center leading-tight">{file.error ?? "Lỗi"}</p>
        </div>
      )}

      {/* ── Video duration badge ── */}
      {file.type === "video" && file.status === "done" && file.duration !== undefined && (
        <div className="absolute bottom-1 left-1 flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white">
          <VideoIcon />
          <span className="text-[8px] font-mono">{formatDuration(file.duration)}</span>
        </div>
      )}

      {/* ── Drag handle ── */}
      {isDraggable && !isUploading && (
        <div
          {...attributes}
          {...listeners}
          className={cn("absolute top-1 left-1 w-5 h-5 rounded-md", "bg-black/60 backdrop-blur-sm", "flex items-center justify-center", "text-white/60 cursor-grab active:cursor-grabbing touch-none")}
        >
          <DragIcon />
        </div>
      )}

      {/* ── Remove button ── */}
      {!isUploading && (
        <button
          onClick={() => onRemove(file.id)}
          className={cn(
            "absolute top-1 right-1 w-5 h-5 rounded-full",
            "bg-black/60 backdrop-blur-sm hover:bg-black/80",
            "flex items-center justify-center",
            "text-white/80 hover:text-white",
            "transition-all duration-150 active:scale-90",
          )}
          aria-label="Xoá file"
        >
          <XIcon />
        </button>
      )}
    </div>
  );
};

export { FileThumb };
export type { FileThumbProps };

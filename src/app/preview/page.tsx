"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editorStore";
import { useUploadStore } from "@/store/uploadStore";
import { getMoodPack } from "@/features/mood-engine";
import { useCanvasPreview } from "@/features/editor/hooks/useCanvasPreview";
import { useFFmpegRender } from "@/features/export/hooks/useFFmpegRender";

const ShuffleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

type Platform = "instagram" | "tiktok" | "facebook" | "download";
const PLATFORMS: { id: Platform; label: string; emoji: string }[] = [
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "tiktok", label: "TikTok", emoji: "🎵" },
  { id: "facebook", label: "Facebook", emoji: "👥" },
  { id: "download", label: "MP4", emoji: "💾" },
];

function PlatformSelector({ selected, onSelect }: { selected: Platform; onSelect: (p: Platform) => void }) {
  return (
    <div className="flex gap-2">
      {PLATFORMS.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl",
            "border text-xs font-medium transition-all duration-200 active:scale-95",
            selected === p.id
              ? "bg-[var(--brand-purple-dim)] border-[var(--brand-purple-border)] text-[var(--brand-purple)]"
              : "bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)]",
          )}
        >
          <span className="text-base">{p.emoji}</span>
          <span className="text-[10px]">{p.label}</span>
        </button>
      ))}
    </div>
  );
}

function RenderProgressBar({ progress, stage }: { progress: number; stage: string }) {
  const { locale } = useI18n();
  const labels: Record<string, Record<string, string>> = {
    "loading-ffmpeg": { vi: "Tải engine...", en: "Loading engine..." },
    "preparing-frames": { vi: "Chuẩn bị frames...", en: "Preparing frames..." },
    encoding: { vi: "Đang encode...", en: "Encoding video..." },
    "muxing-audio": { vi: "Ghép nhạc...", en: "Adding music..." },
  };
  const label = labels[stage]?.[locale] ?? (locale === "vi" ? "Đang tạo video..." : "Creating your video...");
  const est = Math.max(0, Math.round((100 - progress) * 0.3));

  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <span className="text-xs text-[var(--text-muted)] font-mono tabular-nums">{progress}%</span>
      </div>
      <div className="w-full rounded-full h-2 bg-[var(--bg-elevated)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%`, background: "var(--brand-gradient)" }} />
      </div>
      {progress < 100 && (
        <p className="text-xs text-[var(--text-muted)] text-right">
          ~{est}s {locale === "vi" ? "còn lại" : "remaining"}
        </p>
      )}
    </div>
  );
}

// ── Download helper: blob có data → a[download], iOS → window.open ────────────
function triggerDownload(source: Blob | string, filename: string) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const url = source instanceof Blob ? URL.createObjectURL(source) : source;

  if (isIOS) {
    window.open(url, "_blank");
    return;
  }
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (source instanceof Blob) setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PreviewPage() {
  const router = useRouter();
  const { t, locale } = useI18n();

  const files = useUploadStore((s) => s.files);
  const editedCaption = useEditorStore((s) => s.editedCaption);
  const resolvedParams = useEditorStore((s) => s.resolvedParams);
  const selectedMoodPackId = useEditorStore((s) => s.selectedMoodPackId);
  const selectedDuration = useEditorStore((s) => s.selectedDuration);
  const shuffle = useEditorStore((s) => s.shuffle);

  const [platform, setPlatform] = useState<Platform>("instagram");

  // Single source of truth cho render state
  const { render, progress, stage, outputBlob, outputUrl, error: renderError, isRendering, reset: resetRender } = useFFmpegRender();

  const isDone = stage === "done";
  const isError = stage === "error";

  useEffect(
    () => () => {
      resetRender();
    },
    [resetRender],
  );

  const { canvasRef, isLoading: canvasLoading } = useCanvasPreview({
    files,
    resolvedParams,
    caption: editedCaption,
    totalDuration: selectedDuration,
  });

  const moodPack = selectedMoodPackId ? getMoodPack(selectedMoodPackId) : null;

  const handleExport = useCallback(() => {
    if (!resolvedParams || files.length === 0) return;
    render({
      files,
      resolvedParams,
      caption: editedCaption,
      totalDuration: selectedDuration,
      musicFilename: resolvedParams.musicTrack?.filename,
    });
  }, [render, files, resolvedParams, editedCaption, selectedDuration]);

  // Fix 0B: ưu tiên blob có size > 0, fallback url string
  const handleDownload = useCallback(() => {
    const filename = `moodstory-${Date.now()}.mp4`;
    if (outputBlob && outputBlob.size > 0) {
      triggerDownload(outputBlob, filename);
    } else if (outputUrl) {
      triggerDownload(outputUrl, filename);
    }
  }, [outputBlob, outputUrl]);

  const handleMakeAnother = () => {
    useUploadStore.getState().reset();
    useEditorStore.getState().reset();
    resetRender();
    router.push("/");
  };

  return (
    <>
      <div className="min-h-dvh bg-[var(--bg-base)] flex justify-center">
        <div className="relative w-full max-w-[430px] flex flex-col" style={{ height: "100dvh", paddingBottom: "calc(var(--nav-height) + var(--safe-bottom))" }}>
          {/* Header */}
          <header className="shrink-0 flex items-center justify-between px-5 pt-10 pb-3 border-b border-[var(--border-subtle)]">
            <button
              onClick={() => router.back()}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center",
                "bg-[var(--bg-card)] border border-[var(--border-subtle)]",
                "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                "transition-all duration-150 active:scale-90",
              )}
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="text-sm font-semibold text-[var(--text-primary)]">{t.preview.title}</h1>
            {!isRendering && !isDone ? (
              <button
                onClick={shuffle}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl",
                  "bg-[var(--bg-card)] border border-[var(--border-subtle)]",
                  "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                  "text-xs font-medium transition-all duration-150 active:scale-95",
                )}
              >
                <ShuffleIcon />
                {t.preview.shuffleBtn}
              </button>
            ) : (
              <div className="w-20" />
            )}
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {/* Canvas 9:16 */}
            <div className="relative w-full max-w-[200px] mx-auto">
              <canvas ref={canvasRef} className="w-full rounded-2xl border border-[var(--border-subtle)]" style={{ aspectRatio: "9/16" }} />
              {canvasLoading && (
                <div className="absolute inset-0 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center">
                  <span className="w-6 h-6 border-2 border-[var(--brand-purple)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {moodPack && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-[10px] text-white font-medium">
                  {moodPack.emoji} {moodPack.name}
                </div>
              )}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] text-white font-mono">{selectedDuration}s</div>
            </div>

            {/* Caption */}
            {editedCaption && (
              <div className="px-4 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono mb-1">{t.editor.captionLabel}</p>
                <p className="text-sm text-[var(--text-primary)] italic leading-relaxed">"{editedCaption}"</p>
              </div>
            )}

            {/* Render progress */}
            {isRendering && (
              <div className="px-4 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <RenderProgressBar progress={progress} stage={stage} />
              </div>
            )}

            {/* Error */}
            {isError && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/30">
                <span className="text-lg shrink-0">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-red-400">{locale === "vi" ? "Render thất bại" : "Render failed"}</p>
                  {renderError && <p className="text-xs text-red-400/70 mt-0.5 font-mono break-all">{renderError}</p>}
                  <button onClick={handleExport} className="mt-2 text-xs text-[var(--brand-purple)] underline">
                    {locale === "vi" ? "Thử lại" : "Try again"}
                  </button>
                </div>
              </div>
            )}

            {/* Done */}
            {isDone && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--brand-purple-dim)] border border-[var(--brand-purple-border)]">
                <span className="text-xl">🎉</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{t.preview.renderDone}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {outputBlob && outputBlob.size > 0
                      ? `${(outputBlob.size / (1024 * 1024)).toFixed(1)} MB · ${locale === "vi" ? "sẵn sàng tải" : "ready to download"}`
                      : locale === "vi"
                        ? "Sẵn sàng tải xuống"
                        : "Ready to download"}
                  </p>
                </div>
              </div>
            )}

            {/* Platform */}
            {!isRendering && (
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono mb-2">{t.preview.exportFor}</p>
                <PlatformSelector selected={platform} onSelect={setPlatform} />
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="shrink-0 px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] flex flex-col gap-2">
            {!isDone ? (
              <Button
                variant="gradient"
                size="lg"
                fullWidth
                disabled={isRendering || files.length === 0}
                isLoading={isRendering}
                onClick={handleExport}
                leftIcon={!isRendering ? <DownloadIcon /> : undefined}
                className="shadow-xl shadow-[rgba(155,124,244,0.3)]"
              >
                {isRendering ? "" : t.preview.exportBtn}
              </Button>
            ) : (
              <>
                <Button variant="gradient" size="lg" fullWidth onClick={handleDownload} leftIcon={<DownloadIcon />} className="shadow-xl shadow-[rgba(155,124,244,0.3)]">
                  {t.preview.downloadBtn}
                </Button>
                <Button variant="ghost" size="md" fullWidth onClick={handleMakeAnother} leftIcon={<RefreshIcon />}>
                  {t.preview.makeAnother}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}

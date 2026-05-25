"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editorStore";
import { useUploadStore } from "@/store/uploadStore";
import { useExportStore } from "@/store/exportStore";
import { getMoodPack } from "@/features/mood-engine";

// ── Icons ────────────────────────────────────────────────────────────────────

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

// ── Canvas Preview ────────────────────────────────────────────────────────────

interface CanvasPreviewProps {
  imageUrl: string;
  caption: string;
  colorGrade: {
    brightness: number;
    contrast: number;
    saturation: number;
    hueRotate: number;
  };
  textStyle: string;
  fontFamily: string;
  colorTone: { shadows: string; highlights: string; midtones: string };
}

function CanvasPreview({ imageUrl, caption, colorGrade, textStyle, fontFamily, colorTone }: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas size: 9:16 ratio
    canvas.width = 1080;
    canvas.height = 1920;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // ── Draw image (cover) ──
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;

      // Apply color grade via canvas filter
      ctx.filter = [`brightness(${colorGrade.brightness})`, `contrast(${colorGrade.contrast})`, `saturate(${colorGrade.saturation})`, `hue-rotate(${colorGrade.hueRotate}deg)`].join(" ");

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      ctx.filter = "none";

      // ── Shadow overlay (bottom gradient) ──
      const grad = ctx.createLinearGradient(0, canvas.height * 0.5, 0, canvas.height);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, `${colorTone.shadows}cc`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ── Caption text overlay ──
      if (caption) {
        const fontMap: Record<string, string> = {
          mono: "monospace",
          "serif-thin": "Georgia, serif",
          sans: "system-ui, sans-serif",
        };

        ctx.font = `${textStyle === "glitch" ? "bold " : ""}72px ${fontMap[fontFamily] ?? "system-ui"}`;
        ctx.fillStyle = "#f0eeff";
        ctx.textAlign = "left";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 20;

        // Word wrap
        const maxWidth = canvas.width - 120;
        const lineHeight = 90;
        const words = caption.split(" ");
        const lines: string[] = [];
        let current = "";

        for (const word of words) {
          const test = current ? `${current} ${word}` : word;
          if (ctx.measureText(test).width > maxWidth && current) {
            lines.push(current);
            current = word;
          } else {
            current = test;
          }
        }
        if (current) lines.push(current);

        const totalHeight = lines.length * lineHeight;
        const startY = canvas.height - 200 - totalHeight;

        lines.forEach((line, i) => {
          ctx.fillText(line, 60, startY + i * lineHeight);
        });

        ctx.shadowBlur = 0;
      }

      // ── Subtle vignette ──
      const vignette = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.width * 0.3, canvas.width / 2, canvas.height / 2, canvas.width * 0.9);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    img.onerror = () => {
      // Fallback: gradient background nếu ảnh lỗi
      const fallback = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      fallback.addColorStop(0, colorTone.shadows);
      fallback.addColorStop(1, colorTone.midtones);
      ctx.fillStyle = fallback;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    img.src = imageUrl;
  }, [imageUrl, caption, colorGrade, textStyle, fontFamily, colorTone]);

  return <canvas ref={canvasRef} className="w-full h-full object-contain rounded-2xl" style={{ aspectRatio: "9/16" }} />;
}

// ── Platform Selector ─────────────────────────────────────────────────────────

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

// ── Render Progress ───────────────────────────────────────────────────────────

const MOCK_VIDEO_URL = "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function RenderProgress({ onDone }: { onDone: (url: string) => void }) {
  const { locale } = useI18n();
  const updateProgress = useExportStore((s) => s.updateProgress);
  const progress = useExportStore((s) => s.progress);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      // Simulate render progress
      const steps = [
        { target: 20, delay: 300 },
        { target: 45, delay: 400 },
        { target: 70, delay: 500 },
        { target: 88, delay: 400 },
        { target: 95, delay: 300 },
        { target: 100, delay: 200 },
      ];

      for (const step of steps) {
        updateProgress(step.target);
        await sleep(step.delay);
      }

      // Mock: fetch video từ public URL
      onDone(MOCK_VIDEO_URL);
    };

    run();
  }, [onDone, updateProgress]);

  const estSeconds = Math.max(0, Math.round((100 - progress) * 0.025));

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="text-sm font-medium text-[var(--text-primary)]">{locale === "vi" ? "Đang tạo video..." : "Creating your video..."}</p>

      {/* Progress bar */}
      <div className="w-full rounded-full h-2 bg-[var(--bg-elevated)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: "var(--brand-gradient)",
          }}
        />
      </div>

      <div className="flex items-center justify-between w-full">
        <span className="text-xs text-[var(--text-muted)] font-mono">{progress}%</span>
        {progress < 100 && <span className="text-xs text-[var(--text-muted)]">{locale === "vi" ? `~${estSeconds}s` : `~${estSeconds}s left`}</span>}
      </div>
    </div>
  );
}

// ── Main Preview Page ─────────────────────────────────────────────────────────

export default function PreviewPage() {
  const router = useRouter();
  const { t, locale } = useI18n();

  const files = useUploadStore((s) => s.files);
  const editedCaption = useEditorStore((s) => s.editedCaption);
  const resolvedParams = useEditorStore((s) => s.resolvedParams);
  const selectedMoodPackId = useEditorStore((s) => s.selectedMoodPackId);
  const shuffle = useEditorStore((s) => s.shuffle);

  const exportStatus = useExportStore((s) => s.status);
  const outputUrl = useExportStore((s) => s.outputUrl);
  const startRender = useExportStore((s) => s.startRender);
  const setOutput = useExportStore((s) => s.setOutput);
  const resetExport = useExportStore((s) => s.reset);

  const [platform, setPlatform] = useState<Platform>("instagram");

  // Reset export state khi vào trang
  useEffect(() => {
    resetExport();
  }, [resetExport]);

  // Lấy ảnh đầu tiên done làm preview
  const previewFile = files.find((f) => f.status === "done");
  const previewUrl = previewFile?.url ?? "";

  // Fallback nếu chưa có resolvedParams (direct navigate)
  const moodPack = selectedMoodPackId ? getMoodPack(selectedMoodPackId) : null;
  const colorGrade = resolvedParams?.colorGrade ?? {
    brightness: 1,
    contrast: 1,
    saturation: 1,
    hueRotate: 0,
  };
  const colorTone = moodPack?.colorTone ?? {
    shadows: "#0a0a0f",
    highlights: "#f0eeff",
    midtones: "#1a1828",
  };
  const textStyle = resolvedParams?.textStyle ?? "fade-in";
  const fontFamily = resolvedParams?.fontFamily ?? "sans";

  // ── Export handler ──
  const handleExport = () => {
    startRender();
  };

  const handleRenderDone = useCallback(
    (url: string) => {
      // Mock: tạo fake blob từ URL để setOutput nhận Blob
      fetch(url)
        .then((r) => r.blob())
        .then((blob) => setOutput(blob))
        .catch(() => {
          // Nếu fetch fail (CORS), dùng URL trực tiếp làm fallback
          setOutput(new Blob([], { type: "video/mp4" }));
        });
    },
    [setOutput],
  );

  // ── Download handler ──
  const handleDownload = () => {
    if (!outputUrl) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      window.open(outputUrl.startsWith("blob:") ? outputUrl : MOCK_VIDEO_URL, "_blank");
      return;
    }

    const a = document.createElement("a");
    a.href = outputUrl.startsWith("blob:") ? outputUrl : MOCK_VIDEO_URL;
    a.download = `moodstory-${Date.now()}.mp4`;
    a.click();
  };

  // ── Make another ──
  const handleMakeAnother = () => {
    useUploadStore.getState().reset();
    useEditorStore.getState().reset();
    useExportStore.getState().reset();
    router.push("/");
  };

  const isRendering = exportStatus === "rendering";
  const isDone = exportStatus === "done";

  return (
    <>
      <div className="min-h-dvh bg-[var(--bg-base)] flex justify-center">
        <div className="relative w-full max-w-[430px] flex flex-col" style={{ height: "100dvh", paddingBottom: "calc(var(--nav-height) + var(--safe-bottom))" }}>
          {/* ── Header ── */}
          <header className="shrink-0 flex items-center justify-between px-5 pt-10 pb-3 border-b border-[var(--border-subtle)]">
            <button
              onClick={() => router.back()}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center",
                "bg-[var(--bg-card)] border border-[var(--border-subtle)]",
                "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                "transition-all duration-150 active:scale-90",
              )}
              aria-label="Quay lại"
            >
              <ArrowLeftIcon />
            </button>

            <h1 className="text-sm font-semibold text-[var(--text-primary)]">{t.preview.title}</h1>

            {/* Shuffle button */}
            {!isRendering && !isDone && (
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
            )}

            {isDone && <div className="w-9" />}
          </header>

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {/* ── Canvas Preview ── */}
            <div className="relative w-full max-w-[240px] mx-auto">
              {previewUrl ? (
                <CanvasPreview imageUrl={previewUrl} caption={editedCaption} colorGrade={colorGrade} textStyle={textStyle} fontFamily={fontFamily} colorTone={colorTone} />
              ) : (
                // Fallback: no image
                <div
                  className="w-full rounded-2xl flex items-center justify-center"
                  style={{
                    aspectRatio: "9/16",
                    background: `linear-gradient(135deg, ${colorTone.shadows}, ${colorTone.midtones})`,
                  }}
                >
                  <span className="text-4xl opacity-40">🎬</span>
                </div>
              )}

              {/* Mood badge overlay */}
              {selectedMoodPackId && (
                <div className={cn("absolute top-3 left-3", "flex items-center gap-1 px-2 py-1 rounded-lg", "bg-black/50 backdrop-blur-sm", "text-[10px] text-white font-medium")}>
                  {moodPack?.emoji} {moodPack?.name}
                </div>
              )}
            </div>

            {/* ── Caption display ── */}
            {editedCaption && (
              <div className={cn("px-4 py-3 rounded-2xl", "bg-[var(--bg-card)] border border-[var(--border-subtle)]")}>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono mb-1">{t.editor.captionLabel}</p>
                <p className="text-sm text-[var(--text-primary)] italic leading-relaxed">"{editedCaption}"</p>
              </div>
            )}

            {/* ── Render progress ── */}
            {isRendering && (
              <div className={cn("px-4 py-3 rounded-2xl", "bg-[var(--bg-card)] border border-[var(--border-subtle)]")}>
                <RenderProgress onDone={handleRenderDone} />
              </div>
            )}

            {/* ── Done state ── */}
            {isDone && (
              <div className={cn("flex items-center gap-3 px-4 py-3 rounded-2xl", "bg-[var(--brand-purple-dim)] border border-[var(--brand-purple-border)]")}>
                <span className="text-xl">🎉</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{t.preview.renderDone}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{locale === "vi" ? "Sẵn sàng để tải xuống" : "Ready to download"}</p>
                </div>
              </div>
            )}

            {/* ── Platform selector ── */}
            {!isRendering && (
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono mb-2">{t.preview.exportFor}</p>
                <PlatformSelector selected={platform} onSelect={setPlatform} />
              </div>
            )}
          </div>

          {/* ── CTA bottom ── */}
          <div className="shrink-0 px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] flex flex-col gap-2">
            {!isDone ? (
              <Button
                variant="gradient"
                size="lg"
                fullWidth
                disabled={isRendering}
                isLoading={isRendering}
                onClick={handleExport}
                leftIcon={!isRendering ? <DownloadIcon /> : undefined}
                className="shadow-xl shadow-[rgba(155,124,244,0.3)] animate-pulse-glow"
              >
                {isRendering ? t.preview.rendering : t.preview.exportBtn}
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

"use client";

import { useState, useRef, useCallback } from "react";
import { fetchFile } from "@ffmpeg/util";
import { getFFmpeg, resetFFmpeg } from "@/lib/ffmpeg";
import { renderFrame, prepareClips, type CompositorConfig, type RawClip } from "@/features/editor/lib/canvasCompositor";
import type { ResolvedPackParams } from "@/features/mood-engine/types";
import type { UploadedFile } from "@/store/uploadStore";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

type RenderStage = "idle" | "loading-ffmpeg" | "preparing-frames" | "encoding" | "muxing-audio" | "done" | "error";

interface RenderOptions {
  files: UploadedFile[];
  resolvedParams: ResolvedPackParams;
  caption: string;
  totalDuration: 10 | 15 | 20 | 25;
  musicFilename?: string;
}

interface UseFFmpegRenderReturn {
  render: (options: RenderOptions) => Promise<void>;
  progress: number;
  stage: RenderStage;
  outputBlob: Blob | null;
  outputUrl: string | null;
  error: string | null;
  isRendering: boolean;
  reset: () => void;
}

// ── JPEG thay PNG: nhanh hơn 3-5x ──────────────────────────────────────────
async function canvasToUint8Array(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    // JPEG quality 0.85 — đủ cho preview, encode nhanh hơn PNG nhiều
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("toBlob failed"));
          return;
        }
        blob
          .arrayBuffer()
          .then((buf) => resolve(new Uint8Array(buf)))
          .catch(reject);
      },
      "image/jpeg",
      0.85,
    );
  });
}

// ── Mock render với timing log ──────────────────────────────────────────────
async function createMockBlob(setProgress: (n: number) => void, setStage: (s: RenderStage) => void): Promise<{ blob: Blob; url: string }> {
  const t0 = performance.now();
  const mark = (label: string) => console.log(`[FFmpeg] ${label}: ${((performance.now() - t0) / 1000).toFixed(2)}s`);

  // Step 1: Load FFmpeg
  setStage("loading-ffmpeg");
  setProgress(5);
  mark("start load FFmpeg");
  const ffmpeg = await getFFmpeg();
  mark("FFmpeg loaded ✓");
  setProgress(15);

  // Step 2: Render frames
  setStage("encoding");
  const canvas = document.createElement("canvas");
  // 540×960 thay 1080×1920 — đủ cho mock, nhanh hơn 4x
  canvas.width = 540;
  canvas.height = 960;
  const ctx = canvas.getContext("2d")!;

  // Mock chỉ cần 15 frame (0.5s) thay vì 30 — đủ để test flow
  const totalFrames = 15;
  mark("start render frames");

  for (let i = 0; i < totalFrames; i++) {
    const hue = (i / totalFrames) * 60 + 240;
    ctx.fillStyle = `hsl(${hue}, 60%, 8%)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createRadialGradient(270, 480, 0, 270, 480, 350);
    grad.addColorStop(0, `hsla(${hue + 60}, 80%, 30%, 0.4)`);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = `hsla(${hue + 60}, 80%, 80%, 0.9)`;
    ctx.font = "bold 28px monospace";
    ctx.textAlign = "center";
    ctx.fillText("MoodStory", 270, 460);
    ctx.font = "16px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("preview", 270, 495);

    const data = await canvasToUint8Array(canvas);
    // JPEG trong FFmpeg cần extension .jpg
    await ffmpeg.writeFile(`frame${String(i).padStart(5, "0")}.jpg`, data);
    setProgress(15 + Math.round((i / totalFrames) * 60));
  }

  mark("frames done ✓");
  setProgress(78);

  // Step 3: Encode
  mark("start FFmpeg encode");
  await ffmpeg.exec([
    "-framerate",
    "15", // 15fps cho mock — nhanh hơn 2x encode
    "-i",
    "frame%05d.jpg",
    "-c:v",
    "libx264",
    "-preset",
    "ultrafast", // ultrafast thay fast
    "-crf",
    "32", // quality thấp hơn 1 chút, encode nhanh hơn
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "faststart",
    "mock_out.mp4",
  ]);
  mark("FFmpeg encode done ✓");
  setProgress(95);

  const raw = (await ffmpeg.readFile("mock_out.mp4")) as Uint8Array;
  for (let i = 0; i < totalFrames; i++) {
    try {
      await ffmpeg.deleteFile(`frame${String(i).padStart(5, "0")}.jpg`);
    } catch {
      /**/
    }
  }
  try {
    await ffmpeg.deleteFile("mock_out.mp4");
  } catch {
    /**/
  }

  mark("total ✓");
  const blob = new Blob([raw.slice().buffer], { type: "video/mp4" });
  return { blob, url: URL.createObjectURL(blob) };
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useFFmpegRender(): UseFFmpegRenderReturn {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<RenderStage>("idle");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    abortRef.current = true;
    setOutputUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setProgress(0);
    setStage("idle");
    setOutputBlob(null);
    setError(null);
  }, []);

  const render = useCallback(async (options: RenderOptions) => {
    const { files, resolvedParams, caption, totalDuration, musicFilename } = options;
    abortRef.current = false;
    setProgress(0);
    setError(null);
    setOutputBlob(null);
    setOutputUrl(null);

    try {
      if (USE_MOCK) {
        const { blob, url } = await createMockBlob(setProgress, setStage);
        if (abortRef.current) return;
        setOutputBlob(blob);
        setOutputUrl(url);
        setProgress(100);
        setStage("done");
        return;
      }

      // ── REAL RENDER (không thay đổi) ──────────────────────────────────────
      const doneFiles = files.filter((f) => f.status === "done");
      if (doneFiles.length === 0) throw new Error("Không có file để render");

      setStage("loading-ffmpeg");
      const ffmpeg = await getFFmpeg();
      if (abortRef.current) return;

      setStage("preparing-frames");
      setProgress(10);

      const clipDur = totalDuration / doneFiles.length;
      const rawClips: RawClip[] = doneFiles.map(
        (f, i): RawClip => ({
          url: f.url,
          type: f.type,
          startTime: i * clipDur,
          endTime: (i + 1) * clipDur,
          videoSeekTo: 0,
          kenBurns: resolvedParams.kenBurns,
        }),
      );

      const clips = await prepareClips(rawClips);
      if (abortRef.current) return;

      const config: CompositorConfig = {
        clips,
        colorGrade: resolvedParams.colorGrade,
        textOverlay: caption
          ? {
              text: caption,
              style: resolvedParams.textStyle,
              fontFamily: resolvedParams.fontFamily,
              startTime: 1,
              duration: totalDuration - 2,
            }
          : null,
        transition: resolvedParams.transition,
        totalDuration,
        fps: 30,
        width: 1080,
        height: 1920,
        colorTone: resolvedParams.colorTone,
        animationSpeed: resolvedParams.animationSpeed,
      };

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d")!;
      const totalFrames = totalDuration * 30;
      const t0 = performance.now();

      for (let frame = 0; frame < totalFrames; frame++) {
        if (abortRef.current) return;
        renderFrame(ctx, frame / 30, config);
        const data = await canvasToUint8Array(canvas);
        await ffmpeg.writeFile(`frame${String(frame).padStart(5, "0")}.jpg`, data);
        setProgress(10 + Math.round((frame / totalFrames) * 70));

        // Log mỗi 30 frame (mỗi giây)
        if (frame > 0 && frame % 30 === 0) {
          const elapsed = (performance.now() - t0) / 1000;
          const fps = frame / elapsed;
          console.log(`[Render] frame ${frame}/${totalFrames} — ${fps.toFixed(1)} frame/s — eta ${((totalFrames - frame) / fps).toFixed(0)}s`);
        }
      }

      setStage("encoding");
      setProgress(80);

      const args = ["-framerate", "30", "-i", "frame%05d.jpg"];
      if (musicFilename) {
        try {
          const audio = await fetchFile(`/music/${musicFilename}`);
          await ffmpeg.writeFile("audio.mp3", audio);
          args.push("-i", "audio.mp3");
          setStage("muxing-audio");
        } catch {
          /**/
        }
      }

      args.push("-c:v", "libx264", "-preset", "fast", "-crf", "23", "-pix_fmt", "yuv420p", ...(musicFilename ? ["-c:a", "aac", "-shortest"] : []), "-movflags", "faststart", "output.mp4");

      await ffmpeg.exec(args);
      setProgress(95);

      const raw = (await ffmpeg.readFile("output.mp4")) as Uint8Array;
      const blob = new Blob([raw.slice().buffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      for (let i = 0; i < totalFrames; i++) {
        try {
          await ffmpeg.deleteFile(`frame${String(i).padStart(5, "0")}.jpg`);
        } catch {
          /**/
        }
      }
      try {
        await ffmpeg.deleteFile("audio.mp3");
      } catch {
        /**/
      }
      try {
        await ffmpeg.deleteFile("output.mp4");
      } catch {
        /**/
      }

      setOutputBlob(blob);
      setOutputUrl(url);
      setProgress(100);
      setStage("done");
    } catch (err) {
      if (!abortRef.current) {
        setError(err instanceof Error ? err.message : "Render thất bại");
        setStage("error");
        resetFFmpeg();
      }
    }
  }, []);

  return {
    render,
    progress,
    stage,
    outputBlob,
    outputUrl,
    error,
    isRendering: !["idle", "done", "error"].includes(stage),
    reset,
  };
}

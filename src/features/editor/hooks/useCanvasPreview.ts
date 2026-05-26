// features/editor/hooks/useCanvasPreview.ts
// Hook: render 1 frame tĩnh lên canvas để preview (không phải video)

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { renderFrame, prepareClips, type CompositorConfig, type RawClip } from "../lib/canvasCompositor";
import type { ResolvedPackParams } from "@/features/mood-engine/types";
import type { UploadedFile } from "@/store/uploadStore";

interface UseCanvasPreviewOptions {
  files: UploadedFile[];
  resolvedParams: ResolvedPackParams | null;
  caption: string;
  previewTime?: number; // giây trong timeline muốn preview (default: 3s)
  totalDuration?: 10 | 15 | 20 | 25;
}

interface UseCanvasPreviewReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCanvasPreview({ files, resolvedParams, caption, previewTime = 3, totalDuration = 15 }: UseCanvasPreviewOptions): UseCanvasPreviewReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !resolvedParams) return;

    const doneFiles = files.filter((f) => f.status === "done");
    if (doneFiles.length === 0) return;

    setIsLoading(true);
    setError(null);
    setIsReady(false);
    abortRef.current = false;

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      // Canvas size 9:16
      canvas.width = 1080;
      canvas.height = 1920;

      // Chia đều thời gian cho mỗi clip
      const clipDuration = totalDuration / doneFiles.length;

      const rawClips: RawClip[] = doneFiles.map((file, i) => ({
        url: file.url,
        type: file.type,
        startTime: i * clipDuration,
        endTime: (i + 1) * clipDuration,
        videoSeekTo: 0,
        kenBurns: resolvedParams.kenBurns,
      }));

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

      // Render 1 frame tại previewTime
      renderFrame(ctx, Math.min(previewTime, totalDuration - 0.1), config);

      setIsReady(true);
    } catch (err) {
      if (!abortRef.current) {
        setError(err instanceof Error ? err.message : "Preview render failed");
      }
    } finally {
      if (!abortRef.current) setIsLoading(false);
    }
  }, [files, resolvedParams, caption, previewTime, totalDuration]);

  // Re-render khi dependencies thay đổi (shuffle, caption edit)
  useEffect(() => {
    render();
    return () => {
      abortRef.current = true;
    };
  }, [render]);

  return { canvasRef, isReady, isLoading, error, refresh: render };
}

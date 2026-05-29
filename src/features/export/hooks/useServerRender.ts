"use client";

import { useState, useCallback, useRef } from "react";
import type { UploadedFile } from "@/store/uploadStore";
import type { ResolvedPackParams } from "@/features/mood-engine/types";

const RENDER_API = process.env.NEXT_PUBLIC_RENDER_API_URL;
// .env.local: NEXT_PUBLIC_RENDER_API_URL=http://YOUR_VPS_IP:3001

type RenderStage = "idle" | "queued" | "downloading" | "rendering" | "done" | "error";

interface UseServerRenderReturn {
  render: (options: { files: UploadedFile[]; resolvedParams: ResolvedPackParams; caption: string; totalDuration: 10 | 15 | 20 | 25; musicUrl?: string }) => Promise<void>;
  progress: number;
  stage: RenderStage;
  outputBlob: Blob | null;
  outputUrl: string | null;
  error: string | null;
  isRendering: boolean;
  reset: () => void;
}

export function useServerRender(): UseServerRenderReturn {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<RenderStage>("idle");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);

  const reset = useCallback(() => {
    abortRef.current = true;
    if (pollRef.current) clearInterval(pollRef.current);
    setProgress(0);
    setStage("idle");
    setOutputUrl(null);
    setError(null);
  }, []);

  const render = useCallback(async ({ files, resolvedParams, caption, totalDuration, musicUrl }) => {
    abortRef.current = false;
    setProgress(0);
    setError(null);
    setOutputUrl(null);
    setStage("queued");

    try {
      // Bước 1: Gửi job lên server
      const res = await fetch(`${RENDER_API}/render/job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: files
            .filter((f) => f.status === "done")
            .map((f) => ({
              id: f.id,
              url: f.url,
              type: f.type,
              duration: f.duration,
            })),
          resolvedParams,
          caption,
          totalDuration,
          musicUrl,
        }),
      });

      const { jobId } = await res.json();
      setStage("rendering");

      // Bước 2: Poll status mỗi 2s
      await new Promise<void>((resolve, reject) => {
        pollRef.current = setInterval(async () => {
          if (abortRef.current) {
            clearInterval(pollRef.current!);
            return;
          }

          try {
            const statusRes = await fetch(`${RENDER_API}/render/status/${jobId}`);
            const status = await statusRes.json();

            setProgress(status.progress ?? 0);

            if (status.status === "done") {
              clearInterval(pollRef.current!);

              // Fetch blob về FE để download
              setStage("downloading");
              const videoRes = await fetch(status.outputUrl);
              const blob = await videoRes.blob();
              setOutputBlob(blob);
              const blobUrl = URL.createObjectURL(blob);

              setOutputBlob(null);

              setOutputUrl(blobUrl);
              setProgress(100);
              setStage("done");
              resolve();
            }

            if (status.status === "error") {
              clearInterval(pollRef.current!);
              reject(new Error(status.error ?? "Render failed"));
            }
          } catch (err) {
            clearInterval(pollRef.current!);
            reject(err);
          }
        }, 2000);
      });
    } catch (err) {
      if (!abortRef.current) {
        setError(err instanceof Error ? err.message : "Render thất bại");
        setStage("error");
      }
    }
  }, []);

  return {
    render,
    progress,
    stage,
    outputUrl,
    outputBlob,
    error,
    isRendering: !["idle", "done", "error"].includes(stage),
    reset,
  };
}

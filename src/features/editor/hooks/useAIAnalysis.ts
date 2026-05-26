"use client";

import { useState, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { getMoodPack } from "@/features/mood-engine";
import type { UploadedFile } from "@/store/uploadStore";
import type { StoryType } from "@/features/mood-engine";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// Mock fallback — dùng khi NEXT_PUBLIC_USE_MOCK=true hoặc khi AI fail
const MOCK_RESULT = {
  narrativeOrder: [0, 1, 2],
  selectedSegments: [{ fileId: "mock-0", startTime: 0, endTime: 5, score: 0.92, reason: "Good composition" }],
  overallVibe: "Late night city, reflective mood",
  suggestedDuration: 15 as const,
  caption: "some nights feel heavier than they look",
  suggestedMusicId: "nd-01",
};

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Retry wrapper — tối đa 3 lần, delay 1s giữa các lần
async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries - 1) await sleep(delayMs);
    }
  }
  throw lastError;
}

export type AIStatus = "idle" | "analyzing" | "caption" | "music" | "done" | "error";

export interface UseAIAnalysisReturn {
  analyze: (files: UploadedFile[], moodPackId: string, storyType: StoryType) => Promise<void>;
  status: AIStatus;
  error: string | null;
  reset: () => void;
}

export function useAIAnalysis(): UseAIAnalysisReturn {
  const [status, setStatus] = useState<AIStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const setAIResult = useEditorStore((s) => s.setAIResult);
  const setAIStatus = useEditorStore((s) => s.setAIStatus);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const analyze = useCallback(
    async (files: UploadedFile[], moodPackId: string, storyType: StoryType) => {
      setStatus("analyzing");
      setError(null);
      setAIStatus("loading");

      try {
        // ── MOCK MODE ──────────────────────────────────────────────────────
        if (USE_MOCK) {
          await sleep(2500);
          setAIResult({ ...MOCK_RESULT });
          setStatus("done");
          return;
        }

        // ── REAL MODE ──────────────────────────────────────────────────────

        // Chỉ dùng files đã upload xong (có Cloudinary URL)
        const doneFiles = files.filter((f) => f.status === "done" && f.url);
        if (doneFiles.length === 0) throw new Error("Không có file nào upload xong");

        // Step 1: Analyze frames
        setStatus("analyzing");
        const analysis = await fetchWithRetry(() =>
          fetch("/api/ai/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              files: doneFiles.map((f) => ({
                id: f.id,
                url: f.url,
                type: f.type,
                duration: f.duration,
              })),
              moodPackId,
              storyType,
            }),
          }).then(async (r) => {
            if (!r.ok) throw new Error(await r.text());
            return r.json();
          }),
        );

        // Step 2: Caption từ ảnh đẹp nhất (theo narrativeOrder)
        setStatus("caption");
        const bestIndex = analysis.narrativeOrder?.[0] ?? 0;
        const bestFile = doneFiles[bestIndex] ?? doneFiles[0];
        const pack = getMoodPack(moodPackId);

        const captionData = await fetchWithRetry(() =>
          fetch("/api/ai/caption", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: bestFile.url,
              moodPackId,
              captionPromptHint: pack.captionPromptHint,
            }),
          }).then(async (r) => {
            if (!r.ok) throw new Error(await r.text());
            return r.json();
          }),
        );

        // Step 3: Music suggestion
        setStatus("music");
        const musicData = await fetchWithRetry(() =>
          fetch("/api/ai/music", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              moodPackId,
              storyType,
              overallVibe: analysis.overallVibe,
              availableTracks: pack.musicPool,
            }),
          }).then(async (r) => {
            if (!r.ok) throw new Error(await r.text());
            return r.json();
          }),
        );

        // Gộp kết quả vào store
        setAIResult({
          narrativeOrder: analysis.narrativeOrder ?? [0],
          selectedSegments: analysis.selectedSegments ?? [],
          overallVibe: analysis.overallVibe ?? "",
          suggestedDuration: analysis.suggestedDuration ?? 15,
          caption: captionData.caption ?? "",
          suggestedMusicId: musicData.trackId ?? pack.musicPool[0]?.id ?? "",
        });

        setStatus("done");
      } catch (err) {
        console.error("[useAIAnalysis]", err);
        const message = err instanceof Error ? err.message : "AI phân tích thất bại";
        setError(message);
        setStatus("error");
        setAIStatus("error", message);
      }
    },
    [setAIResult, setAIStatus],
  );

  return { analyze, status, error, reset };
}

"use client";

import { create } from "zustand";
import { getMoodPack, generateSeed, resolveSeed } from "@/features/mood-engine";
import type { MoodSeed, ResolvedPackParams, AllowedDuration } from "@/features/mood-engine";

export interface SegmentSelection {
  fileId: string;
  startTime: number;
  endTime: number;
  score: number;
  reason: string;
}

export interface AIAnalysisResult {
  narrativeOrder: number[];
  selectedSegments: SegmentSelection[];
  overallVibe: string;
  suggestedDuration: AllowedDuration;
  caption: string;
  suggestedMusicId: string;
}

interface EditorStore {
  selectedMoodPackId: string | null;
  currentSeed: MoodSeed | null;
  resolvedParams: ResolvedPackParams | null;

  aiResult: AIAnalysisResult | null;
  aiStatus: "idle" | "loading" | "done" | "error";
  aiError: string | null;

  editedCaption: string;
  selectedMusicId: string | null;
  selectedDuration: AllowedDuration;

  selectMoodPack: (packId: string) => void;
  shuffle: () => void;
  setAIResult: (result: AIAnalysisResult) => void;
  setAIStatus: (status: EditorStore["aiStatus"], error?: string) => void;
  updateCaption: (caption: string) => void;
  selectMusic: (musicId: string) => void;
  setDuration: (duration: AllowedDuration) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  selectedMoodPackId: null,
  currentSeed: null,
  resolvedParams: null,
  aiResult: null,
  aiStatus: "idle",
  aiError: null,
  editedCaption: "",
  selectedMusicId: null,
  selectedDuration: 15,

  selectMoodPack: (packId) => {
    const pack = getMoodPack(packId);
    const seed = generateSeed(pack);
    const resolved = resolveSeed(pack, seed);
    set({
      selectedMoodPackId: packId,
      currentSeed: seed,
      resolvedParams: resolved,
      selectedMusicId: resolved.musicTrack.id,
    });
  },

  shuffle: () => {
    const { selectedMoodPackId } = get();
    if (!selectedMoodPackId) return;
    const pack = getMoodPack(selectedMoodPackId);
    const seed = generateSeed(pack);
    const resolved = resolveSeed(pack, seed);
    set({ currentSeed: seed, resolvedParams: resolved, selectedMusicId: resolved.musicTrack.id });
  },

  setAIResult: (result) =>
    set({
      aiResult: result,
      editedCaption: result.caption,
      selectedDuration: result.suggestedDuration,
      aiStatus: "done",
    }),

  setAIStatus: (status, error) => set({ aiStatus: status, aiError: error ?? null }),

  updateCaption: (caption) => set({ editedCaption: caption }),
  selectMusic: (musicId) => set({ selectedMusicId: musicId }),
  setDuration: (duration) => set({ selectedDuration: duration }),

  reset: () =>
    set({
      selectedMoodPackId: null,
      currentSeed: null,
      resolvedParams: null,
      aiResult: null,
      aiStatus: "idle",
      aiError: null,
      editedCaption: "",
      selectedMusicId: null,
      selectedDuration: 15,
    }),
}));

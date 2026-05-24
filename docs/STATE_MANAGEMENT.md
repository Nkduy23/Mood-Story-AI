# STATE_MANAGEMENT — Zustand Store Design

> Đọc file này khi làm việc với store, state flow giữa các page.

---

## Store Architecture

```
store/
├── uploadStore.ts      # Files đã upload, metadata
├── editorStore.ts      # Mood, seed, AI result, caption
├── exportStore.ts      # Render progress, output blob
└── index.ts            # Re-export tất cả
```

3 store tách biệt theo feature, không gộp chung.
Data flow một chiều: upload → editor → export.

---

## uploadStore

```typescript
// store/uploadStore.ts
import { create } from "zustand";

interface UploadedFile {
  id: string;
  file: File;
  url: string; // Cloudinary URL sau khi upload
  publicId: string; // Cloudinary public ID
  type: "image" | "video";
  width: number;
  height: number;
  duration?: number; // chỉ có với video, tính bằng giây
  thumbnailUrl?: string; // Cloudinary thumbnail
  uploadProgress: number; // 0-100
  status: "uploading" | "done" | "error";
  error?: string;
}

interface UploadStore {
  files: UploadedFile[];
  storyType: StoryType | null;

  // Actions
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  updateFileProgress: (id: string, progress: number) => void;
  updateFileStatus: (id: string, status: UploadedFile["status"], url?: string) => void;
  setStoryType: (type: StoryType) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  files: [],
  storyType: null,

  addFiles: (newFiles) =>
    set((state) => ({
      files: [
        ...state.files,
        ...newFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
          url: "",
          publicId: "",
          type: file.type.startsWith("video") ? "video" : "image",
          width: 0,
          height: 0,
          uploadProgress: 0,
          status: "uploading" as const,
        })),
      ],
    })),

  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    })),

  reorderFiles: (from, to) =>
    set((state) => {
      const files = [...state.files];
      const [moved] = files.splice(from, 1);
      files.splice(to, 0, moved);
      return { files };
    }),

  updateFileProgress: (id, progress) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, uploadProgress: progress } : f)),
    })),

  updateFileStatus: (id, status, url) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, status, url: url ?? f.url } : f)),
    })),

  setStoryType: (storyType) => set({ storyType }),

  reset: () => set({ files: [], storyType: null }),
}));
```

---

## editorStore

```typescript
// store/editorStore.ts

interface AIAnalysisResult {
  narrativeOrder: number[];
  selectedSegments: SegmentSelection[];
  overallVibe: string;
  suggestedDuration: 10 | 15 | 20 | 25;
  caption: string;
  suggestedMusicId: string;
}

interface EditorStore {
  // Mood selection
  selectedMoodPackId: string | null;
  currentSeed: MoodSeed | null;
  resolvedParams: ResolvedPackParams | null;

  // AI results
  aiResult: AIAnalysisResult | null;
  aiStatus: "idle" | "loading" | "done" | "error";
  aiError: string | null;

  // User edits
  editedCaption: string;
  selectedMusicId: string | null;
  selectedDuration: 10 | 15 | 20 | 25;

  // Actions
  selectMoodPack: (packId: string) => void;
  shuffle: () => void; // Random seed mới
  setAIResult: (result: AIAnalysisResult) => void;
  setAIStatus: (status: EditorStore["aiStatus"], error?: string) => void;
  updateCaption: (caption: string) => void;
  selectMusic: (musicId: string) => void;
  setDuration: (duration: 10 | 15 | 20 | 25) => void;
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
    set({
      currentSeed: seed,
      resolvedParams: resolved,
      selectedMusicId: resolved.musicTrack.id,
    });
  },

  setAIResult: (result) =>
    set({
      aiResult: result,
      editedCaption: result.caption,
      selectedDuration: result.suggestedDuration,
      aiStatus: "done",
    }),

  setAIStatus: (status, error) =>
    set({
      aiStatus: status,
      aiError: error ?? null,
    }),

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
```

---

## exportStore

```typescript
// store/exportStore.ts

interface ExportStore {
  status: "idle" | "rendering" | "done" | "error";
  progress: number; // 0-100
  outputBlob: Blob | null;
  outputUrl: string | null; // object URL từ blob
  selectedPlatform: "instagram" | "tiktok" | "facebook" | "download";
  error: string | null;

  // Actions
  startRender: () => void;
  updateProgress: (progress: number) => void;
  setOutput: (blob: Blob) => void;
  setError: (error: string) => void;
  selectPlatform: (platform: ExportStore["selectedPlatform"]) => void;
  reset: () => void;
}

export const useExportStore = create<ExportStore>((set, get) => ({
  status: "idle",
  progress: 0,
  outputBlob: null,
  outputUrl: null,
  selectedPlatform: "instagram",
  error: null,

  startRender: () => set({ status: "rendering", progress: 0, error: null }),

  updateProgress: (progress) => set({ progress }),

  setOutput: (blob) => {
    // Revoke old URL nếu có
    const { outputUrl } = get();
    if (outputUrl) URL.revokeObjectURL(outputUrl);

    const url = URL.createObjectURL(blob);
    set({ status: "done", outputBlob: blob, outputUrl: url, progress: 100 });
  },

  setError: (error) => set({ status: "error", error }),

  selectPlatform: (platform) => set({ selectedPlatform: platform }),

  reset: () => {
    const { outputUrl } = get();
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    set({ status: "idle", progress: 0, outputBlob: null, outputUrl: null, error: null });
  },
}));
```

---

## Store index

```typescript
// store/index.ts
export { useUploadStore } from "./uploadStore";
export { useEditorStore } from "./editorStore";
export { useExportStore } from "./exportStore";
export type { UploadedFile } from "./uploadStore";
export type { AIAnalysisResult } from "./editorStore";
```

---

## Sử dụng trong component

```typescript
// Chỉ subscribe những field cần thiết để tránh re-render thừa
function MoodPicker() {
  const selectedMoodPackId = useEditorStore((s) => s.selectedMoodPackId);
  const selectMoodPack = useEditorStore((s) => s.selectMoodPack);
  const shuffle = useEditorStore((s) => s.shuffle);
  // ...
}

// Không làm thế này — sẽ re-render mỗi khi bất kỳ field nào thay đổi
function BadComponent() {
  const store = useEditorStore(); // BAD
}
```

---

## Reset flow

Khi user bấm "Start Over" hoặc về Home:

```typescript
function handleReset() {
  useUploadStore.getState().reset();
  useEditorStore.getState().reset();
  useExportStore.getState().reset();
  router.push("/");
}
```

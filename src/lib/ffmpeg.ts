// lib/ffmpeg.ts
// FFmpeg.wasm singleton — load lazy, cache sau lần đầu
// Dùng cho V1.5 real video render

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

let instance: FFmpeg | null = null;
let isLoaded = false;
let loadPromise: Promise<FFmpeg> | null = null;

// CDN version — đồng bộ với @ffmpeg/core trong package.json
const FFMPEG_CDN = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

type ProgressCallback = (progress: number) => void;

/**
 * Lấy FFmpeg singleton.
 * Lần đầu gọi sẽ load WASM (~10MB), các lần sau trả về instance đã load.
 * Dùng loadPromise để tránh race condition khi nhiều nơi gọi cùng lúc.
 */
export async function getFFmpeg(onProgress?: ProgressCallback): Promise<FFmpeg> {
  // Đã load xong → trả về luôn
  if (instance && isLoaded) return instance;

  // Đang load → đợi promise hiện tại
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    instance = new FFmpeg();

    // Forward FFmpeg progress event ra ngoài
    instance.on("progress", ({ progress }) => {
      onProgress?.(Math.round(progress * 100));
      // Cũng dispatch CustomEvent để các component khác có thể lắng nghe
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ffmpeg-progress", { detail: { progress: Math.round(progress * 100) } }));
      }
    });

    // Load WASM từ CDN (không bundle vào app để giữ bundle nhỏ)
    await instance.load({
      coreURL: await toBlobURL(`${FFMPEG_CDN}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${FFMPEG_CDN}/ffmpeg-core.wasm`, "application/wasm"),
    });

    isLoaded = true;
    loadPromise = null;
    return instance;
  })();

  return loadPromise;
}

/**
 * Reset singleton — dùng khi cần reload (ví dụ: sau crash)
 */
export function resetFFmpeg() {
  instance = null;
  isLoaded = false;
  loadPromise = null;
}

/**
 * Check xem FFmpeg đã load chưa mà không trigger load
 */
export function isFFmpegLoaded(): boolean {
  return isLoaded;
}

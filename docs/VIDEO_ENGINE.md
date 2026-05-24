# VIDEO_ENGINE — FFmpeg.wasm + Canvas Pipeline

> Đọc file này khi làm bất cứ thứ gì liên quan đến render video, Canvas, hoặc FFmpeg.

---

## Tổng quan pipeline

```
Input files (ảnh/video)
    ↓
[Canvas Compositor]     — color grade, text overlay, Ken Burns effect
    ↓
[Frame Sequence]        — Canvas export từng frame thành PNG buffer
    ↓
[FFmpeg.wasm]           — encode PNG sequence thành MP4 + ghép audio
    ↓
Output MP4 (Blob)       — download hoặc preview
```

---

## Setup FFmpeg.wasm

```typescript
// lib/ffmpeg.ts — Singleton pattern, chỉ load 1 lần
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;
let isLoaded = false;

export async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance && isLoaded) return ffmpegInstance;

  ffmpegInstance = new FFmpeg();

  // Log progress
  ffmpegInstance.on("progress", ({ progress }) => {
    // Emit event để UI update progress bar
    window.dispatchEvent(new CustomEvent("ffmpeg-progress", { detail: { progress } }));
  });

  // Load WASM từ CDN (tránh bundle size lớn)
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpegInstance.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  isLoaded = true;
  return ffmpegInstance;
}
```

**Lưu ý quan trọng:** FFmpeg.wasm cần header CORS đặc biệt.
Thêm vào `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};
```

---

## Canvas Compositor

```typescript
// features/editor/lib/canvasCompositor.ts

interface CompositorConfig {
  clips: ProcessedClip[];
  colorGrade: ColorGradeConfig;
  textOverlay: TextOverlayConfig;
  transition: TransitionConfig;
  totalDuration: 10 | 15 | 20 | 25; // giây
  fps: 30;
  width: 1080;
  height: 1920;
}

interface ProcessedClip {
  element: HTMLImageElement | HTMLVideoElement;
  startTime: number; // giây trong timeline output
  endTime: number;
  kenBurns: KenBurnsConfig;
}

// Color grade bằng Canvas filter
function applyColorGrade(ctx: CanvasRenderingContext2D, config: ColorGradeConfig) {
  // Canvas filter string
  ctx.filter = [`brightness(${config.brightness})`, `contrast(${config.contrast})`, `saturate(${config.saturation})`, `hue-rotate(${config.hueRotate}deg)`].join(" ");
}

// Ken Burns effect — pan/zoom chậm
function getKenBurnsTransform(
  progress: number, // 0 → 1
  config: KenBurnsConfig,
): { scale: number; x: number; y: number } {
  const scale = config.startScale + (config.endScale - config.startScale) * progress;
  const x = config.startX + (config.endX - config.startX) * progress;
  const y = config.startY + (config.endY - config.startY) * progress;
  return { scale, x, y };
}
```

---

## Render Pipeline chi tiết

### Bước 1: Chuẩn bị clips

```typescript
// Với ảnh: load vào HTMLImageElement
// Với video: extract frames tại các timestamp được AI chọn

async function prepareClips(files: ProcessedFile[], aiResult: AIAnalysisResult): Promise<PreparedClip[]> {
  return Promise.all(
    aiResult.selectedSegments.map(async (segment) => {
      const file = files.find((f) => f.id === segment.fileId)!;

      if (file.type === "image") {
        const img = await loadImage(file.url);
        return { element: img, ...segment };
      }

      if (file.type === "video") {
        // Extract frame tại startTime để làm thumbnail
        // Video element sẽ được dùng trực tiếp trong canvas
        const video = await loadVideo(file.url, segment.startTime);
        return { element: video, ...segment };
      }
    }),
  );
}
```

### Bước 2: Render frame sequence vào FFmpeg

```typescript
async function renderToFFmpeg(config: CompositorConfig, onProgress: (p: number) => void): Promise<Uint8Array> {
  const ffmpeg = await getFFmpeg();
  const canvas = document.createElement("canvas");
  canvas.width = config.width; // 1080
  canvas.height = config.height; // 1920
  const ctx = canvas.getContext("2d")!;

  const totalFrames = config.totalDuration * config.fps;
  const frameDuration = 1 / config.fps;

  for (let frame = 0; frame < totalFrames; frame++) {
    const currentTime = frame * frameDuration;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Tìm clip đang active tại currentTime
    const activeClip = getActiveClip(config.clips, currentTime);
    const clipProgress = getClipProgress(activeClip, currentTime);

    // Apply Ken Burns
    const { scale, x, y } = getKenBurnsTransform(clipProgress, activeClip.kenBurns);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Draw media
    ctx.drawImage(activeClip.element, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Apply color grade
    applyColorGrade(ctx, config.colorGrade);

    // Transition overlay (nếu đang ở điểm chuyển cảnh)
    applyTransition(ctx, config, currentTime);

    // Text overlay
    if (config.textOverlay.visible) {
      drawTextOverlay(ctx, config.textOverlay, currentTime);
    }

    // Export frame → FFmpeg
    const frameData = await canvasToUint8Array(canvas);
    await ffmpeg.writeFile(`frame${String(frame).padStart(5, "0")}.png`, frameData);

    onProgress((frame / totalFrames) * 0.8); // 0-80% cho render frames
  }

  // Ghép frames thành MP4
  await ffmpeg.writeFile("audio.mp3", await fetchFile(config.audioTrack));

  await ffmpeg.exec([
    "-framerate",
    String(config.fps),
    "-i",
    "frame%05d.png",
    "-i",
    "audio.mp3",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-shortest",
    "-movflags",
    "faststart",
    "output.mp4",
  ]);

  onProgress(1.0);

  const data = await ffmpeg.readFile("output.mp4");
  return data as Uint8Array;
}
```

---

## Transition Types

```typescript
type TransitionType = "slow-fade" | "light-leak" | "film-burn" | "soft-cut" | "zoom-blur";

function applyTransition(ctx: CanvasRenderingContext2D, config: CompositorConfig, currentTime: number) {
  // Tìm transition point gần nhất
  const nearestTransition = findNearestTransitionPoint(config.clips, currentTime);
  if (!nearestTransition) return;

  const { distanceFromTransition, type } = nearestTransition;
  const TRANSITION_DURATION = 0.5; // giây

  if (distanceFromTransition > TRANSITION_DURATION) return;

  const progress = distanceFromTransition / TRANSITION_DURATION; // 0 → 1

  switch (type) {
    case "slow-fade":
      ctx.globalAlpha =
        progress < 0.5
          ? 1 - progress * 2 // fade out
          : (progress - 0.5) * 2; // fade in
      break;

    case "light-leak":
      // Overlay trắng flash ngắn
      ctx.fillStyle = `rgba(255, 245, 220, ${Math.sin(progress * Math.PI) * 0.7})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      break;

    case "film-burn":
      // Overlay cam/vàng với noise texture
      ctx.fillStyle = `rgba(200, 100, 20, ${Math.sin(progress * Math.PI) * 0.5})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      break;
  }
}
```

---

## Text Overlay

```typescript
interface TextOverlayConfig {
  text: string; // AI-generated caption
  style: "typewriter" | "fade-in" | "glitch" | "slide-up";
  fontFamily: "mono" | "serif-thin" | "sans";
  position: "bottom-left" | "center" | "top";
  color: string;
  startTime: number; // giây bắt đầu hiện text
  duration: number; // hiện bao lâu
}

function drawTextOverlay(ctx: CanvasRenderingContext2D, config: TextOverlayConfig, currentTime: number) {
  const elapsed = currentTime - config.startTime;
  if (elapsed < 0 || elapsed > config.duration) return;

  const progress = elapsed / config.duration;

  switch (config.style) {
    case "typewriter": {
      const charsToShow = Math.floor(config.text.length * Math.min(progress * 3, 1));
      const displayText = config.text.slice(0, charsToShow);
      drawText(ctx, displayText, config);
      break;
    }
    case "fade-in": {
      ctx.globalAlpha = Math.min(progress * 2, 1);
      drawText(ctx, config.text, config);
      ctx.globalAlpha = 1;
      break;
    }
  }
}
```

---

## Mock Mode (dev không cần render thật)

```typescript
// features/export/hooks/useFFmpegRender.ts

export function useFFmpegRender() {
  const [progress, setProgress] = useState(0);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);

  const render = async (params: RenderParams) => {
    if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
      // Simulate render với progress giả
      for (let i = 0; i <= 100; i += 10) {
        await sleep(300);
        setProgress(i);
      }
      // Dùng sample video từ public/mock/
      const response = await fetch("/mock/sample-output.mp4");
      const blob = await response.blob();
      setOutputBlob(blob);
      return;
    }

    // Real render
    const result = await renderToFFmpeg(params, setProgress);
    setOutputBlob(new Blob([result], { type: "video/mp4" }));
  };

  return { render, progress, outputBlob };
}
```

---

## Output Specs

| Platform           | Resolution | FPS | Bitrate |
| ------------------ | ---------- | --- | ------- |
| Instagram Reels    | 1080x1920  | 30  | 8Mbps   |
| TikTok             | 1080x1920  | 30  | 8Mbps   |
| Facebook Story     | 1080x1920  | 30  | 6Mbps   |
| Download (default) | 1080x1920  | 30  | 8Mbps   |

---

## Performance Notes

- FFmpeg.wasm load lần đầu mất 2–5s → show loading spinner, cache sau đó
- Render 25s video ở 30fps = 750 frames → mất ~30–60s trên thiết bị trung bình
- Luôn show progress bar với thời gian ước tính
- Cleanup FFmpeg files sau khi render xong: `ffmpeg.deleteFile('frame*.png')`

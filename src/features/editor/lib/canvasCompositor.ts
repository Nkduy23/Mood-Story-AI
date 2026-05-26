// features/editor/lib/canvasCompositor.ts
// Canvas Compositor: Ken Burns + color grade + text overlay + transitions
// Chạy hoàn toàn trên browser, không cần FFmpeg

import type { ColorGradePreset, KenBurnsPreset, TextStyle, FontFamily, TransitionType } from "@/features/mood-engine/types";
import { clamp } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

export interface PreparedClip {
  element: HTMLImageElement | HTMLVideoElement;
  startTime: number; // giây trong timeline output
  endTime: number;
  kenBurns: KenBurnsPreset;
}

export interface TextOverlayConfig {
  text: string;
  style: TextStyle;
  fontFamily: FontFamily;
  startTime: number;
  duration: number;
  color?: string;
}

export interface CompositorConfig {
  clips: PreparedClip[];
  colorGrade: ColorGradePreset;
  textOverlay: TextOverlayConfig | null;
  transition: TransitionType;
  totalDuration: 10 | 15 | 20 | 25;
  fps: 30;
  width: 1080;
  height: 1920;
  colorTone: { shadows: string; highlights: string; midtones: string };
  animationSpeed: number;
}

export interface FrameRenderResult {
  canvas: HTMLCanvasElement;
  currentTime: number;
}

// ── Font map ─────────────────────────────────────────────────────────────────

const FONT_MAP: Record<FontFamily, string> = {
  mono: '"Geist Mono", "Courier New", monospace',
  "serif-thin": '"Georgia", "Times New Roman", serif',
  sans: '"Geist", "Inter", system-ui, sans-serif',
};

// ── Ken Burns transform ───────────────────────────────────────────────────────

export function getKenBurnsTransform(
  progress: number, // 0 → 1
  config: KenBurnsPreset,
  speed: number = 1.0,
): { scale: number; x: number; y: number } {
  const t = clamp(progress * speed, 0, 1);
  return {
    scale: config.startScale + (config.endScale - config.startScale) * t,
    x: config.startX + (config.endX - config.startX) * t,
    y: config.startY + (config.endY - config.startY) * t,
  };
}

// ── Color grade via CSS filter ────────────────────────────────────────────────

export function buildFilterString(grade: ColorGradePreset): string {
  return [`brightness(${grade.brightness})`, `contrast(${grade.contrast})`, `saturate(${grade.saturation})`, `hue-rotate(${grade.hueRotate}deg)`].join(" ");
}

// ── Draw media element (cover fit) ───────────────────────────────────────────

function drawMediaCover(ctx: CanvasRenderingContext2D, el: HTMLImageElement | HTMLVideoElement, canvasW: number, canvasH: number, scale: number, offsetX: number, offsetY: number) {
  const srcW = el instanceof HTMLImageElement ? el.naturalWidth : el.videoWidth;
  const srcH = el instanceof HTMLImageElement ? el.naturalHeight : el.videoHeight;
  if (!srcW || !srcH) return;

  const coverScale = Math.max(canvasW / srcW, canvasH / srcH) * scale;
  const drawW = srcW * coverScale;
  const drawH = srcH * coverScale;
  const x = (canvasW - drawW) / 2 + offsetX;
  const y = (canvasH - drawH) / 2 + offsetY;

  ctx.drawImage(el, x, y, drawW, drawH);
}

// ── Transition overlay ────────────────────────────────────────────────────────

const TRANSITION_DURATION = 0.5; // giây

function getTransitionProgress(currentTime: number, clips: PreparedClip[]): { progress: number; type: TransitionType } | null {
  for (let i = 0; i < clips.length - 1; i++) {
    const transitionPoint = clips[i].endTime;
    const dist = Math.abs(currentTime - transitionPoint);
    if (dist <= TRANSITION_DURATION) {
      return {
        progress: dist / TRANSITION_DURATION, // 1 → 0 → 1
        type: "slow-fade", // được override từ config bên ngoài
      };
    }
  }
  return null;
}

export function applyTransition(ctx: CanvasRenderingContext2D, type: TransitionType, currentTime: number, clips: PreparedClip[], canvasW: number, canvasH: number) {
  const tInfo = getTransitionProgress(currentTime, clips);
  if (!tInfo) return;

  // progress: 1 (far from transition) → 0 (at transition point) → 1
  const p = tInfo.progress;

  switch (type) {
    case "slow-fade": {
      // Fade to black at midpoint
      const alpha = 1 - p;
      ctx.fillStyle = `rgba(0,0,0,${alpha * 0.85})`;
      ctx.fillRect(0, 0, canvasW, canvasH);
      break;
    }
    case "light-leak": {
      // Warm white flash
      const alpha = Math.sin((1 - p) * Math.PI) * 0.75;
      const grad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
      grad.addColorStop(0, `rgba(255, 240, 200, ${alpha})`);
      grad.addColorStop(1, `rgba(255, 200, 150, ${alpha * 0.5})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasW, canvasH);
      break;
    }
    case "film-burn": {
      // Orange/amber burn
      const alpha = Math.sin((1 - p) * Math.PI) * 0.6;
      ctx.fillStyle = `rgba(180, 80, 10, ${alpha})`;
      ctx.fillRect(0, 0, canvasW, canvasH);
      break;
    }
    case "soft-cut": {
      // Instant cut, no overlay
      break;
    }
    case "zoom-blur": {
      // Slight white flash
      const alpha = Math.sin((1 - p) * Math.PI) * 0.4;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(0, 0, canvasW, canvasH);
      break;
    }
  }
}

// ── Text overlay ──────────────────────────────────────────────────────────────

export function drawTextOverlay(ctx: CanvasRenderingContext2D, config: TextOverlayConfig, currentTime: number, canvasW: number, canvasH: number) {
  const elapsed = currentTime - config.startTime;
  if (elapsed < 0 || elapsed > config.duration) return;

  const progress = clamp(elapsed / config.duration, 0, 1);
  const font = FONT_MAP[config.fontFamily];
  const fontSize = 72;
  const lineHeight = 90;
  const maxWidth = canvasW - 120;
  const color = config.color ?? "#f0eeff";

  ctx.save();
  ctx.font = `${fontSize}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(0,0,0,0.9)";
  ctx.shadowBlur = 24;

  // Word wrap
  const words = config.text.split(" ");
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

  const totalH = lines.length * lineHeight;
  const baseY = canvasH - 220 - totalH;

  switch (config.style) {
    case "typewriter": {
      // Reveal chars progressively in first 40% of duration
      const revealProgress = clamp(progress * 2.5, 0, 1);
      const totalChars = config.text.length;
      const charsToShow = Math.floor(totalChars * revealProgress);
      let remaining = charsToShow;

      lines.forEach((line, i) => {
        const show = line.slice(0, remaining);
        remaining = Math.max(0, remaining - line.length);
        if (show) ctx.fillText(show, 60, baseY + i * lineHeight);
      });
      break;
    }
    case "fade-in": {
      ctx.globalAlpha = clamp(progress * 3, 0, 1);
      lines.forEach((line, i) => ctx.fillText(line, 60, baseY + i * lineHeight));
      ctx.globalAlpha = 1;
      break;
    }
    case "slide-up": {
      const slideProgress = clamp(progress * 2, 0, 1);
      const offsetY = (1 - slideProgress) * 60;
      ctx.globalAlpha = clamp(progress * 3, 0, 1);
      lines.forEach((line, i) => ctx.fillText(line, 60, baseY + i * lineHeight - offsetY));
      ctx.globalAlpha = 1;
      break;
    }
    case "glitch": {
      // Base text
      ctx.globalAlpha = 1;
      lines.forEach((line, i) => ctx.fillText(line, 60, baseY + i * lineHeight));
      // Glitch offset (random, subtle)
      if (Math.random() > 0.85) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#f472b6";
        lines.forEach((line, i) => ctx.fillText(line, 60 + (Math.random() * 6 - 3), baseY + i * lineHeight));
        ctx.fillStyle = color;
        ctx.globalAlpha = 1;
      }
      break;
    }
  }

  ctx.restore();
}

// ── Bottom gradient (shadow for text readability) ─────────────────────────────

export function drawBottomGradient(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number, shadowColor: string) {
  const grad = ctx.createLinearGradient(0, canvasH * 0.55, 0, canvasH);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, `${shadowColor}dd`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasW, canvasH);
}

// ── Vignette ──────────────────────────────────────────────────────────────────

export function drawVignette(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number) {
  const vignette = ctx.createRadialGradient(canvasW / 2, canvasH / 2, canvasW * 0.25, canvasW / 2, canvasH / 2, canvasW * 0.85);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvasW, canvasH);
}

// ── Render single frame ───────────────────────────────────────────────────────

export function renderFrame(ctx: CanvasRenderingContext2D, currentTime: number, config: CompositorConfig) {
  const { clips, colorGrade, textOverlay, transition, colorTone, animationSpeed } = config;
  const W = config.width;
  const H = config.height;

  // Clear
  ctx.clearRect(0, 0, W, H);

  // Fallback background
  ctx.fillStyle = colorTone.shadows;
  ctx.fillRect(0, 0, W, H);

  // Find active clip
  const activeClip = clips.find((c) => currentTime >= c.startTime && currentTime < c.endTime) ?? clips[clips.length - 1];

  if (!activeClip) return;

  const clipDuration = activeClip.endTime - activeClip.startTime;
  const clipProgress = clamp((currentTime - activeClip.startTime) / clipDuration, 0, 1);

  // Ken Burns
  const { scale, x, y } = getKenBurnsTransform(clipProgress, activeClip.kenBurns, animationSpeed);

  // Apply color grade + draw media
  ctx.save();
  ctx.filter = buildFilterString(colorGrade);
  drawMediaCover(ctx, activeClip.element, W, H, scale, x, y);
  ctx.filter = "none";
  ctx.restore();

  // Bottom gradient
  drawBottomGradient(ctx, W, H, colorTone.shadows);

  // Transition overlay
  applyTransition(ctx, transition, currentTime, clips, W, H);

  // Vignette
  drawVignette(ctx, W, H);

  // Text overlay
  if (textOverlay) {
    drawTextOverlay(ctx, textOverlay, currentTime, W, H);
  }
}

// ── Load helpers ──────────────────────────────────────────────────────────────

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

export function loadVideo(url: string, seekTo: number = 0): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      video.currentTime = seekTo;
    };
    video.onseeked = () => resolve(video);
    video.onerror = () => reject(new Error(`Failed to load video: ${url}`));
    video.src = url;
  });
}

// ── Prepare clips from uploaded files ────────────────────────────────────────

export interface RawClip {
  url: string;
  type: "image" | "video";
  startTime: number; // trong timeline output
  endTime: number;
  videoSeekTo?: number; // với video: seek đến giây nào
  kenBurns: KenBurnsPreset;
}

export async function prepareClips(rawClips: RawClip[]): Promise<PreparedClip[]> {
  return Promise.all(
    rawClips.map(async (raw) => {
      const element = raw.type === "image" ? await loadImage(raw.url) : await loadVideo(raw.url, raw.videoSeekTo ?? 0);

      return {
        element,
        startTime: raw.startTime,
        endTime: raw.endTime,
        kenBurns: raw.kenBurns,
      };
    }),
  );
}

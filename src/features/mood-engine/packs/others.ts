import type { MoodPack } from "../types";

export const chill: MoodPack = {
  id: "chill",
  name: "Chill",
  emoji: "☁️",
  accentColor: "#4a7a5a",

  colorGrades: [
    { id: "muted-green", brightness: 1.0, contrast: 0.95, saturation: 0.75, hueRotate: 5, temperature: "neutral" },
    { id: "warm-beige", brightness: 1.05, contrast: 0.9, saturation: 0.8, hueRotate: -3, temperature: "warm" },
    { id: "cool-gray", brightness: 0.95, contrast: 1.0, saturation: 0.6, hueRotate: 0, temperature: "cool" },
  ],
  transitions: ["slow-fade", "soft-cut"],
  textStyles: ["fade-in", "slide-up"],
  fontFamilies: ["serif-thin", "sans"],
  kenBurnsOptions: [
    { id: "slow-up", startScale: 1.0, endScale: 1.05, startX: 0, endX: 0, startY: 0, endY: -10 },
    { id: "slow-out", startScale: 1.03, endScale: 1.0, startX: 0, endX: 0, startY: 0, endY: 0 },
  ],
  animationSpeeds: [1.0, 1.2],
  musicPool: [
    { id: "ch-01", filename: "chill-acoustic-01.mp3", name: "Sunday Afternoon", bpm: 72, duration: 180, mood: ["chill"], beatMarkers: [12, 24, 36] },
    { id: "ch-02", filename: "chill-lofi-02.mp3", name: "Soft Rain", bpm: 68, duration: 200, mood: ["chill"], beatMarkers: [16, 32] },
  ],
  colorTone: { shadows: "#1a2010", highlights: "#f0ece0", midtones: "#4a5a3a" },
  captionPromptHint: "Peaceful, soft, gentle, simple observations, quiet moments, lowercase",
};

export const sad: MoodPack = {
  id: "sad",
  name: "Sad",
  emoji: "💔",
  accentColor: "#8a4a6a",

  colorGrades: [
    { id: "desaturated", brightness: 0.85, contrast: 1.05, saturation: 0.4, hueRotate: 0, temperature: "cool" },
    { id: "blue-tint", brightness: 0.8, contrast: 1.1, saturation: 0.5, hueRotate: 20, temperature: "cool" },
    { id: "faded", brightness: 0.9, contrast: 0.9, saturation: 0.35, hueRotate: 0, temperature: "neutral" },
  ],
  transitions: ["slow-fade", "soft-cut"],
  textStyles: ["fade-in", "typewriter"],
  fontFamilies: ["serif-thin"],
  kenBurnsOptions: [{ id: "very-slow", startScale: 1.0, endScale: 1.04, startX: 0, endX: 0, startY: 0, endY: 5 }],
  animationSpeeds: [0.7, 0.8],
  musicPool: [
    { id: "sd-01", filename: "sad-piano-01.mp3", name: "Empty Room", bpm: 60, duration: 200, mood: ["sad"], beatMarkers: [16, 32, 48] },
    { id: "sd-02", filename: "sad-ambient-02.mp3", name: "Rainy Window", bpm: 55, duration: 220, mood: ["sad"], beatMarkers: [20, 40] },
  ],
  colorTone: { shadows: "#0f0f1a", highlights: "#d0d0e0", midtones: "#2a2a4a" },
  captionPromptHint: "Melancholic, nostalgic, heartfelt, honest, short sentences, lowercase",
};

export const coding: MoodPack = {
  id: "coding",
  name: "Coding",
  emoji: "💻",
  accentColor: "#4a6a8a",

  colorGrades: [
    { id: "terminal-green", brightness: 0.8, contrast: 1.3, saturation: 0.6, hueRotate: 140, temperature: "cool" },
    { id: "dark-blue", brightness: 0.75, contrast: 1.25, saturation: 0.5, hueRotate: 200, temperature: "cool" },
    { id: "synthwave", brightness: 0.85, contrast: 1.2, saturation: 1.1, hueRotate: 280, temperature: "cool" },
  ],
  transitions: ["glitch", "soft-cut", "zoom-blur"] as never,
  textStyles: ["glitch", "typewriter"],
  fontFamilies: ["mono"],
  kenBurnsOptions: [
    { id: "static", startScale: 1.0, endScale: 1.0, startX: 0, endX: 0, startY: 0, endY: 0 },
    { id: "slight-zoom", startScale: 1.0, endScale: 1.03, startX: 0, endX: 0, startY: 0, endY: 0 },
  ],
  animationSpeeds: [1.0, 1.1],
  musicPool: [
    { id: "cd-01", filename: "coding-synthwave-01.mp3", name: "Binary Rain", bpm: 110, duration: 180, mood: ["coding"], beatMarkers: [8, 16, 24, 32] },
    { id: "cd-02", filename: "coding-lofi-02.mp3", name: "Late Night Debug", bpm: 90, duration: 200, mood: ["coding"], beatMarkers: [10, 20, 30] },
  ],
  colorTone: { shadows: "#050d0a", highlights: "#a0ffa0", midtones: "#0a2a1a" },
  captionPromptHint: "Technical, focused, minimal, dry humor, code references, lowercase",
};

export const cinematic: MoodPack = {
  id: "cinematic",
  name: "Cinematic",
  emoji: "🎬",
  accentColor: "#8a6a3a",

  colorGrades: [
    { id: "teal-orange", brightness: 0.9, contrast: 1.2, saturation: 1.1, hueRotate: 0, temperature: "warm" },
    { id: "bleach-bypass", brightness: 0.85, contrast: 1.35, saturation: 0.7, hueRotate: 0, temperature: "neutral" },
    { id: "golden-hour", brightness: 1.05, contrast: 1.15, saturation: 1.2, hueRotate: -10, temperature: "warm" },
  ],
  transitions: ["slow-fade", "film-burn", "light-leak"],
  textStyles: ["fade-in", "slide-up"],
  fontFamilies: ["serif-thin", "sans"],
  kenBurnsOptions: [
    { id: "epic-zoom", startScale: 1.0, endScale: 1.12, startX: 0, endX: 0, startY: 0, endY: 0 },
    { id: "wide-pan", startScale: 1.1, endScale: 1.0, startX: -30, endX: 30, startY: 0, endY: 0 },
    { id: "pull-back", startScale: 1.15, endScale: 1.0, startX: 0, endX: 0, startY: 0, endY: 0 },
  ],
  animationSpeeds: [0.8, 0.9, 1.0],
  musicPool: [
    { id: "cm-01", filename: "cinematic-epic-01.mp3", name: "Golden Horizon", bpm: 70, duration: 200, mood: ["cinematic"], beatMarkers: [15, 30, 45] },
    { id: "cm-02", filename: "cinematic-ambient-02.mp3", name: "Wide Open", bpm: 65, duration: 220, mood: ["cinematic"], beatMarkers: [20, 40] },
  ],
  colorTone: { shadows: "#1a0f05", highlights: "#ffe8c0", midtones: "#6a3a10" },
  captionPromptHint: "Epic, dramatic, poetic, grand scale, evocative imagery, proper case",
};

export const neon: MoodPack = {
  id: "neon",
  name: "Neon",
  emoji: "🌆",
  accentColor: "#7a4a9a",

  colorGrades: [
    { id: "cyberpunk", brightness: 0.9, contrast: 1.3, saturation: 1.5, hueRotate: 280, temperature: "cool" },
    { id: "pink-city", brightness: 0.85, contrast: 1.25, saturation: 1.4, hueRotate: 320, temperature: "cool" },
    { id: "blue-electric", brightness: 0.8, contrast: 1.3, saturation: 1.3, hueRotate: 200, temperature: "cool" },
  ],
  transitions: ["light-leak", "zoom-blur", "film-burn"],
  textStyles: ["glitch", "typewriter", "fade-in"],
  fontFamilies: ["mono", "sans"],
  kenBurnsOptions: [
    { id: "zoom-fast", startScale: 1.0, endScale: 1.1, startX: 0, endX: 0, startY: 0, endY: 0 },
    { id: "strafe", startScale: 1.05, endScale: 1.05, startX: -20, endX: 20, startY: 0, endY: 0 },
  ],
  animationSpeeds: [1.0, 1.2, 1.3],
  musicPool: [
    { id: "ne-01", filename: "neon-synthwave-01.mp3", name: "Neon Pulse", bpm: 128, duration: 180, mood: ["neon"], beatMarkers: [4, 8, 12, 16] },
    { id: "ne-02", filename: "neon-electronic-02.mp3", name: "City Grid", bpm: 120, duration: 200, mood: ["neon"], beatMarkers: [5, 10, 15, 20] },
  ],
  colorTone: { shadows: "#0a0015", highlights: "#ff80ff", midtones: "#2a0050" },
  captionPromptHint: "Urban, electric, edgy, short punchy phrases, cyberpunk aesthetics, lowercase",
};

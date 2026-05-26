import type { MoodPack } from "../types";

export const coding: MoodPack = {
  id: "coding",
  name: "Coding",
  emoji: "💻",
  accentColor: "#4a6a8a",

  colorGrades: [
    { id: "dark-cyan", brightness: 0.8, contrast: 1.2, saturation: 0.6, hueRotate: 15, temperature: "cool" },
    { id: "synthwave", brightness: 0.85, contrast: 1.15, saturation: 0.8, hueRotate: -10, temperature: "cool" },
    { id: "matrix-dark", brightness: 0.75, contrast: 1.3, saturation: 0.5, hueRotate: 20, temperature: "cool" },
  ],
  transitions: ["soft-cut", "zoom-blur"],
  textStyles: ["typewriter", "glitch"],
  fontFamilies: ["mono"],
  kenBurnsOptions: [
    { id: "zoom-in-slow", startScale: 1.0, endScale: 1.06, startX: 0, endX: 0, startY: 0, endY: 0 },
    { id: "pan-right", startScale: 1.04, endScale: 1.04, startX: 0, endX: -15, startY: 0, endY: 0 },
  ],
  animationSpeeds: [0.9, 1.0],
  musicTags: ["lofi", "focus", "coding", "ambient"],
  colorTone: { shadows: "#050a10", highlights: "#d0f0e8", midtones: "#0a2030" },
  captionPromptHint: "Focused, minimal, technical aesthetic, lowercase, short",
};

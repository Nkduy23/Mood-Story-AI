import type { MoodPack } from "../types";

export const sad: MoodPack = {
  id: "sad",
  name: "Sad",
  emoji: "💔",
  accentColor: "#8a4a6a",

  colorGrades: [
    { id: "desaturated", brightness: 0.85, contrast: 1.1, saturation: 0.45, hueRotate: 0, temperature: "cool" },
    { id: "blue-tint", brightness: 0.8, contrast: 1.05, saturation: 0.5, hueRotate: 20, temperature: "cool" },
    { id: "faded-purple", brightness: 0.9, contrast: 1.0, saturation: 0.55, hueRotate: 10, temperature: "cool" },
  ],
  transitions: ["slow-fade", "film-burn"],
  textStyles: ["fade-in", "typewriter"],
  fontFamilies: ["serif-thin", "mono"],
  kenBurnsOptions: [
    { id: "drift-left", startScale: 1.05, endScale: 1.0, startX: 10, endX: -10, startY: 0, endY: 0 },
    { id: "sink-slow", startScale: 1.0, endScale: 1.04, startX: 0, endX: 0, startY: 0, endY: 15 },
  ],
  animationSpeeds: [0.7, 0.9],
  musicTags: ["piano", "sad", "nostalgic", "ambient"],
  colorTone: { shadows: "#0d0a14", highlights: "#e8e0f0", midtones: "#2a1a3a" },
  captionPromptHint: "Nostalgic, emotional, raw, honest, lowercase, short phrases",
};

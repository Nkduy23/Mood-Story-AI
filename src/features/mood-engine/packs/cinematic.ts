import type { MoodPack } from "../types";

export const cinematic: MoodPack = {
  id: "cinematic",
  name: "Cinematic",
  emoji: "🎬",
  accentColor: "#8a6a3a",

  colorGrades: [
    { id: "teal-orange", brightness: 0.95, contrast: 1.25, saturation: 1.1, hueRotate: 5, temperature: "warm" },
    { id: "warm-dramatic", brightness: 0.9, contrast: 1.3, saturation: 1.0, hueRotate: -5, temperature: "warm" },
    { id: "cold-epic", brightness: 0.85, contrast: 1.2, saturation: 0.9, hueRotate: 15, temperature: "cool" },
  ],
  transitions: ["slow-fade", "light-leak"],
  textStyles: ["fade-in", "slide-up"],
  fontFamilies: ["serif-thin", "sans"],
  kenBurnsOptions: [
    { id: "epic-zoom", startScale: 1.0, endScale: 1.1, startX: 0, endX: 0, startY: 0, endY: -20 },
    { id: "wide-pan", startScale: 1.08, endScale: 1.08, startX: 20, endX: -20, startY: 0, endY: 0 },
  ],
  animationSpeeds: [0.8, 1.0],
  musicPool: [{ id: "ci-01", filename: "cinematic-01.mp3", name: "Epic Rise", bpm: 90, duration: 180, mood: ["cinematic"], beatMarkers: [8, 16, 32] }],
  colorTone: { shadows: "#0a0800", highlights: "#fff5e0", midtones: "#3a2800" },
  captionPromptHint: "Epic, dramatic, powerful, cinematic, uppercase or title case",
};

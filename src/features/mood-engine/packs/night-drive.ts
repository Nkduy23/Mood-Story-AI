import type { MoodPack } from "../types";

export const nightDrive: MoodPack = {
  id: "night-drive",
  name: "Night Drive",
  emoji: "🌙",
  accentColor: "#4a6fa5",

  colorGrades: [
    { id: "deep-blue", brightness: 0.85, contrast: 1.15, saturation: 0.7, hueRotate: 10, temperature: "cool" },
    { id: "cyan-shadow", brightness: 0.8, contrast: 1.2, saturation: 0.65, hueRotate: 15, temperature: "cool" },
    { id: "warm-night", brightness: 0.9, contrast: 1.1, saturation: 0.8, hueRotate: -5, temperature: "warm" },
  ],
  transitions: ["light-leak", "slow-fade", "film-burn"],
  textStyles: ["typewriter", "fade-in", "glitch"],
  fontFamilies: ["mono", "serif-thin"],
  kenBurnsOptions: [
    { id: "zoom-right", startScale: 1.0, endScale: 1.08, startX: 0, endX: -20, startY: 0, endY: 0 },
    { id: "zoom-out", startScale: 1.05, endScale: 1.0, startX: 0, endX: 0, startY: 0, endY: 10 },
  ],
  animationSpeeds: [0.8, 1.0],
  musicTags: ["night-drive", "electronic", "ambient", "late-night"],
  colorTone: { shadows: "#0a1628", highlights: "#f5e6d0", midtones: "#1a3a5c" },
  captionPromptHint: "Melancholic, late night, introspective, poetic, lowercase, no punctuation",
};

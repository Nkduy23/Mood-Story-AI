import type { MoodPack } from "../types";

export const neon: MoodPack = {
  id: "neon",
  name: "Neon",
  emoji: "🌆",
  accentColor: "#7a4a9a",

  colorGrades: [
    { id: "cyberpunk", brightness: 0.9, contrast: 1.3, saturation: 1.4, hueRotate: -15, temperature: "cool" },
    { id: "pink-purple", brightness: 0.95, contrast: 1.2, saturation: 1.3, hueRotate: 20, temperature: "cool" },
    { id: "acid-green", brightness: 0.85, contrast: 1.25, saturation: 1.2, hueRotate: 30, temperature: "cool" },
  ],
  transitions: ["light-leak", "zoom-blur"],
  textStyles: ["glitch", "typewriter"],
  fontFamilies: ["mono", "sans"],
  kenBurnsOptions: [
    { id: "pulse-zoom", startScale: 1.0, endScale: 1.08, startX: -15, endX: 0, startY: 0, endY: 0 },
    { id: "city-drift", startScale: 1.06, endScale: 1.06, startX: -15, endX: 15, startY: 0, endY: 0 },
  ],
  animationSpeeds: [1.0, 1.2],
  musicPool: [{ id: "ne-01", filename: "neon-01.mp3", name: "Neon City", bpm: 100, duration: 180, mood: ["neon"], beatMarkers: [6, 12, 18] }],
  colorTone: { shadows: "#05000f", highlights: "#f0d0ff", midtones: "#1a0030" },
  captionPromptHint: "Cyberpunk, vibrant, city life, edgy, lowercase, punchy",
};

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
  musicTags: ["chill", "lofi", "cafe", "bossa", "focus"],
  colorTone: { shadows: "#1a2010", highlights: "#f0ece0", midtones: "#4a5a3a" },
  captionPromptHint: "Peaceful, soft, gentle, simple observations, quiet moments, lowercase",
};

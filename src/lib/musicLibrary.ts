// lib/musicLibrary.ts
// Source of truth cho tất cả music tracks.
// Hiện tại: hardcode URL Cloudinary.
// V3: thay bằng API call từ database.

export type MusicGenre = "ambient" | "lofi" | "cinematic" | "electronic" | "piano" | "bossa";
export type EnergyLevel = "low" | "mid" | "high";

export interface MusicTrack {
  id: string;
  url: string; // Cloudinary URL — thay filename local
  name: string;
  genre: MusicGenre;
  bpm: number;
  duration: number; // giây
  energy: EnergyLevel;
  tags: string[]; // dùng để filter theo mood pack
  beatMarkers: number[]; // giây — dùng cho beat sync transition
}

// ── Đổi YOUR_CLOUD_NAME thành cloud name Cloudinary của bạn ─────────────────
const CDN = `https://res.cloudinary.com/dtkmj95es/video/upload`;

export const MUSIC_LIBRARY: MusicTrack[] = [
  // ── Lo-fi ────────────────────────────────────────────────────────────────
  {
    id: "lof-001",
    url: `${CDN}/lof-001_b25x61.mp3`,
    name: "Rainy Afternoon",
    genre: "lofi",
    bpm: 75,
    duration: 180,
    energy: "low",
    tags: ["chill", "lofi", "cafe", "focus", "coding"],
    beatMarkers: [12, 24, 36],
  },
  {
    id: "lof-002",
    url: `${CDN}/lof-002_dfwufa.mp3`,
    name: "Coffee Shop",
    genre: "lofi",
    bpm: 70,
    duration: 180,
    energy: "low",
    tags: ["chill", "lofi", "cafe", "bossa"],
    beatMarkers: [10, 20, 30],
  },

  // ── Ambient ───────────────────────────────────────────────────────────────
  {
    id: "amb-001",
    url: `${CDN}/ambient/amb-001.mp3`,
    name: "Midnight Air",
    genre: "ambient",
    bpm: 60,
    duration: 180,
    energy: "low",
    tags: ["ambient", "night-drive", "sad", "nostalgic", "late-night"],
    beatMarkers: [15, 30, 45],
  },
  {
    id: "amb-002",
    url: `${CDN}/ambient/amb-002.mp3`,
    name: "Open Space",
    genre: "ambient",
    bpm: 65,
    duration: 180,
    energy: "low",
    tags: ["ambient", "cinematic", "focus", "product"],
    beatMarkers: [20, 40, 60],
  },

  // ── Cinematic ─────────────────────────────────────────────────────────────
  {
    id: "cin-001",
    url: `${CDN}/cinematic/cin-001.mp3`,
    name: "Epic Rise",
    genre: "cinematic",
    bpm: 90,
    duration: 180,
    energy: "high",
    tags: ["cinematic", "dramatic", "product"],
    beatMarkers: [8, 16, 32],
  },
  {
    id: "cin-002",
    url: `${CDN}/cinematic/cin-002.mp3`,
    name: "Quiet Journey",
    genre: "cinematic",
    bpm: 72,
    duration: 180,
    energy: "mid",
    tags: ["cinematic", "ambient", "nostalgic"],
    beatMarkers: [12, 24, 48],
  },

  // ── Electronic ────────────────────────────────────────────────────────────
  {
    id: "ele-001",
    url: `${CDN}/electronic/ele-001.mp3`,
    name: "Neon City",
    genre: "electronic",
    bpm: 100,
    duration: 180,
    energy: "high",
    tags: ["electronic", "night-drive", "late-night"],
    beatMarkers: [6, 12, 18],
  },
  {
    id: "ele-002",
    url: `${CDN}/electronic/ele-002.mp3`,
    name: "Synthwave Drive",
    genre: "electronic",
    bpm: 95,
    duration: 180,
    energy: "mid",
    tags: ["electronic", "night-drive", "coding"],
    beatMarkers: [8, 16, 24],
  },

  // ── Piano ─────────────────────────────────────────────────────────────────
  {
    id: "pia-001",
    url: `${CDN}/piano/pia-001.mp3`,
    name: "Rainy Days",
    genre: "piano",
    bpm: 65,
    duration: 180,
    energy: "low",
    tags: ["piano", "sad", "nostalgic", "ambient"],
    beatMarkers: [10, 20, 30],
  },
  {
    id: "pia-002",
    url: `${CDN}/piano/pia-002.mp3`,
    name: "Memory",
    genre: "piano",
    bpm: 60,
    duration: 180,
    energy: "low",
    tags: ["piano", "sad", "cinematic"],
    beatMarkers: [12, 24, 36],
  },

  // ── Bossa ─────────────────────────────────────────────────────────────────
  {
    id: "bos-001",
    url: `${CDN}/bossa/bos-001.mp3`,
    name: "Afternoon Cafe",
    genre: "bossa",
    bpm: 80,
    duration: 180,
    energy: "mid",
    tags: ["bossa", "cafe", "chill", "product"],
    beatMarkers: [8, 16, 24],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getTracksByTags(tags: string[]): MusicTrack[] {
  return MUSIC_LIBRARY.filter((t) => tags.some((tag) => t.tags.includes(tag)));
}

export function getTrackById(id: string): MusicTrack | undefined {
  return MUSIC_LIBRARY.find((t) => t.id === id);
}

// Fallback: trả về track đầu tiên của library nếu không match tag nào
export function getDefaultTrack(): MusicTrack {
  return MUSIC_LIBRARY[0];
}

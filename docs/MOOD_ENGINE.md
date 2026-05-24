# MOOD_ENGINE — Mood Pack System & Randomization

> Đọc file này khi làm việc với mood pack, parameter space, hoặc shuffle logic.

---

## Triết lý thiết kế

Mood **không phải template cứng**. Mood là một **không gian tham số** với nhiều biến.
Mỗi lần generate = 1 seed ngẫu nhiên từ không gian đó.

Kết quả: 10 người chọn "Chill" → 10 video khác nhau về màu sắc, font, transition,
nhưng vẫn cùng "cảm giác" Chill.

User bấm "Shuffle" → seed mới → video khác → không bao giờ nhàm.

---

## Story Type

User chọn Story Type TRƯỚC khi chọn Mood Pack.
Story Type quyết định logic xử lý ảnh/video.

```typescript
type StoryType = "moment" | "journey" | "vibe";

const STORY_TYPES = {
  moment: {
    id: "moment",
    name: "Moment",
    description: "1 khoảnh khắc, text lớn, cảm xúc mạnh",
    emoji: "✨",
    maxFiles: 2,
    durationOptions: [10, 15] as const,
    textSize: "large",
    narrativeMode: "single",
  },
  journey: {
    id: "journey",
    name: "Journey",
    description: "3–5 ảnh, có đầu có cuối, kể câu chuyện",
    emoji: "🗺️",
    maxFiles: 5,
    durationOptions: [15, 20, 25] as const,
    textSize: "medium",
    narrativeMode: "sequential",
  },
  vibe: {
    id: "vibe",
    name: "Vibe",
    description: "Loop ngắn, không cần story, chỉ cần đẹp",
    emoji: "🌊",
    maxFiles: 3,
    durationOptions: [10, 15] as const,
    textSize: "small",
    narrativeMode: "loop",
  },
};
```

---

## Mood Pack Type Definition

```typescript
// features/mood-engine/types.ts

interface MoodPack {
  id: string;
  name: string;
  emoji: string;
  description: string;

  // Không gian tham số — mỗi array là các lựa chọn có thể random
  colorGrades: ColorGradePreset[];
  transitions: TransitionType[];
  textStyles: TextStyle[];
  fontFamilies: FontFamily[];
  kenBurnsOptions: KenBurnsPreset[];
  animationSpeeds: number[];
  musicPool: MusicTrack[];

  // Tone màu cố định của mood (không random)
  colorTone: {
    shadows: string; // hex
    highlights: string;
    midtones: string;
  };

  // AI prompt hint để generate caption phù hợp
  captionPromptHint: string;
}

interface ColorGradePreset {
  id: string;
  brightness: number; // 0.8 – 1.2
  contrast: number; // 0.9 – 1.3
  saturation: number; // 0.5 – 1.5
  hueRotate: number; // degrees
  temperature: "warm" | "cool" | "neutral";
}

interface MusicTrack {
  id: string;
  filename: string; // file trong /public/music/
  name: string; // tên hiển thị cho user
  bpm: number;
  duration: number; // giây
  mood: string[]; // ['chill', 'night-drive']
  beatMarkers: number[]; // timestamps của beat drop, dùng để sync transition
}
```

---

## Mood Pack Definitions

### Night Drive

```typescript
// features/mood-engine/packs/night-drive.ts
export const nightDrive: MoodPack = {
  id: "night-drive",
  name: "Night Drive",
  emoji: "🌙",
  description: "Đêm muộn, ánh đèn đường, lo-fi beats",

  colorGrades: [
    { id: "deep-blue", brightness: 0.85, contrast: 1.15, saturation: 0.7, hueRotate: 10, temperature: "cool" },
    { id: "cyan-shadow", brightness: 0.8, contrast: 1.2, saturation: 0.65, hueRotate: 15, temperature: "cool" },
    { id: "warm-night", brightness: 0.9, contrast: 1.1, saturation: 0.8, hueRotate: -5, temperature: "warm" },
  ],
  transitions: ["light-leak", "slow-fade", "film-burn"],
  textStyles: ["typewriter", "fade-in", "glitch"],
  fontFamilies: ["mono", "serif-thin"],
  kenBurnsOptions: [
    { startScale: 1.0, endScale: 1.08, startX: 0, endX: -20, startY: 0, endY: 0, id: "zoom-right" },
    { startScale: 1.05, endScale: 1.0, startX: 0, endX: 0, startY: 0, endY: 10, id: "zoom-out" },
  ],
  animationSpeeds: [0.8, 1.0],
  musicPool: [
    { id: "nd-01", filename: "night-drive-lofi-01.mp3", name: "Midnight Drive", bpm: 85, duration: 180, mood: ["night-drive"], beatMarkers: [8, 16, 24] },
    { id: "nd-02", filename: "night-drive-lofi-02.mp3", name: "3AM City", bpm: 78, duration: 200, mood: ["night-drive"], beatMarkers: [10, 20, 30] },
  ],
  colorTone: { shadows: "#0a1628", highlights: "#f5e6d0", midtones: "#1a3a5c" },
  captionPromptHint: "Melancholic, late night, introspective, poetic, lowercase",
};
```

### Chill

```typescript
export const chill: MoodPack = {
  id: "chill",
  name: "Chill",
  emoji: "☁️",
  description: "Thư giãn, nhẹ nhàng, không lo nghĩ",

  colorGrades: [
    { id: "muted-green", brightness: 1.0, contrast: 0.95, saturation: 0.75, hueRotate: 5, temperature: "neutral" },
    { id: "warm-beige", brightness: 1.05, contrast: 0.9, saturation: 0.8, hueRotate: -3, temperature: "warm" },
    { id: "cool-gray", brightness: 0.95, contrast: 1.0, saturation: 0.6, hueRotate: 0, temperature: "cool" },
  ],
  transitions: ["slow-fade", "soft-cut"],
  textStyles: ["fade-in", "slide-up"],
  fontFamilies: ["serif-thin", "sans"],
  kenBurnsOptions: [
    { startScale: 1.0, endScale: 1.05, startX: 0, endX: 0, startY: 0, endY: -10, id: "slow-up" },
    { startScale: 1.03, endScale: 1.0, startX: 0, endX: 0, startY: 0, endY: 0, id: "slow-out" },
  ],
  animationSpeeds: [1.0, 1.2],
  musicPool: [{ id: "ch-01", filename: "chill-acoustic-01.mp3", name: "Sunday Afternoon", bpm: 72, duration: 180, mood: ["chill"], beatMarkers: [12, 24, 36] }],
  colorTone: { shadows: "#1a2010", highlights: "#f0ece0", midtones: "#4a5a3a" },
  captionPromptHint: "Peaceful, soft, gentle, simple observations, quiet moments",
};
```

_(Các pack Sad, Coding, Cinematic, Neon tương tự — cùng pattern)_

---

## Randomization Logic

```typescript
// features/mood-engine/randomizer.ts

export interface MoodSeed {
  colorGradeIndex: number;
  transitionIndex: number;
  textStyleIndex: number;
  fontFamilyIndex: number;
  kenBurnsIndex: number;
  animationSpeedIndex: number;
  musicIndex: number;
  timestamp: number; // để reproduce nếu cần
}

export function generateSeed(pack: MoodPack): MoodSeed {
  const rand = (max: number) => Math.floor(Math.random() * max);
  return {
    colorGradeIndex: rand(pack.colorGrades.length),
    transitionIndex: rand(pack.transitions.length),
    textStyleIndex: rand(pack.textStyles.length),
    fontFamilyIndex: rand(pack.fontFamilies.length),
    kenBurnsIndex: rand(pack.kenBurnsOptions.length),
    animationSpeedIndex: rand(pack.animationSpeeds.length),
    musicIndex: rand(pack.musicPool.length),
    timestamp: Date.now(),
  };
}

export function resolveSeed(pack: MoodPack, seed: MoodSeed): ResolvedPackParams {
  return {
    colorGrade: pack.colorGrades[seed.colorGradeIndex],
    transition: pack.transitions[seed.transitionIndex],
    textStyle: pack.textStyles[seed.textStyleIndex],
    fontFamily: pack.fontFamilies[seed.fontFamilyIndex],
    kenBurns: pack.kenBurnsOptions[seed.kenBurnsIndex],
    animationSpeed: pack.animationSpeeds[seed.animationSpeedIndex],
    musicTrack: pack.musicPool[seed.musicIndex],
    colorTone: pack.colorTone,
  };
}
```

---

## Beat Sync Logic

```typescript
// Chuyển cảnh luôn rơi vào beat marker của nhạc
// không phải chia đều duration

function calculateTransitionPoints(music: MusicTrack, clips: PreparedClip[], totalDuration: number): number[] {
  // Lấy beat markers trong khoảng totalDuration
  const validBeats = music.beatMarkers.filter((t) => t < totalDuration);

  // Số transitions cần = số clips - 1
  const transitionsNeeded = clips.length - 1;

  // Chọn beats phân bố đều nhất
  return selectDistributedBeats(validBeats, transitionsNeeded);
}
```

---

## Danh sách Mood Pack V1

| ID            | Name        | Emoji | Vibe                         |
| ------------- | ----------- | ----- | ---------------------------- |
| `night-drive` | Night Drive | 🌙    | Đêm muộn, lo-fi, melancholic |
| `chill`       | Chill       | ☁️    | Thư giãn, nhẹ nhàng          |
| `sad`         | Sad         | 💔    | Cảm xúc, nostalgic           |
| `coding`      | Coding      | 💻    | Focus, dark, synthwave       |
| `cinematic`   | Cinematic   | 🎬    | Epic, wide, dramatic         |
| `neon`        | Neon        | 🌆    | Cyberpunk, vibrant, city     |

_(V2 sẽ thêm: Travel, Memories, Gaming, Late Night)_

// features/mood-engine/types.ts

export type StoryType = "moment" | "journey" | "vibe";

export type AllowedDuration = 10 | 15 | 20 | 25;

export type TransitionType = "slow-fade" | "light-leak" | "film-burn" | "soft-cut" | "zoom-blur";

export type TextStyle = "typewriter" | "fade-in" | "glitch" | "slide-up";

export type FontFamily = "mono" | "serif-thin" | "sans";

export interface ColorGradePreset {
  id: string;
  brightness: number; // 0.8 – 1.2
  contrast: number; // 0.9 – 1.3
  saturation: number; // 0.5 – 1.5
  hueRotate: number; // degrees
  temperature: "warm" | "cool" | "neutral";
}

export interface KenBurnsPreset {
  id: string;
  startScale: number;
  endScale: number;
  startX: number;
  endX: number;
  startY: number;
  endY: number;
}

export interface MusicTrack {
  id: string;
  url: string; // Cloudinary URL
  name: string;
  genre: string;
  bpm: number;
  duration: number;
  energy: "low" | "mid" | "high";
  tags: string[]; // thay mood
  beatMarkers: number[];
}
export interface MoodPack {
  id: string;
  name: string; // tên kỹ thuật (không dịch)
  emoji: string;
  accentColor: string; // CSS color cho UI highlight

  colorGrades: ColorGradePreset[];
  transitions: TransitionType[];
  textStyles: TextStyle[];
  fontFamilies: FontFamily[];
  kenBurnsOptions: KenBurnsPreset[];
  animationSpeeds: number[];
  musicTags: string[];

  colorTone: {
    shadows: string;
    highlights: string;
    midtones: string;
  };

  captionPromptHint: string;
}

export interface MoodSeed {
  colorGradeIndex: number;
  transitionIndex: number;
  textStyleIndex: number;
  fontFamilyIndex: number;
  kenBurnsIndex: number;
  animationSpeedIndex: number;
  musicIndex: number;
  timestamp: number;
}

export interface ResolvedPackParams {
  colorGrade: ColorGradePreset;
  transition: TransitionType;
  textStyle: TextStyle;
  fontFamily: FontFamily;
  kenBurns: KenBurnsPreset;
  animationSpeed: number;
  musicTrack: MusicTrack;
  colorTone: MoodPack["colorTone"];
}

export interface StoryTypeConfig {
  id: StoryType;
  emoji: string;
  maxFiles: number;
  durationOptions: AllowedDuration[];
  narrativeMode: "single" | "sequential" | "loop";
}

export const STORY_TYPE_CONFIGS: Record<StoryType, StoryTypeConfig> = {
  moment: {
    id: "moment",
    emoji: "✨",
    maxFiles: 2,
    durationOptions: [10, 15],
    narrativeMode: "single",
  },
  journey: {
    id: "journey",
    emoji: "🗺️",
    maxFiles: 5,
    durationOptions: [15, 20, 25],
    narrativeMode: "sequential",
  },
  vibe: {
    id: "vibe",
    emoji: "🌊",
    maxFiles: 3,
    durationOptions: [10, 15],
    narrativeMode: "loop",
  },
};

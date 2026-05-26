import { nightDrive } from "./packs/night-drive";
import { chill } from "./packs/chill";
import { sad } from "./packs/sad";
import { coding } from "./packs/coding";
import { cinematic } from "./packs/cinematic";
import { neon } from "./packs/neon";
import type { MoodPack, StoryType } from "./types";

export { generateSeed, resolveSeed } from "./randomizer";
export type { MoodPack, MoodSeed, ResolvedPackParams, StoryType, StoryTypeConfig, AllowedDuration } from "./types";
export { STORY_TYPE_CONFIGS } from "./types";

export const MOOD_PACKS: MoodPack[] = [nightDrive, chill, sad, coding, cinematic, neon];

export const MOOD_PACK_MAP: Record<string, MoodPack> = Object.fromEntries(MOOD_PACKS.map((p) => [p.id, p]));

export function getMoodPack(id: string): MoodPack {
  const pack = MOOD_PACK_MAP[id];
  if (!pack) throw new Error(`Mood pack "${id}" not found`);
  return pack;
}

export function getMaxFiles(storyType: StoryType): number {
  const map: Record<StoryType, number> = {
    moment: 2,
    journey: 5,
    vibe: 3,
  };
  return map[storyType];
}

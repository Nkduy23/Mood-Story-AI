// features/mood-engine/randomizer.ts
import { getTracksByTags, getDefaultTrack } from "@/lib/musicLibrary";
import type { MoodPack, MoodSeed, ResolvedPackParams } from "./types";

export function generateSeed(pack: MoodPack): MoodSeed {
  const rand = (max: number) => Math.floor(Math.random() * max);

  // Lấy tracks theo tags của pack, fallback về default nếu không có
  const tracks = getTracksByTags(pack.musicTags);
  const musicPoolLength = tracks.length > 0 ? tracks.length : 1;

  return {
    colorGradeIndex: rand(pack.colorGrades.length),
    transitionIndex: rand(pack.transitions.length),
    textStyleIndex: rand(pack.textStyles.length),
    fontFamilyIndex: rand(pack.fontFamilies.length),
    kenBurnsIndex: rand(pack.kenBurnsOptions.length),
    animationSpeedIndex: rand(pack.animationSpeeds.length),
    musicIndex: rand(musicPoolLength), // ← random trong tracks của library
    timestamp: Date.now(),
  };
}

export function resolveSeed(pack: MoodPack, seed: MoodSeed): ResolvedPackParams {
  const tracks = getTracksByTags(pack.musicTags);
  const musicTrack = tracks.length > 0 ? tracks[seed.musicIndex % tracks.length] : getDefaultTrack();

  return {
    colorGrade: pack.colorGrades[seed.colorGradeIndex],
    transition: pack.transitions[seed.transitionIndex],
    textStyle: pack.textStyles[seed.textStyleIndex],
    fontFamily: pack.fontFamilies[seed.fontFamilyIndex],
    kenBurns: pack.kenBurnsOptions[seed.kenBurnsIndex],
    animationSpeed: pack.animationSpeeds[seed.animationSpeedIndex],
    musicTrack, // ← MusicTrack từ library, có .url thay vì .filename
    colorTone: pack.colorTone,
  };
}

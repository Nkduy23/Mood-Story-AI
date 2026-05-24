// features/mood-engine/randomizer.ts
import type { MoodPack, MoodSeed, ResolvedPackParams } from "./types";

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

/** One scroll-driven model shared by the DOM and the demand-rendered scene. */
export interface StoryMotion {
  progress: number;
  active: boolean;
  invalidate?: () => void;
}

export const STORY_MEDIA =
  "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Smooth endpoints give the story its reading holds, without a second clock. */
export function segment(progress: number, start: number, end: number): number {
  const value = clamp01((progress - start) / (end - start));
  return value * value * (3 - 2 * value);
}

export function storyChapter(progress: number): number {
  if (progress < 0.23) return 0;
  if (progress < 0.49) return 1;
  if (progress < 0.78) return 2;
  return 3;
}

export function roomReveal(progress: number): number {
  return segment(progress, 0.84, 0.94);
}

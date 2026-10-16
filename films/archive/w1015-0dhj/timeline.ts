import {s} from '../../engine/kit/theme';

// 100 BPM 4/4 → beat 0.6 s (18 f), bar 2.4 s (72 f). Every cut is on a bar line; keep in sync with score.py.
export const T = {
	hook: [0, 4.8], // 2 bars
	count: [4.8, 12], // 3 bars
	oxygen: [12, 21.6], // 4 bars
	carbon: [21.6, 28.8], // 3 bars
	rain: [28.8, 36], // 3 bars
	life: [36, 43.2], // 3 bars
	half: [43.2, 52.8], // 4 bars
	end: [52.8, 60], // 3 bars
} as const;

export const BEAT = 18; // frames
export const BAR = 72; // frames

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);

// Scene-local frames shared with the score (score.py mirrors these in seconds).
export const HOOK_VANISH = [30, 126] as const; // trees vanish between these frames
export const CARBON_BLOCK0 = 72; // first of 29 blocks, one per 16th note (4.5 f)
export const CARBON_STEP = 4.5;
export const HALF_VANISH = [54, 162] as const; // 46 of 100 trees go dark between these frames

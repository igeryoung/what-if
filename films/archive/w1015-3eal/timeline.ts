import {s} from '../../engine/kit/theme';

// 120 BPM 4/4 → beat = 0.5 s (15 f), bar = 2 s (60 f). Every cut is on a bar line; keep in sync with score.py.
export const BEAT = 15;
export const BAR = 60;
export const T = {
	hook: [0, 6],
	odds: [6, 14],
	daily: [14, 20],
	wait: [20, 28],
	year: [28, 36],
	lives: [36, 44],
	twist: [44, 52],
	days: [52, 60],
	end: [60, 70], // the ending is its own 10 s scene (docs/BRIEF.md "Ending")
} as const;

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);

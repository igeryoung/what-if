import {s} from '../../engine/kit/theme';

// 120 BPM, bar = 2 s. Every cut is on a bar line; keep in sync with music/w1013-s1h5.py.
export const T = {
	hook: [0, 6],
	speed: [6, 12],
	naive: [12, 22],
	twist: [22, 30],
	limit: [30, 36],
	record: [36, 44],
	sum: [44, 50],
	life: [50, 56],
	end: [56, 62],
} as const;

export const TOTAL = s(62);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);

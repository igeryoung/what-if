import {s} from '../../engine/kit/theme';

// 120 BPM, bar = 2 s. Every cut is on a bar line; keep in sync with music/ants.py.
export const T = {
	hook: [0, 6],
	count: [6, 16],
	person: [16, 24],
	density: [24, 30],
	pivot: [30, 32],
	scale: [32, 46],
	where: [46, 54],
	end: [54, 60],
} as const;

export const TOTAL = s(60);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);

import {s} from '../../engine/kit/theme';

// A lullaby waltz: 120 BPM in 3/4 → beat = 0.5 s (15 f), bar = 1.5 s (45 f).
// Every cut is on a bar line; keep in sync with music/w1014-sxd5.py.
export const BEAT = 15;
export const BAR = 45;
export const T = {
	hook: [0, 4.5],
	life: [4.5, 12],
	gain: [12, 19.5],
	pivot: [19.5, 22.5],
	record: [22.5, 31.5],
	drunk: [31.5, 39],
	wash: [39, 48],
	dolphin: [48, 54],
	end: [54, 60],
} as const;

export const TOTAL = s(60);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);

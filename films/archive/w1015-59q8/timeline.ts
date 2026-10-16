import {s} from '../../engine/kit/theme';

// 120 BPM 4/4 → bar = 2 s. Every cut is on a bar line; keep in sync with score.py.
export const T = {
	hook: [0, 6],
	tall: [6, 12],
	push: [12, 20],
	lungs: [20, 28],
	vacuum: [28, 36],
	sky: [36, 44],
	boil: [44, 50],
	everest: [50, 56],
	end: [56, 68], // the ending is its own 12 s scene (docs/BRIEF.md "Ending")
} as const;

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);

import {s} from '../../engine/kit/theme';

// 120 BPM 4/4 → beat = 15 f, bar = 2 s. Every cut is on a bar line; keep in sync with score.py.
export const T = {
	hook: [0, 6], // speech bubble + "how many books?"
	talk: [6, 16], // ~12,650 words a day (the gender gap is small)
	novel: [16, 24], // a novel every 6.3 days
	bard: [24, 32], // Shakespeare's complete works in 70 days
	tower: [32, 42], // age 5 → 80: an 87 m stack of books
	um: [42, 50], // 47 of those books are "um… uh…"
	end: [50, 62], // back to the bubble: over 4,300 novels
} as const;

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);
export const BEATF = 15;

import {s} from '../../engine/kit/theme';

// 120 BPM 4/4 → beat 0.5 s (15 f), bar 2 s (60 f). Every cut is on a bar line; keep in sync with score.py.
export const T = {
	hook: [0, 6], // 3 bars: dog + cake with 1 candle, "how many candles?"
	seven: [6, 12], // 3 bars: the ×7 rule → 7 candles
	parent: [12, 20], // 4 bars: a 1-year-old dog can have puppies, a 7-year-old can't
	dna: [20, 28], // 4 bars: the DNA clock study
	answer: [28, 36], // 4 bars: 1 ≈ 31 → 31 candles
	curve: [36, 44], // 4 bars: then it slows down (2→42, 7→62, 12→71)
	flip: [44, 52], // 4 bars: twist: later, ×7 makes dogs too old (84 vs 71)
	size: [52, 60], // 4 bars: and big dogs age faster
	end: [60, 69.5], // back to the cake, payoff, the closing line, a button at 67.5, settle into frame 0
} as const;

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);
export const start = (k: keyof typeof T) => s(T[k][0]);

// Scene-local frames shared with score.py (which mirrors them in seconds).
export const SEVEN_POP = [30, 75] as const; // candles 2..7 pop, one per 8th note (7.5 f)
export const ANSWER_POP = [15, 60] as const; // candles 2..31 pop; "31" lands at 60 (= 30.0 s, bar line)
export const CURVE_PTS = [45, 90, 135] as const; // points 2→42, 7→62, 12→71
export const FLIP_LINE = [20, 110] as const; // ×7 line draws; 84 lands at 110
export const SIZE_SWAP = 105; // mouse/elephant → chihuahua/great dane
export const END_POP = [8, 52] as const; // candles rise to 31
export const END_PAYOFF = 60; // payoff lands on the cadence (62.0 s)
export const END_SETTLE = [248, 276] as const; // candles sink back to 1 → frame 0 (after the 67.5 s button)

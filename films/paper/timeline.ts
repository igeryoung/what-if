import {Easing} from 'remotion';

// 96 BPM → bar = 2.5 s. Every cut lands on a bar line. Keep in sync with music/paper.py.
export const BAR = 2.5;
export const T = {
	hook: [0, 5],
	guess: [5, 7.5],
	climb: [7.5, 50], // payoff (45–50) happens inside the climb world
	twist: [50, 57.5],
	end: [57.5, 62.5],
} as const;
export const TOTAL_SEC = 62.5;

// Fold segments: [t0, t1, fromFold, toFold]. Fold k (k = 1..n) completes at t0 + (t1 - t0) * k / n.
export const SEG: [number, number, number, number][] = [
	[7.5, 12.0, 0, 14],
	[15.0, 19.5, 14, 23],
	[22.5, 26.0, 23, 27],
	[30.0, 33.5, 27, 32],
	[37.5, 45.0, 32, 42],
];

/** Completion times of every fold (index i → fold i+1). */
export const FOLD_TIMES: number[] = SEG.flatMap(([t0, t1, a, b]) => Array.from({length: b - a}, (_, i) => t0 + ((t1 - t0) * (i + 1)) / (b - a)));

const ease = Easing.inOut(Easing.cubic);

/** Continuous fold count at time t (seconds). Each fold eases over up to 0.3 s ending at its completion time. */
export const foldsAt = (t: number) => {
	let n = 0;
	for (let i = 0; i < FOLD_TIMES.length; i++) {
		const tc = FOLD_TIMES[i];
		const prev = i === 0 ? tc - 0.5 : FOLD_TIMES[i - 1];
		const d = Math.min(0.3, (tc - prev) * 0.85);
		const x = (t - (tc - d)) / d;
		n += x <= 0 ? 0 : x >= 1 ? 1 : ease(x);
	}
	return n;
};

export const THICK0 = 1e-4; // metres (0.1 mm)
export const thick = (n: number) => THICK0 * Math.pow(2, n);

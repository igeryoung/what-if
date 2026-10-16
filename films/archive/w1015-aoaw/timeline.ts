import {s} from '../../engine/kit/theme';

// 120 BPM 4/4 → bar = 2 s. Every cut is on a bar line; keep in sync with score.py.
export const T = {
	hook: [0, 6],
	speed: [6, 14],
	hour: [14, 22],
	taiwan: [22, 30],
	earth: [30, 38],
	yushan: [38, 46],
	pyramid: [46, 54],
	end: [54, 64], // the ending is its own 10 s scene (docs/BRIEF.md "Ending"); payoff lands at 56 s
} as const;

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);

// The model (see meta.json notes): 0.28 m/s ≈ 1 km/h, 30 cm wide lane, straight lines, no charging.
export const SPEED_CM_S = 28;
export const LANE_CM = 30;

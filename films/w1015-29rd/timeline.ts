import {s} from '../../engine/kit/theme';

// 120 BPM 4/4 → beat 0.5 s (15 f), bar 2 s (60 f). Every cut is on a bar line; keep in sync with score.py.
export const T = {
	hook: [0, 6], // 3 bars: the giant paw pushes the mug off, then the question
	lap: [6, 14], // 4 bars: 220 kg on your lap
	food: [14, 22], // 4 bars: 5–6 kg of meat a day ≈ 65 pouches
	litter: [22, 30], // 4 bars: a litter box ~3 m long
	push: [30, 38], // 4 bars: laptop, TV, the whole table
	dna: [38, 48], // 5 bars: the twist, 95.6 %
	end: [48, 56], // 4 bars: back to the mug; payoff on the cadence, the closing line, a button at 54, ring to the cut
} as const;

export const BEAT = 15; // frames
export const BAR = 60; // frames

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);

// Scene-local frames shared with the score (score.py mirrors these in seconds).
export const HOOK_PUSH = [4, 36] as const; // paw slides right; the mug tips off and is gone by HOOK_CRASH
export const HOOK_CRASH = 60; // 2.0 s
export const LAP_LAND = 30; // the cat lands on the lap: 7.0 s
export const FOOD_POUCH = [120, 180] as const; // 65 pouches pop in over bar 3: 18–20 s
export const LITTER_GROW = [40, 100] as const; // the box grows to 3 m
export const LITTER_TABLE = 130; // the ping-pong table drops onto it: 26.33 s (lands ~26.67)
export const PUSH_SWIPES = [60, 120, 180] as const; // swipes at 32, 34, 36 s; each object is gone 30 f later (33, 35, 37 s)
export const DNA_REVEAL = 60; // 95.6 % lands on 40 s
export const DNA_SHRINK = 180; // the giant cat shrinks back to house-cat size on 44 s

import {s} from '../../engine/kit/theme';

// 120 BPM 4/4 → bar = 2 s. Every cut is on a bar line; keep in sync with score.py.
export const T = {
	hook: [0, 6],
	blink: [6, 14], // one blink ≈ 0.3 s
	minute: [14, 22], // 15 a minute → 4.5 s dark
	day: [22, 32], // 14,400 a day → 72 min
	year: [32, 40], // 18 days a year
	life: [40, 50], // 370 million blinks
	twist: [50, 58], // and you never noticed
	end: [58, 69], // the eye again: 3.5 years; the closing line; a button + one last blink at 67
} as const;

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);

// Hook blinks (local frames). Each one dims the whole screen.
export const HOOK_BLINKS = [26, 118];
// Minute ring: the hand sweeps one "minute" between these local frames; 15 blink marks on it.
// Marks every 7.5 frames = an eighth note at 120 BPM; the first lands on 14.5 s.
export const SWEEP = [11.25, 123.75] as const;
export const markFrame = (k: number) => SWEEP[0] + ((k + 0.5) / 15) * (SWEEP[1] - SWEEP[0]);

import {s} from '../../engine/kit/theme';

// 120 BPM 4/4 → beat 0.5 s (15 f), bar 2 s (60 f). Every cut is on a bar line; keep in sync with score.py.
export const T = {
	hook: [0, 6], // 3 bars: the wall, the gecko, the question
	secret: [6, 16], // 5 bars: toe → hairs → split tips
	strength: [16, 24], // 4 bars: 50 g gecko, 133 kg
	scale: [24, 32], // 4 bars: twice the size → weight ×8, soles ×4
	species: [32, 40], // 4 bars: 225 species, geckos 200× mites
	forty: [40, 48], // 4 bars: 40% of your skin
	shoe: [48, 54], // 3 bars: EU size 145
	front: [54, 62], // 4 bars: twist, 80% of your front, hugging the wall
	end: [62, 71], // back on the opening wall: the payoff, the closing line, a button at 69, ring to the cut
} as const;

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);

// Scene-local frames shared with the score (score.py mirrors these in seconds).
export const HOOK_RUN = [6, 42] as const; // gecko scurries up the glass
export const SECRET_STAGE = [0, 105, 210] as const; // toe, hairs, one hair splitting (every 7 beats)
export const STRENGTH_POP = 45; // "133 kg" lands
export const STRENGTH_DROP = 120; // the two adults drop onto the platform
export const SCALE_GROW = [75, 105] as const; // the cube doubles
export const SPECIES_BAR = [60, 90] as const; // gecko bar grows
export const FILL = [30, 90] as const; // 40% / 80% fills (forty, front)
export const CLIMB = [135, 240] as const; // front: climbing up the glass
export const END_FILL = [30, 75] as const; // end: the 40% fill on the opening figure

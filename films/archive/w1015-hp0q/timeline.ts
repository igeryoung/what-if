// 90 BPM 4/4 → beat 20 f (0.667 s), bar 80 f (2.667 s). Every cut is on a bar line; keep in sync with score.py.
export const BEAT = 20; // frames
export const BAR = 80; // frames

// Scene bounds in bars.
export const T = {
	hook: [0, 2],
	rain: [2, 5],
	fluff: [5, 8],
	rise: [8, 12],
	aomori: [12, 15],
	record: [15, 18],
	twist: [18, 21],
	end: [21, 25], // the ending is its own 4-bar scene (docs/BRIEF.md "Ending")
} as const;

export const from = (k: keyof typeof T) => T[k][0] * BAR;
export const dur = (k: keyof typeof T) => (T[k][1] - T[k][0]) * BAR;
export const TOTAL = T.end[1] * BAR; // 2000 f = 66.67 s

// Facts (see meta.json notes).
// CWA Taipei station 1991–2020 monthly normals, mm (sum 2,329.5).
export const MONTHS = [90.5, 143.2, 157.2, 152.5, 239.9, 345.0, 226.1, 337.8, 315.2, 150.2, 83.2, 88.7];
export const RAIN_MM = 2329.5;
export const SNOW_M = 23.3; // 2,329.5 mm × 10 (10:1 snow-to-liquid) = 23.3 m
export const FH = 3; // metres per floor

// Scene-local frames shared with score.py.
export const MONTH0 = 40; // rain scene: month m (1..12) fills during [MONTH0 + 10(m−1), MONTH0 + 10m]
export const MONTH_STEP = 10;
export const RISE0 = 20; // rise scene: the snow enters floor n (1..8) at RISE0 + (n−1)·BEAT
export const RISE_TOP = 200; // …and settles at 23.3 m here
export const END_UP = 64; // end scene: snow 0 → 23.3 m over [0, END_UP]
export const END_PAY = 80; // payoff lands on the 2nd bar of the end scene
export const END_MELT = 284; // last 36 frames: snow melts, rain returns, text fades (gone at D − 6)

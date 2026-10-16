import {s} from '../../engine/kit/theme';

// 120 BPM 4/4 → bar = 2 s. Every cut is on a bar line; keep in sync with score.py.
export const T = {
	hook: [0, 6], // LEGO Taipei 101: will the bottom brick be crushed?
	tall: [6, 14], // 101 = 508 m = ~53,000 bricks
	press: [14, 24], // Open University press test: 4,240 N ≈ 432 kg
	stack: [24, 32], // 432 kg ÷ 1.152 g = 375,000 bricks (camera follows the stack up)
	seven: [32, 40], // ≈ 3.5 km = 7 Taipei 101s
	yushan: [40, 46], // less than one 101 short of Yushan
	twist: [46, 56], // it would buckle long before: 2 mm off-centre at the midpoint
	end: [56, 66], // back to the LEGO 101: it won't crush, it holds 7 of them
} as const;

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);

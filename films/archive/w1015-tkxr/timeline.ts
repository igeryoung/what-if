import {s} from '../../engine/kit/theme';

// 120 BPM 4/4 → bar = 2 s (60 frames). Every cut is on a bar line; keep in sync with score.py.
export const T = {
	hook: [0, 6], // 如果蟑螂跟人一樣大，你跑得掉嗎？
	real: [6, 14], // 真蟑螂：4 公分、每秒 1.5 公尺
	scale: [14, 24], // ×42.5 → 時速 230 公里
	race: [24, 34], // 百米 1.6 秒 vs 博爾特 9.58 秒
	hide: [34, 42], // 躲到床底下？3 毫米 → 13 公分
	twist: [42, 52], // 全速時用兩條腿跑
	end: [52, 64], // 回到開場：你跑不掉。還好牠只有 4 公分。
} as const;

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);

// The one assumption of the film: a 4 cm American cockroach scaled to a 1.7 m person.
export const K = 170 / 4; // 42.5

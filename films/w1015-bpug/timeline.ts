import {s} from '../../engine/kit/theme';

// 120 BPM 4/4 → bar = 2 s. Every cut is on a bar line; keep in sync with score.py.
export const T = {
	hook: [0, 6], // 如果雨滴跟棒球一樣大？
	size: [6, 14], // 真的雨滴約 2 毫米；5 萬顆才裝滿一顆
	weight: [14, 20], // 約 210 克，比棒球重
	speed: [20, 28], // 時速約 150 公里 ≈ 職棒快速球
	pitch: [28, 36], // 足球場每秒挨 47 顆
	twist: [36, 44], // 但這不可能：雨滴不是淚滴形
	burst: [44, 52], // 約 5 毫米 → 降落傘 → 碎掉（碎在 48 s）
	hail: [52, 58], // 天上真的會掉棒球大的東西：冰雹
	end: [58, 69], // 回到開場：碎成小雨（60 s 收束和弦）、收尾句、67 s 收尾重音，碎片倒帶回開場的雨滴
} as const;

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);

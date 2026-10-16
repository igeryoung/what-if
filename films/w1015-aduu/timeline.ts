import {Easing} from 'remotion';
import {s} from '../../engine/kit/theme';

// 96 BPM 4/4 → beat 0.625 s, bar 2.5 s. Every cut is on a bar line; keep in sync with score.py.
export const T = {
	hook: [0, 5],
	limit: [5, 10],
	dark: [10, 17.5],
	titanic: [17.5, 25],
	everest: [25, 32.5],
	bottom: [32.5, 45],
	bag: [45, 52.5],
	end: [52.5, 67], // rewind to the surface, the payoff, the closing line, a button at 65, ring to the cut
} as const;

export const TOTAL = s(T.end[1]);
export const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);

// Fastest way down: the phone slicing edge-first at its terminal velocity (≈1.8 m/s, see meta.json notes).
export const SPEED = 1.8;
export const BOTTOM = 10935;
export const SPLASH = 1.15; // s: the phone hits the water

type Key = [number, number, 'lin' | 'ease'];
// Story depth (m) over film time (s). The HUD clock is depth / SPEED, so the two always agree.
const DEPTH: Key[] = [
	[0, 0, 'lin'],
	[SPLASH, 0, 'lin'],
	[5, 1.5, 'lin'],
	[7.5, 6, 'lin'],
	[10, 12, 'lin'],
	[10.2, 14, 'lin'],
	[12.2, 1000, 'ease'],
	[17.5, 1040, 'lin'],
	[18, 1060, 'lin'],
	[20, 3800, 'ease'],
	[25, 3850, 'lin'],
	[25.5, 3900, 'lin'],
	[27.5, 8849, 'ease'],
	[32.5, 8900, 'lin'],
	[34, BOTTOM, 'ease'],
	[53, BOTTOM, 'lin'],
	[54.4, 1.5, 'ease'],
	[55, 0, 'lin'],
];
// Marine-snow scroll (px): how far the water has streamed past the camera. Runs backwards in the rewind.
const SCROLL: Key[] = [
	[0, 0, 'lin'],
	[1.2, 0, 'lin'],
	[5, 500, 'lin'],
	[10, 1100, 'lin'],
	[10.2, 1150, 'lin'],
	[12.2, 3900, 'ease'],
	[17.5, 4300, 'lin'],
	[18, 4380, 'lin'],
	[20, 7100, 'ease'],
	[25, 7500, 'lin'],
	[25.5, 7580, 'lin'],
	[27.5, 10300, 'ease'],
	[32.5, 10700, 'lin'],
	[34, 11300, 'ease'],
	[53, 11300, 'lin'],
	[54.4, 0, 'ease'],
];

const ease = Easing.inOut(Easing.cubic);
const piecewise = (keys: Key[], sec: number) => {
	if (sec <= keys[0][0]) return keys[0][1];
	for (let i = 1; i < keys.length; i++) {
		const [t1, v1, kind] = keys[i];
		const [t0, v0] = keys[i - 1];
		if (sec <= t1) {
			const p = (sec - t0) / (t1 - t0);
			return v0 + (v1 - v0) * (kind === 'ease' ? ease(p) : p);
		}
	}
	return keys[keys.length - 1][1];
};

// Camera: a slow push or pull per scene around the phone; in the bag scene it drifts toward the bag.
const ZOOM: Key[] = [
	[0, 1, 'lin'],
	[5, 1, 'lin'],
	[10, 1.05, 'ease'],
	[17.5, 1, 'ease'],
	[25, 1.05, 'ease'],
	[32.5, 1, 'ease'],
	[45, 1.06, 'ease'],
	[52.5, 1.1, 'ease'],
	[53, 1.1, 'lin'],
	[54.4, 1, 'ease'],
];
const PAN: Key[] = [
	[45, 540, 'lin'],
	[52.5, 420, 'ease'],
	[53, 420, 'lin'],
	[54.4, 540, 'ease'],
];
export const camAt = (sec: number) => ({z: piecewise(ZOOM, sec), x: piecewise(PAN, sec), y: 1180});

export const depthAt = (sec: number) => piecewise(DEPTH, sec);
export const scrollAt = (sec: number) => piecewise(SCROLL, sec);

export const clock = (depth: number) => {
	const x = Math.round(depth / SPEED);
	const h = Math.floor(x / 3600);
	const m = Math.floor((x % 3600) / 60);
	const sec = x % 60;
	return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

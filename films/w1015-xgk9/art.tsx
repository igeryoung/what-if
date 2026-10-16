import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp} from '../../engine/kit/kit';
import {C} from '../../engine/kit/theme';

export const P = {
	iris: '#3E9BFF',
	irisDeep: '#1B4FA8',
	lid: '#1B1E25',
	lidEdge: '#F4F1EC',
	white: '#F4F1EC',
	dark: '#000000',
};

export const BG = 'radial-gradient(120% 70% at 50% 40%, #171A20 0%, #0C0D10 60%, #08090B 100%)';

export const rng = (seed: number) => {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

/** Lid position 0 (open) → 1 (closed) for a real-speed blink starting at frame `at`: ~0.3 s total. */
export const blinkLid = (f: number, at: number, close = 3, hold = 2, open = 5) => {
	if (f < at || f > at + close + hold + open) return 0;
	if (f < at + close) return interpolate(f, [at, at + close], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	if (f < at + close + hold) return 1;
	return interpolate(f, [at + close + hold, at + close + hold + open], [1, 0], {...clamp, easing: Easing.out(Easing.quad)});
};

const q = (u: number, a: number, c: number, b: number) => (1 - u) * (1 - u) * a + 2 * u * (1 - u) * c + u * u * b;
const LASH = [-160, -136, -112, -68, -44, -20];

/**
 * Flat vector eye in a 400×200 box (drawn at width `w`). `lid` 0 = open, 1 = closed: the upper lid sweeps down to
 * meet the lower one and the lashes flip from up to down.
 */
export const Eye: React.FC<{w: number; lid: number; id: string; look?: number}> = ({w, lid, id, look = 0}) => {
	const k = Math.min(1, Math.max(0, lid));
	const cu = -40 + 255 * k; // upper lid edge control point
	const cl = 240 - 25 * k; // lower lid rises a little
	const edge = `M10 100 Q200 ${cu} 390 100`;
	const almond = 'M10 100 Q200 -40 390 100 Q200 240 10 100 Z';
	const sm = k * k * (3 - 2 * k);
	return (
		<svg viewBox="0 0 400 200" width={w} height={w / 2} style={{display: 'block', overflow: 'visible'}}>
			<defs>
				<clipPath id={`${id}-clip`}>
					<path d={almond} />
				</clipPath>
				<radialGradient id={`${id}-iris`} cx="50%" cy="50%" r="50%">
					<stop offset="0%" stopColor="#9CD2FF" />
					<stop offset="45%" stopColor={P.iris} />
					<stop offset="100%" stopColor={P.irisDeep} />
				</radialGradient>
			</defs>
			{/* crease above the eye */}
			<path d="M40 64 Q200 -78 360 64" fill="none" stroke={C.faint} strokeWidth={6} strokeLinecap="round" />
			<g clipPath={`url(#${id}-clip)`}>
				<path d={almond} fill={P.white} />
				<g transform={`translate(${look * 40} 0)`}>
					<circle cx={200} cy={102} r={60} fill={`url(#${id}-iris)`} />
					<circle cx={200} cy={102} r={60} fill="none" stroke={P.irisDeep} strokeWidth={5} />
					<circle cx={200} cy={102} r={27} fill="#05070B" />
					<circle cx={220} cy={82} r={11} fill="#fff" />
					<circle cx={184} cy={122} r={4.5} fill="#fff" opacity={0.8} />
				</g>
				<path d={`M-10 100 L10 100 Q200 ${cu} 390 100 L410 100 L410 -120 L-10 -120 Z`} fill={P.lid} />
				<path d={`M10 100 Q200 ${cl} 390 100 L410 100 L410 300 L-10 300 L-10 100 Z`} fill={P.lid} />
			</g>
			<path d={`M10 100 Q200 240 390 100`} fill="none" stroke={C.dim} strokeWidth={4} opacity={0.55} />
			<path d={edge} fill="none" stroke={P.lidEdge} strokeWidth={8} strokeLinecap="round" />
			{LASH.map((a, i) => {
				const u = 0.2 + (i / (LASH.length - 1)) * 0.62;
				const x = q(u, 10, 200, 390);
				const y = q(u, 100, cu, 100);
				const r = (a * Math.PI) / 180;
				const dx = Math.cos(r);
				const dy = Math.sin(r) * (1 - 2 * sm);
				const n = Math.hypot(dx, dy) || 1;
				const L = 34;
				return <line key={i} x1={x} y1={y} x2={x + (dx / n) * L} y2={y + (dy / n) * L} stroke={P.lidEdge} strokeWidth={7} strokeLinecap="round" />;
			})}
		</svg>
	);
};

// Hook layout: the big eye. Reused by the ending and the thumbnail so the replay and the cover match frame 0.
export const EYE_W = 760;
export const EYE_Y = 1170; // centre
export const HookArt: React.FC<{lid?: number; look?: number}> = ({lid = 0, look = 0}) => (
	<div style={{position: 'absolute', left: (1080 - EYE_W) / 2, top: EYE_Y - EYE_W / 4, width: EYE_W}}>
		<Eye w={EYE_W} lid={lid} look={look} id="hook-eye" />
	</div>
);

/** Full-screen darkness while the lid is down: the world goes black with every blink. */
export const Dark: React.FC<{v: number; max?: number}> = ({v, max = 0.82}) => (
	<div style={{position: 'absolute', inset: 0, background: P.dark, opacity: Math.min(1, Math.max(0, v)) * max}} />
);

/** A frame of the film strip: either a tiny daylight scene or a black blink frame. */
export const Frame: React.FC<{w: number; h: number; black: boolean; seed: number}> = ({w, h, black, seed}) => {
	const r = rng(seed);
	const sunX = 0.2 + r() * 0.6;
	const hill = 0.55 + r() * 0.15;
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display: 'block'}}>
			<rect x={2} y={2} width={w - 4} height={h - 4} rx={14} fill={black ? '#000' : '#1E2A3A'} stroke={black ? '#2A2D34' : '#3A4B63'} strokeWidth={4} />
			{!black && (
				<g>
					<circle cx={sunX * w} cy={h * 0.34} r={h * 0.12} fill={C.amber} />
					<path d={`M2 ${h * hill} Q ${w * 0.3} ${h * (hill - 0.18)} ${w * 0.55} ${h * hill} T ${w - 2} ${h * (hill - 0.05)} L ${w - 2} ${h - 2} L 2 ${h - 2} Z`} fill="#2E6B4E" />
				</g>
			)}
		</svg>
	);
};

import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp} from '../../engine/kit/kit';
import {C} from '../../engine/kit/theme';
import {P} from './art';

// A side view of the real world in metres: the 2×2 LEGO column, Taipei 101s and Yushan, seen by a camera
// that only changes its scale (metres per pixel, `mpp`). Ground is fixed at screen y = GROUND.
export const GROUND = 1470;
export const BRICK_H = 0.0096; // m, one 2×2 brick without its studs
export const BRICK_W = 0.0158; // m
export const N_MAX = 375000; // bricks the bottom one can carry (BBC / Open University)
export const TOWER_M = N_MAX * BRICK_H; // 3,600 m drawn (BBC rounds to 3.5 km)
export const T101 = 508; // m
export const YUSHAN = 3952; // m

// Taipei 101 outline: [half-width m, altitude m], left side bottom → top.
const PROF: [number, number][] = (() => {
	const p: [number, number][] = [
		[36, 0],
		[27, 112],
	];
	for (let k = 0; k < 8; k++) {
		const y0 = 112 + k * 33.5;
		p.push([22, y0], [28.5, y0 + 33.5]);
	}
	p.push([16, 380], [16, 415], [12, 415], [12, 448], [4, 448], [4, 463], [2, 463], [0.8, 508]);
	return p;
})();

export const path101 = (cx: number, baseAlt: number, mpp: number, wx = 1) => {
	const pt = ([hx, a]: [number, number], side: number) => `${(cx + (side * hx * wx) / mpp).toFixed(2)} ${(GROUND - (baseAlt + a) / mpp).toFixed(2)}`;
	const left = PROF.map((q) => pt(q, -1));
	const right = [...PROF].reverse().map((q) => pt(q, 1));
	return `M ${left.join(' L ')} L ${right.join(' L ')} Z`;
};

// Yushan, stylised: [dx m from the peak, altitude m].
const MOUNT: [number, number][] = [
	[-14000, 0],
	[-9000, 900],
	[-6500, 1500],
	[-4800, 2300],
	[-3400, 2750],
	[-2300, 3150],
	[-1300, 3520],
	[-600, 3800],
	[0, YUSHAN],
	[450, 3860],
	[1000, 3720],
	[1600, 3560],
	[2500, 3380],
	[3600, 3000],
	[5200, 2500],
	[8000, 1600],
	[14000, 0],
];

/** Fixed-base column buckling: tangent angle φ(s) = Φ·sin(πs/2L). Returns screen points base → top. */
const bentPoints = (x0: number, len: number, phi: number, steps = 80) => {
	const pts: [number, number][] = [[x0, GROUND]];
	let x = x0;
	let y = GROUND;
	const ds = len / steps;
	for (let i = 0; i < steps; i++) {
		const sm = (i + 0.5) / steps;
		const a = phi * Math.sin((Math.PI / 2) * sm);
		x -= Math.sin(a) * ds; // falls to the left
		y -= Math.cos(a) * ds;
		pts.push([x, Math.min(y, GROUND - 3)]);
	}
	return pts;
};
// Φ at which the falling top touches the ground (the top's altitude only drops as Φ grows).
export const PHI_MAX = (() => {
	const topAlt = (phi: number) => {
		let a = 0;
		for (let i = 0; i < 400; i++) a += Math.cos(phi * Math.sin((Math.PI / 2) * ((i + 0.5) / 400))) / 400;
		return a;
	};
	let lo = 0;
	let hi = Math.PI;
	for (let k = 0; k < 40; k++) {
		const mid = (lo + hi) / 2;
		if (topAlt(mid) > 0.004) lo = mid;
		else hi = mid;
	}
	return lo;
})();

export type WorldState = {
	mpp: number;
	towerX: number;
	towerH: number; // m
	towerO?: number;
	fallBrick?: number; // px: the newest brick is still dropping (close-up only)
	bend?: number; // Φ in radians
	stackX?: number;
	stack?: {alt: number; o: number}[]; // Taipei 101s, base altitude in m
	wx?: number;
	ghost?: number; // dashed 8th 101 on top of the stack
	ghostAlt?: number;
	mount?: number; // Yushan opacity
	mountX?: number;
	mountRise?: number; // px
	peakLine?: number;
	peakLabel?: string;
	labelFont?: string;
	stackNums?: number; // 1..7 labels beside the stack (opacity)
};

export const World: React.FC<WorldState> = (w) => {
	const {mpp, towerX, towerH} = w;
	const brickPx = BRICK_H / mpp;
	const colW = Math.max(BRICK_W / mpp, 7);
	const topY = GROUND - towerH / mpp;
	const wx = w.wx ?? 1;
	const N = Math.floor(towerH / BRICK_H + 1e-6);
	const seams: number[] = [];
	if (brickPx > 2.5) {
		const last = Math.min(N, Math.ceil(GROUND / brickPx) + 1);
		for (let i = 1; i <= last; i++) seams.push(GROUND - i * brickPx);
	}
	const seamO = interpolate(brickPx, [2.5, 7], [0, 1], clamp);
	const studs = BRICK_W / mpp > 30;
	const plateH = 3.2e-3 / mpp;
	const mountO = w.mount ?? 0;
	const peakY = GROUND - YUSHAN / mpp;
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<linearGradient id="mt" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={P.mountL} />
					<stop offset="1" stopColor={P.mount} />
				</linearGradient>
			</defs>
			{/* Yushan (behind everything) */}
			{mountO > 0 && (
				<g opacity={mountO} transform={`translate(0 ${w.mountRise ?? 0})`}>
					<path
						d={`M ${MOUNT.map(([dx, a]) => `${((w.mountX ?? 780) + (dx * 0.5) / mpp).toFixed(1)} ${(GROUND - a / mpp).toFixed(1)}`).join(' L ')} Z`}
						fill="url(#mt)"
						stroke="#33425F"
						strokeWidth={3}
						strokeLinejoin="round"
					/>
				</g>
			)}
			{/* ground */}
			<rect x={0} y={GROUND} width={1080} height={1920 - GROUND} fill="#0A0B0E" />
			<rect x={0} y={GROUND} width={1080} height={3} fill={C.faint} />
			{/* close-up: a LEGO baseplate under the first brick */}
			{plateH > 1.5 && (
				<g>
					<rect x={0} y={GROUND} width={1080} height={plateH} fill={P.plate} />
					{Array.from({length: 41}, (_, k) => k - 20).map((k) => {
						const x = towerX + (k * 0.008) / mpp;
						if (Math.abs(k) < 1 || x < -100 || x > 1180) return null;
						const sw = 4.8e-3 / mpp;
						return <rect key={k} x={x - sw / 2} y={GROUND - 1.7e-3 / mpp} width={sw} height={1.7e-3 / mpp + 2} rx={sw * 0.08} fill={P.plateL} />;
					})}
				</g>
			)}
			{/* Taipei 101s */}
			{(w.stack ?? []).map((s, k) =>
				s.o > 0 ? <path key={k} d={path101(w.stackX ?? 0, s.alt, mpp, wx)} fill={P.teal} stroke={P.tealD} strokeWidth={1.5} opacity={s.o} /> : null,
			)}
			{(w.stackNums ?? 0) > 0 &&
				(w.stack ?? []).map((s, k) =>
					s.o > 0.5 ? (
						<text
							key={`n${k}`}
							x={(w.stackX ?? 0) + (40 * wx) / mpp + 16}
							y={GROUND - (s.alt + 254) / mpp + 11}
							fill={C.dim}
							opacity={w.stackNums}
							style={{fontFamily: w.labelFont, fontWeight: 700, fontSize: 32}}
						>
							{k + 1}
						</text>
					) : null,
				)}
			{(w.ghost ?? 0) > 0 && (
				<path d={path101(w.stackX ?? 0, w.ghostAlt ?? 7 * T101, mpp, wx)} fill={P.teal} fillOpacity={0.12} stroke={P.tealL} strokeWidth={3} strokeDasharray="8 6" opacity={w.ghost} />
			)}
			{/* Yushan summit line */}
			{(w.peakLine ?? 0) > 0 && (
				<g opacity={w.peakLine}>
					<line x1={60} y1={peakY} x2={1020} y2={peakY} stroke={C.amber} strokeWidth={3} strokeDasharray="12 9" />
					<text x={70} y={peakY - 16} fill={C.amber} style={{fontFamily: w.labelFont, fontWeight: 800, fontSize: 34}}>
						{w.peakLabel}
					</text>
				</g>
			)}
			{/* the LEGO column */}
			<g opacity={w.towerO ?? 1}>
				{w.bend && w.bend > 0 ? (
					<polyline
						points={bentPoints(towerX, towerH / mpp, w.bend)
							.map((p) => p.join(','))
							.join(' ')}
						fill="none"
						stroke={P.red}
						strokeWidth={colW}
						strokeLinejoin="round"
					/>
				) : (
					<>
						<rect x={towerX - colW / 2} y={topY} width={colW} height={GROUND - topY} fill={P.red} />
						{brickPx > 2.5 && (
							<>
								<rect x={towerX - colW / 2 + colW * 0.08} y={topY} width={colW * 0.1} height={GROUND - topY} fill={P.redL} opacity={0.22 * seamO} />
								{seams.map((y, i) => (
									<rect key={i} x={towerX - colW / 2} y={y - Math.max(1, brickPx * 0.05)} width={colW} height={Math.max(1, brickPx * 0.05)} fill={P.redD} opacity={seamO} />
								))}
							</>
						)}
						{studs &&
							[-1, 1].map((d) => {
								const sw = 4.8e-3 / mpp;
								const sh = 1.7e-3 / mpp;
								return <rect key={d} x={towerX + (d * 4e-3) / mpp - sw / 2} y={topY - sh} width={sw} height={sh + 1} rx={sw * 0.06} fill={P.red} />;
							})}
						{(w.fallBrick ?? 0) > 0 && (
							<g>
								<rect x={towerX - colW / 2} y={topY - brickPx - (w.fallBrick ?? 0)} width={colW} height={brickPx - 1} fill={P.red} />
								{[-1, 1].map((d) => {
									const sw = 4.8e-3 / mpp;
									const sh = 1.7e-3 / mpp;
									return <rect key={d} x={towerX + (d * 4e-3) / mpp - sw / 2} y={topY - brickPx - (w.fallBrick ?? 0) - sh} width={sw} height={sh + 1} rx={sw * 0.06} fill={P.red} />;
								})}
							</g>
						)}
					</>
				)}
			</g>
		</svg>
	);
};

// ---------------------------------------------------------------------------------------------
// One continuous camera from the stack scene through the twist (global seconds), so the cuts between
// those scenes don't jump.
const io = Easing.inOut(Easing.cubic);
const L = (sec: number, a: number, b: number, v0: number, v1: number, e: (x: number) => number = io) =>
	interpolate(sec, [a, b], [v0, v1], {...clamp, easing: e});

const TOP_Y = 690; // the top of the stack settles here
const MPP0 = BRICK_H / 92;
const DROPS = [24.5, 24.75, 25.0, 25.25, 25.5, 25.75, 26.0]; // bricks 2..8 click on in 8ths
export const STACK_ZOOM: [number, number] = [26.0, 29.6];
export const DROP101 = [33.0, 33.5, 34.0, 34.5, 35.0, 35.5, 36.0]; // seven Taipei 101s land on beats

export const bricksAt = (sec: number) => {
	if (sec < STACK_ZOOM[0]) return 1 + DROPS.filter((t) => sec >= t).length;
	const p = L(sec, STACK_ZOOM[0], STACK_ZOOM[1], 0, 1, Easing.inOut(Easing.sin));
	return Math.exp(Math.log(8) + (Math.log(N_MAX) - Math.log(8)) * p);
};

export const worldAt = (sec: number, labelFont: string, peakLabel: string): WorldState => {
	const n = bricksAt(sec);
	const H = sec < STACK_ZOOM[0] ? Math.floor(n) * BRICK_H : n * BRICK_H;
	const mppStack = Math.max(MPP0, H / (GROUND - TOP_Y));
	const mppEnd = TOWER_M / (GROUND - TOP_Y);
	// newest brick still falling (close-up)
	const next = DROPS.find((t) => sec < t && sec >= t - 0.12);
	const fallBrick = next !== undefined ? ((next - sec) / 0.12) ** 2 * 220 : 0;
	let mpp = mppStack;
	if (sec >= 32) mpp = L(sec, 32, 33.5, mppEnd, 4.95);
	if (sec >= 40) mpp = L(sec, 40, 41.5, 4.95, 5.45);
	if (sec >= 46) mpp = L(sec, 46.2, 47.6, 5.45, 5.0);
	const towerX = sec < 32 ? 540 : sec < 46 ? L(sec, 32, 33.2, 540, 390) : L(sec, 46.2, 47.6, 390, 650);
	const fade = sec < 46 ? 1 : L(sec, 46, 46.8, 1, 0);
	const stack = DROP101.map((t, k) => {
		const fall = L(sec, t - 0.28, t, 1, 0, Easing.in(Easing.quad));
		return {alt: k * T101 + fall * 700, o: (sec >= t - 0.28 ? 1 : 0) * fade};
	});
	const ghostT = 41.9;
	const bend = sec < 51.6 ? 0 : PHI_MAX * Math.min(1, ((sec - 51.6) / 2.3) ** 2.2);
	return {
		mpp,
		towerX,
		towerH: sec < 32 ? H : TOWER_M,
		fallBrick: sec < 26.1 ? fallBrick : 0,
		bend,
		stackX: 545,
		stack: sec >= 32 ? stack : [],
		wx: 2,
		stackNums: sec < 40 ? L(sec, 33.1, 33.5, 0, 1) : L(sec, 40, 40.4, 1, 0),
		ghost: sec < 46 ? L(sec, ghostT - 0.3, ghostT, 0, 1) : fade,
		ghostAlt: 7 * T101 + L(sec, ghostT - 0.3, ghostT, 700, 0, Easing.in(Easing.quad)),
		mount: sec < 46 ? L(sec, 40, 41.0, 0, 1) : fade,
		mountX: 820,
		mountRise: sec < 46 ? L(sec, 40, 41.4, 420, 0, Easing.out(Easing.cubic)) : 0,
		peakLine: sec < 46 ? L(sec, 40.9, 41.4, 0, 1) : fade,
		peakLabel,
		labelFont,
	};
};

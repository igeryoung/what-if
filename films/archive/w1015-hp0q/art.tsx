import React from 'react';
import {C} from '../../engine/kit/theme';
import {FH, TOTAL} from './timeline';

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

// ---------- camera: world metres (y up) → screen px ----------
export type Cam = {k: number; cx: number; cy: number};
export const sx = (c: Cam, x: number) => 540 + (x - c.cx) * c.k;
export const sy = (c: Cam, y: number) => 960 - (y - c.cy) * c.k;
/** Camera with zoom k (px per metre) that puts world point (ax, ay) at screen (px, py). */
export const camAt = (k: number, ax: number, ay: number, px: number, py: number): Cam => ({k, cx: ax - (px - 540) / k, cy: ay + (py - 960) / k});
/** The opening shot: street level at y 1680, the tall building centred at x 400. */
export const WIDE = camAt(21, 0, 0, 400, 1680);
/** Zoom between two (anchor-screen-position, k) states along a log-k path. */
export const camLerp = (k0: number, k1: number, a0: [number, number], a1: [number, number], p0: [number, number], p1: [number, number], p: number): Cam => {
	const k = Math.exp(Math.log(k0) + (Math.log(k1) - Math.log(k0)) * p);
	const ax = a0[0] + (a1[0] - a0[0]) * p;
	const ay = a0[1] + (a1[1] - a0[1]) * p;
	return camAt(k, ax, ay, p0[0] + (p1[0] - p0[0]) * p, p0[1] + (p1[1] - p0[1]) * p);
};

// ---------- the street ----------
type Bldg = {x0: number; x1: number; n: number; fill: string; bays: number; seed: number; grill?: boolean; shop?: 'store' | 'shutter'};
export const HERO = {x0: -9, x1: 9, n: 11};
const BLDGS: Bldg[] = [
	{x0: -36, x1: -21, n: 8, fill: '#141A27', bays: 5, seed: 1},
	{x0: -20, x1: -10, n: 5, fill: '#1A2232', bays: 3, seed: 2, grill: true},
	{x0: HERO.x0, x1: HERO.x1, n: HERO.n, fill: '#1E2738', bays: 5, seed: 3, shop: 'shutter'},
	{x0: 10, x1: 18, n: 4, fill: '#19212F', bays: 3, seed: 4, grill: true, shop: 'store'},
	{x0: 19, x1: 31, n: 7, fill: '#161D2A', bays: 4, seed: 5},
	{x0: 32, x1: 46, n: 10, fill: '#131926', bays: 4, seed: 6},
];
type Win = {x: number; y: number; w: number; h: number; lit: number; ac: boolean; grill: boolean};
const WINDOWS: Win[] = BLDGS.flatMap((b) => {
	const r = rng(b.seed * 97 + 5);
	const bw = (b.x1 - b.x0) / b.bays;
	const out: Win[] = [];
	for (let f = 2; f <= b.n; f++) {
		for (let i = 0; i < b.bays; i++) {
			const lit = r() < 0.42 ? 0.45 + r() * 0.45 : 0;
			out.push({x: b.x0 + i * bw + bw * 0.22, y: (f - 1) * FH + 1.0, w: bw * 0.56, h: 1.3, lit, ac: r() < 0.3, grill: !!b.grill});
		}
	}
	return out;
});

const GOODS = (() => {
	const r = rng(31);
	const cols = [C.red, C.green, '#3D8BFF', C.amber, '#E86FA8'];
	const out: {x: number; y: number; h: number; c: string}[] = [];
	for (const y of [0.95, 1.65]) for (let x = 0.75; x < 7.2; x += 0.3) if (r() < 0.75) out.push({x, y: y + 0.06, h: 0.18 + r() * 0.2, c: cols[Math.floor(r() * cols.length)]});
	return out;
})();

const Buildings: React.FC = () => (
	<g>
		{BLDGS.map((b) => (
			<g key={b.seed}>
				<rect x={b.x0} y={-b.n * FH - 0.6} width={b.x1 - b.x0} height={b.n * FH + 0.6} fill={b.fill} />
				<rect x={b.x0 - 0.15} y={-b.n * FH - 0.6} width={b.x1 - b.x0 + 0.3} height={0.25} fill="#2A3446" />
				{Array.from({length: b.n - 1}, (_, i) => (
					<rect key={i} x={b.x0} y={-(i + 1) * FH - 0.06} width={b.x1 - b.x0} height={0.12} fill="#141B27" />
				))}
				{b.shop === 'store' && (
					<g>
						<rect x={b.x0 + 0.4} y={-2.7} width={b.x1 - b.x0 - 0.8} height={2.5} fill="#FFE9B8" opacity={0.92} />
						<rect x={b.x0 + 0.4} y={-2.7} width={b.x1 - b.x0 - 0.8} height={0.35} fill={C.green} opacity={0.9} />
						{[0.95, 1.65].map((y) => (
							<rect key={y} x={b.x0 + 0.6} y={-y} width={b.x1 - b.x0 - 1.2} height={0.06} fill="#C9B88E" />
						))}
						{GOODS.map((g, i) => (
							<rect key={i} x={b.x0 + g.x} y={-g.y - g.h} width={0.22} height={g.h} fill={g.c} opacity={0.75} />
						))}
						{[0.33, 0.66].map((p) => (
							<rect key={p} x={b.x0 + 0.4 + (b.x1 - b.x0 - 0.8) * p - 0.04} y={-2.35} width={0.08} height={2.15} fill="#C9B88E" />
						))}
					</g>
				)}
				{b.shop === 'shutter' && (
					<g>
						<rect x={b.x0 + 0.4} y={-2.5} width={b.x1 - b.x0 - 0.8} height={2.5} fill="#2B3445" />
						{Array.from({length: 12}, (_, i) => (
							<rect key={i} x={b.x0 + 0.4} y={-2.4 + i * 0.2} width={b.x1 - b.x0 - 0.8} height={0.05} fill="#222A38" />
						))}
						<rect x={b.x0 + 0.4} y={-3.0} width={b.x1 - b.x0 - 0.8} height={0.45} fill={C.redDeep} />
					</g>
				)}
			</g>
		))}
		{WINDOWS.map((w, i) => (
			<g key={i}>
				<rect x={w.x} y={-w.y - w.h} width={w.w} height={w.h} fill={w.lit ? C.amber : '#10151E'} opacity={w.lit ? w.lit : 1} />
				{w.grill &&
					[0.2, 0.4, 0.6, 0.8].map((p) => <rect key={p} x={w.x + w.w * p - 0.03} y={-w.y - w.h - 0.1} width={0.06} height={w.h + 0.2} fill="#3A4558" />)}
				{w.ac && <rect x={w.x + w.w + 0.08} y={-w.y - 0.55} width={0.62} height={0.45} fill="#323C4E" />}
			</g>
		))}
		{/* rooftop: water tanks and a tin shack, the Taipei skyline staple */}
		<g>
			{[-6.6, -4.4].map((x) => (
				<g key={x}>
					<rect x={x} y={-HERO.n * FH - 1.4} width={0.12} height={0.8} fill="#2A3446" />
					<rect x={x + 1.2} y={-HERO.n * FH - 1.4} width={0.12} height={0.8} fill="#2A3446" />
					<rect x={x - 0.1} y={-HERO.n * FH - 3.1} width={1.6} height={1.8} rx={0.5} fill="#2F3A4D" />
				</g>
			))}
			<rect x={0.8} y={-HERO.n * FH - 3.2} width={6.4} height={2.6} fill="#232C3C" />
			<path d={`M0.5 ${-HERO.n * FH - 3.1} L4 ${-HERO.n * FH - 3.9} L7.5 ${-HERO.n * FH - 3.1} Z`} fill="#2C3648" />
			<rect x={2} y={-HERO.n * FH - 2.4} width={1.2} height={0.9} fill={C.amber} opacity={0.55} />
		</g>
	</g>
);

/** Gentle drifts on the snow surface; flat while the snow is still shallow. */
export const bump = (x: number) => 0.28 * Math.sin(x * 0.55 + 0.6) + 0.16 * Math.sin(x * 1.37 + 2.1) + 0.08 * Math.sin(x * 3.1);
export const snowTop = (x: number, h: number) => h + bump(x) * Math.min(1, h / 2);

const snowPath = (h: number) => {
	let d = '';
	for (let x = -70; x <= 90; x += 0.8) d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${(-snowTop(x, h)).toFixed(3)} `;
	return d + 'L90 40 L-70 40 Z';
};
/** The snow, plus a faint dashed "x-ray" of the buildings and the tall building's floors buried under it. */
const Snow: React.FC<{h: number}> = ({h}) => {
	if (h <= 0.01) return null;
	const d = snowPath(h);
	return (
		<g>
			<defs>
				<clipPath id="hp-under" clipPathUnits="userSpaceOnUse">
					<path d={d} />
				</clipPath>
			</defs>
			<path d={d} fill="url(#hp-snow)" />
			<g clipPath="url(#hp-under)" fill="none" stroke="#7D90AE" strokeWidth={0.14} strokeDasharray="0.7 0.45" opacity={0.75}>
				{BLDGS.map((b) => (
					<rect key={b.seed} x={b.x0} y={-b.n * FH - 0.6} width={b.x1 - b.x0} height={b.n * FH + 0.6} />
				))}
				{Array.from({length: HERO.n - 1}, (_, i) => (
					<line key={i} x1={HERO.x0} x2={HERO.x1} y1={-(i + 1) * FH} y2={-(i + 1) * FH} strokeWidth={0.1} />
				))}
			</g>
			<path d={d} fill="none" stroke="#FFFFFF" strokeWidth={0.18} opacity={0.9} />
		</g>
	);
};

export const PERSON_X = 11.4;
/** A small figure in a yellow raincoat, feet at (x, y). */
export const Person: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x} ${-y})`}>
		<rect x={-0.15} y={-0.82} width={0.12} height={0.82} fill="#2B3446" />
		<rect x={0.03} y={-0.82} width={0.12} height={0.82} fill="#2B3446" />
		<path d="M-0.22 -1.42 L0.22 -1.42 L0.32 -0.7 L-0.32 -0.7 Z" fill={C.amber} />
		<path d="M-0.22 -1.4 L-0.34 -0.95 L-0.27 -0.92 L-0.16 -1.25 Z" fill="#E59A12" />
		<path d="M0.22 -1.4 L0.34 -0.95 L0.27 -0.92 L0.16 -1.25 Z" fill="#E59A12" />
		<circle cx={0} cy={-1.57} r={0.15} fill={C.amber} />
		<circle cx={0.03} cy={-1.55} r={0.1} fill="#E9C6A2" />
	</g>
);

const Scooter: React.FC = () => (
	<g transform="translate(5.6 0)">
		<circle cx={0.35} cy={-0.27} r={0.27} fill="#0A0D12" stroke="#3B4558" strokeWidth={0.06} />
		<circle cx={1.65} cy={-0.27} r={0.27} fill="#0A0D12" stroke="#3B4558" strokeWidth={0.06} />
		<path d="M0.05 -0.45 Q0.1 -0.85 0.55 -0.86 L1.05 -0.86 L1.25 -0.45 L1.45 -0.45 L1.55 -1.15 L1.75 -1.15 L1.85 -0.4 L0.05 -0.4 Z" fill="#46597A" />
		<rect x={0.15} y={-0.98} width={0.8} height={0.14} rx={0.07} fill="#1A2130" />
		<rect x={1.48} y={-1.28} width={0.45} height={0.08} fill="#1A2130" />
		<rect x={0.0} y={-0.72} width={0.1} height={0.12} fill={C.red} />
	</g>
);

/** The clear measuring tank from the rain scene, filled to `water` metres. */
export const TANK = {x0: 12.7, x1: 14.1, top: 2.8};
const Tank: React.FC<{water: number; o: number}> = ({water, o}) => (
	<g opacity={o}>
		<rect x={TANK.x0} y={-TANK.top} width={TANK.x1 - TANK.x0} height={TANK.top} fill="#8CB4E6" opacity={0.1} />
		<rect x={TANK.x0} y={-water} width={TANK.x1 - TANK.x0} height={water} fill="#3D8BFF" opacity={0.62} />
		<rect x={TANK.x0} y={-water - 0.02} width={TANK.x1 - TANK.x0} height={0.05} fill="#BFDBFF" />
		<rect x={TANK.x0} y={-TANK.top} width={TANK.x1 - TANK.x0} height={TANK.top} fill="none" stroke="#A9C7EA" strokeWidth={0.04} opacity={0.8} />
		{Array.from({length: 6}, (_, i) => (
			<rect key={i} x={TANK.x1} y={-(i + 1) * 0.5 - 0.01} width={i % 2 ? 0.22 : 0.12} height={0.02} fill="#A9C7EA" />
		))}
	</g>
);

// ---------- far layer: Taipei 101 and the low skyline ----------
const T101: React.FC = () => {
	const mods = Array.from({length: 8}, (_, i) => -350 - i * 78);
	return (
		<g>
			<path d="M-82 0 L82 0 L58 -330 L-58 -330 Z" fill="#1A2233" />
			<rect x={-50} y={-352} width={100} height={24} fill="#1A2233" />
			{mods.map((y0) => (
				<g key={y0}>
					<path d={`M-48 ${y0} L48 ${y0} L64 ${y0 - 78} L-64 ${y0 - 78} Z`} fill="#1C2537" />
					<rect x={-64} y={y0 - 79} width={128} height={2.5} fill={C.amber} opacity={0.35} />
				</g>
			))}
			<path d="M-40 -974 L40 -974 L34 -1030 L-34 -1030 Z" fill="#1C2537" />
			<path d="M-22 -1030 L22 -1030 L18 -1072 L-18 -1072 Z" fill="#1C2537" />
			<path d="M-4 -1072 L4 -1072 L1.5 -1232 L-1.5 -1232 Z" fill="#26304A" />
			<circle cx={0} cy={-1232} r={3} fill={C.red} opacity={0.8} />
		</g>
	);
};
const FAR = (() => {
	const r = rng(77);
	const out: {x: number; w: number; h: number}[] = [];
	for (let x = -300; x < 1400; ) {
		const w = 50 + r() * 90;
		out.push({x, w, h: 90 + r() * 260});
		x += w + 4;
	}
	return out;
})();

/** Night sky + far skyline. Parallax: moves at ~35% of the street's motion, fades out when the camera dives in. */
const Far: React.FC<{cam: Cam}> = ({cam}) => {
	const ref = 30;
	const dx = (sx(cam, ref) - sx(WIDE, ref)) * 0.35;
	const dy = (sy(cam, 0) - sy(WIDE, 0)) * 0.35;
	const sc = Math.pow(cam.k / WIDE.k, 0.3);
	const o = Math.max(0, Math.min(1, (60 - cam.k) / 30));
	if (o <= 0) return null;
	return (
		<g opacity={o} transform={`translate(${540 + dx} ${1700 + dy}) scale(${sc}) translate(-540 -1700)`}>
			{FAR.map((b, i) => (
				<rect key={i} x={b.x} y={1700 - b.h} width={b.w} height={b.h + 400} fill="#111725" />
			))}
			<g transform="translate(868 1700)">
				<T101 />
			</g>
		</g>
	);
};

/** The whole street at camera `cam`, snow `snow` metres deep. Screen-space sky; world-space everything else. */
export const City: React.FC<{cam: Cam; snow: number; water?: number; tankO?: number}> = ({cam, snow, water = 0, tankO = 0}) => {
	const feet = snow > 0.01 ? snowTop(PERSON_X, snow) : 0;
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<linearGradient id="hp-sky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#05070D" />
					<stop offset="0.55" stopColor="#0C1322" />
					<stop offset="1" stopColor="#1A2540" />
				</linearGradient>
				<linearGradient id="hp-snow" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
					<stop offset="0" stopColor="#F5F8FC" />
					<stop offset="0.25" stopColor="#E3EAF3" />
					<stop offset="1" stopColor="#B7C5D8" />
				</linearGradient>
			</defs>
			<rect width={1080} height={1920} fill="url(#hp-sky)" />
			<Far cam={cam} />
			<g transform={`translate(${540 - cam.cx * cam.k} ${960 + cam.cy * cam.k}) scale(${cam.k})`}>
				<Buildings />
				<rect x={-120} y={0} width={260} height={60} fill="#0A0E15" />
				<rect x={-120} y={-0.04} width={260} height={0.18} fill="#2A3344" />
				<Scooter />
				{tankO > 0 && <Tank water={water} o={tankO} />}
				<Snow h={snow} />
				<Person x={PERSON_X} y={feet} />
			</g>
		</svg>
	);
};

// ---------- weather overlays (screen space) ----------
// Rain is periodic over the whole film (each streak wraps a whole number of times in TOTAL frames), so the last frame
// flows into frame 0 on replay.
const SPAN = 2300;
const DROPS = (() => {
	const r = rng(2024);
	return Array.from({length: 150}, () => ({x: r() * 1400 - 100, y: r() * SPAN, n: 34 + Math.floor(r() * 14), len: 45 + r() * 60, o: 0.16 + r() * 0.26, w: 1.6 + r() * 1.6}));
})();
export const Rain: React.FC<{g: number; o: number}> = ({g, o}) => {
	if (o <= 0) return null;
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
			{DROPS.map((d, i) => {
				const y = ((d.y + (d.n * SPAN * g) / TOTAL) % SPAN) - 200;
				const x = d.x - y * 0.12;
				return <line key={i} x1={x} y1={y} x2={x + d.len * 0.12} y2={y - d.len} stroke="#A8C4E8" strokeWidth={d.w} strokeLinecap="round" opacity={d.o} />;
			})}
		</svg>
	);
};

const FLAKES = (() => {
	const r = rng(909);
	return Array.from({length: 120}, () => ({x: r() * 1160 - 40, y: r() * 2100, v: 1.6 + r() * 2.6, r: 2 + r() * 4.5, ph: r() * 6.28, a: 10 + r() * 22, o: 0.45 + r() * 0.5}));
})();
export const Flakes: React.FC<{g: number; o: number; speed?: number}> = ({g, o, speed = 1}) => {
	if (o <= 0) return null;
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
			{FLAKES.map((p, i) => {
				const y = ((p.y + p.v * speed * g) % 2100) - 90;
				const x = p.x + Math.sin(g * 0.03 + p.ph) * p.a;
				return <circle key={i} cx={x} cy={y} r={p.r} fill="#FFFFFF" opacity={p.o} />;
			})}
		</svg>
	);
};

// ---------- snowflake glyph ----------
export const Crystal: React.FC<{size: number; color?: string; sw?: number}> = ({size, color = '#DDEBFF', sw = 6}) => (
	<svg width={size} height={size} viewBox="-50 -50 100 100">
		{[0, 60, 120].map((a) => (
			<g key={a} transform={`rotate(${a})`} stroke={color} strokeWidth={sw} strokeLinecap="round">
				<line x1={0} y1={-44} x2={0} y2={44} />
				<line x1={0} y1={-26} x2={-12} y2={-38} />
				<line x1={0} y1={-26} x2={12} y2={-38} />
				<line x1={0} y1={26} x2={-12} y2={38} />
				<line x1={0} y1={26} x2={12} y2={38} />
			</g>
		))}
	</svg>
);

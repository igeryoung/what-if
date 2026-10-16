import React from 'react';
import {C} from '../../engine/kit/theme';

/** Seeded PRNG (deterministic per seed). */
export const rng = (seed: number) => {
	let x = seed % 2147483647;
	if (x <= 0) x += 2147483646;
	return () => (x = (x * 16807) % 2147483647) / 2147483647;
};

export const PAD = C.amber; // sticky pads are always amber
export const PAD_DARK = '#B9760A';
export const SKIN = '#D9CEC1'; // human silhouette
export const GECKO = C.green;
export const GECKO_DARK = '#1F8F57';
export const GLASS_LINE = '#1C2531';

// ---------------------------------------------------------------- glass facade
/** Full-screen glass curtain wall. `shift` scrolls it vertically (px), for climbing. */
export const Glass: React.FC<{shift?: number; opacity?: number}> = ({shift = 0, opacity = 1}) => {
	const COL = 216;
	const ROW = 288;
	const off = ((shift % ROW) + ROW) % ROW;
	const rows = Array.from({length: 9}, (_, i) => -ROW + off + i * ROW);
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, opacity}}>
			<defs>
				<linearGradient id="gl-bg" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#15202B" />
					<stop offset="0.55" stopColor="#0F161E" />
					<stop offset="1" stopColor="#0A0E13" />
				</linearGradient>
			</defs>
			<rect x={0} y={0} width={1080} height={1920} fill="url(#gl-bg)" />
			{rows.map((y, r) =>
				Array.from({length: 5}, (_, c) => {
					const x = c * COL;
					return <path key={`${r}-${c}`} d={`M ${x + 30} ${y + ROW} L ${x + 120} ${y} L ${x + 165} ${y} L ${x + 75} ${y + ROW} Z`} fill="#FFFFFF" opacity={0.028} />;
				}),
			)}
			{Array.from({length: 6}, (_, c) => (
				<rect key={c} x={c * COL - 5} y={0} width={10} height={1920} fill={GLASS_LINE} />
			))}
			{rows.map((y, r) => (
				<rect key={r} x={0} y={y - 4} width={1080} height={8} fill={GLASS_LINE} />
			))}
		</svg>
	);
};

// ---------------------------------------------------------------- gecko (top-down, head up)
type Pt = [number, number];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];

const Foot: React.FC<{at: Pt; from: Pt; color: string}> = ({at, from, color}) => {
	const base = Math.atan2(at[1] - from[1], at[0] - from[0]);
	return (
		<g>
			{[-1.25, -0.62, 0, 0.62, 1.25].map((da, i) => {
				const a = base + da;
				const tip: Pt = [at[0] + Math.cos(a) * 20, at[1] + Math.sin(a) * 20];
				return (
					<g key={i}>
						<line x1={at[0]} y1={at[1]} x2={tip[0]} y2={tip[1]} stroke={color} strokeWidth={6} strokeLinecap="round" />
						<ellipse cx={tip[0]} cy={tip[1]} rx={6} ry={8.5} fill={PAD} transform={`rotate(${(a * 180) / Math.PI + 90} ${tip[0]} ${tip[1]})`} />
					</g>
				);
			})}
		</g>
	);
};

/** Gecko seen from above (= on a wall), head toward −y, ~340 px long at scale 1. `phase`/`step` drive the trot. */
export const Gecko: React.FC<{x: number; y: number; rot?: number; scale?: number; phase?: number; step?: number}> = ({x, y, rot = 0, scale = 1, phase = 0, step = 0}) => {
	const legs: {hip: Pt; knee: Pt; foot: Pt; ph: number}[] = [
		{hip: [-22, -58], knee: [-58, -64], foot: [-66, -98], ph: 0},
		{hip: [22, -58], knee: [58, -64], foot: [66, -98], ph: Math.PI},
		{hip: [-22, 22], knee: [-60, 28], foot: [-70, 60], ph: Math.PI},
		{hip: [22, 22], knee: [60, 28], foot: [70, 60], ph: 0},
	];
	const sway = Math.sin(phase) * step * 5;
	return (
		<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
			<g transform={`rotate(${sway})`}>
				{legs.map((l, i) => {
					const o = Math.sin(phase + l.ph) * step;
					const knee = add(l.knee, [0, -9 * o]);
					const foot = add(l.foot, [0, -20 * o]);
					return (
						<g key={i}>
							<polyline points={`${l.hip[0]},${l.hip[1]} ${knee[0]},${knee[1]} ${foot[0]},${foot[1]}`} fill="none" stroke={GECKO} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
							<Foot at={foot} from={knee} color={GECKO} />
						</g>
					);
				})}
				<path d={`M -14 30 C -20 90 ${-4 - sway} 140 ${30 - sway * 3} 188 C ${12 - sway} 145 6 95 14 30 Z`} fill={GECKO} />
				<ellipse cx={0} cy={-18} rx={33} ry={66} fill={GECKO} />
				<ellipse cx={0} cy={-82} rx={21} ry={20} fill={GECKO} />
				<path d="M -28 -104 C -30 -134 -14 -152 0 -153 C 14 -152 30 -134 28 -104 C 24 -88 -24 -88 -28 -104 Z" fill={GECKO} />
				{[[-12, -42, 6], [11, -24, 7], [-9, 2, 6], [12, 24, 5], [-3, -64, 4.5], [-5, 52, 4.5], [6, 82, 4], [10, 112, 3.5]].map(([cx, cy, r], i) => (
					<circle key={i} cx={cx} cy={cy} r={r} fill={GECKO_DARK} />
				))}
				{[-1, 1].map((sx) => (
					<g key={sx}>
						<circle cx={sx * 22} cy={-118} r={9} fill="#F2E28C" />
						<ellipse cx={sx * 22} cy={-118} rx={2.2} ry={6.5} fill={C.bg} />
					</g>
				))}
			</g>
		</g>
	);
};

// ---------------------------------------------------------------- human silhouette (cm, h = height above ground)
type Shape = {k: 'c'; x: number; h: number; r: number} | {k: 's'; a: Pt; b: Pt; r: number} | {k: 'p'; pts: Pt[]};
export type Pose = 'down' | 'up';

const mirror = (shapes: Shape[]): Shape[] =>
	shapes.flatMap((sh): Shape[] => {
		if (sh.k === 'c') return [sh, {...sh, x: -sh.x}];
		if (sh.k === 's') return [sh, {...sh, a: [-sh.a[0], sh.a[1]] as Pt, b: [-sh.b[0], sh.b[1]] as Pt}];
		return [sh];
	});

const CORE: Shape[] = [
	{k: 'c', x: 0, h: 167, r: 11},
	{k: 's', a: [0, 150], b: [0, 158], r: 5},
	{k: 'p', pts: [[-20, 152], [20, 152], [23, 145], [17, 110], [18.5, 90], [-18.5, 90], [-17, 110], [-23, 145]]},
];
const LIMBS: Record<Pose, Shape[]> = {
	down: mirror([
		{k: 'c', x: -19, h: 146, r: 6},
		{k: 's', a: [-23, 145], b: [-26, 112], r: 4.8},
		{k: 's', a: [-26, 112], b: [-28, 84], r: 4},
		{k: 'c', x: -28.5, h: 79, r: 5},
		{k: 's', a: [-9, 90], b: [-9.5, 50], r: 7.5},
		{k: 's', a: [-9.5, 50], b: [-9.5, 8], r: 5.5},
		{k: 's', a: [-12, 3.5], b: [-7, 3.5], r: 3.5},
	]),
	up: mirror([
		{k: 'c', x: -19, h: 146, r: 6},
		{k: 's', a: [-21, 147], b: [-31, 171], r: 4.8},
		{k: 's', a: [-31, 171], b: [-36, 196], r: 4},
		{k: 'c', x: -37, h: 201, r: 5.5},
		{k: 's', a: [-9, 90], b: [-11.5, 50], r: 7.5},
		{k: 's', a: [-11.5, 50], b: [-13, 8], r: 5.5},
		{k: 's', a: [-16, 3.5], b: [-10, 3.5], r: 3.5},
	]),
};
// Capsules become filled polygons: SVG clip paths ignore strokes, so a stroked line would not clip the pad fill.
const capsule = (a: Pt, b: Pt, r: number): Pt[] => {
	const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
	const arc = (c: Pt, from: number): Pt[] => Array.from({length: 9}, (_, i) => [c[0] + r * Math.cos(from + (i / 8) * Math.PI), c[1] + r * Math.sin(from + (i / 8) * Math.PI)]);
	return [...arc(b, ang - Math.PI / 2), ...arc(a, ang + Math.PI / 2)];
};
const SHAPES: Partial<Record<Pose, Shape[]>> = {};
const shapesOf = (pose: Pose) =>
	(SHAPES[pose] ??= [...CORE, ...LIMBS[pose]].map((sh): Shape => (sh.k === 's' ? {k: 'p', pts: capsule(sh.a, sh.b, sh.r)} : sh)));

const segDist = (p: Pt, a: Pt, b: Pt) => {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
	return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
};
const inPoly = (p: Pt, pts: Pt[]) => {
	let inside = false;
	for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
		const [xi, yi] = pts[i];
		const [xj, yj] = pts[j];
		if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
	}
	return inside;
};
const inside = (p: Pt, shapes: Shape[]) =>
	shapes.some((sh) => (sh.k === 'c' ? Math.hypot(p[0] - sh.x, p[1] - sh.h) <= sh.r : sh.k === 's' ? segDist(p, sh.a, sh.b) <= sh.r : inPoly(p, sh.pts)));

// Silhouette area per 0.5 cm row, so a fill can cover exactly a given share of the figure's area.
const ROWS: Partial<Record<Pose, number[]>> = {};
const rowsOf = (pose: Pose) => {
	if (!ROWS[pose]) {
		const sh = shapesOf(pose);
		const rows: number[] = [];
		for (let h = 0.25; h < 215; h += 0.5) {
			let n = 0;
			for (let x = -59.75; x < 60; x += 0.5) if (inside([x, h], sh)) n++;
			rows.push(n);
		}
		ROWS[pose] = rows;
	}
	return ROWS[pose]!;
};
/** Height (cm) below which `frac` of the silhouette's area lies. */
export const fillLevel = (pose: Pose, frac: number) => {
	const rows = rowsOf(pose);
	const total = rows.reduce((a, b) => a + b, 0);
	let cum = 0;
	for (let i = 0; i < rows.length; i++) {
		if (cum + rows[i] >= frac * total) return (i + (frac * total - cum) / Math.max(1, rows[i])) * 0.5;
		cum += rows[i];
	}
	return 215;
};

const ShapeEl: React.FC<{sh: Shape; fill: string}> = ({sh, fill}) => {
	if (sh.k === 'c') return <circle cx={sh.x} cy={-sh.h} r={sh.r} fill={fill} />;
	if (sh.k === 's') return <line x1={sh.a[0]} y1={-sh.a[1]} x2={sh.b[0]} y2={-sh.b[1]} stroke={fill} strokeWidth={sh.r * 2} strokeLinecap="round" />;
	return <polygon points={sh.pts.map(([x, h]) => `${x},${-h}`).join(' ')} fill={fill} />;
};
const HAIR = '#4B3D33';

/**
 * Standing person, front or back view. `x`,`y` = feet center on the ground (px), `k` = px per cm (180 cm tall).
 * `fill` 0..1 = share of the silhouette's area covered by amber sticky pad, rising from the feet.
 */
export const Person: React.FC<{id: string; x: number; y: number; k: number; pose?: Pose; fill?: number; color?: string; view?: 'front' | 'back'}> = ({id, x, y, k, pose = 'down', fill = 0, color = SKIN, view = 'front'}) => {
	const shapes = shapesOf(pose);
	const level = fill > 0 ? fillLevel(pose, Math.min(1, fill)) : 0;
	return (
		<g transform={`translate(${x} ${y}) scale(${k})`}>
			<defs>
				<clipPath id={`clip-${id}`}>
					{shapes.map((sh, i) => (
						<ShapeEl key={i} sh={sh} fill="#000" />
					))}
				</clipPath>
			</defs>
			{shapes.map((sh, i) => (
				<ShapeEl key={i} sh={sh} fill={color} />
			))}
			{view === 'back' ? (
				<circle cx={0} cy={-167.4} r={11.2} fill={HAIR} />
			) : (
				<path d="M -10.9 -169 A 11.1 11.1 0 0 1 10.9 -169 Q 6 -172.5 0 -171 Q -6 -172.5 -10.9 -169 Z" fill={HAIR} />
			)}
			{level > 0 && (
				<g clipPath={`url(#clip-${id})`}>
					<rect x={-60} y={-level} width={120} height={level + 2} fill={PAD} />
					{Array.from({length: Math.floor(level / 5)}, (_, i) => (
						<line key={i} x1={-60} x2={60} y1={-(i + 1) * 5 + 1} y2={-(i + 1) * 5 + 1} stroke={PAD_DARK} strokeWidth={1.1} />
					))}
					<rect x={-60} y={-level} width={120} height={1.2} fill="#FFE2A0" />
				</g>
			)}
		</g>
	);
};

// ---------------------------------------------------------------- macro gecko foot (underside), for the toe zoom
/** Five broad toes with amber lamellae, palm at (cx, cy). */
const TOE = 'M -22 0 L -26 -110 C -58 -150 -60 -300 0 -340 C 60 -300 58 -150 26 -110 L 22 0 Z';
const TOE_PAD = 'M -24 -128 C -48 -165 -48 -290 0 -322 C 48 -290 48 -165 24 -128 Z';
export const BigFoot: React.FC<{cx: number; cy: number}> = ({cx, cy}) => (
	<g transform={`translate(${cx} ${cy}) rotate(-14)`}>
		<defs>
			<clipPath id="toe-pad">
				<path d={TOE_PAD} />
			</clipPath>
		</defs>
		<g transform="rotate(40)">
			<path d="M -80 30 C -100 200 -110 400 -120 800 L 120 800 C 110 400 100 200 80 30 Z" fill={GECKO} />
			{[[-30, 180, 12], [40, 260, 10], [-50, 380, 13], [30, 470, 11], [-20, 600, 12]].map(([x, y, r], i) => (
				<circle key={i} cx={x} cy={y} r={r} fill={GECKO_DARK} />
			))}
		</g>
		{[-78, -40, 0, 38, 74].map((deg, i) => (
			<g key={i} transform={`rotate(${deg}) translate(0 -60) scale(${[0.86, 0.97, 1, 0.95, 0.82][i]})`}>
				<path d={TOE} fill={GECKO} />
				<path d={TOE_PAD} fill="#3A2E14" />
				<g clipPath="url(#toe-pad)">
					{Array.from({length: 10}, (_, j) => {
						const yy = -138 - j * 19;
						return <path key={j} d={`M -46 ${yy + 10} Q 0 ${yy - 14} 46 ${yy + 10}`} stroke={PAD} strokeWidth={9} strokeLinecap="round" fill="none" />;
					})}
				</g>
				<path d="M -5 -336 L 0 -354 L 5 -336 Z" fill="#E9E3D6" />
			</g>
		))}
		<ellipse cx={0} cy={0} rx={96} ry={88} fill={GECKO} />
		{[[-30, -10, 7], [24, 18, 6], [-6, 34, 5], [34, -22, 5]].map(([x, y, r], i) => (
			<circle key={i} cx={x} cy={y} r={r} fill={GECKO_DARK} />
		))}
	</g>
);

// ---------------------------------------------------------------- mite (top-down)
export const Mite: React.FC<{x: number; y: number; scale?: number}> = ({x, y, scale = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${scale})`}>
		{[-1, 1].map((sx) =>
			[-24, -8, 8, 24].map((yy, i) => (
				<polyline key={`${sx}${i}`} points={`${sx * 14},${yy * 0.6} ${sx * 34},${yy - 6} ${sx * 46},${yy + (i - 1.5) * 8}`} fill="none" stroke="#C9665A" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
			)),
		)}
		<ellipse cx={0} cy={4} rx={22} ry={28} fill="#C9665A" />
		<ellipse cx={0} cy={-26} rx={10} ry={9} fill="#C9665A" />
	</g>
);

// ---------------------------------------------------------------- sneaker (side view)
/** Side-view sneaker, toe to the right. `x`,`y` = heel on the ground, `len` = sole length (px). */
export const Shoe: React.FC<{x: number; y: number; len: number; color?: string}> = ({x, y, len, color = '#E8E4DC'}) => (
	<g transform={`translate(${x} ${y}) scale(${len / 100})`}>
		<path d="M 2 -6 L 2 -30 C 2 -38 8 -40 14 -40 L 30 -40 C 36 -40 38 -34 44 -30 C 56 -24 74 -22 88 -19 C 97 -17 100 -12 100 -7 L 100 -6 Z" fill={color} />
		<path d="M 0 0 L 0 -8 L 100 -8 L 100 -3 C 100 -1 98 0 96 0 Z" fill={PAD} />
		<path d="M 22 -38 L 40 -26 M 30 -40 L 48 -27" stroke="#9A958C" strokeWidth={2} strokeLinecap="round" />
	</g>
);

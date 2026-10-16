import React from 'react';
import {C} from '../../engine/kit/theme';

// American cockroach palette: glossy red-brown wings, pale-rimmed pronotum.
export const R = {
	wing: '#8E431D',
	wingHi: '#C9703A',
	wingDk: '#5A250E',
	pron: '#3E180A',
	rim: '#E2BA70',
	leg: '#8A4420',
	legFar: '#4E230F',
	ant: '#9A4E24',
	edge: '#2A1007',
};

const TAU = Math.PI * 2;
type P = [number, number];

const rotP = (p: P, c: P, a: number): P => {
	const s = Math.sin(a);
	const co = Math.cos(a);
	const x = p[0] - c[0];
	const y = p[1] - c[1];
	return [c[0] + x * co - y * s, c[1] + x * s + y * co];
};

// Two-segment leg: knee from hip, foot and segment lengths; `bend` ±1 picks the side the knee points to.
const ik = (h: P, f: P, a: number, b: number, bend: number): P => {
	const dx = f[0] - h[0];
	const dy = f[1] - h[1];
	const d = Math.max(0.01, Math.min(Math.hypot(dx, dy), a + b - 0.01));
	const base = Math.atan2(dy, dx);
	const al = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
	const k1: P = [h[0] + a * Math.cos(base + al), h[1] + a * Math.sin(base + al)];
	const k2: P = [h[0] + a * Math.cos(base - al), h[1] + a * Math.sin(base - al)];
	// insect knees point up; `bend` only breaks ties
	if (Math.abs(k1[1] - k2[1]) < 0.5) return bend > 0 ? k1 : k2;
	return k1[1] < k2[1] ? k1 : k2;
};

// Short spines along the tibia, pointing back from the leg.
const spines = (k: P, f: P, side: number, len = 3.2) => {
	const dx = f[0] - k[0];
	const dy = f[1] - k[1];
	const l = Math.hypot(dx, dy) || 1;
	const nx = (-dy / l) * side;
	const ny = (dx / l) * side;
	return [0.3, 0.55, 0.8]
		.map((u) => {
			const x = k[0] + dx * u;
			const y = k[1] + dy * u;
			return `M${x} ${y} L${x + nx * len + (dx / l) * len * 0.6} ${y + ny * len + (dy / l) * len * 0.6}`;
		})
		.join(' ');
};

const LegPath: React.FC<{h: P; k: P; f: P; color: string; w: number; side: number}> = ({h, k, f, color, w, side}) => (
	<g stroke={color} strokeLinecap="round" strokeLinejoin="round" fill="none">
		<path d={`M${h[0]} ${h[1]} L${k[0]} ${k[1]}`} strokeWidth={w * 1.4} />
		<path d={`M${k[0]} ${k[1]} L${f[0]} ${f[1]}`} strokeWidth={w} />
		<path d={spines(k, f, side)} strokeWidth={w * 0.45} />
	</g>
);

// ---------- Top view (dorsal), head up. Unit body: head front y=-50 → wing tips y=+50. ----------
const LEGS_TOP: {h: P; k: P; f: P; g: 0 | 1}[] = [
	{h: [6, -22], k: [21, -31], f: [28, -50], g: 0},
	{h: [8, -12], k: [29, -12], f: [43, 3], g: 1},
	{h: [8, -2], k: [27, 16], f: [36, 54], g: 0},
];

export const RoachTop: React.FC<{
	x: number;
	y: number;
	len: number; // body length in px (head to wing tips)
	rot?: number; // degrees; 90 = head right
	phase?: number; // gait cycles
	amp?: number; // leg swing (rad)
	sway?: number; // antenna sway in units
	tip?: P; // right antenna tip (units)
}> = ({x, y, len, rot = 0, phase = 0, amp = 0.2, sway = 0, tip = [44, -150]}) => {
	const k = len / 100;
	const legs = [1, -1].flatMap((side) =>
		LEGS_TOP.map((L, i) => {
			const grp = side === 1 ? L.g : 1 - L.g;
			const a = amp * Math.sin(TAU * phase + (grp ? Math.PI : 0));
			const kn = rotP(L.k, L.h, a);
			const ft = rotP(L.f, L.h, a);
			return (
				<g key={`${side}${i}`} transform={`scale(${side} 1)`}>
					<LegPath h={L.h} k={kn} f={ft} color={R.leg} w={2.6} side={i === 0 ? -1 : 1} />
				</g>
			);
		}),
	);
	const ant = (sd: number) => {
		const w = sway * (sd === 1 ? 1 : -0.8);
		const tx = (tip[0] + w * 1.6) * sd;
		const ty = tip[1] + Math.abs(w) * 0.3;
		return `M${3 * sd} -47 C${10 * sd} -70 ${(tip[0] * 0.35 + w) * sd} ${tip[1] * 0.75} ${tx} ${ty}`;
	};
	return (
		<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>
			{legs}
			<g stroke={R.ant} strokeWidth={1.5} strokeLinecap="round" fill="none">
				<path d={ant(1)} />
				<path d={ant(-1)} />
			</g>
			<path d="M4 44 L9 57 M-4 44 L-9 57" stroke={R.wingDk} strokeWidth={2.2} strokeLinecap="round" />
			<ellipse cx={0} cy={36} rx={13} ry={12} fill={R.wingDk} />
			{/* tegmina */}
			<path d="M0 -21 C19 -21 21 2 19 22 C17 40 9 49 0 50 C-9 49 -17 40 -19 22 C-21 2 -19 -21 0 -21 Z" fill={R.wing} stroke={R.edge} strokeWidth={1.2} />
			<path d="M-11 -14 C-15 4 -14 24 -9 40" stroke={R.wingHi} strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={0.55} />
			<path d="M8 -12 C12 6 11 26 6 42" stroke={R.wingDk} strokeWidth={1} fill="none" opacity={0.6} />
			<path d="M2 -20 C3 8 2 32 -1 49" stroke={R.edge} strokeWidth={1.3} fill="none" />
			{/* head under the pronotum */}
			<ellipse cx={0} cy={-45} rx={7} ry={5} fill={R.pron} />
			<ellipse cx={-5} cy={-46} rx={2} ry={2.6} fill="#120604" />
			<ellipse cx={5} cy={-46} rx={2} ry={2.6} fill="#120604" />
			{/* pronotum: pale rim, dark centre */}
			<path d="M0 -43 C12 -43 20 -36 20 -27 C20 -20 14 -17 0 -17 C-14 -17 -20 -20 -20 -27 C-20 -36 -12 -43 0 -43 Z" fill={R.rim} stroke={R.edge} strokeWidth={1} />
			<path d="M0 -40 C10 -40 16.5 -34 16.5 -27.5 C16.5 -22 12 -19.5 0 -19.5 C-12 -19.5 -16.5 -22 -16.5 -27.5 C-16.5 -34 -10 -40 0 -40 Z" fill="#5C240D" />
			<path d="M-10 -36 C-6 -38.5 6 -38.5 10 -36" stroke={R.wingHi} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.6} />
		</g>
	);
};

// ---------- Side view, facing right. Unit body length 100 (tail x=-50 → head x=+50), ground y=0. ----------
export const RoachSide: React.FC<{
	x: number;
	y: number; // ground line
	len: number;
	phase?: number;
	squash?: number; // 0 standing → 1 flattened to 3/7 of its height (body 7 → 3 units of 40)
	pitch?: number; // degrees nose-up, pivoting on the hind hips (bipedal sprint)
	sway?: number;
	flip?: boolean; // face left
	stride?: number;
}> = ({x, y, len, phase = 0, squash = 0, pitch = 0, sway = 0, flip = false, stride = 9}) => {
	const k = len / 100;
	const th = 18 - 11 * squash;
	const yb = -(22 - 21.5 * squash);
	const pr = (pitch * Math.PI) / 180;
	const up = 30 * Math.sin(pr);
	const pv: P = [2, yb];
	// body-space point → scene-space point (rotation about the hind hip, then lift)
	const toWorld = (p: P): P => {
		const r = rotP(p, pv, -pr);
		return [r[0], r[1] - up];
	};
	const Pt = (px: number, f: number) => `${px} ${yb - th * f}`;
	const splay = 1 + 0.9 * squash;
	const legSpec = [
		{hx: 32, bx: 14, a: 14, b: 17, bend: -1, off: 0},
		{hx: 18, bx: 3, a: 16, b: 19, bend: -1, off: Math.PI},
		{hx: 4, bx: -20, a: 21, b: 25, bend: 1, off: 0},
	];
	const foot = (hx: number, bx: number, off: number, lift: number): P => {
		const th2 = TAU * phase + off;
		return [hx + bx * splay - stride * Math.cos(th2), -lift * Math.max(0, Math.sin(th2))];
	};
	// front + middle legs live in body space (they lift off when the body pitches up)
	const bodyLeg = (i: number, far: boolean) => {
		const L = legSpec[i];
		const hip: P = [L.hx + (far ? 3 : 0), yb + 1];
		const f = foot(L.hx, L.bx, L.off + (far ? Math.PI : 0), 7 + pitch * 0.25);
		const fb: P = [f[0], f[1] + (pitch > 0 ? -pitch * 0.35 : 0)];
		const kn = ik(hip, fb, L.a, L.b, L.bend);
		return <LegPath key={`b${i}${far}`} h={hip} k={kn} f={fb} color={far ? R.legFar : R.leg} w={2.8} side={-1} />;
	};
	// hind legs stay planted in scene space so the insect runs on two legs when pitched
	const hindLeg = (far: boolean) => {
		const L = legSpec[2];
		const hip = toWorld([L.hx + (far ? 3 : 0), yb + 1]);
		const f = foot(L.hx, L.bx * (1 - Math.min(0.6, pitch / 60)), L.off + (far ? Math.PI : 0), 9);
		const kn = ik(hip, f, L.a, L.b, L.bend);
		return <LegPath h={hip} k={kn} f={f} color={far ? R.legFar : R.leg} w={3} side={1} />;
	};
	const ha: P = [51, yb - th * 0.3];
	const hs = th / 18;
	const hy = Math.min(yb + 6 * hs - th * 0.3, -7 * hs);
	return (
		<g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`}>
			{hindLeg(true)}
			<g transform={`translate(0 ${-up}) rotate(${-pitch} ${pv[0]} ${pv[1]})`}>
				{bodyLeg(0, true)}
				{bodyLeg(1, true)}
				<g stroke={R.ant} strokeWidth={1.4} strokeLinecap="round" fill="none">
					<path d={`M${ha[0]} ${ha[1]} C68 ${yb - th * 1.3} 96 ${yb - th * 1.9 + sway} 140 ${yb - th * 1.3 + sway * 1.4}`} />
					<path d={`M${ha[0]} ${ha[1]} C70 ${yb - th * 0.9} 102 ${yb - th * 1.1 - sway} 142 ${yb - th * 0.4 - sway}`} opacity={0.7} />
				</g>
				<path d={`M-49 ${yb - th * 0.4} L-60 ${yb - th * 0.75}`} stroke={R.wingDk} strokeWidth={2.2} strokeLinecap="round" />
				<path d={`M${Pt(-44, 0.22)} C${Pt(-30, -0.2)} ${Pt(6, -0.2)} ${Pt(26, 0.05)} L${Pt(26, 0.35)} C${Pt(0, 0.3)} ${Pt(-30, 0.35)} ${Pt(-44, 0.22)} Z`} fill={R.wingDk} />
				<path d={`M${Pt(-52, 0.45)} C${Pt(-46, 1.02)} ${Pt(6, 1.1)} ${Pt(24, 1.0)} L${Pt(24, 0.22)} C${Pt(4, 0.02)} ${Pt(-30, 0.05)} ${Pt(-47, 0.22)} Z`} fill={R.wing} stroke={R.edge} strokeWidth={1.2} />
				<path d={`M${Pt(-40, 0.8)} C${Pt(-20, 1.0)} ${Pt(0, 1.02)} ${Pt(18, 0.95)}`} stroke={R.wingHi} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.55} />
				<path d={`M${Pt(-46, 0.5)} C${Pt(-25, 0.55)} ${Pt(0, 0.6)} ${Pt(22, 0.6)}`} stroke={R.wingDk} strokeWidth={1} fill="none" opacity={0.6} />
				<ellipse cx={48} cy={hy} rx={5} ry={7 * hs} transform={`rotate(25 48 ${hy})`} fill={R.pron} />
				<ellipse cx={50} cy={hy - 2 * hs} rx={2} ry={3 * hs} fill="#120604" />
				<path d={`M${Pt(20, 1.0)} C${Pt(32, 1.14)} ${Pt(46, 0.96)} ${Pt(50, 0.5)} C${Pt(51, 0.3)} ${Pt(44, 0.22)} ${Pt(20, 0.28)} Z`} fill={R.rim} stroke={R.edge} strokeWidth={1} />
				<path d={`M${Pt(24, 0.94)} C${Pt(33, 1.02)} ${Pt(42, 0.88)} ${Pt(45, 0.56)} C${Pt(44, 0.44)} ${Pt(36, 0.42)} ${Pt(24, 0.46)} Z`} fill={R.pron} />
				{bodyLeg(0, false)}
				{bodyLeg(1, false)}
			</g>
			{hindLeg(false)}
		</g>
	);
};

// ---------- People and props ----------
// Front-view person, feet at (x, y), height h px.
export const Person: React.FC<{x: number; y: number; h: number; color?: string}> = ({x, y, h, color = '#5B6170'}) => (
	<g transform={`translate(${x - (h * 50) / 240} ${y - h}) scale(${h / 240})`}>
		<circle cx="50" cy="28" r="24" fill={color} />
		<path d="M22 66 Q50 56 78 66 L84 140 Q84 148 76 148 L70 148 L68 232 L54 232 L50 160 L46 232 L32 232 L30 148 L24 148 Q16 148 16 140 Z" fill={color} />
	</g>
);

// Side-view sprinter facing right, feet on y, height h px. `phase` in cycles.
export const Runner: React.FC<{x: number; y: number; h: number; phase: number; color?: string; far?: string}> = ({x, y, h, phase, color = C.ink, far = '#6B707B'}) => {
	const k = h / 100;
	const hip: P = [0, -52];
	const sh: P = [7, -80];
	const limb = (o: number, isArm: boolean): [P, P, P] => {
		const th = TAU * phase + o;
		if (isArm) {
			const a1 = 0.9 * Math.sin(th);
			const el: P = [sh[0] + 15 * Math.sin(a1), sh[1] + 15 * Math.cos(a1)];
			const a2 = a1 - 1.5;
			return [sh, el, [el[0] + 14 * Math.sin(a2 + Math.PI), el[1] - 14 * Math.cos(a2 + Math.PI)]];
		}
		const a1 = 0.75 * Math.sin(th) + 0.1;
		const kn: P = [hip[0] + 25 * Math.sin(a1), hip[1] + 25 * Math.cos(a1)];
		const bend = 0.25 + 1.3 * Math.max(0, -Math.cos(th));
		const a2 = a1 - bend;
		return [hip, kn, [kn[0] + 26 * Math.sin(a2), kn[1] + 26 * Math.cos(a2)]];
	};
	const L = (pts: [P, P, P], c: string, w: number) => (
		<path d={`M${pts[0][0]} ${pts[0][1]} L${pts[1][0]} ${pts[1][1]} L${pts[2][0]} ${pts[2][1]}`} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
	);
	return (
		<g transform={`translate(${x} ${y - 2}) scale(${k})`}>
			{L(limb(Math.PI, false), far, 9)}
			{L(limb(0, true), far, 7)}
			<path d={`M${hip[0]} ${hip[1]} L${sh[0]} ${sh[1]}`} stroke={color} strokeWidth={14} strokeLinecap="round" />
			<circle cx={12} cy={-91} r={8.5} fill={color} />
			{L(limb(0, false), color, 9)}
			{L(limb(Math.PI, true), color, 7)}
		</g>
	);
};

// Side-view bed: left edge x, floor y, length w, `gap` px of clearance under the frame.
export const Bed: React.FC<{x: number; y: number; w: number; gap: number; k: number}> = ({x, y, w, gap, k}) => {
	const frameH = 14 * k;
	const top = y - gap - frameH;
	const matH = 24 * k;
	return (
		<g>
			<rect x={x - 6 * k} y={top - matH - 55 * k} width={7 * k} height={55 * k + matH + frameH + gap} rx={2 * k} fill="#3A3F4B" />
			<rect x={x} y={top - matH} width={w} height={matH} rx={6 * k} fill="#565D6C" />
			<rect x={x + 6 * k} y={top - matH - 12 * k} width={60 * k} height={14 * k} rx={6 * k} fill="#8C9099" />
			<rect x={x} y={top} width={w} height={frameH} fill="#3A3F4B" />
			<rect x={x + w - 7 * k} y={top} width={7 * k} height={frameH + gap} fill="#3A3F4B" />
			<path d={`M${x + 4 * k} ${top + frameH} L${x + w - 8 * k} ${top + frameH}`} stroke="#000" strokeOpacity={0.35} strokeWidth={2} />
		</g>
	);
};

// Kitchen wall, baseboard and floor behind the hook image.
export const FLOOR = 1500;
export const Room: React.FC = () => {
	const tiles = [];
	for (let yy = FLOOR - 40; yy > 140; yy -= 120) tiles.push(<path key={`h${yy}`} d={`M0 ${yy} H1080`} />);
	for (let xx = 60; xx < 1080; xx += 120) tiles.push(<path key={`v${xx}`} d={`M${xx} 140 V${FLOOR - 40}`} />);
	return (
		<g>
			<g stroke="#1B1E25" strokeWidth={2}>{tiles}</g>
			<rect x={0} y={FLOOR - 40} width={1080} height={40} fill="#191B21" />
			<rect x={0} y={FLOOR} width={1080} height={1920 - FLOOR} fill="#121318" />
			<path d={`M0 ${FLOOR} H1080`} stroke="#2A2D34" strokeWidth={3} />
		</g>
	);
};

// The opening image: a person and a cockroach on the wall. grow 0 = real 4 cm, 1 = as tall as the person (1.7 m).
export const PERSON_H = 640; // 1.7 m
export const ROACH_SMALL = (4 / 170) * PERSON_H; // 4 cm on the same scale
export const ROACH_X = 750;
export const HookArt: React.FC<{grow: number; f: number}> = ({grow, f}) => {
	const len = ROACH_SMALL + (PERSON_H - ROACH_SMALL) * grow;
	const k = len / 100;
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
			<Room />
			<Person x={300} y={FLOOR} h={PERSON_H} />
			<RoachTop x={ROACH_X} y={FLOOR - 4 - 54 * k} len={len} phase={f / 40} amp={0.06 * grow} sway={4 * grow * Math.sin(f / 9)} tip={[95, -60]} />
		</svg>
	);
};

import React from 'react';

// Seeded PRNG (mulberry32): frames render in parallel and must be deterministic.
export const rng = (seed: number) => () => {
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const LEAF = ['#2E9E62', '#34C77B', '#278A55', '#3FD38A', '#1F7A4D'];
export const TRUNK = '#5A4030';
export const GHOST = '#3A3E47';

// Canopy shapes of one tree, base at (0,0), height h. kind 0 conifer, 1 round, 2 poplar.
const Canopy: React.FC<{kind: number; h: number; fill?: string; stroke?: string; dash?: boolean}> = ({kind, h, fill = 'none', stroke, dash}) => {
	const st = stroke ? {stroke, strokeWidth: Math.max(1.5, h * 0.012), strokeDasharray: dash ? `${h * 0.04} ${h * 0.035}` : undefined, strokeLinejoin: 'round' as const} : {};
	if (kind === 0) {
		const w = h * 0.52;
		return (
			<g fill={fill} {...st}>
				<polygon points={`${-w / 2},${-h * 0.16} ${w / 2},${-h * 0.16} 0,${-h * 0.6}`} />
				<polygon points={`${-w * 0.4},${-h * 0.4} ${w * 0.4},${-h * 0.4} 0,${-h * 0.82}`} />
				<polygon points={`${-w * 0.29},${-h * 0.62} ${w * 0.29},${-h * 0.62} 0,${-h}`} />
			</g>
		);
	}
	if (kind === 1) {
		return (
			<g fill={fill} {...st}>
				<circle cx={-h * 0.19} cy={-h * 0.5} r={h * 0.2} />
				<circle cx={h * 0.2} cy={-h * 0.52} r={h * 0.21} />
				<circle cx={0} cy={-h * 0.69} r={h * 0.29} />
			</g>
		);
	}
	return <ellipse cx={0} cy={-h * 0.57} rx={h * 0.17} ry={h * 0.43} fill={fill} {...st} />;
};

const trunkOf = (kind: number, h: number) => (kind === 0 ? {w: h * 0.07, top: h * 0.2} : kind === 1 ? {w: h * 0.09, top: h * 0.5} : {w: h * 0.06, top: h * 0.3});

/**
 * One tree at base (x, y). `gone` 0 = standing, 1 = vanished (shrinks into a puff of leaves).
 * `ghost` is the opacity of the dashed outline left behind.
 */
export const Tree: React.FC<{x: number; y: number; h: number; kind: number; color: string; gone?: number; ghost?: number; seed?: number}> = ({x, y, h, kind, color, gone = 0, ghost = 0, seed = 1}) => {
	const tr = trunkOf(kind, h);
	const sc = (1 - gone) * (1 - gone);
	const r = rng(seed);
	const bits = gone > 0 && gone < 1 ? Array.from({length: 7}, () => ({a: r() * Math.PI * 2, d: 0.5 + r() * 0.7, c: LEAF[Math.floor(r() * LEAF.length)]})) : [];
	return (
		<g transform={`translate(${x} ${y})`}>
			{ghost > 0 && (
				<g opacity={ghost}>
					<Canopy kind={kind} h={h} stroke={GHOST} dash />
					<line x1={0} y1={0} x2={0} y2={-tr.top} stroke={GHOST} strokeWidth={Math.max(1.5, h * 0.012)} strokeDasharray={`${h * 0.04} ${h * 0.035}`} />
				</g>
			)}
			{sc > 0.001 && (
				<g opacity={1 - gone} transform={`scale(${0.35 + 0.65 * sc} ${sc})`}>
					<rect x={-tr.w / 2} y={-tr.top} width={tr.w} height={tr.top} fill={TRUNK} />
					<Canopy kind={kind} h={h} fill={color} />
				</g>
			)}
			{bits.map((b, i) => (
				<circle
					key={i}
					cx={Math.cos(b.a) * b.d * h * 0.5 * gone}
					cy={-h * 0.6 + Math.sin(b.a) * b.d * h * 0.4 * gone + gone * gone * h * 0.5}
					r={h * 0.035 * (1 - gone)}
					fill={b.c}
					opacity={1 - gone}
				/>
			))}
		</g>
	);
};

/** Tiny conifer icon centred on (x, y), size = height. */
export const MiniTree: React.FC<{x: number; y: number; size: number; color: string; scale?: number; opacity?: number}> = ({x, y, size, color, scale = 1, opacity = 1}) => {
	const h = size;
	return (
		<g transform={`translate(${x} ${y + h / 2}) scale(${scale})`} opacity={opacity}>
			<rect x={-h * 0.06} y={-h * 0.22} width={h * 0.12} height={h * 0.22} fill={TRUNK} />
			<polygon points={`${-h * 0.36},${-h * 0.18} ${h * 0.36},${-h * 0.18} 0,${-h * 0.62}`} fill={color} />
			<polygon points={`${-h * 0.27},${-h * 0.5} ${h * 0.27},${-h * 0.5} 0,${-h}`} fill={color} />
		</g>
	);
};

/** Outline of the tiny conifer (what is left after it vanishes). */
export const MiniGhost: React.FC<{x: number; y: number; size: number; opacity?: number}> = ({x, y, size, opacity = 1}) => {
	const h = size;
	return (
		<g transform={`translate(${x} ${y + h / 2})`} opacity={opacity} fill="none" stroke={GHOST} strokeWidth={2} strokeDasharray="4 4" strokeLinejoin="round">
			<polygon points={`${-h * 0.36},${-h * 0.18} ${h * 0.36},${-h * 0.18} 0,${-h * 0.62}`} />
			<polygon points={`${-h * 0.27},${-h * 0.5} ${h * 0.27},${-h * 0.5} 0,${-h}`} />
		</g>
	);
};

/** Person silhouette, feet at (0,0), height h. */
export const Person: React.FC<{h: number; color: string}> = ({h, color}) => (
	<g fill={color}>
		<circle cx={0} cy={-h * 0.82} r={h * 0.16} />
		<path d={`M ${-h * 0.26} 0 L ${-h * 0.26} ${-h * 0.42} Q ${-h * 0.26} ${-h * 0.62} 0 ${-h * 0.62} Q ${h * 0.26} ${-h * 0.62} ${h * 0.26} ${-h * 0.42} L ${h * 0.26} 0 Z`} />
	</g>
);

// Animal icons drawn in a 100×100 box.
export const Frog: React.FC<{color: string; eye: string}> = ({color, eye}) => (
	<g>
		<ellipse cx={18} cy={86} rx={16} ry={7} fill={color} />
		<ellipse cx={82} cy={86} rx={16} ry={7} fill={color} />
		<ellipse cx={50} cy={64} rx={36} ry={24} fill={color} />
		<circle cx={30} cy={38} r={13} fill={color} />
		<circle cx={70} cy={38} r={13} fill={color} />
		<circle cx={30} cy={36} r={6} fill={eye} />
		<circle cx={70} cy={36} r={6} fill={eye} />
		<path d="M 34 66 Q 50 74 66 66" stroke={eye} strokeWidth={3.5} fill="none" strokeLinecap="round" />
	</g>
);

export const Bird: React.FC<{color: string; eye: string}> = ({color, eye}) => (
	<g>
		<polygon points="26,52 2,40 8,64" fill={color} />
		<ellipse cx={46} cy={58} rx={28} ry={20} fill={color} />
		<circle cx={72} cy={40} r={15} fill={color} />
		<polygon points="84,35 99,41 84,47" fill="#FFB020" />
		<circle cx={76} cy={37} r={3.5} fill={eye} />
		<path d="M 30 52 Q 48 40 62 58 Q 46 66 30 52 Z" fill={eye} opacity={0.35} />
		<line x1={42} y1={76} x2={40} y2={92} stroke={color} strokeWidth={4} strokeLinecap="round" />
		<line x1={54} y1={76} x2={56} y2={92} stroke={color} strokeWidth={4} strokeLinecap="round" />
	</g>
);

export const Deer: React.FC<{color: string; eye: string}> = ({color, eye}) => (
	<g>
		<g stroke={color} strokeWidth={4} strokeLinecap="round" fill="none">
			<path d="M 74 22 L 70 6 M 72 14 L 64 8 M 82 22 L 88 6 M 85 14 L 93 9" />
		</g>
		<rect x={24} y={60} width={6} height={32} rx={3} fill={color} />
		<rect x={34} y={60} width={6} height={32} rx={3} fill={color} />
		<rect x={58} y={60} width={6} height={32} rx={3} fill={color} />
		<rect x={68} y={60} width={6} height={32} rx={3} fill={color} />
		<ellipse cx={48} cy={56} rx={30} ry={14} fill={color} />
		<polygon points="62,52 72,26 84,30 76,58" fill={color} />
		<ellipse cx={82} cy={30} rx={12} ry={8} transform="rotate(20 82 30)" fill={color} />
		<ellipse cx={70} cy={24} rx={6} ry={3} transform="rotate(-30 70 24)" fill={color} />
		<circle cx={83} cy={28} r={2.5} fill={eye} />
		<polygon points="18,50 12,46 18,56" fill={color} />
	</g>
);

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from '../../engine/kit/lang';
import {C, NUM, SANS, SANS_EN} from '../../engine/kit/theme';

export const PAPER = '#F7F4EE';
export const GOLD = '#FFC93C';
export const INK = '#17181C';
export const RECEIPT_NO = '48210736';

export const rng = (seed: number) => {
	let x = seed >>> 0;
	return () => {
		x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
		return x / 4294967296;
	};
};

// Paper outline with a torn (zigzag) bottom edge, in a 500 × 790 box.
const PAPER_PATH = (() => {
	let d = 'M0 0 H500 V770';
	for (let i = 0; i < 20; i++) d += ` L${500 - 25 * (i + 0.5)} 786 L${500 - 25 * (i + 1)} 770`;
	return d + ' Z';
})();

const BARS = (() => {
	const r = rng(7);
	const out: [number, number][] = [];
	let x = 40;
	while (x < 456) {
		const w = 2 + Math.floor(r() * 4) * 2;
		if (x + w > 460) break;
		out.push([x, w]);
		x += w + 2 + Math.floor(r() * 3) * 2;
	}
	return out;
})();

const qr = (seed: number) => {
	const r = rng(seed);
	const n = 25;
	const cells: [number, number][] = [];
	const finder = (i: number, j: number) => (i < 8 && j < 8) || (i < 8 && j >= n - 8) || (i >= n - 8 && j < 8);
	for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (!finder(i, j) && r() < 0.48) cells.push([i, j]);
	return cells;
};
const QR_A = qr(3);
const QR_B = qr(91);

const Qr: React.FC<{x: number; y: number; size: number; cells: [number, number][]}> = ({x, y, size, cells}) => {
	const m = size / 25;
	const Finder = ({i, j}: {i: number; j: number}) => (
		<g transform={`translate(${x + j * m} ${y + i * m})`}>
			<rect width={7 * m} height={7 * m} fill={INK} />
			<rect x={m} y={m} width={5 * m} height={5 * m} fill={PAPER} />
			<rect x={2 * m} y={2 * m} width={3 * m} height={3 * m} fill={INK} />
		</g>
	);
	return (
		<g>
			{cells.map(([i, j]) => (
				<rect key={`${i}-${j}`} x={x + j * m} y={y + i * m} width={m + 0.3} height={m + 0.3} fill={INK} />
			))}
			<Finder i={0} j={0} />
			<Finder i={0} j={18} />
			<Finder i={18} j={0} />
		</g>
	);
};

/** A Taiwanese e-invoice proof slip (電子發票證明聯), drawn at width `w`. */
export const Receipt: React.FC<{w: number; numColor?: string}> = ({w, numColor = INK}) => {
	const t = useT();
	const font = t(SANS, SANS_EN);
	return (
		<svg width={w} height={(w * 800) / 500} viewBox="0 0 500 800" style={{overflow: 'visible'}}>
			<path d={PAPER_PATH} fill="rgba(0,0,0,.45)" transform="translate(10 16)" />
			<path d={PAPER_PATH} fill={PAPER} />
			<rect x={30} y={30} width={440} height={64} rx={12} fill={C.red} />
			<text x={250} y={73} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={32} fill="#fff" letterSpacing={t(6, 3)}>
				{t('好日便利商店', 'GOOD DAY MART')}
			</text>
			<text x={250} y={160} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={t(48, 46)} fill={INK} letterSpacing={t(4, 2)}>
				{t('電子發票證明聯', 'E-INVOICE')}
			</text>
			<text x={250} y={222} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill={INK}>
				{t('115年09-10月', 'SEP–OCT 2026')}
			</text>
			<text x={250} y={300} textAnchor="middle" fontFamily={NUM} fontWeight={900} fontSize={66} fill={numColor} letterSpacing={1}>
				{`XK-${RECEIPT_NO}`}
			</text>
			<text x={40} y={352} fontFamily={NUM} fontWeight={400} fontSize={30} fill="#3A3D45">
				2026-10-15 08:12:36
			</text>
			<text x={40} y={394} fontFamily={font} fontWeight={400} fontSize={30} fill="#3A3D45">
				{t('隨機碼 4821', 'Code 4821')}
			</text>
			<text x={460} y={394} textAnchor="end" fontFamily={font} fontWeight={700} fontSize={30} fill="#3A3D45">
				{t('總計 45', 'Total 45')}
			</text>
			{BARS.map(([x, bw]) => (
				<rect key={x} x={x} y={418} width={bw} height={74} fill={INK} />
			))}
			<Qr x={40} y={520} size={190} cells={QR_A} />
			<Qr x={270} y={520} size={190} cells={QR_B} />
		</svg>
	);
};

/** A small slip without text (for piles and rows). `gold` paints it as a winning slip with a star stamp. */
const STAR = (() => {
	const pts: string[] = [];
	for (let i = 0; i < 10; i++) {
		const r = i % 2 === 0 ? 92 : 40;
		const a = -Math.PI / 2 + (i * Math.PI) / 5;
		pts.push(`${250 + r * Math.cos(a)},${560 + r * Math.sin(a)}`);
	}
	return pts.join(' ');
})();
export const MiniReceipt: React.FC<{w: number; gold?: boolean}> = ({w, gold}) => (
	<svg width={w} height={(w * 800) / 500} viewBox="0 0 500 800" style={{overflow: 'visible'}}>
		<path d={PAPER_PATH} fill="rgba(0,0,0,.4)" transform="translate(14 20)" />
		<path d={PAPER_PATH} fill={gold ? GOLD : PAPER} />
		<rect x={40} y={40} width={420} height={70} rx={14} fill={gold ? C.red : '#C9C5BE'} />
		<rect x={90} y={150} width={320} height={44} rx={10} fill={gold ? '#9A6A10' : '#9A968F'} />
		<rect x={50} y={240} width={400} height={64} rx={12} fill={gold ? '#3A2600' : INK} />
		{gold ? (
			<>
				<circle cx={250} cy={560} r={150} fill={C.red} />
				<polygon points={STAR} fill={GOLD} />
			</>
		) : (
			<>
				<rect x={50} y={350} width={260} height={28} rx={8} fill="#B5B1AA" />
				<rect x={50} y={420} width={400} height={70} fill="#55585F" opacity={0.7} />
				<rect x={40} y={530} width={190} height={190} rx={10} fill="#55585F" opacity={0.75} />
				<rect x={270} y={530} width={190} height={190} rx={10} fill="#55585F" opacity={0.75} />
			</>
		)}
	</svg>
);

// Where the hook's slip sits. The ending puts it back here so the replay is seamless.
export const SLIP = {w: 540, x: 540 - 270, y: 1060, rot: -4};

/** The opening image: one receipt in a warm glow. Frame 0 of the film and the last frames of the ending. */
export const HookArt: React.FC<{dy?: number; numColor?: string}> = ({dy = 0, numColor}) => (
	<AbsoluteFill>
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<radialGradient id="slip-glow" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stopColor={C.amber} stopOpacity={0.3} />
					<stop offset="55%" stopColor={C.amber} stopOpacity={0.08} />
					<stop offset="100%" stopColor={C.amber} stopOpacity={0} />
				</radialGradient>
			</defs>
			<ellipse cx={540} cy={1440} rx={640} ry={620} fill="url(#slip-glow)" />
		</svg>
		<div style={{position: 'absolute', left: SLIP.x, top: SLIP.y + dy, transform: `rotate(${SLIP.rot}deg)`, transformOrigin: '50% 30%'}}>
			<Receipt w={SLIP.w} numColor={numColor} />
		</div>
	</AbsoluteFill>
);

/** One rolling digit window; `c` is the continuous digit 0..10 (10 wraps to 0). */
export const Wheel: React.FC<{c: number; w: number; h: number; size: number; color?: string; bg?: string; border?: string}> = ({
	c,
	w,
	h,
	size,
	color = C.ink,
	bg = C.bg2,
	border = C.faint,
}) => {
	const v = ((c % 10) + 10) % 10;
	return (
		<div style={{position: 'relative', width: w, height: h, borderRadius: 18, background: bg, border: `3px solid ${border}`, overflow: 'hidden', boxSizing: 'border-box'}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: -v * h}}>
				{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
					<div
						key={i}
						style={{height: h, lineHeight: `${h - 6}px`, textAlign: 'center', fontFamily: NUM, fontWeight: 900, fontSize: size, color, fontVariantNumeric: 'tabular-nums'}}
					>
						{d}
					</div>
				))}
			</div>
			<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,13,16,.55) 0%, rgba(12,13,16,0) 28%, rgba(12,13,16,0) 72%, rgba(12,13,16,.55) 100%)'}} />
		</div>
	);
};

// —— Icons for "3 purchases a day" (220 × 220 boxes) ——
export const Coffee: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 220 220">
		<path d="M88 30 q-10 -12 0 -24 M110 30 q-10 -12 0 -24 M132 30 q-10 -12 0 -24" stroke={C.dim} strokeWidth={5} fill="none" strokeLinecap="round" />
		<path d="M58 66 H162 L148 210 H72 Z" fill={PAPER} />
		<path d="M64 112 H156 L150 170 H70 Z" fill="#A0663F" />
		<rect x={48} y={50} width={124} height={24} rx={9} fill="#4A4E57" />
		<rect x={66} y={38} width={88} height={18} rx={7} fill="#4A4E57" />
	</svg>
);
export const Onigiri: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 220 220">
		<path d="M110 26 C126 26 136 38 146 54 L198 146 C210 170 198 196 168 196 H52 C22 196 10 170 22 146 L74 54 C84 38 94 26 110 26 Z" fill={PAPER} />
		<rect x={78} y={118} width={64} height={80} rx={6} fill="#1F3327" />
		<circle cx={100} cy={80} r={4} fill="#D9D3C8" />
		<circle cx={124} cy={92} r={4} fill="#D9D3C8" />
		<circle cx={90} cy={104} r={4} fill="#D9D3C8" />
	</svg>
);
export const BubbleTea: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 220 220">
		<rect x={116} y={4} width={13} height={92} rx={6} fill={C.red} transform="rotate(14 122 50)" />
		<path d="M60 70 Q110 22 160 70 Z" fill="rgba(244,241,236,.35)" />
		<path d="M62 76 H158 L146 210 H74 Z" fill="#D8B48A" />
		<path d="M62 76 H158 L155 100 H65 Z" fill="#E9D3B6" />
		{[
			[86, 192],
			[106, 196],
			[128, 192],
			[96, 178],
			[118, 180],
			[138, 176],
			[80, 172],
		].map(([x, y], i) => (
			<circle key={i} cx={x} cy={y} r={9} fill="#2A1A10" />
		))}
		<rect x={52} y={68} width={116} height={12} rx={5} fill={PAPER} />
	</svg>
);

/** Hourglass; `p` 0..1 is how much sand has fallen. */
export const Hourglass: React.FC<{size: number; p: number; flow: number}> = ({size, p, flow}) => {
	const top = 1 - p;
	return (
		<svg width={size} height={size * 1.4} viewBox="0 0 200 280">
			<rect x={20} y={6} width={160} height={16} rx={6} fill="#4A4E57" />
			<rect x={20} y={258} width={160} height={16} rx={6} fill="#4A4E57" />
			<path d="M40 22 C40 90 92 118 92 140 C92 162 40 190 40 258 H160 C160 190 108 162 108 140 C108 118 160 90 160 22 Z" fill="rgba(244,241,236,.06)" stroke={C.dim} strokeWidth={4} />
			{/* sand left on top: a shrinking wedge */}
			<path d={`M${100 - 52 * top} ${130 - 92 * top} H${100 + 52 * top} L100 134 Z`} fill={C.amber} opacity={0.9} />
			{/* falling stream */}
			<rect x={98} y={136} width={4} height={118 - 70 * p} fill={C.amber} opacity={flow} />
			{/* pile at the bottom */}
			<path d={`M${100 - 58 * Math.sqrt(p)} 258 Q100 ${258 - 120 * p} ${100 + 58 * Math.sqrt(p)} 258 Z`} fill={C.amber} opacity={0.9} />
		</svg>
	);
};

import React from 'react';
import {C} from '../../engine/kit/theme';

// Palette: teal = Taipei 101, red = the LEGO brick, steel = the press, slate = Yushan.
export const P = {
	teal: '#35B0A3',
	teal2: '#2FA194',
	teal3: '#3CBDAF',
	tealD: '#1D6A62',
	tealL: '#7BE0D4',
	red: '#E5332A',
	redD: '#8F1A14',
	redL: '#FF7A6E',
	steel: '#8A93A3',
	steelD: '#4A515E',
	steelL: '#C3CAD6',
	plate: '#262B33',
	plateL: '#353C47',
	mount: '#18202F',
	mountL: '#26324A',
};

// ---------------------------------------------------------------------------------------------
// Taipei 101 built from LEGO bricks (the hook image, reused by the ending).
// Stud pitch U, brick height BH = 1.2 U (9.6 mm / 8 mm). Row widths are in studs, bottom → top.
const U = 15;
const BH = U * 1.2;
const CX = 540;
export const LEGO_BASE_Y = 1480; // top of the baseplate = bottom of row 0
const ROWS: number[] = [
	16, 16, 14, 14, 14, 12, 12, 12, // podium (tapers in)
	...Array.from({length: 8}, () => [10, 12, 12]).flat(), // 8 pagoda modules (flare out)
	8, 8, 6, 6, // crown
	2, 2, 2, 1, 1, // spire
];
export const LEGO_TOP_Y = LEGO_BASE_Y - ROWS.length * BH;

type Brick = {x0: number; x1: number; row: number; i: number; hero: boolean};
const BRICKS: Brick[] = (() => {
	const out: Brick[] = [];
	ROWS.forEach((w, r) => {
		const L = -w / 2;
		let cuts: number[];
		if (r === 0) cuts = [L, L + 4, L + 7, L + 9, L + 12, L + w]; // 4·3·2·3·4: the 2×2 hero brick sits dead centre
		else if (w <= 2) cuts = [L, L + w];
		else {
			const off = (r % 2) * 2;
			cuts = [L];
			for (let p = Math.ceil(L) + 1; p < L + w; p++) if ((((p + off) % 4) + 4) % 4 === 0) cuts.push(p);
			cuts.push(L + w);
		}
		for (let i = 0; i < cuts.length - 1; i++) out.push({x0: cuts[i], x1: cuts[i + 1], row: r, i, hero: r === 0 && cuts[i] === -1});
	});
	return out;
})();

// Stud centres (in studs) left uncovered by the row above.
const STUDS: {x: number; row: number}[] = (() => {
	const out: {x: number; row: number}[] = [];
	ROWS.forEach((w, r) => {
		const above = ROWS[r + 1] ?? 0;
		for (let k = 0; k < Math.max(1, Math.round(w)); k++) {
			const x = w < 1.5 ? 0 : -w / 2 + 0.5 + k;
			if (Math.abs(x) > above / 2 || above === 0) out.push({x, row: r});
		}
	});
	return out;
})();
const SHADES = [P.teal, P.teal2, P.teal3];

/** `build` 0..1 drops the rows in from the bottom; `ring` 0..1 is a pulse around the bottom 2×2 brick (0 = none). */
export const Lego101: React.FC<{build?: number; ring?: number; heroGlow?: number}> = ({build = 1, ring = 0, heroGlow = 0}) => {
	const n = ROWS.length;
	const rowQ = (r: number) => Math.max(0, Math.min(1, build * (n + 2) - r));
	const yOf = (r: number) => LEGO_BASE_Y - (r + 1) * BH;
	const plateStuds: number[] = [];
	for (let k = -32; k <= 32; k++) if (Math.abs(k + 0.5) > 8.2 && Math.abs(k + 0.5) < 32) plateStuds.push(k + 0.5);
	const hx0 = CX - U;
	const hy0 = LEGO_BASE_Y - BH;
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
			{/* baseplate */}
			<rect x={CX - 32 * U} y={LEGO_BASE_Y} width={64 * U} height={18} rx={3} fill={P.plate} />
			<rect x={CX - 32 * U} y={LEGO_BASE_Y} width={64 * U} height={3} fill={P.plateL} />
			{plateStuds.map((x) => (
				<rect key={x} x={CX + x * U - U * 0.3} y={LEGO_BASE_Y - U * 0.21} width={U * 0.6} height={U * 0.21 + 1} rx={1.5} fill={P.plateL} />
			))}
			{BRICKS.map((b) => {
				const q = rowQ(b.row);
				if (q <= 0) return null;
				const x = CX + b.x0 * U;
				const w = (b.x1 - b.x0) * U;
				const y = yOf(b.row) - (1 - q) * 46;
				const fill = b.hero ? P.red : SHADES[(b.row * 2 + b.i) % 3];
				return (
					<g key={`${b.row}-${b.i}`} opacity={q}>
						<rect x={x + 0.6} y={y + 0.6} width={w - 1.2} height={BH - 1.2} rx={1.5} fill={fill} />
						<rect x={x + 0.6} y={y + 0.6} width={w - 1.2} height={2.2} fill={b.hero ? P.redL : P.tealL} opacity={0.45} />
						<rect x={x + 0.6} y={y + BH - 3} width={w - 1.2} height={2.4} fill={b.hero ? P.redD : P.tealD} opacity={0.7} />
					</g>
				);
			})}
			{STUDS.map((s) => {
				const q = rowQ(s.row);
				if (q <= 0) return null;
				const hero = s.row === 0 && Math.abs(s.x) < 1;
				const y = yOf(s.row) - (1 - q) * 46;
				return (
					<rect key={`s${s.row}-${s.x}`} x={CX + s.x * U - U * 0.3} y={y - U * 0.21} width={U * 0.6} height={U * 0.21 + 1} rx={1.5} fill={hero ? P.red : P.teal} opacity={q} />
				);
			})}
			{/* the bottom 2×2 brick: optional glow + pulse ring */}
			{heroGlow > 0 && <rect x={hx0 - 6} y={hy0 - 6} width={2 * U + 12} height={BH + 12} rx={6} fill="none" stroke={C.amber} strokeWidth={4} opacity={heroGlow} />}
			{ring > 0 && ring < 1 && (
				<rect
					x={hx0 - 6 - ring * 40}
					y={hy0 - 6 - ring * 30}
					width={2 * U + 12 + ring * 80}
					height={BH + 12 + ring * 60}
					rx={8 + ring * 20}
					fill="none"
					stroke={C.amber}
					strokeWidth={4}
					opacity={(1 - ring) * 0.9}
				/>
			)}
		</svg>
	);
};

// ---------------------------------------------------------------------------------------------
// The hydraulic test: a 2×2 brick between two steel platens. 22 px per mm.
const K = 22;
const BW = 15.8 * K;
const BHt = 9.6 * K;
const STW = 4.8 * K;
const STH = 1.7 * K;
const FLOOR = 1000; // top of the bottom platen

/** `gap` px between the top platen and the studs; `load` 0..1 (elastic squeeze); `melt` 0..1 (plastic flow). */
export const Press: React.FC<{gap: number; load: number; melt: number; shake?: number}> = ({gap, load, melt, shake = 0}) => {
	const hf = 1 - 0.025 * load - 0.3 * melt;
	const h = BHt * hf;
	const top = FLOOR - h;
	const sh = STH * (1 - 0.75 * melt);
	const studTop = top - sh;
	const platenBottom = studTop - gap;
	const bulge = 26 * melt + 3 * load;
	const spread = 1 + 0.05 * melt;
	const L = 540 - BW / 2;
	const R = 540 + BW / 2;
	const Lt = 540 - (BW / 2) * spread;
	const Rt = 540 + (BW / 2) * spread;
	const body = `M ${L} ${FLOOR} L ${R} ${FLOOR} Q ${R + bulge * 2} ${FLOOR - h / 2} ${Rt} ${top} L ${Lt} ${top} Q ${L - bulge * 2} ${FLOOR - h / 2} ${L} ${FLOOR} Z`;
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<linearGradient id="st" x1="0" x2="1">
					<stop offset="0" stopColor={P.steelD} />
					<stop offset="0.35" stopColor={P.steelL} />
					<stop offset="1" stopColor={P.steel} />
				</linearGradient>
			</defs>
			{/* frame */}
			<rect x={220} y={470} width={44} height={600} fill={P.steelD} />
			<rect x={816} y={470} width={44} height={600} fill={P.steelD} />
			<rect x={200} y={460} width={680} height={60} rx={6} fill="url(#st)" />
			<rect x={470} y={520} width={140} height={36} rx={4} fill={P.steel} />
			<rect x={490} y={526} width={100} height={8} rx={3} fill={C.amber} opacity={0.5 + 0.5 * load} />
			{/* rod + top platen */}
			<rect x={518} y={556} width={44} height={Math.max(0, platenBottom - 36 - 556)} fill={P.steelL} />
			<rect x={540 - 230} y={platenBottom - 36} width={460} height={36} rx={4} fill="url(#st)" />
			{/* brick */}
			<g transform={`translate(${shake} 0)`}>
				<path d={body} fill={P.red} />
				<path d={`M ${Lt + 6} ${top + 4} L ${Rt - 6} ${top + 4}`} stroke={P.redL} strokeWidth={6} opacity={0.5} strokeLinecap="round" />
				<path d={`M ${L + 18} ${FLOOR - 10} L ${L + 18 - bulge * 0.6} ${FLOOR - h / 2} L ${Lt + 18} ${top + 14}`} stroke={P.redL} strokeWidth={10} opacity={0.25} fill="none" strokeLinejoin="round" />
				{[-1, 1].map((d) => {
					const sx = 540 + d * 4 * K * spread;
					const sw = STW * (1 + 0.3 * melt);
					return (
						<g key={d}>
							<rect x={sx - sw / 2} y={studTop} width={sw} height={sh + 2} rx={6 + 10 * melt} fill={P.red} />
							<rect x={sx - sw / 2 + 8} y={studTop + 3} width={sw - 16} height={5} rx={2.5} fill={P.redL} opacity={0.5} />
						</g>
					);
				})}
				<rect x={L} y={FLOOR - 8} width={BW} height={8} fill={P.redD} opacity={0.6} />
			</g>
			{/* bottom platen + bed */}
			<rect x={540 - 260} y={FLOOR} width={520} height={40} rx={4} fill="url(#st)" />
			<rect x={200} y={1040} width={680} height={30} rx={4} fill={P.steelD} />
		</svg>
	);
};

// ---------------------------------------------------------------------------------------------
// Magnifier for the twist: the tower's midpoint, blown up so 2 mm reads (15 px per mm).
export const Magnifier: React.FC<{cx: number; cy: number; r: number; o: number; fromX: number; label: string; font: string}> = ({cx, cy, r, o, fromX, label, font}) => {
	if (o <= 0) return null;
	const k = 15;
	const bw = 15.8 * k;
	const bh = 9.6 * k;
	const off = 2 * k;
	const rows = [-2, -1, 0, 1];
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
			<defs>
				<clipPath id="mag">
					<circle cx={cx} cy={cy} r={r} />
				</clipPath>
			</defs>
			<line x1={fromX} y1={cy} x2={cx + r} y2={cy} stroke={C.dim} strokeWidth={3} strokeDasharray="6 6" />
			<circle cx={fromX} cy={cy} r={9} fill="none" stroke={C.ink} strokeWidth={3} />
			<g clipPath="url(#mag)">
				<rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} fill={C.bg2} />
				{rows.map((i) => (
					<g key={i}>
						<rect x={cx + off - bw / 2 + 1} y={cy + i * bh + 1} width={bw - 2} height={bh - 2} rx={4} fill={P.red} />
						<rect x={cx + off - bw / 2 + 1} y={cy + i * bh + 1} width={bw - 2} height={5} fill={P.redL} opacity={0.4} />
						<rect x={cx + off - bw / 2 + 1} y={cy + (i + 1) * bh - 7} width={bw - 2} height={6} fill={P.redD} opacity={0.7} />
					</g>
				))}
				<line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={C.ink} strokeWidth={4} strokeDasharray="14 10" />
				<line x1={cx + off} y1={cy - r} x2={cx + off} y2={cy + r} stroke={C.amber} strokeWidth={4} />
			</g>
			<circle cx={cx} cy={cy} r={r} fill="none" stroke={C.ink} strokeWidth={6} />
			{/* 2 mm callout, outside the lens so it stays legible */}
			<path d={`M ${cx} ${cy - r - 18} L ${cx + off} ${cy - r - 18}`} stroke={C.amber} strokeWidth={4} />
			<path d={`M ${cx} ${cy - r - 30} L ${cx} ${cy - r - 6} M ${cx + off} ${cy - r - 30} L ${cx + off} ${cy - r - 6}`} stroke={C.amber} strokeWidth={4} />
			<text x={cx + off / 2} y={cy - r - 44} textAnchor="middle" fill={C.amber} style={{fontFamily: font, fontWeight: 900, fontSize: 52}}>
				{label}
			</text>
		</svg>
	);
};

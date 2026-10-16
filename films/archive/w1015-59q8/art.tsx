import React from 'react';
import {C, NUM} from '../../engine/kit/theme';

// ── World: the 3-story bubble tea, side view, in screen px at the home camera ──
// 1 m = 64 px. Ground at y 1700, cup 10 m tall (top at y 1060), a 3-story 透天厝 beside it.
export const PX = 64;
export const GROUND = 1700;
export const CX = 420; // cup centre
export const CUP_H = 10;
export const LID = 10.12; // top of the flat lid (m)
export const MOUTH = 10.25; // the drinker lies on the lid, chin down: mouth = top of the straw (m)
export const FULL = 9.75; // tea level when full (m)
export const STRAW_X = 372;
const STRAW_W = 18;
const HB = 1.6; // half widths (m) at the bottom and top: a 700 cc cup's taper
const HT = 2.55;
export const yAt = (h: number) => GROUND - h * PX;
export const hw = (h: number) => (HB + ((HT - HB) * h) / CUP_H) * PX;

export const TEA = '#C99561';
export const TEA_HI = '#E2B98A';
export const PEARL = '#2B1A12';
const GLASS = '#ECE7DE';

export type Cam = {wx: number; wy: number; sx: number; sy: number; z: number};
export const HOME: Cam = {wx: 540, wy: 960, sx: 540, sy: 960, z: 1};
export const mixCam = (a: Cam, b: Cam, p: number): Cam => ({
	wx: a.wx + (b.wx - a.wx) * p,
	wy: a.wy + (b.wy - a.wy) * p,
	sx: a.sx + (b.sx - a.sx) * p,
	sy: a.sy + (b.sy - a.sy) * p,
	z: a.z + (b.z - a.z) * p,
});
const camT = (c: Cam) => `translate(${c.sx} ${c.sy}) scale(${c.z}) translate(${-c.wx} ${-c.wy})`;

export const rng = (seed: number) => () => {
	seed = (seed * 16807) % 2147483647;
	return (seed - 1) / 2147483646;
};

const PEARLS = (() => {
	const r = rng(59);
	const out: {x: number; y: number; r: number}[] = [];
	for (let row = 0; row < 3; row++) {
		const h = 0.24 + row * 0.36;
		const w = 2 * hw(h) - 34;
		const n = Math.floor(w / 31);
		for (let k = 0; k < n; k++) {
			const x = CX - w / 2 + 16 + k * 31 + (row % 2) * 12 + (r() - 0.5) * 6;
			if (x > CX + w / 2 - 12) continue;
			out.push({x, y: yAt(h) + (r() - 0.5) * 6, r: 13 + r() * 2});
		}
	}
	return out;
})();

const STARS = (() => {
	const r = rng(7);
	return Array.from({length: 46}, () => ({x: r() * 1080, y: 60 + r() * 900, r: 1 + r() * 1.8, o: 0.15 + r() * 0.35}));
})();

const cupPts = (h0: number, h1: number) =>
	`${CX - hw(h0)},${yAt(h0)} ${CX + hw(h0)},${yAt(h0)} ${CX + hw(h1)},${yAt(h1)} ${CX - hw(h1)},${yAt(h1)}`;

export type Bracket = {x: number; h1: number; h2: number; label: string; color: string; o: number};

const Person: React.FC<{mx: number; my: number}> = ({mx, my}) => {
	// prone on the lid, facing left, mouth on the straw, feet kicked up
	const top = yAt(LID);
	return (
		<g>
			<path d={`M ${mx + 66} ${top - 6} L ${mx + 104} ${top - 6} L ${mx + 122} ${top - 34}`} stroke="#2B3A67" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none" />
			<rect x={mx + 18} y={top - 17} width={56} height={16} rx={8} fill="#3FB6A8" />
			<path d={`M ${mx + 24} ${top - 8} L ${mx + 6} ${top - 3}`} stroke="#F1C39B" strokeWidth={6} strokeLinecap="round" />
			<circle cx={mx + 12} cy={my - 6} r={10} fill="#F1C39B" />
			<path d={`M ${mx + 4} ${my - 12} A 10 10 0 0 1 ${mx + 22} ${my - 6} L ${mx + 20} ${my - 2} Z`} fill="#2A1E1A" />
		</g>
	);
};

export const World: React.FC<{
	cam?: Cam;
	level?: number;
	col?: number;
	ruler?: number;
	floors?: number;
	dim?: number;
	dimH?: number;
	band?: number;
	bandH?: number;
	snow?: number;
	floorDim?: number;
	ring?: number;
	brackets?: Bracket[];
	label?: {text: string; o: number; font: string};
}> = ({cam = HOME, level = FULL, col = MOUTH, ruler = 0, floors = 0, dim = 0, dimH = 0, band = 0, bandH = 0, snow = 0, floorDim = 0, ring = 0, brackets = [], label}) => {
	const z = cam.z;
	const lidY = yAt(LID);
	const floorH = (CUP_H * PX) / 3;
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<linearGradient id="tea59" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={TEA_HI} />
					<stop offset="0.25" stopColor={TEA} />
					<stop offset="1" stopColor="#8E5E36" />
				</linearGradient>
				<clipPath id="cup59">
					<polygon points={cupPts(0, CUP_H)} />
				</clipPath>
				<pattern id="hatch59" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
					<line x1="0" y1="0" x2="0" y2="18" stroke={C.red} strokeWidth="3" strokeOpacity="0.45" />
				</pattern>
			</defs>
			{STARS.map((st, i) => (
				<circle key={i} cx={st.x} cy={st.y} r={st.r} fill={C.ink} opacity={st.o * (1 - snow * 0.5)} />
			))}
			<g transform={camT(cam)}>
				{snow > 0 && (
					<g opacity={snow}>
						{[
							[-160, 130, 1170, 420],
							[430, 640, 1300, 840],
							[790, 1010, 1220, 1260],
						].map(([a, px, py, b], i) => (
							<g key={i}>
								<polygon points={`${a},${GROUND} ${px},${py} ${b},${GROUND}`} fill="#243044" />
								<polygon
									points={`${px},${py} ${px - (px - a) * 0.22},${py + (GROUND - py) * 0.22} ${px - (px - a) * 0.08},${py + (GROUND - py) * 0.17} ${px + (b - px) * 0.05},${py + (GROUND - py) * 0.24} ${px + (b - px) * 0.22},${py + (GROUND - py) * 0.22}`}
									fill="#C9D4E0"
								/>
							</g>
						))}
					</g>
				)}
				<rect x={-2000} y={GROUND} width={5000} height={1200} fill="#07080A" />
				<line x1={-2000} y1={GROUND} x2={3000} y2={GROUND} stroke={C.faint} strokeWidth={3} />
				{snow > 0 && <path d={`M -2000 ${GROUND + 6} Q 540 ${GROUND - 40} 3000 ${GROUND + 6} L 3000 3000 L -2000 3000 Z`} fill="#D5DEE8" opacity={snow} />}

				{/* 3-story 透天厝 */}
				<g>
					<rect x={660} y={yAt(CUP_H)} width={300} height={CUP_H * PX} fill="#1A1E26" stroke="#2C323E" strokeWidth={3} />
					<rect x={650} y={yAt(CUP_H) - 14} width={320} height={16} fill="#232833" />
					{[0, 1, 2].map((f) => {
						const top = yAt(CUP_H) + f * floorH;
						return (
							<g key={f}>
								{f > 0 && <line x1={660} y1={top} x2={960} y2={top} stroke="#2C323E" strokeWidth={4} />}
								{f < 2 ? (
									<>
										<rect x={700} y={top + 52} width={92} height={104} rx={4} fill={f === 0 ? '#F3C56B' : '#3A4150'} opacity={f === 0 ? 0.85 : 1} />
										<rect x={830} y={top + 52} width={92} height={104} rx={4} fill={f === 1 ? '#F3C56B' : '#3A4150'} opacity={0.85} />
										<line x1={690} y1={top + 168} x2={932} y2={top + 168} stroke="#4A5262" strokeWidth={4} />
										{[0, 1, 2, 3, 4, 5, 6].map((k) => (
											<line key={k} x1={696 + k * 39} y1={top + 168} x2={696 + k * 39} y2={top + 192} stroke="#4A5262" strokeWidth={3} />
										))}
									</>
								) : (
									<>
										<rect x={692} y={top + 60} width={236} height={153} fill="#2E3440" />
										{Array.from({length: 9}, (_, k) => (
											<line key={k} x1={692} y1={top + 76 + k * 16} x2={928} y2={top + 76 + k * 16} stroke="#3C4352" strokeWidth={3} />
										))}
									</>
								)}
								<text x={676} y={top + 40} fontFamily={NUM} fontWeight={800} fontSize={34} fill={C.dim} opacity={floors}>
									{3 - f}F
								</text>
							</g>
						);
					})}
					<rect x={660} y={yAt(CUP_H) + floorH} width={300} height={floorH * 2} fill="#07080A" opacity={0.7 * floorDim} />
				</g>

				{/* ruler */}
				{ruler > 0 && (
					<g opacity={Math.min(1, ruler * 3)}>
						<line x1={200} y1={yAt(0)} x2={200} y2={yAt(CUP_H * ruler)} stroke={C.dim} strokeWidth={4} />
						{Array.from({length: 11}, (_, m) =>
							m <= CUP_H * ruler + 0.01 ? (
								<g key={m}>
									<line x1={200} y1={yAt(m)} x2={m % 5 === 0 ? 228 : 216} y2={yAt(m)} stroke={C.dim} strokeWidth={4} />
									{m % 5 === 0 && (
										<text x={186} y={yAt(m) + 12} textAnchor="end" fontFamily={NUM} fontWeight={800} fontSize={36} fill={m === 10 ? C.amber : C.dim}>
											{m === 0 ? '0' : `${m} m`}
										</text>
									)}
								</g>
							) : null,
						)}
					</g>
				)}

				{/* cup body, tea, pearls */}
				<polygon points={cupPts(0, CUP_H)} fill={GLASS} opacity={0.05} />
				<polygon points={cupPts(0, Math.max(0.01, level))} fill="url(#tea59)" />
				<line x1={CX - hw(level)} y1={yAt(level)} x2={CX + hw(level)} y2={yAt(level)} stroke={TEA_HI} strokeWidth={4} opacity={level > 0.05 ? 1 : 0} />
				{PEARLS.map((p, i) => (
					<g key={i}>
						<circle cx={p.x} cy={p.y} r={p.r} fill={PEARL} />
						<circle cx={p.x - p.r * 0.35} cy={p.y - p.r * 0.35} r={p.r * 0.3} fill="#6E4A33" />
					</g>
				))}
				<g clipPath="url(#cup59)">
					{dim > 0 && (
						<g opacity={dim}>
							<rect x={0} y={yAt(dimH)} width={1080} height={dimH * PX} fill="#07080A" opacity={0.62} />
							<rect x={0} y={yAt(dimH)} width={1080} height={dimH * PX} fill="url(#hatch59)" />
						</g>
					)}
					{band > 0 && <rect x={0} y={yAt(CUP_H)} width={1080} height={(CUP_H - bandH) * PX} fill={C.green} opacity={0.3 * band} />}
					{band > 0 && (
						<rect x={0} y={yAt(bandH)} width={1080} height={bandH * PX} fill="#07080A" opacity={0.6 * band} />
					)}
				</g>
				{dim > 0 && <line x1={CX - hw(dimH) - 26} y1={yAt(dimH)} x2={CX + hw(dimH) + 26} y2={yAt(dimH)} stroke={C.red} strokeWidth={5 / z} strokeDasharray={`${16 / z} ${10 / z}`} opacity={dim} />}
				{band > 0 && <line x1={CX - hw(bandH) - 26} y1={yAt(bandH)} x2={CX + hw(bandH) + 26} y2={yAt(bandH)} stroke={C.green} strokeWidth={5} strokeDasharray="16 10" opacity={band} />}

				{/* straw: a clear tube; tea inside it up to `col` */}
				<rect x={STRAW_X - STRAW_W / 2} y={yAt(MOUTH)} width={STRAW_W} height={(MOUTH - 0.25) * PX} fill="#0E0F13" opacity={0.85} />
				<rect x={STRAW_X - STRAW_W / 2} y={yAt(Math.min(col, MOUTH))} width={STRAW_W} height={(Math.min(col, MOUTH) - 0.25) * PX} fill="#7A4B27" />
				<rect x={STRAW_X - STRAW_W / 2} y={yAt(MOUTH)} width={STRAW_W} height={(MOUTH - 0.25) * PX} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={0.95} rx={3} />

				{/* cup outline and lid */}
				<polygon points={cupPts(0, CUP_H)} fill="none" stroke={GLASS} strokeWidth={5} strokeLinejoin="round" opacity={0.9} />
				<line x1={CX - hw(9) + 22} y1={yAt(9)} x2={CX - hw(1.5) + 18} y2={yAt(1.5)} stroke={GLASS} strokeWidth={8} strokeLinecap="round" opacity={0.18} />
				<rect x={CX - hw(CUP_H) - 10} y={lidY} width={2 * hw(CUP_H) + 20} height={(LID - CUP_H) * PX + 4} rx={4} fill={GLASS} opacity={0.92} />
				<Person mx={STRAW_X} my={yAt(MOUTH) + 6} />

				{ring > 0 && <ellipse cx={CX} cy={yAt(0.6)} rx={hw(0.6) + 34} ry={70} fill="none" stroke={C.amber} strokeWidth={5} strokeDasharray="18 12" opacity={ring} />}
				{brackets.map((b, i) => {
					const y1 = yAt(b.h1);
					const y2 = yAt(b.h2);
					const cap = 14 / z;
					return (
						<g key={i} opacity={b.o}>
							<line x1={b.x} y1={y1} x2={b.x} y2={y2} stroke={b.color} strokeWidth={5 / z} />
							<line x1={b.x - cap} y1={y1} x2={b.x + cap} y2={y1} stroke={b.color} strokeWidth={5 / z} />
							<line x1={b.x - cap} y1={y2} x2={b.x + cap} y2={y2} stroke={b.color} strokeWidth={5 / z} />
							<text x={b.x - 18 / z} y={(y1 + y2) / 2 + 15 / z} textAnchor="end" fontFamily={NUM} fontWeight={900} fontSize={44 / z} fill={b.color}>
								{b.label}
							</text>
						</g>
					);
				})}
				{label && (
					<g opacity={label.o}>
						<rect x={694} y={yAt(CUP_H) + floorH / 2 - 36} width={232} height={72} rx={14} fill="#07080A" opacity={0.85} stroke={C.green} strokeWidth={3} />
						<text x={810} y={yAt(CUP_H) + floorH / 2 + 16} textAnchor="middle" fontFamily={label.font} fontWeight={900} fontSize={44} fill={C.green}>
							{label.text}
						</text>
					</g>
				)}
			</g>
		</svg>
	);
};

// ── Push: an ordinary cup in cross-section, air pressing on the surface ──
export const PushArt: React.FC<{f: number; rise: number; arrows: number; font: string; air: string; low: string}> = ({f, rise, arrows, font, air, low}) => {
	const cx = 500;
	const top = 860;
	const bot = 1640;
	const ht = 225;
	const hb = 140;
	const lvl = 940;
	const sx = 590;
	const strawTop = 720;
	const colTop = lvl - (lvl - strawTop) * rise;
	const xAt = (y: number) => hb + ((ht - hb) * (bot - y)) / (bot - top);
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<linearGradient id="tea59p" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={TEA_HI} />
					<stop offset="0.2" stopColor={TEA} />
					<stop offset="1" stopColor="#8E5E36" />
				</linearGradient>
			</defs>
			<polygon points={`${cx - hb},${bot} ${cx + hb},${bot} ${cx + ht},${top} ${cx - ht},${top}`} fill={GLASS} opacity={0.05} />
			<polygon points={`${cx - hb},${bot} ${cx + hb},${bot} ${cx + xAt(lvl)},${lvl} ${cx - xAt(lvl)},${lvl}`} fill="url(#tea59p)" />
			<line x1={cx - xAt(lvl)} y1={lvl} x2={cx + xAt(lvl)} y2={lvl} stroke={TEA_HI} strokeWidth={5} />
			{[0, 1, 2, 3, 4, 5, 6].map((k) => {
				const x = cx - hb + 30 + (k % 4) * 66 + (k >= 4 ? 33 : 0);
				const y = bot - 40 - (k >= 4 ? 52 : 0);
				return <circle key={k} cx={x} cy={y} r={22} fill={PEARL} />;
			})}
			<rect x={sx - 16} y={strawTop} width={32} height={bot - 30 - strawTop} fill="#0E0F13" opacity={0.85} />
			<rect x={sx - 16} y={colTop} width={32} height={bot - 30 - colTop} fill="#B98451" />
			<rect x={sx - 16} y={strawTop} width={32} height={bot - 30 - strawTop} fill="none" stroke={GLASS} strokeWidth={4} rx={4} />
			<polygon points={`${cx - hb},${bot} ${cx + hb},${bot} ${cx + ht},${top} ${cx - ht},${top}`} fill="none" stroke={GLASS} strokeWidth={6} strokeLinejoin="round" />
			{/* low pressure at the top of the straw */}
			<g opacity={rise > 0.02 ? 1 : 0}>
				<circle cx={sx} cy={strawTop - 46} r={34} fill="none" stroke={C.ink} strokeWidth={5} />
				<line x1={sx - 16} y1={strawTop - 46} x2={sx + 16} y2={strawTop - 46} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
				<text x={sx + 52} y={strawTop - 32} fontFamily={font} fontWeight={700} fontSize={40} fill={C.ink}>
					{low}
				</text>
			</g>
			{/* air pushing down on the surface */}
			{[-170, -100, -30, 120, 175].map((dx, k) => {
				const bob = Math.sin((f + k * 9) / 7) * 6;
				const y0 = lvl - 150 + bob;
				return (
					<g key={k} opacity={arrows}>
						<line x1={cx + dx} y1={y0} x2={cx + dx} y2={lvl - 26 + bob} stroke={C.amber} strokeWidth={7} strokeLinecap="round" />
						<polygon points={`${cx + dx - 14},${lvl - 34 + bob} ${cx + dx + 14},${lvl - 34 + bob} ${cx + dx},${lvl - 12 + bob}`} fill={C.amber} />
					</g>
				);
			})}
			<text x={cx - 190} y={lvl - 172} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={40} fill={C.amber} opacity={arrows}>
				{air}
			</text>
		</svg>
	);
};

// ── Sky vs tea: a balance, the whole air column on the left, 10 m of water on the right ──
export const Balance: React.FC<{tilt: number; fill: number; font: string; sky: string; water: string; labels: number}> = ({tilt, fill, font, sky, water, labels}) => {
	const px = 540;
	const py = 1560;
	const arm = 330;
	const a = (tilt * Math.PI) / 180;
	const ly = py - Math.sin(a) * arm;
	const ry = py + Math.sin(a) * arm;
	const lx = px - Math.cos(a) * arm;
	const rx = px + Math.cos(a) * arm;
	const colW = 130;
	const teaH = CUP_H * PX * fill;
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<linearGradient id="air59" x1="0" y1="1" x2="0" y2="0">
					<stop offset="0" stopColor="#7FB8FF" stopOpacity={0.55} />
					<stop offset="0.45" stopColor="#7FB8FF" stopOpacity={0.2} />
					<stop offset="0.72" stopColor="#7FB8FF" stopOpacity={0.05} />
					<stop offset="1" stopColor="#7FB8FF" stopOpacity={0} />
				</linearGradient>
				<linearGradient id="tea59b" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={TEA_HI} />
					<stop offset="0.15" stopColor={TEA} />
					<stop offset="1" stopColor="#8E5E36" />
				</linearGradient>
			</defs>
			<rect x={-10} y={GROUND} width={1100} height={300} fill="#07080A" />
			<line x1={0} y1={GROUND} x2={1080} y2={GROUND} stroke={C.faint} strokeWidth={3} />
			<polygon points={`${px},${py + 8} ${px - 70},${GROUND} ${px + 70},${GROUND}`} fill="#2A2D34" />
			<rect x={lx - colW / 2} y={-40} width={colW} height={ly - 8 + 40} fill="url(#air59)" />
			<rect x={rx - colW / 2} y={ry - 8 - teaH} width={colW} height={teaH} fill="url(#tea59b)" />
			<rect x={rx - colW / 2} y={ry - 8 - CUP_H * PX} width={colW} height={CUP_H * PX} fill="none" stroke={GLASS} strokeWidth={4} strokeDasharray="12 10" opacity={0.5} />
			<line x1={lx - colW / 2 - 20} y1={ly} x2={rx + colW / 2 + 20} y2={ry} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
			<circle cx={px} cy={py} r={14} fill={C.amber} />
			<g opacity={labels} fontFamily={font} fontWeight={800} fontSize={40} textAnchor="middle">
				<text x={lx} y={ly - 60} fill="#CFE3FF" stroke="#07080A" strokeWidth={8} paintOrder="stroke">
					{sky}
				</text>
				<text x={rx} y={ry - 60} fill={C.ink} stroke="#07080A" strokeWidth={8} paintOrder="stroke">
					{water}
				</text>
			</g>
		</svg>
	);
};

// ── Boil: the top of the tea column in the straw, zoomed in, boiling at room temperature ──
const BUBBLES = (() => {
	const r = rng(23);
	return Array.from({length: 30}, () => ({x: 450 + r() * 180, p: 34 + Math.floor(r() * 40), ph: Math.floor(r() * 80), d: 120 + r() * 420, s: 0.6 + r() * 0.8}));
})();

export const BoilArt: React.FC<{f: number; boil: number; font: string; vac: string}> = ({f, boil, font, vac}) => {
	const L = 420;
	const R = 660;
	const surf = 1180;
	const wave = Array.from({length: 25}, (_, i) => {
		const x = L + (i * (R - L)) / 24;
		const y = surf + Math.sin(i * 1.7 + f * 0.5) * 7 * boil + Math.sin(i * 0.9 - f * 0.3) * 4 * boil;
		return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
	}).join(' ');
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<linearGradient id="tea59c" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={TEA_HI} />
					<stop offset="0.15" stopColor={TEA} />
					<stop offset="1" stopColor="#8E5E36" />
				</linearGradient>
				<clipPath id="tube59">
					<rect x={L} y={600} width={R - L} height={1400} />
				</clipPath>
			</defs>
			<rect x={L} y={640} width={R - L} height={1400} fill="#0E0F13" />
			<g clipPath="url(#tube59)">
				<path d={`${wave} L ${R} 2000 L ${L} 2000 Z`} fill="url(#tea59c)" />
				{BUBBLES.map((b, i) => {
					const u = ((f + b.ph) % b.p) / b.p;
					const y = surf + b.d * (1 - u);
					const rr = (5 + 14 * u) * b.s;
					return <circle key={i} cx={b.x + Math.sin(u * 6 + i) * 6} cy={y} r={rr} fill="#FFF3E2" fillOpacity={0.18} stroke="#FFF3E2" strokeOpacity={0.7} strokeWidth={3} opacity={boil * (u > 0.94 ? 0 : 1)} />;
				})}
				{BUBBLES.slice(0, 12).map((b, i) => {
					const u = ((f + b.ph * 2) % 60) / 60;
					return (
						<path
							key={i}
							d={`M ${b.x} ${surf - 20 - u * 300} q 14 -22 0 -44 q -14 -22 0 -44`}
							stroke="#FFF3E2"
							strokeWidth={4}
							fill="none"
							strokeLinecap="round"
							opacity={boil * 0.35 * Math.sin(u * Math.PI)}
						/>
					);
				})}
			</g>
			<rect x={L} y={640} width={R - L} height={1400} fill="none" stroke={GLASS} strokeWidth={6} />
			<text x={(L + R) / 2} y={860} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={44} fill={C.dim}>
				{vac}
			</text>
			{/* thermometer */}
			<g>
				<rect x={786} y={960} width={30} height={360} rx={15} fill="none" stroke={GLASS} strokeWidth={5} />
				<rect x={794} y={1180} width={14} height={150} fill={C.red} />
				<circle cx={801} cy={1350} r={30} fill={C.red} stroke={GLASS} strokeWidth={5} />
				<text x={801} y={1440} textAnchor="middle" fontFamily={NUM} fontWeight={800} fontSize={44} fill={C.ink}>
					25°C
				</text>
			</g>
		</svg>
	);
};

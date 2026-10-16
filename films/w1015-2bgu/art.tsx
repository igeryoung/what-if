import React from 'react';

export const rng = (seed: number) => () => {
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const P = {
	sky0: '#121725',
	sky1: '#0C0D10',
	city: '#151922',
	window: '#FFB020',
	ledgeTop: '#4B505B',
	ledgeFace: '#262A32',
	wall: '#121419',
	moon: '#ECE6D8',
	body: '#4C525F',
	bodyHi: '#6A7182',
	band: '#ECE9E3',
	eye: '#14161B',
	rim: '#9AA1AE',
	wing: 'rgba(205,222,255,0.16)',
	wingEdge: 'rgba(225,236,255,0.6)',
	blood: '#C8102E',
	bloodDeep: '#8E0B1F',
	pBody: '#98A1AE',
	pBack: '#B1B9C4',
	pHead: '#8A93A1',
	pDark: '#353A43',
	pFeet: '#D86C7B',
	skin: '#C98F70',
	skinHi: '#DDA685',
};

// ---------- Mosquito (side view, facing left; feet at y = 0, about 420 × 235 at scale 1) ----------
const LEGS: [number, number][][] = [
	[[-62, -128], [-125, -150], [-178, 0]], // front, near
	[[-58, -126], [-106, -138], [-142, 0]], // front, far
	[[-44, -121], [-70, -96], [-78, 0]], // middle, near
	[[-40, -120], [-24, -96], [-18, 0]], // middle, far
	[[-28, -124], [26, -96], [120, -152], [192, -206]], // hind, near: raised like an Aedes
	[[-26, -122], [30, -86], [110, 0]], // hind, far
];
const pts = (p: [number, number][]) => p.map(([x, y]) => `${x},${y}`).join(' ');

export const Mosquito: React.FC<{
	x: number;
	y: number;
	scale: number;
	id: string;
	t?: number; // frame, drives the wing buzz
	buzz?: number; // 0 = wings folded, 1 = full buzz
	blood?: number; // 0 = empty, 1 = fully fed (abdomen swollen red)
	bite?: number; // 0 = proboscis at rest, 1 = pushed down into the surface
	flip?: boolean;
}> = ({x, y, scale, id, t = 0, buzz = 0, blood = 0, bite = 0, flip = false}) => {
	const sw = 1.6 / scale;
	const ax = 78 + 6 * blood;
	const ay = -134 + 8 * blood;
	const rx = 92 + 12 * blood;
	const ry = 21 + 21 * blood;
	const tip = [-205 + 22 * bite, -62 + 92 * bite];
	// Wings: folded back over the abdomen; buzzing adds a flap fan and a fast-moving wing.
	const B = [-28, -180];
	const rest = 7;
	const flapA = rest - buzz * 72 * (0.5 + 0.5 * Math.sin(t * 2.9));
	const flapB = rest - buzz * 72 * (0.5 + 0.5 * Math.sin(t * 2.9 + 2.1));
	const wing = (ang: number, op: number, dy = 0, key?: string) => (
		<g key={key} transform={`rotate(${ang} ${B[0]} ${B[1] + dy})`} opacity={op}>
			<ellipse cx={B[0] + 104} cy={B[1] + dy} rx={104} ry={17} fill={P.wing} stroke={P.wingEdge} strokeWidth={sw * 1.2} />
			<path d={`M ${B[0] + 8} ${B[1] + dy} L ${B[0] + 196} ${B[1] + dy - 2} M ${B[0] + 30} ${B[1] + dy + 6} L ${B[0] + 170} ${B[1] + dy + 10}`} stroke={P.wingEdge} strokeWidth={sw * 0.8} opacity={0.6} />
		</g>
	);
	// motion blur: faint ghost wings across the stroke
	const fan = buzz > 0.01 ? <g opacity={0.5 * buzz}>{[-62, -44, -26, -8].map((a) => wing(a, 0.35, 0, `g${a}`))}</g> : null;
	return (
		<g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
			<defs>
				<clipPath id={`${id}-abd`}>
					<ellipse cx={ax} cy={ay} rx={rx} ry={ry} transform={`rotate(12 ${ax} ${ay})`} />
				</clipPath>
			</defs>
			<ellipse cx={0} cy={2} rx={170} ry={9} fill="#000" opacity={0.35} />
			{/* far wing + far legs */}
			{buzz > 0.01 ? wing(flapB, 0.55, -4) : wing(rest - 4, 0.8, -6)}
			{[1, 3, 5].map((i) => (
				<g key={i} opacity={0.75}>
					<polyline points={pts(LEGS[i])} fill="none" stroke={P.body} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round" />
					<polyline points={pts(LEGS[i])} fill="none" stroke={P.band} strokeWidth={4.5} strokeDasharray="5 15" strokeDashoffset={i * 4} />
				</g>
			))}
			{/* proboscis + palps */}
			<line x1={-111} y1={-143} x2={tip[0]} y2={tip[1]} stroke={P.bodyHi} strokeWidth={5} strokeLinecap="round" />
			<line x1={-111} y1={-143} x2={-111 + (tip[0] + 111) * 0.3} y2={-143 + (tip[1] + 143) * 0.3} stroke={P.body} strokeWidth={8} strokeLinecap="round" />
			{/* abdomen with white bands; fills red as it feeds */}
			<ellipse cx={ax} cy={ay} rx={rx} ry={ry} transform={`rotate(12 ${ax} ${ay})`} fill={P.body} stroke={P.rim} strokeWidth={sw} />
			<g clipPath={`url(#${id}-abd)`}>
				<g transform={`rotate(12 ${ax} ${ay})`}>
					{[-62, -34, -6, 22, 50, 78].map((dx) => (
						<rect key={dx} x={ax + dx * (rx / 92)} y={ay - 60} width={7} height={120} fill={P.band} opacity={1 - 0.75 * blood} />
					))}
				</g>
				<ellipse cx={ax} cy={ay} rx={rx} ry={ry} transform={`rotate(12 ${ax} ${ay})`} fill={P.blood} opacity={0.92 * blood} />
				<ellipse cx={ax - 10} cy={ay - ry * 0.45} rx={rx * 0.6} ry={ry * 0.22} transform={`rotate(12 ${ax} ${ay})`} fill="#fff" opacity={0.22 * blood} />
			</g>
			{/* thorax with lyre markings */}
			<path d="M -78 -140 C -80 -176 -46 -197 -10 -184 C 12 -174 14 -140 -4 -124 C -24 -110 -68 -114 -78 -140 Z" fill={P.bodyHi} stroke={P.rim} strokeWidth={sw} />
			<path d="M -56 -174 C -46 -160 -46 -140 -42 -127 M -30 -180 C -24 -163 -24 -146 -18 -131" fill="none" stroke={P.band} strokeWidth={4} strokeLinecap="round" />
			{/* head, eye, antennae */}
			<path d="M -104 -166 L -150 -222 M -101 -168 L -124 -234" stroke={P.bodyHi} strokeWidth={3.2} strokeLinecap="round" />
			{[0.3, 0.5, 0.7, 0.9].map((k) => (
				<path key={k} d={`M ${-104 - 46 * k - 7} ${-166 - 56 * k + 4} L ${-104 - 46 * k + 7} ${-166 - 56 * k - 4} M ${-101 - 23 * k - 7} ${-168 - 66 * k + 1} L ${-101 - 23 * k + 7} ${-168 - 66 * k - 1}`} stroke={P.bodyHi} strokeWidth={2} />
			))}
			<circle cx={-95} cy={-151} r={20} fill={P.body} stroke={P.rim} strokeWidth={sw} />
			<circle cx={-99} cy={-153} r={15} fill={P.eye} />
			<circle cx={-104} cy={-159} r={4.5} fill="#fff" opacity={0.55} />
			{/* near legs */}
			{[0, 2, 4].map((i) => (
				<g key={i}>
					<polyline points={pts(LEGS[i])} fill="none" stroke={P.body} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
					<polyline points={pts(LEGS[i])} fill="none" stroke={P.band} strokeWidth={5} strokeDasharray="5 15" strokeDashoffset={i * 3} />
				</g>
			))}
			{/* near wing */}
			{fan}
			{buzz > 0.01 ? wing(flapA, 0.9) : wing(rest, 0.95)}
		</g>
	);
};

// ---------- Pigeon (side view, facing right; feet at y = 0, about 345 × 300 at scale 1) ----------
const P_BODY = 'M 118 -205 C 132 -150 112 -86 56 -66 C 20 -53 -40 -58 -76 -80 L -186 -112 L -192 -136 L -96 -160 C -60 -206 0 -230 50 -232 C 76 -234 102 -226 118 -205 Z';
const P_NECK = 'M 54 -230 C 58 -262 76 -292 102 -297 C 128 -300 141 -281 135 -256 C 131 -236 127 -220 119 -204 Z';
const P_WING = 'M 44 -214 C 2 -216 -62 -190 -152 -140 C -100 -124 -40 -114 12 -124 C 44 -140 58 -182 44 -214 Z';

/** The pigeon's outline shapes (body + neck/head), for clip paths (which can't contain <g>, so the transform goes on each path). */
export const PigeonShape: React.FC<{transform?: string}> = ({transform}) => (
	<>
		<path d={P_BODY} transform={transform} />
		<path d={P_NECK} transform={transform} />
	</>
);

export const Pigeon: React.FC<{x: number; y: number; scale: number; id: string; t?: number; flip?: boolean}> = ({x, y, scale, id, t = 0, flip = false}) => {
	const sw = 1.6 / scale;
	const nod = 4 * Math.sin((t / 45) * Math.PI); // gentle head tilt, period 90 frames
	return (
		<g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
			<defs>
				<linearGradient id={`${id}-neck`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#2FA884" />
					<stop offset="0.55" stopColor="#4C7FA8" />
					<stop offset="1" stopColor="#8E5BB5" />
				</linearGradient>
			</defs>
			<ellipse cx={-10} cy={2} rx={150} ry={9} fill="#000" opacity={0.35} />
			{/* legs + toes */}
			<g stroke={P.pFeet} strokeWidth={7} strokeLinecap="round" fill="none">
				<path d="M 24 -64 L 20 -6 M 20 -4 L -2 0 M 20 -4 L 40 0" />
				<path d="M 46 -62 L 50 -6 M 50 -4 L 30 1 M 50 -4 L 72 0" />
			</g>
			<path d={P_BODY} fill={P.pBody} stroke={P.rim} strokeWidth={sw} />
			{/* tail band */}
			<path d="M -150 -150 L -192 -136 L -186 -112 L -146 -120 Z" fill={P.pDark} />
			{/* folded wing with two dark bars */}
			<path d={P_WING} fill={P.pBack} />
			<path d="M -104 -150 C -122 -142 -140 -140 -152 -140 C -128 -130 -112 -126 -92 -124 Z" fill={P.pDark} opacity={0.75} />
			<path d="M -6 -196 C -16 -170 -22 -148 -28 -126 M -42 -182 C -52 -160 -58 -144 -62 -124" fill="none" stroke={P.pDark} strokeWidth={9} strokeLinecap="round" />
			<g transform={`rotate(${nod} 60 -228)`}>
				<path d={P_NECK} fill={P.pHead} stroke={P.rim} strokeWidth={sw} />
				{/* iridescent neck patch */}
				<path d="M 64 -238 C 82 -250 116 -246 130 -232 C 128 -218 124 -210 119 -202 C 96 -206 72 -214 60 -226 Z" fill={`url(#${id}-neck)`} opacity={0.9} />
				{/* beak + cere */}
				<path d="M 130 -279 L 160 -268 L 130 -263 Z" fill="#3A3E47" />
				<ellipse cx={133} cy={-276} rx={8} ry={5} fill={P.band} />
				{/* eye */}
				<circle cx={114} cy={-279} r={8} fill="#E8742A" />
				<circle cx={115} cy={-279} r={3.8} fill="#111" />
			</g>
		</g>
	);
};

// ---------- The opening image: night skyline, a ledge, a pigeon and a pigeon-sized mosquito ----------
export const LEDGE = 1268;
const CITY = (() => {
	const r = rng(23);
	const out: {x: number; w: number; top: number; win: {x: number; y: number}[]}[] = [];
	let x = -20;
	while (x < 1100) {
		const w = 90 + r() * 120;
		const top = 960 + r() * 170;
		const win: {x: number; y: number}[] = [];
		for (let wy = top + 24; wy < LEDGE - 20; wy += 34) for (let wx = x + 16; wx < x + w - 20; wx += 30) if (r() < 0.16) win.push({x: wx, y: wy});
		out.push({x, w, top, win});
		x += w + 6 + r() * 20;
	}
	return out;
})();

export const Backdrop: React.FC<{moon?: [number, number]}> = ({moon = [846, 262]}) => (
	<>
		<defs>
			<linearGradient id="bd-sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={P.sky1} />
				<stop offset="0.55" stopColor={P.sky0} />
				<stop offset="0.66" stopColor="#1A2132" />
			</linearGradient>
			<radialGradient id="bd-moon" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0.45" stopColor={P.moon} stopOpacity={0.16} />
				<stop offset="1" stopColor={P.moon} stopOpacity={0} />
			</radialGradient>
		</defs>
		<rect x={0} y={0} width={1080} height={1920} fill="url(#bd-sky)" />
		<g transform={`translate(${moon[0] - 846} ${moon[1] - 262})`}>
			<circle cx={846} cy={262} r={150} fill="url(#bd-moon)" />
			<circle cx={846} cy={262} r={58} fill={P.moon} />
			<circle cx={828} cy={250} r={10} fill="#D6CFC0" />
			<circle cx={862} cy={280} r={7} fill="#D6CFC0" />
		</g>
		{CITY.map((b, i) => (
			<g key={i}>
				<rect x={b.x} y={b.top} width={b.w} height={LEDGE - b.top + 10} fill={P.city} />
				{b.win.map((w, j) => (
					<rect key={j} x={w.x} y={w.y} width={12} height={16} fill={P.window} opacity={0.32} />
				))}
			</g>
		))}
		{/* ledge */}
		<rect x={0} y={LEDGE - 6} width={1080} height={20} fill={P.ledgeTop} />
		<rect x={0} y={LEDGE + 14} width={1080} height={96} fill={P.ledgeFace} />
		<rect x={0} y={LEDGE + 110} width={1080} height={1920} fill={P.wall} />
	</>
);

/** Hook and End share this exactly; `t` = 0 at the first frame of the film and at the last frame of the end. */
export const HookArt: React.FC<{t: number; moon?: [number, number]}> = ({t, moon}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
		<Backdrop moon={moon} />
		<Pigeon x={300} y={LEDGE - 2} scale={1.08} id="hk-p" t={t} />
		<Mosquito x={770} y={LEDGE - 2} scale={1.16} id="hk-m" t={t} buzz={0.85} />
	</svg>
);

// ---------- Blood bag (top-left at x, y) ----------
export const BloodBag: React.FC<{x: number; y: number; level: number; id: string; scale?: number}> = ({x, y, level, id, scale = 1}) => {
	const w = 300;
	const h = 420;
	const inner = {x: 14, y: 70, w: w - 28, h: h - 92};
	const top = inner.y + inner.h * (1 - Math.max(0, Math.min(1, level)));
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			<defs>
				<clipPath id={`${id}-in`}>
					<rect x={inner.x} y={inner.y} width={inner.w} height={inner.h} rx={30} />
				</clipPath>
				<linearGradient id={`${id}-liq`} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor={P.bloodDeep} />
					<stop offset="0.45" stopColor={P.blood} />
					<stop offset="1" stopColor={P.bloodDeep} />
				</linearGradient>
			</defs>
			{/* hanger + top seal */}
			<rect x={w / 2 - 46} y={-6} width={92} height={60} rx={14} fill="none" stroke="#C9CDD4" strokeWidth={8} />
			<rect x={0} y={44} width={w} height={h - 44} rx={40} fill="rgba(230,236,245,0.07)" stroke="#C9CDD4" strokeWidth={6} />
			<rect x={0} y={44} width={w} height={22} fill="rgba(230,236,245,0.14)" />
			<g clipPath={`url(#${id}-in)`}>
				<rect x={inner.x} y={top} width={inner.w} height={inner.y + inner.h - top + 4} fill={`url(#${id}-liq)`} />
				<rect x={inner.x} y={top} width={inner.w} height={6} fill="#FF5A5F" opacity={level > 0.01 ? 0.6 : 0} />
			</g>
			{/* graduation ticks on the right */}
			{Array.from({length: 10}, (_, i) => (
				<rect key={i} x={w - 46} y={inner.y + (inner.h * i) / 9 - 2} width={i % 3 === 0 ? 30 : 16} height={4} fill="#C9CDD4" opacity={0.7} />
			))}
			{/* ports + tube */}
			<rect x={w / 2 - 54} y={h} width={26} height={44} rx={6} fill="#C9CDD4" />
			<rect x={w / 2 + 28} y={h} width={26} height={44} rx={6} fill="#C9CDD4" />
			<path d={`M ${w / 2 + 41} ${h + 44} C ${w / 2 + 41} ${h + 140} ${w + 120} ${h + 60} ${w + 110} ${h + 190}`} fill="none" stroke="rgba(200,16,46,0.75)" strokeWidth={12} strokeLinecap="round" />
		</g>
	);
};

// ---------- Person pictogram, filled with blood up to `level` (feet at x, y; 820 tall) ----------
const PersonShapes: React.FC = () => (
	<>
		<circle cx={0} cy={-740} r={74} />
		<rect x={-34} y={-680} width={68} height={50} />
		<rect x={-118} y={-650} width={236} height={320} rx={64} />
		<rect x={-178} y={-636} width={52} height={300} rx={26} />
		<rect x={126} y={-636} width={52} height={300} rx={26} />
		<rect x={-104} y={-380} width={94} height={380} rx={40} />
		<rect x={10} y={-380} width={94} height={380} rx={40} />
	</>
);
export const PERSON_H = 814;
export const Person: React.FC<{x: number; y: number; level: number; scale?: number}> = ({x, y, level, scale = 1}) => {
	const top = -PERSON_H * level;
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			<defs>
				<clipPath id="person-clip">
					<PersonShapes />
				</clipPath>
			</defs>
			<g fill="#1B1E25" stroke="#3A3F4A" strokeWidth={6}>
				<PersonShapes />
			</g>
			<g clipPath="url(#person-clip)">
				<rect x={-200} y={top} width={400} height={-top + 4} fill={P.blood} />
				<rect x={-200} y={top} width={400} height={8} fill="#FF5A5F" opacity={0.7} />
			</g>
		</g>
	);
};

// ---------- Fly swatter (pivot at the end of the handle; points up at angle 0) ----------
export const Swatter: React.FC<{x: number; y: number; angle: number; scale?: number}> = ({x, y, angle, scale = 1}) => (
	<g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
		<rect x={-14} y={-560} width={28} height={560} rx={14} fill="#E39A12" />
		<rect x={-170} y={-900} width={340} height={360} rx={44} fill="#FFB020" />
		{Array.from({length: 7}, (_, i) => (
			<rect key={`v${i}`} x={-130 + i * 40} y={-866} width={14} height={292} rx={7} fill="#C77F0A" />
		))}
		{Array.from({length: 7}, (_, i) => (
			<rect key={`h${i}`} x={-140} y={-856 + i * 42} width={280} height={14} rx={7} fill="#C77F0A" />
		))}
	</g>
);

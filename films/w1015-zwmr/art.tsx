import React from 'react';

// Flat vector art for the film: the birthday Lab, the cake and its candles, a kid, a DNA strand, the age chart,
// and the size comparison animals. All drawn in SVG; nothing here reads the clock — callers pass `tick`.
export const P = {
	fur: '#E8BE78',
	furShade: '#CF9F58',
	furLight: '#F6DDAE',
	ear: '#B98540',
	nose: '#2A201A',
	tongue: '#F27A8E',
	collar: '#FF3B30',
	tag: '#FFB020',
	hat: '#2F7BFF',
	hatBand: '#FFB020',
	cream: '#FBE6CB',
	creamShade: '#EBCFAC',
	jam: '#FF6F96',
	frost: '#FF8DB2',
	frostTop: '#FFA9C6',
	plate: '#E9E4DB',
	plateRim: '#B3AC9F',
	table: '#1A1410',
	tableEdge: '#33281F',
	flame: '#FFB020',
	flameCore: '#FFF4C9',
	skin: '#D9A07A',
	hair: '#3B2A20',
	shirt: '#2EB8A6',
	shorts: '#2E3A59',
	balloon: '#FF3B30',
	strandA: '#DDE6F0',
	strandB: '#5E8BFF',
	rung: '#3A4252',
	tagDot: '#FFB020',
};

export const rng = (seed: number) => {
	let s = seed >>> 0 || 1;
	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 4294967296;
	};
};

const c01 = (v: number) => Math.min(1, Math.max(0, v));
const backOut = (p: number) => {
	const k = 1.9;
	const q = p - 1;
	return 1 + (k + 1) * q * q * q + k * q * q;
};
const mod = (a: number, n: number) => ((a % n) + n) % n;

// ── The birthday Lab: sitting, facing us. Origin = bottom centre of the body. ──────────────────────────────
export const Lab: React.FC<{
	x: number;
	y: number;
	sc?: number;
	tick: number;
	hat?: boolean;
	mood?: 'happy' | 'wow';
	head?: number; // head scale (puppies have big heads)
	collar?: boolean;
	seed?: number;
}> = ({x, y, sc = 1, tick, hat = false, mood = 'happy', head = 1, collar = true, seed = 0}) => {
	const wag = 14 * Math.sin(tick * 0.38 + seed);
	const blink = mod(tick + 40 + seed * 23, 97) < 4 ? 0.12 : 1; // eyes open on frame 0 (and on the cover)
	const eyeR = mood === 'wow' ? 19 : 15;
	const ear = (
		<path d="M-92 -72 C-150 -64 -172 18 -148 76 C-134 104 -98 92 -92 60 C-88 28 -84 -26 -64 -62 Z" fill={P.ear} />
	);
	const eye = (ex: number) => (
		<g transform={`translate(${ex} -14) scale(1 ${blink})`}>
			<circle r={eyeR} fill={P.nose} />
			<circle cx={5} cy={-6} r={5.5} fill="#fff" />
		</g>
	);
	return (
		<g transform={`translate(${x} ${y}) scale(${sc})`}>
			<g transform={`rotate(${wag} 105 -60)`}>
				<path d="M105 -60 Q190 -70 210 -160" stroke={P.furShade} strokeWidth={30} fill="none" strokeLinecap="round" />
			</g>
			<ellipse cx={-132} cy={-58} rx={72} ry={58} fill={P.furShade} />
			<ellipse cx={132} cy={-58} rx={72} ry={58} fill={P.furShade} />
			<path d="M-92 -330 C-150 -250 -188 -120 -172 -34 Q-166 0 -126 0 L126 0 Q166 0 172 -34 C188 -120 150 -250 92 -330 Z" fill={P.fur} />
			<ellipse cx={0} cy={-205} rx={62} ry={105} fill={P.furLight} opacity={0.55} />
			<rect x={-86} y={-238} width={64} height={230} rx={32} fill={P.fur} />
			<rect x={22} y={-238} width={64} height={230} rx={32} fill={P.fur} />
			<path d="M-24 -190 L-24 -30 M24 -190 L24 -30" stroke={P.furShade} strokeWidth={5} opacity={0.7} strokeLinecap="round" />
			<ellipse cx={-54} cy={-14} rx={46} ry={22} fill={P.furLight} />
			<ellipse cx={54} cy={-14} rx={46} ry={22} fill={P.furLight} />
			<path d="M-68 -22 L-68 -6 M-40 -22 L-40 -6 M40 -22 L40 -6 M68 -22 L68 -6" stroke={P.furShade} strokeWidth={4} strokeLinecap="round" />
			{collar ? (
				<>
					<path d="M-96 -322 Q0 -276 96 -322" stroke={P.collar} strokeWidth={22} fill="none" strokeLinecap="round" />
					<circle cx={0} cy={-286} r={15} fill={P.tag} />
				</>
			) : null}
			<g transform={`translate(0 -440) scale(${head})`}>
				<ellipse cx={0} cy={-8} rx={120} ry={110} fill={P.fur} />
				<ellipse cx={0} cy={40} rx={108} ry={72} fill={P.fur} />
				{ear}
				<g transform="scale(-1 1)">{ear}</g>
				<ellipse cx={0} cy={54} rx={76} ry={56} fill={P.furLight} />
				<path d="M-70 -46 Q-46 -60 -24 -48 M24 -48 Q46 -60 70 -46" stroke={P.furShade} strokeWidth={6} fill="none" strokeLinecap="round" opacity={mood === 'wow' ? 1 : 0} />
				{eye(-46)}
				{eye(46)}
				{mood === 'happy' ? <path d="M-17 76 Q0 72 17 76 L15 104 Q0 118 -15 104 Z" fill={P.tongue} /> : null}
				<path d="M-30 18 Q0 6 30 18 Q28 42 0 50 Q-28 42 -30 18 Z" fill={P.nose} />
				<ellipse cx={-9} cy={20} rx={9} ry={5} fill="#fff" opacity={0.35} />
				{mood === 'happy' ? (
					<path d="M0 50 L0 66 M-38 66 Q-18 86 0 66 Q18 86 38 66" stroke={P.nose} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				) : (
					<>
						<path d="M0 50 L0 64" stroke={P.nose} strokeWidth={6} strokeLinecap="round" />
						<ellipse cx={0} cy={84} rx={15} ry={19} fill={P.nose} />
						<ellipse cx={0} cy={90} rx={9} ry={9} fill={P.tongue} />
					</>
				)}
				{hat ? (
					<g transform="translate(20 -96) rotate(12)">
						<path d="M-62 0 L0 -178 L62 0 Q0 16 -62 0 Z" fill={P.hat} />
						<path d="M-41 -60 L41 -60 L30 -92 L-30 -92 Z" fill={P.hatBand} />
						<path d="M-20 -120 L20 -120 L12 -144 L-12 -144 Z" fill={P.hatBand} />
						<path d="M-64 0 Q0 18 64 0 L60 -14 Q0 2 -60 -14 Z" fill="#fff" opacity={0.9} />
						<circle cx={0} cy={-180} r={22} fill={P.hatBand} />
					</g>
				) : null}
			</g>
		</g>
	);
};

// ── The cake. Origin = centre of the plate. `n` = candles shown (fractional values animate the next one). ──
export const CAKE_MAX = 31;
const CANDLE_H = 80;
const CANDLE_COLORS = ['#FFFFFF', '#7CC8FF', '#FFD166', '#9BE3B5', '#FF9EBB'];

const spots = (rx: number, ry: number) =>
	Array.from({length: CAKE_MAX}, (_, i) => {
		if (i === 0) return {i, x: 0, y: 2};
		const r = Math.sqrt((i + 0.5) / CAKE_MAX) * 0.86;
		const a = i * 2.39996 + 1.2;
		return {i, x: Math.cos(a) * r * rx, y: Math.sin(a) * r * ry};
	}).sort((a, b) => a.y - b.y);

export const Cake: React.FC<{x: number; y: number; w?: number; h?: number; n: number; tick: number}> = ({x, y, w = 540, h = 190, n, tick}) => {
	const rx = w / 2;
	const ry = w * 0.12;
	const top = -h;
	const band = (y1: number, y2: number) => `M${-rx} ${y1} A${rx} ${ry} 0 0 0 ${rx} ${y1} L${rx} ${y2} A${rx} ${ry} 0 0 1 ${-rx} ${y2} Z`;
	const front = (px: number, py: number) => py + ry * Math.sqrt(Math.max(0, 1 - (px / rx) ** 2));
	const r = rng(42);
	const drips = Array.from({length: 11}, (_, k) => {
		const px = -rx + 24 + (k / 10) * (w - 48) + (r() - 0.5) * 16;
		return {px, len: 18 + r() * 34};
	});
	const sprinkles = Array.from({length: 26}, () => {
		const px = (r() * 2 - 1) * rx * 0.9;
		const py = top + 74 + r() * (h - 110);
		return {px, py: front(px, py), a: r() * 180, c: CANDLE_COLORS[Math.floor(r() * 5)]};
	});
	return (
		<g transform={`translate(${x} ${y})`}>
			<defs>
				<radialGradient id="zwmr-glow">
					<stop offset="0%" stopColor="#FFD27A" stopOpacity={0.55} />
					<stop offset="100%" stopColor="#FFD27A" stopOpacity={0} />
				</radialGradient>
			</defs>
			<ellipse cx={0} cy={16} rx={rx + 80} ry={44} fill="#000" opacity={0.35} />
			<ellipse cx={0} cy={8} rx={rx + 56} ry={38} fill={P.plateRim} />
			<ellipse cx={0} cy={0} rx={rx + 56} ry={36} fill={P.plate} />
			<path d={band(top, -12)} fill={P.cream} />
			<path d={band(-h * 0.42, -h * 0.42 + 20)} fill={P.jam} />
			<path d={band(-40, -12)} fill={P.creamShade} />
			{sprinkles.map((sp, k) => (
				<rect key={k} x={sp.px - 9} y={sp.py - 3} width={18} height={6} rx={3} fill={sp.c} transform={`rotate(${sp.a} ${sp.px} ${sp.py})`} />
			))}
			<path d={band(top, top + 46)} fill={P.frost} />
			{drips.map((d, k) => {
				const yy = front(d.px, top + 40);
				return <rect key={k} x={d.px - 13} y={yy - 8} width={26} height={d.len + 8} rx={13} fill={P.frost} />;
			})}
			<ellipse cx={0} cy={top} rx={rx} ry={ry} fill={P.frostTop} />
			{spots(rx, ry).map((sp) => {
				const p = c01(n - sp.i);
				if (p <= 0) return null;
				const e = backOut(p);
				const fl = c01((p - 0.55) / 0.45);
				const fs = fl * (1 + 0.09 * Math.sin(tick * 0.7 + sp.i * 1.9));
				const sway = 4 * Math.sin(tick * 0.31 + sp.i * 2.3);
				const tipY = top + sp.y - CANDLE_H * e - 8;
				return (
					<g key={sp.i}>
						<g transform={`translate(${sp.x} ${top + sp.y}) scale(1 ${e})`}>
							<rect x={-7} y={-CANDLE_H} width={14} height={CANDLE_H} rx={4} fill={CANDLE_COLORS[sp.i % 5]} />
							<rect x={-7} y={-CANDLE_H} width={4} height={CANDLE_H} rx={2} fill="#fff" opacity={0.4} />
							<line x1={0} y1={-CANDLE_H} x2={0} y2={-CANDLE_H - 8} stroke="#3A2A20" strokeWidth={3} />
						</g>
						{fs > 0 ? (
							<g transform={`translate(${sp.x} ${tipY}) scale(${fs * 0.95} ${fs * 1.08}) skewX(${sway})`}>
								<circle cx={0} cy={-14} r={30} fill="url(#zwmr-glow)" />
								<path d="M0 0 C-11 -8 -10 -24 0 -38 C10 -24 11 -8 0 0 Z" fill={P.flame} />
								<path d="M0 -3 C-5 -7 -5 -15 0 -23 C5 -15 5 -7 0 -3 Z" fill={P.flameCore} />
							</g>
						) : null}
					</g>
				);
			})}
		</g>
	);
};

// ── The opening image: the Lab in a party hat behind its cake, on a table. Same placement in hook and end. ──
export const PARTY = {dogX: 540, dogY: 1700, dogSc: 1.12, cakeY: 1722, cakeW: 540, tableY: 1690};
export const Party: React.FC<{tick: number; n: number; mood?: 'happy' | 'wow'}> = ({tick, n, mood = 'happy'}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
		<Lab x={PARTY.dogX} y={PARTY.dogY} sc={PARTY.dogSc} tick={tick} hat mood={mood} />
		<rect x={-200} y={PARTY.tableY} width={1480} height={600} fill={P.table} />
		<rect x={-200} y={PARTY.tableY} width={1480} height={6} fill={P.tableEdge} />
		<Cake x={540} y={PARTY.cakeY} w={PARTY.cakeW} n={n} tick={tick} />
	</svg>
);

// ── A 7-year-old with a balloon. Origin = between the feet; about 500 units tall without the balloon. ──
export const Kid: React.FC<{x: number; y: number; sc?: number; tick: number; label?: string; font?: string}> = ({x, y, sc = 1, tick, label = '7', font}) => {
	const sway = 4 * Math.sin(tick * 0.09);
	return (
		<g transform={`translate(${x} ${y}) scale(${sc})`}>
			<g transform={`rotate(${sway} 96 -214)`}>
				<path d="M96 -214 Q130 -380 150 -560" stroke="#C9C2B6" strokeWidth={3} fill="none" />
				<ellipse cx={150} cy={-622} rx={54} ry={64} fill={P.balloon} />
				<path d="M142 -560 L158 -560 L150 -548 Z" fill={P.balloon} />
				<ellipse cx={130} cy={-650} rx={12} ry={18} fill="#fff" opacity={0.3} />
				<text x={150} y={-600} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={64} fill="#fff">
					{label}
				</text>
			</g>
			<rect x={-40} y={-196} width={30} height={186} rx={14} fill={P.skin} />
			<rect x={10} y={-196} width={30} height={186} rx={14} fill={P.skin} />
			<ellipse cx={-28} cy={-8} rx={30} ry={13} fill={P.balloon} />
			<ellipse cx={28} cy={-8} rx={30} ry={13} fill={P.balloon} />
			<path d="M-50 -256 L50 -256 L56 -160 L6 -160 L0 -206 L-6 -160 L-56 -160 Z" fill={P.shorts} />
			<path d="M-84 -318 L-96 -214" stroke={P.skin} strokeWidth={24} strokeLinecap="round" />
			<path d="M84 -318 L96 -214" stroke={P.skin} strokeWidth={24} strokeLinecap="round" />
			<path d="M-60 -372 Q0 -392 60 -372 L100 -318 L76 -298 L64 -320 L64 -246 L-64 -246 L-64 -320 L-76 -298 L-100 -318 Z" fill={P.shirt} />
			<rect x={-13} y={-404} width={26} height={36} fill={P.skin} />
			<circle cx={0} cy={-448} r={60} fill={P.skin} />
			<path d="M-62 -446 Q-66 -514 0 -514 Q66 -514 62 -446 Q44 -480 4 -474 Q-30 -484 -62 -446 Z" fill={P.hair} />
			<circle cx={-21} cy={-444} r={7} fill={P.nose} />
			<circle cx={21} cy={-444} r={7} fill={P.nose} />
			<circle cx={-36} cy={-422} r={10} fill="#FF7E8A" opacity={0.35} />
			<circle cx={36} cy={-422} r={10} fill="#FF7E8A" opacity={0.35} />
			<path d="M-18 -418 Q0 -402 18 -418" stroke={P.nose} strokeWidth={5} fill="none" strokeLinecap="round" />
		</g>
	);
};

// ── A horizontal DNA double helix with methyl tags that accumulate (`tags` = how many are on). ──
export const Helix: React.FC<{y: number; x0: number; x1: number; phase: number; tags: number; amp?: number}> = ({y, x0, x1, phase, tags, amp = 90}) => {
	const k = (Math.PI * 2) / 300;
	const ya = (x: number) => y + amp * Math.sin(k * (x - x0) + phase);
	const yb = (x: number) => y - amp * Math.sin(k * (x - x0) + phase);
	const pts = (fn: (x: number) => number) => {
		const out: string[] = [];
		for (let x = x0; x <= x1; x += 6) out.push(`${x.toFixed(1)},${fn(x).toFixed(1)}`);
		return out.join(' ');
	};
	const rungs: number[] = [];
	for (let x = x0 + 12; x < x1; x += 25) rungs.push(x);
	const r = rng(9);
	const order = rungs.map((rx, i) => ({rx, i, key: r(), side: r() < 0.5 ? 0 : 1})).sort((a, b) => a.key - b.key);
	return (
		<g>
			{rungs.map((rx, i) => (
				<line key={i} x1={rx} y1={ya(rx)} x2={rx} y2={yb(rx)} stroke={P.rung} strokeWidth={7} strokeLinecap="round" />
			))}
			<polyline points={pts(yb)} fill="none" stroke={P.strandB} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
			<polyline points={pts(ya)} fill="none" stroke={P.strandA} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
			{order.map((o, j) => {
				const p = c01(tags - j);
				if (p <= 0) return null;
				const e = backOut(p);
				const sy = o.side === 0 ? ya(o.rx) : yb(o.rx);
				const dir = sy < y ? -1 : 1;
				return (
					<g key={o.i} transform={`translate(${o.rx} ${sy}) scale(${e})`}>
						<line x1={0} y1={0} x2={0} y2={dir * 26} stroke={P.tagDot} strokeWidth={4} />
						<circle cx={0} cy={dir * 34} r={13} fill={P.tagDot} />
					</g>
				);
			})}
		</g>
	);
};

// ── The age chart: dog age (x, 0–14) vs human age (y, 0–100). ──
export const CHART = {x0: 170, x1: 950, y0: 1330, y1: 650, maxX: 14, maxY: 100};
export const cx = (d: number) => CHART.x0 + (d / CHART.maxX) * (CHART.x1 - CHART.x0);
export const cy = (h: number) => CHART.y0 - (h / CHART.maxY) * (CHART.y0 - CHART.y1);
export const human = (d: number) => 16 * Math.log(d) + 31; // Wang et al. 2020, Labradors
export const curvePath = (() => {
	const pts: string[] = [];
	for (let d = 0.15; d <= CHART.maxX + 1e-6; d += 0.05) pts.push(`${cx(d).toFixed(1)},${cy(Math.max(0, human(d))).toFixed(1)}`);
	return 'M' + pts.join(' L');
})();

export const ChartAxes: React.FC<{font: string; xLabel: string; yLabel: string; color: string; faint: string}> = ({font, xLabel, yLabel, color, faint}) => (
	<g>
		{[20, 40, 60, 80, 100].map((h) => (
			<line key={h} x1={CHART.x0} y1={cy(h)} x2={CHART.x1} y2={cy(h)} stroke={faint} strokeWidth={2} />
		))}
		<line x1={CHART.x0} y1={CHART.y0} x2={CHART.x1} y2={CHART.y0} stroke={color} strokeWidth={3} />
		<line x1={CHART.x0} y1={CHART.y0} x2={CHART.x0} y2={CHART.y1 - 10} stroke={color} strokeWidth={3} />
		{[0, 2, 4, 6, 8, 10, 12, 14].map((d) => (
			<text key={d} x={cx(d)} y={CHART.y0 + 46} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={34} fill={color}>
				{d}
			</text>
		))}
		{[0, 20, 40, 60, 80, 100].map((h) => (
			<text key={h} x={CHART.x0 - 16} y={cy(h) + 12} textAnchor="end" fontFamily={font} fontWeight={600} fontSize={34} fill={color}>
				{h}
			</text>
		))}
		<text x={(CHART.x0 + CHART.x1) / 2} y={CHART.y0 + 100} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={36} fill={color}>
			{xLabel}
		</text>
		<text x={CHART.x0 - 70} y={CHART.y1 - 40} textAnchor="start" fontFamily={font} fontWeight={700} fontSize={36} fill={color}>
			{yLabel}
		</text>
	</g>
);

// ── Size comparison animals, side view facing right. Origin = bottom centre; `w` = drawn width of the 200-unit box. ──
const Box: React.FC<{x: number; y: number; w: number; children: React.ReactNode}> = ({x, y, w, children}) => (
	<g transform={`translate(${x - w / 2} ${y - w}) scale(${w / 200})`}>{children}</g>
);

export const Mouse: React.FC<{x: number; y: number; w: number; color?: string}> = ({x, y, w, color = '#A9A39A'}) => (
	<Box x={x} y={y} w={w}>
		<path d="M52 176 Q20 186 8 168 Q2 156 14 150" stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />
		<ellipse cx={100} cy={166} rx={52} ry={32} fill={color} />
		<path d="M136 146 Q170 140 192 168 Q170 178 140 182 Z" fill={color} />
		<circle cx={138} cy={136} r={20} fill={color} />
		<circle cx={138} cy={136} r={12} fill="#E9A3AE" />
		<circle cx={166} cy={156} r={4} fill="#1C1A18" />
		<circle cx={193} cy={168} r={4.5} fill="#E9A3AE" />
		<rect x={82} y={190} width={10} height={10} rx={4} fill={color} />
		<rect x={126} y={190} width={10} height={10} rx={4} fill={color} />
	</Box>
);

export const Elephant: React.FC<{x: number; y: number; w: number; color?: string}> = ({x, y, w, color = '#8E949C'}) => (
	<Box x={x} y={y} w={w}>
		<path d="M24 92 Q12 110 16 132" stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" />
		<rect x={38} y={120} width={26} height={78} rx={8} fill="#737982" />
		<rect x={112} y={120} width={26} height={78} rx={8} fill="#737982" />
		<ellipse cx={92} cy={102} rx={72} ry={52} fill={color} />
		<rect x={56} y={120} width={28} height={80} rx={9} fill={color} />
		<rect x={126} y={120} width={28} height={80} rx={9} fill={color} />
		<circle cx={160} cy={84} r={36} fill={color} />
		<path d="M184 92 Q200 120 192 150 Q188 172 198 182" stroke={color} strokeWidth={18} fill="none" strokeLinecap="round" />
		<ellipse cx={142} cy={92} rx={24} ry={36} fill="#737982" />
		<path d="M178 112 Q190 122 200 118" stroke="#F1ECE2" strokeWidth={6} fill="none" strokeLinecap="round" />
		<circle cx={172} cy={76} r={4} fill="#1C1A18" />
	</Box>
);

export const Chihuahua: React.FC<{x: number; y: number; w: number; color?: string}> = ({x, y, w, color = '#E8B27D'}) => (
	<Box x={x} y={y} w={w}>
		<path d="M62 130 Q38 104 56 84" stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" />
		<path d="M72 150 L70 198 M126 150 L126 198" stroke="#C9925C" strokeWidth={9} strokeLinecap="round" />
		<ellipse cx={100} cy={138} rx={44} ry={24} fill={color} />
		<path d="M80 150 L78 198 M118 150 L120 198" stroke={color} strokeWidth={9} strokeLinecap="round" />
		<path d="M122 128 L136 96 L158 104 L144 144 Z" fill={color} />
		<path d="M132 88 L118 36 L152 78 Z" fill={color} />
		<path d="M150 78 L166 30 L172 86 Z" fill={color} />
		<path d="M134 80 L124 50 L146 76 Z" fill="#F2A0A8" opacity={0.7} />
		<circle cx={150} cy={100} r={28} fill={color} />
		<ellipse cx={176} cy={110} rx={14} ry={10} fill={color} />
		<circle cx={188} cy={107} r={4} fill="#1C1A18" />
		<circle cx={158} cy={96} r={6} fill="#1C1A18" />
	</Box>
);

export const GreatDane: React.FC<{x: number; y: number; w: number; color?: string}> = ({x, y, w, color = '#B79B74'}) => (
	<Box x={x} y={y} w={w}>
		<path d="M42 90 Q24 112 30 156" stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" />
		<path d="M60 100 L70 140 L54 170 L58 196 M124 118 L122 196" stroke="#9A7F5B" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
		<path d="M40 92 Q42 76 62 76 L120 72 Q142 70 148 92 Q150 124 132 130 Q112 132 96 120 Q76 112 58 114 Q42 112 40 92 Z" fill={color} />
		<path d="M50 98 L62 140 L46 170 L50 196 M136 118 L136 196" stroke={color} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
		<ellipse cx={55} cy={197} rx={9} ry={4} fill={color} />
		<ellipse cx={141} cy={197} rx={9} ry={4} fill={color} />
		<path d="M116 82 Q126 52 144 38 L168 48 Q158 76 150 106 Z" fill={color} />
		<path d="M142 40 Q144 24 162 22 Q176 22 181 33 L195 39 Q200 44 198 54 L192 60 Q180 63 168 60 Q154 57 148 51 Z" fill={color} />
		<path d="M181 33 L195 39 Q200 44 198 54 L192 60 Q182 62 176 58 Q178 44 181 33 Z" fill="#3A3029" />
		<path d="M152 28 Q147 19 158 19 Q166 32 160 46 Q150 42 152 28 Z" fill="#9A7F5B" />
		<circle cx={170} cy={34} r={3.2} fill="#1C1A18" />
	</Box>
);

// A small clock whose hand speed shows how fast something ages.
export const Clock: React.FC<{x: number; y: number; r: number; angle: number; color: string}> = ({x, y, r, angle, color}) => (
	<g transform={`translate(${x} ${y})`}>
		<circle r={r} fill="#15171C" stroke={color} strokeWidth={6} />
		{Array.from({length: 12}, (_, i) => {
			const a = (i / 12) * Math.PI * 2;
			return <line key={i} x1={Math.sin(a) * r * 0.78} y1={-Math.cos(a) * r * 0.78} x2={Math.sin(a) * r * 0.9} y2={-Math.cos(a) * r * 0.9} stroke={color} strokeWidth={3} />;
		})}
		<line x1={0} y1={0} x2={Math.sin((angle * Math.PI) / 180) * r * 0.72} y2={-Math.cos((angle * Math.PI) / 180) * r * 0.72} stroke={color} strokeWidth={6} strokeLinecap="round" />
		<line x1={0} y1={0} x2={Math.sin((angle * Math.PI) / 2160) * r * 0.48} y2={-Math.cos((angle * Math.PI) / 2160) * r * 0.48} stroke={color} strokeWidth={7} strokeLinecap="round" />
		<circle r={6} fill={color} />
	</g>
);

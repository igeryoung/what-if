import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Line, useIn, useOut} from '../../engine/kit/kit';
import {FPS, NUM, SANS} from '../../engine/kit/theme';
import {curtainPath, P, Person, rng} from './art';
import {dur} from './timeline';

const L: React.FC<{at: number; y: number; size?: number; weight?: number; color?: string; children: React.ReactNode; out?: number; align?: 'center' | 'left'; x?: number}> = ({at, y, size = 64, weight = 700, color = P.ink, children, out, align, x}) => (
	<Line at={at} y={y} size={size} weight={weight} color={color} out={out} align={align} x={x}>
		{children}
	</Line>
);
const Kicker: React.FC<{at: number; y: number; align?: 'center' | 'left'; x?: number; children: React.ReactNode}> = ({at, y, align, x, children}) => (
	<Line at={at} y={y} size={40} weight={700} color={P.accent} tracking={6} lift={14} align={align} x={x}>
		{children}
	</Line>
);
const Exit: React.FC<{len: number; children: React.ReactNode; fade?: number}> = ({len, children, fade = 10}) => {
	const o = useOut(len, fade);
	return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};
const N: React.FC<{size: number; color?: string; children: React.ReactNode}> = ({size, color = P.ink, children}) => (
	<span style={{fontFamily: NUM, fontWeight: 900, fontSize: size, color, letterSpacing: -size * 0.03, fontVariantNumeric: 'tabular-nums'}}>{children}</span>
);
const Z: React.FC<{size: number; color?: string; weight?: number; children: React.ReactNode}> = ({size, color = P.ink, weight = 900, children}) => (
	<span style={{fontFamily: SANS, fontWeight: weight, fontSize: size, color}}>{children}</span>
);

/** SVG camera: world point (wx, wy) lands on screen (sx, sy) at k px per world unit. */
const Cam: React.FC<{k: number; wx: number; wy: number; sx?: number; sy: number; children: React.ReactNode; style?: React.CSSProperties}> = ({k, wx, wy, sx = 540, sy, children, style}) => (
	<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, ...style}}>
		<g transform={`translate(${sx} ${sy}) scale(${k}) translate(${-wx} ${-wy})`}>{children}</g>
	</svg>
);

const ease = Easing.inOut(Easing.cubic);

// ── 1. HOOK ──────────────────────────────────────────────────────────────────
export const Hook: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const k = interpolate(f, [0, 180], [11, 7.5], {...clamp, easing: ease});
	const hair = interpolate(f, [0, 180], [14, 40], {...clamp, easing: Easing.inOut(Easing.quad)});
	return (
		<Exit len={dur('hook')}>
			<Cam k={k} wx={0} wy={-157} sy={900}>
				<Person hair={hair} t={t} />
			</Cam>
			<L at={4} y={240} size={92} weight={900}>
				如果你一輩子
			</L>
			<L at={16} y={360} size={110} weight={900} color={P.hair}>
				都不剪頭髮
			</L>
			<L at={70} y={520} size={72} weight={700} color={P.dim}>
				會長到多長？
			</L>
		</Exit>
	);
};

// ── 2. SPEED: 1 cm a month ───────────────────────────────────────────────────
export const Speed: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const L0 = 30;
	const mo = interpolate(f, [20, 150], [0, 12], {...clamp, easing: Easing.inOut(Easing.sin)});
	const m = Math.floor(mo + 1e-6);
	const hair = L0 + mo;
	const k = 9;
	const tip0 = -170 + L0;
	const rx = -30;
	return (
		<Exit len={dur('speed')}>
			<Cam k={k} wx={0} wy={-157} sy={720}>
				<Person hair={hair} t={t} />
				{/* ruler */}
				<g>
					<rect x={rx - 6} y={tip0 - 2} width={6} height={16} rx={1} fill={P.faint} />
					<rect x={rx - 6} y={tip0} width={6} height={mo} fill={P.accent} opacity={0.9} />
					{Array.from({length: 13}, (_, i) => (
						<line key={i} x1={rx - (i % 6 === 0 ? 9 : 7.5)} x2={rx} y1={tip0 + i} y2={tip0 + i} stroke={P.ink} strokeWidth={0.18} opacity={0.8} />
					))}
					<line x1={rx} x2={-12} y1={-170 + hair} y2={-170 + hair} stroke={P.accent} strokeWidth={0.25} strokeDasharray="0.8 0.6" />
				</g>
			</Cam>
			<L at={4} y={230} size={72} weight={900}>
				頭髮每個月 約長 <span style={{color: P.hair}}>1</span> 公分
			</L>
			<div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', opacity: useIn(16)}}>
				<Z size={56} weight={700} color={P.dim}>
					第{' '}
				</Z>
				<N size={110} color={P.ink}>
					{Math.max(1, m)}
				</N>
				<Z size={56} weight={700} color={P.dim}>
					{' '}個月
				</Z>
				<N size={110} color={P.accent}>
					+{m}
				</N>
				<Z size={56} weight={700} color={P.dim}>
					{' '}cm
				</Z>
			</div>
			<L at={160} y={1420} size={56} weight={700} color={P.ink}>
				一年 ≈ 12 公分
			</L>
		</Exit>
	);
};

// ── 3. NAIVE: 80 years → 9.6 m, a three-storey building ────────────────────
const Building: React.FC = () => (
	<g>
		<rect x={-260} y={0} width={520} height={900} fill={P.wall} />
		<rect x={-275} y={-10} width={550} height={12} fill={P.faint} />
		{[0, 1, 2].map((fl) =>
			[-200, -110, 70, 160].map((x) => <rect key={`${fl}_${x}`} x={x} y={fl * 300 + 70} width={50} height={140} rx={6} fill={P.window} />),
		)}
		{[300, 600].map((y) => (
			<rect key={y} x={-260} y={y - 3} width={520} height={6} fill={P.faint} />
		))}
		<rect x={-1400} y={900} width={2800} height={600} fill="#0E0B12" />
		<rect x={-1400} y={898} width={2800} height={6} fill={P.faint} />
	</g>
);

export const Naive: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const p = interpolate(f, [24, 250], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
	const age = 80 * p;
	const hair = Math.max(8, 12 * age);
	const tip = -170 + hair;
	const k = Math.min(4, 900 / (Math.max(tip, 40) + 200));
	const meters = (12 * age) / 100;
	const end = useIn(256);
	return (
		<Exit len={dur('naive')}>
			<Cam k={k} wx={0} wy={-190} sy={600}>
				<Building />
				<Person hair={hair} t={t} />
				{['3F', '2F', '1F'].map((s, i) => (
					<text key={s} x={-230} y={i * 300 + 270} fill={P.dim} fontFamily={NUM} fontWeight={800} fontSize={42 / Math.max(k, 0.9)} opacity={interpolate(k, [1.1, 1.6], [1, 0], clamp)}>
						{s}
					</text>
				))}
			</Cam>
			<L at={0} y={220} size={60} weight={700} color={P.dim}>
				照這速度，一直留到 80 歲
			</L>
			<div style={{position: 'absolute', top: 310, left: 0, right: 0, textAlign: 'center', opacity: useIn(8)}}>
				<N size={150} color={P.hair}>
					{meters.toFixed(1)}
				</N>
				<Z size={64}> 公尺</Z>
				<Z size={44} weight={700} color={P.dim}>
					{'　'}
					{Math.floor(age)} 歲
				</Z>
			</div>
			<div style={{position: 'absolute', top: 480, left: 0, right: 0, textAlign: 'center', opacity: end, transform: `translateY(${(1 - end) * 30}px)`}}>
				<span style={{display: 'inline-block', padding: '16px 40px', borderRadius: 999, background: P.ink, color: P.bg, fontFamily: SANS, fontWeight: 900, fontSize: 56}}>差不多三層樓高</span>
			</div>
		</Exit>
	);
};

// ── 4. TWIST: every hair has a lifespan ─────────────────────────────────────
const CYC = 84;
export const Twist: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const g = f - 54;
	const c = Math.max(0, g) % CYC;
	const grow = interpolate(c, [0, 56], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	const fall = interpolate(c, [66, CYC], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const len = 420 * grow;
	const phase = c < 56 ? 0 : c < 66 ? 1 : 2;
	const diag = useIn(44);
	const bar = 120 + 840 * (c / CYC);
	const thump = spring({frame: f - 2, fps, config: {damping: 10, mass: 0.6, stiffness: 200}});
	const sy = 1130;
	const strand = (l: number, dy = 0, rot = 0, o = 1) => (
		<g opacity={o} transform={`translate(540 ${sy + dy}) rotate(${rot})`}>
			<path d={`M-9,0 L-8,${-l} Q0,${-l - 14} 8,${-l} L9,0 Z`} fill={P.hair} />
		</g>
	);
	const labels: [string, number, number][] = [
		['生長期 3–5 年', 120, 588],
		['休止', 708, 84],
		['脫落', 792, 168],
	];
	return (
		<Exit len={dur('twist')}>
			<L at={0} y={230} size={64} weight={700} color={P.dim}>
				但其實——
			</L>
			<div style={{position: 'absolute', top: 320, left: 0, right: 0, textAlign: 'center', transform: `scale(${0.7 + 0.3 * thump})`, opacity: Math.min(1, thump * 1.5)}}>
				<Z size={110} color={P.accent}>
					它不會無限長
				</Z>
			</div>
			<L at={36} y={500} size={60} weight={700}>
				每根頭髮，都有「壽命」
			</L>
			<div style={{position: 'absolute', inset: 0, opacity: diag}}>
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
					{/* skin cross-section */}
					<rect x={140} y={sy} width={800} height={110} rx={20} fill={P.skin} opacity={0.9} />
					<rect x={140} y={sy + 40} width={800} height={70} rx={20} fill="#D9A383" opacity={0.9} />
					<ellipse cx={540} cy={sy + 70} rx={20} ry={26} fill="#B9785A" />
					{g >= 0 && phase < 2 && strand(len)}
					{g >= 0 && phase === 2 && strand(420, fall * 220, fall * 35, 1 - fall)}
					{g >= 0 && phase === 2 && strand(30 * fall)}
				</svg>
			</div>
			<div style={{position: 'absolute', inset: 0, opacity: diag}}>
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
					<rect x={120} y={1310} width={588} height={22} rx={11} fill={P.hair} opacity={phase === 0 ? 1 : 0.35} />
					<rect x={712} y={1310} width={76} height={22} rx={11} fill={P.dim} opacity={phase === 1 ? 1 : 0.35} />
					<rect x={792} y={1310} width={168} height={22} rx={11} fill={P.accent} opacity={phase === 2 ? 1 : 0.35} />
					<circle cx={bar} cy={1321} r={18} fill={P.ink} />
				</svg>
				{labels.map(([s, x, w], i) => (
					<div key={s} style={{position: 'absolute', left: x, width: w, top: 1352, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: i === 0 ? 44 : 36, color: phase === i ? P.ink : P.dim}}>
						{s}
					</div>
				))}
			</div>
			<L at={150} y={1440} size={44} weight={700} color={P.dim}>
				掉了，再從零長一根新的
			</L>
		</Exit>
	);
};

// ── 5. LIMIT: 60–90 cm ───────────────────────────────────────────────────────
export const Limit: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const {fps} = useVideoConfig();
	const hair = 15 + 60 * spring({frame: f - 10, fps, config: {damping: 14, mass: 1.6, stiffness: 40}});
	const k = interpolate(f, [0, 180], [5.4, 5.0], clamp);
	const b = useIn(70);
	const y0 = 560;
	// bracket from 60 cm to 90 cm (measured from crown)
	const yb = (cm: number) => y0 + cm * k;
	return (
		<Exit len={dur('limit')}>
			<Cam k={k} wx={0} wy={-170} sy={y0}>
				<Person hair={hair} t={t} />
			</Cam>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: b}}>
				<rect x={330} y={yb(60)} width={10} height={yb(90) - yb(60)} rx={5} fill={P.accent} />
				<rect x={330} y={yb(60)} width={50} height={8} rx={4} fill={P.accent} />
				<rect x={330} y={yb(90) - 8} width={50} height={8} rx={4} fill={P.accent} />
			</svg>
			<div style={{position: 'absolute', left: 40, width: 270, top: (yb(60) + yb(90)) / 2 - 60, textAlign: 'right', opacity: b}}>
				<N size={68} color={P.accent}>
					60–90
				</N>
				<div>
					<Z size={44} weight={700} color={P.accent}>
						公分
					</Z>
				</div>
			</div>
			<L at={0} y={230} size={60} weight={700} color={P.dim}>
				所以大多數人
			</L>
			<L at={10} y={320} size={96} weight={900}>
				留到這裡，就停了
			</L>
		</Exit>
	);
};

// ── 6. RECORD: 5.627 m ───────────────────────────────────────────────────────
export const Record: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const k = 2.0;
	const top = 330;
	const len = interpolate(f, [10, 110], [0, 562.7], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const sx = 830;
	const floor = top + 562.7 * k;
	const sway = (y: number) => 6 * Math.sin(y * 0.01 - t * 1.4) * (y / 1125);
	const pts = Array.from({length: 40}, (_, i) => (len * k * i) / 39);
	const d =
		`M${sx - 12},${top} ` +
		pts.map((y) => `L${(sx - 12 - y * 0.006 + sway(y)).toFixed(1)},${(top + y).toFixed(1)}`).join(' ') +
		` Q${sx + sway(len * k)},${top + len * k + 14} ${(sx + 12 + len * k * 0.006 + sway(len * k)).toFixed(1)},${(top + len * k).toFixed(1)} ` +
		pts
			.slice()
			.reverse()
			.map((y) => `L${(sx + 12 + y * 0.006 + sway(y)).toFixed(1)},${(top + y).toFixed(1)}`)
			.join(' ') +
		' Z';
	return (
		<Exit len={dur('record')}>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<rect x={sx - 50} y={top - 24} width={100} height={18} rx={9} fill={P.dim} />
				<path d={d} fill={P.hair} />
				{Array.from({length: 6}, (_, i) => (
					<g key={i} opacity={len >= i * 100 ? 0.8 : 0}>
						<line x1={sx + 40} x2={sx + 64} y1={top + i * 100 * k} y2={top + i * 100 * k} stroke={P.dim} strokeWidth={3} />
						<text x={sx + 72} y={top + i * 100 * k + 12} fill={P.dim} fontFamily={NUM} fontWeight={800} fontSize={32}>
							{i}m
						</text>
					</g>
				))}
				<rect x={360} y={floor} width={600} height={4} fill={P.faint} />
				<g transform={`translate(680 ${floor}) scale(${k * (160 / 170)})`} opacity={useIn(60)}>
					<Person hair={30} t={t} strands={false} />
				</g>
				<text x={680} y={floor - 160 * k - 20} textAnchor="middle" fill={P.dim} fontFamily={SANS} fontWeight={700} fontSize={32} opacity={useIn(66)}>
					160 cm
				</text>
			</svg>
			<Kicker at={0} y={340} align="left" x={70}>
				金氏世界紀錄
			</Kicker>
			<Line at={20} y={400} size={150} weight={900} font={NUM} color={P.hair} align="left" x={64}>
				5.627
			</Line>
			<L at={26} y={590} size={72} weight={900} align="left" x={70}>
				公尺
			</L>
			<L at={90} y={760} size={48} align="left" x={70}>
				謝秋萍（中國）
			</L>
			<L at={104} y={830} size={48} align="left" x={70}>
				{'13 歲起留了 31 年'}
			</L>
			<L at={116} y={900} size={34} weight={400} color={P.dim} align="left" x={70}>
				2004 年量測
			</L>
			<L at={160} y={1120} size={52} weight={700} color={P.dim} align="left" x={70}>
				{'極少數人，\n頭髮能長得\n遠超常人'}
			</L>
		</Exit>
	);
};

// ── 7. SUM: 100,000 hairs → 1 km a month ────────────────────────────────────
export const Sum: React.FC = () => {
	const f = useCurrentFrame();
	const n = Math.floor(interpolate(f, [16, 80], [0, 10000], {...clamp, easing: Easing.in(Easing.quad)}));
	const dots = useMemo(() => {
		const r = rng(5);
		const order = Array.from({length: 10000}, (_, i) => [i, r()] as const).sort((a, b) => a[1] - b[1]);
		return order.map(([i]) => i);
	}, []);
	const d = useMemo(() => {
		const parts: string[] = [];
		for (let j = 0; j < n; j++) {
			const i = dots[j];
			const x = 160 + (i % 100) * 7.6;
			const y = 520 + Math.floor(i / 100) * 5.2;
			parts.push(`M${x},${y}h4.2v2.6h-4.2z`);
		}
		return parts.join('');
	}, [n, dots]);
	const big = useIn(108, 12, 0.6);
	return (
		<Exit len={dur('sum')}>
			<Kicker at={0} y={240}>
				換個算法
			</Kicker>
			<L at={6} y={310} size={72} weight={900}>
				你頭上約有 <span style={{color: P.hair}}>10 萬</span> 根頭髮
			</L>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<path d={d} fill={P.hair} opacity={0.85} />
			</svg>
			<L at={30} y={1060} size={34} weight={400} color={P.dim}>
				每一點 = 10 根
			</L>
			<L at={70} y={1150} size={52} weight={700}>
				每根每月 1 公分，加起來
			</L>
			<div style={{position: 'absolute', top: 1240, left: 0, right: 0, textAlign: 'center', opacity: big, transform: `scale(${1.2 - 0.2 * big})`}}>
				<Z size={64}>每個月 </Z>
				<N size={150} color={P.accent}>
					≈1
				</N>
				<Z size={90}> 公里</Z>
			</div>
		</Exit>
	);
};

// ── 8. LIFE: 960 km ≈ 2.4 × Taiwan ──────────────────────────────────────────
export const Life: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const kk = 840 / 960;
	const tw = interpolate(f, [24, 50], [0, 394], {...clamp, easing: ease});
	const hl = interpolate(f, [40, 100], [0, 960], {...clamp, easing: ease});
	const x0 = 120;
	const wave = (w: number, y: number) => {
		const pts = Array.from({length: 60}, (_, i) => {
			const x = (w * i) / 59;
			return `${(x0 + x).toFixed(1)},${(y + 7 * Math.sin(x * 0.03 - t * 3)).toFixed(1)}`;
		});
		return `M${pts.join(' L')}`;
	};
	return (
		<Exit len={dur('life')}>
			<L at={0} y={230} size={60} weight={700} color={P.dim}>
				留滿 80 年，全部接起來
			</L>
			<div style={{position: 'absolute', top: 320, left: 0, right: 0, textAlign: 'center', opacity: useIn(8)}}>
				<Z size={64}>約 </Z>
				<N size={170} color={P.hair}>
					960
				</N>
				<Z size={80}> 公里</Z>
			</div>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<rect x={x0} y={760} width={tw * kk} height={30} rx={15} fill={P.dim} />
				{hl > 0 && <path d={wave(hl * kk, 1000)} stroke={P.hair} strokeWidth={16} strokeLinecap="round" fill="none" />}
			</svg>
			<L at={20} y={680} size={40} align="left" x={x0} color={P.dim}>
				台灣南北全長 394 公里
			</L>
			<L at={40} y={910} size={40} align="left" x={x0} color={P.hair}>
				你一輩子長出的頭髮
			</L>
			<div style={{position: 'absolute', top: 1140, left: 0, right: 0, textAlign: 'center', opacity: useIn(104)}}>
				<Z size={64}>≈ 台灣的 </Z>
				<N size={120} color={P.accent}>
					2.4
				</N>
				<Z size={64}> 倍長</Z>
			</div>
			<L at={120} y={1340} size={32} weight={400} color={P.dim}>
				10 萬根 × 1 公分 × 960 個月（粗估）
			</L>
		</Exit>
	);
};

// ── 9. END ───────────────────────────────────────────────────────────────────
export const End: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const D = dur('end');
	const fade = interpolate(f, [D - 20, D], [1, 0], clamp);
	return (
		<AbsoluteFill style={{opacity: fade}}>
			<Cam k={3.2} wx={0} wy={-120} sy={1080} style={{opacity: 0.5 * useIn(0)}}>
				<Person hair={75} t={t} />
			</Cam>
			<L at={6} y={300} size={64} weight={700} color={P.dim}>
				就算一輩子不剪，
			</L>
			<L at={30} y={400} size={84} weight={900}>
				頭髮也不會無限長
			</L>
			<L at={66} y={560} size={84} weight={900} color={P.hair}>
				但它每天都在長
			</L>
			<L at={90} y={690} size={40} weight={700} color={P.dim}>
				全頭加總，一天約 33 公尺
			</L>
			<div style={{position: 'absolute', left: 60, right: 60, top: 1390, textAlign: 'center', fontFamily: SANS, fontSize: 32, lineHeight: 1.6, color: P.dim, opacity: useIn(100)}}>
				資料：Wikipedia〈Hair growth〉· 金氏世界紀錄 · Wikipedia〈Geography of Taiwan〉
				<br />
				數字為平均值，個人差異大 · 原創配樂
			</div>
		</AbsoluteFill>
	);
};

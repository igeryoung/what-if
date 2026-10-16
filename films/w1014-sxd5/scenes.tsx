import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Line, useIn, useOut} from '../../engine/kit/kit';
import {NUM, SANS} from '../../engine/kit/theme';
import {Dolphin, Eye, Moon, P, rng, Sleeper, Sun} from './art';
import {BAR, dur} from './timeline';

// ── shared pieces ────────────────────────────────────────────────────────────
const Exit: React.FC<{len: number; children: React.ReactNode; fade?: number}> = ({len, children, fade = 10}) => (
	<AbsoluteFill style={{opacity: useOut(len, fade)}}>{children}</AbsoluteFill>
);
/** Slow camera push over the whole scene. */
const Cam: React.FC<{len: number; from?: number; to?: number; ox?: number; oy?: number; dy?: number; children: React.ReactNode}> = ({len, from = 1, to = 1.05, ox = 540, oy = 860, dy = 0, children}) => {
	const f = useCurrentFrame();
	const p = interpolate(f, [0, len], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
	return <AbsoluteFill style={{transform: `translateY(${dy * p}px) scale(${from + (to - from) * p})`, transformOrigin: `${ox}px ${oy}px`}}>{children}</AbsoluteFill>;
};
const N: React.FC<{size: number; color?: string; children: React.ReactNode}> = ({size, color = P.ink, children}) => (
	<span style={{fontFamily: NUM, fontWeight: 900, fontSize: size, color, letterSpacing: -size * 0.03, fontVariantNumeric: 'tabular-nums'}}>{children}</span>
);
const Z: React.FC<{size: number; color?: string; weight?: number; children: React.ReactNode}> = ({size, color = P.ink, weight = 900, children}) => (
	<span style={{fontFamily: SANS, fontWeight: weight, fontSize: size, color}}>{children}</span>
);
const Kicker: React.FC<{at: number; y: number; color?: string; children: React.ReactNode}> = ({at, y, color = P.awake, children}) => (
	<Line at={at} y={y} size={40} weight={700} color={color} tracking={6} lift={14}>
		{children}
	</Line>
);
const Note: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => (
	<Line at={at} y={y} size={32} weight={400} color={P.dim} lift={10}>
		{children}
	</Line>
);
/** A centred row that pops in with a spring (for mixed number + text lines). */
const Pop: React.FC<{at: number; y: number; children: React.ReactNode; big?: boolean}> = ({at, y, children, big}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: f - at, fps, config: {damping: 12, mass: 0.6, stiffness: 170}});
	return (
		<div style={{position: 'absolute', top: y, left: 40, right: 40, textAlign: 'center', opacity: Math.min(1, p * 1.4), transform: `scale(${big ? 1.25 - 0.25 * p : 1}) translateY(${big ? 0 : (1 - p) * 30}px)`, whiteSpace: 'nowrap'}}>
			{children}
		</div>
	);
};
const Badge: React.FC<{at: number; y: number; bg: string; color?: string; size?: number; children: React.ReactNode}> = ({at, y, bg, color = P.bg, size = 50, children}) => {
	const p = useIn(at);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>
			<span style={{display: 'inline-block', padding: `${size * 0.32}px ${size * 0.8}px`, borderRadius: 999, background: bg, color, fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 1.15}}>{children}</span>
		</div>
	);
};

// ── 1. HOOK: a sleeper's eyes snap open ─────────────────────────────────────
export const Hook: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const OPEN = BAR; // eyes open on bar 2
	const open = f < OPEN ? 0 : spring({frame: f - OPEN, fps, config: {damping: 9, mass: 0.5, stiffness: 240}});
	const alarm = interpolate(f, [OPEN, OPEN + 4, OPEN + 40], [0, 1, 0], clamp);
	const shake = f >= OPEN && f < OPEN + 18 ? Math.sin((f - OPEN) * 2.4) * 12 * (1 - (f - OPEN) / 18) : 0;
	const zzz = interpolate(f, [0, 8, OPEN - 2, OPEN + 3], [0, 1, 1, 0], clamp);
	const moonOut = interpolate(f, [OPEN, OPEN + 8], [1, 0], clamp);
	const sunIn = f < OPEN ? 0 : spring({frame: f - OPEN - 2, fps, config: {damping: 10, mass: 0.6, stiffness: 160}});
	return (
		<Exit len={dur('hook')} fade={6}>
			<Cam len={dur('hook')} to={1.07} oy={880}>
				<div style={{position: 'absolute', left: 760, top: 540, width: 150, height: 150}}>
					<div style={{position: 'absolute', inset: 0, opacity: moonOut * useIn(0, 20), transform: `rotate(${(1 - moonOut) * 40}deg)`}}>
						<Moon size={150} id="ns-hook-moon" />
					</div>
					<div style={{position: 'absolute', inset: 0, opacity: sunIn, transform: `scale(${sunIn}) `}}>
						<Sun size={150} spin={f * 1.5} />
					</div>
				</div>
				<div style={{position: 'absolute', left: 120, top: 700, transform: `translateX(${shake}px)`}}>
					<Sleeper w={840} open={open} zzz={zzz} f={f} alarm={alarm} />
				</div>
			</Cam>
			<Line at={0} y={240} size={64} weight={700} color={P.dim}>
				如果人
			</Line>
			<Line at={4} y={320} size={120} weight={900}>
				不用睡覺
			</Line>
			<Line at={66} y={1220} size={76} weight={900} color={P.awake}>
				一輩子會多出什麼？
			</Line>
		</Exit>
	);
};

// ── 2. LIFE: 80 years, a third of them asleep ────────────────────────────────
export const Life: React.FC = () => {
	const f = useCurrentFrame();
	const COLS = 10,
		G = 84,
		R = 30,
		X0 = 540 - 4.5 * G,
		Y0 = 480;
	const pos = (k: number) => [X0 + (k % COLS) * G, Y0 + Math.floor(k / COLS) * G];
	// every third year-dot is "sleep": 27 of 80. They then regroup at the end of the grid.
	const target = useMemo(() => {
		const awake: number[] = [],
			sleep: number[] = [];
		for (let i = 0; i < 80; i++) (i % 3 === 0 ? sleep : awake).push(i);
		const t: number[] = [];
		awake.forEach((i, k) => (t[i] = k));
		sleep.forEach((i, k) => (t[i] = awake.length + k));
		return t;
	}, []);
	const TURN = BAR,
		MOVE = 2 * BAR;
	return (
		<Exit len={dur('life')}>
			<Line at={0} y={220} size={88} weight={900}>
				假設活到 80 歲
			</Line>
			<Note at={10} y={350}>
				每一格 = 1 年
			</Note>
			<Cam len={dur('life')} from={1} to={1.04} oy={780}>
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
					{Array.from({length: 80}).map((_, i) => {
						const row = Math.floor(i / COLS);
						const a = interpolate(f, [4 + row * 4, 14 + row * 4], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
						const isS = i % 3 === 0;
						const turn = isS ? interpolate(f, [TURN + (i / 80) * 22, TURN + 8 + (i / 80) * 22], [0, 1], clamp) : 0;
						const st = (target[i] / 80) * 14;
						const mv = interpolate(f, [MOVE + st, MOVE + 24 + st], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
						const [x0, y0] = pos(i),
							[x1, y1] = pos(target[i]);
						const x = x0 + (x1 - x0) * mv,
							y = y0 + (y1 - y0) * mv - (isS ? Math.sin(Math.PI * mv) * 46 : 0);
						return (
							<g key={i} transform={`translate(${x} ${y}) scale(${a})`}>
								<circle r={R} fill="#CDD2E4" opacity={1 - turn} />
								<circle r={R} fill={P.sleep} opacity={turn} />
							</g>
						);
					})}
				</svg>
			</Cam>
			<Pop at={3 * BAR} y={1130}>
				<Z size={64}>其中 </Z>
				<N size={170} color={P.sleep}>
					27
				</N>
				<Z size={64}> 年在睡覺</Z>
			</Pop>
			<Note at={3 * BAR + 24} y={1370}>
				以每晚 8 小時計，約是人生的 1/3
			</Note>
		</Exit>
	);
};

// ── 3. GAIN: the night slice of the clock turns gold ─────────────────────────
const CX = 540,
	CY = 830;
const ang = (h: number) => (h / 24) * Math.PI * 2 - Math.PI / 2;
const pt = (h: number, r: number) => [CX + r * Math.cos(ang(h)), CY + r * Math.sin(ang(h))];
const sector = (h0: number, h1: number, r0: number, r1: number) => {
	if (h1 - h0 < 0.01) return '';
	const large = h1 - h0 > 12 ? 1 : 0;
	const [a, b] = pt(h0, r1),
		[c, d] = pt(h1, r1),
		[e, g] = pt(h1, r0),
		[k, m] = pt(h0, r0);
	return `M${a} ${b} A${r1} ${r1} 0 ${large} 1 ${c} ${d} L${e} ${g} A${r0} ${r0} 0 ${large} 0 ${k} ${m} Z`;
};

export const Gain: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const FLIP = BAR;
	const sweep = interpolate(f, [FLIP, FLIP + 40], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const hand = 23 + 8 * sweep + Math.max(0, f - FLIP - 40) * 0.01;
	const icon = spring({frame: f - FLIP - 36, fps, config: {damping: 10, mass: 0.6, stiffness: 160}});
	const [hx, hy] = pt(hand, 250);
	return (
		<Exit len={dur('gain')}>
			<Line at={0} y={210} size={60} weight={700} color={P.dim}>
				如果不用睡
			</Line>
			<Pop at={6} y={290}>
				<Z size={92}>每天多出 </Z>
				<N size={124} color={P.awake}>
					8
				</N>
				<Z size={92}> 小時</Z>
			</Pop>
			<Cam len={dur('gain')} from={1} to={1.05} oy={CY}>
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: useIn(2)}}>
					<circle cx={CX} cy={CY} r={300} fill={P.bg2} stroke={P.faint} strokeWidth={4} />
					<path d={sector(7, 23, 150, 280)} fill="#2B3358" />
					<path d={sector(23, 31, 150, 280)} fill={P.sleep} />
					<path d={sector(23, 23 + 8 * sweep, 150, 280)} fill={P.awake} />
					{Array.from({length: 24}).map((_, h) => {
						const [a, b] = pt(h, h % 6 === 0 ? 300 : 306),
							[c, d] = pt(h, 318);
						return <line key={h} x1={a} y1={b} x2={c} y2={d} stroke={P.dim} strokeWidth={h % 6 === 0 ? 6 : 3} strokeLinecap="round" />;
					})}
					{[0, 6, 12, 18].map((h) => {
						const [x, y] = pt(h, 358);
						return (
							<text key={h} x={x} y={y + 14} textAnchor="middle" fill={P.dim} style={{fontFamily: NUM, fontWeight: 800, fontSize: 40}}>
								{h}
							</text>
						);
					})}
					<line x1={CX} y1={CY} x2={hx} y2={hy} stroke={P.ink} strokeWidth={10} strokeLinecap="round" />
					<circle cx={CX} cy={CY} r={16} fill={P.ink} />
				</svg>
				{/* icon in the slice */}
				{(() => {
					const [ix, iy] = pt(27, 215);
					return (
						<div style={{position: 'absolute', left: ix - 50, top: iy - 50, width: 100, height: 100, opacity: useIn(8)}}>
							<div style={{position: 'absolute', inset: 0, opacity: 1 - Math.min(1, icon * 2)}}>
								<Moon size={100} id="ns-gain-moon" color={P.ink} />
							</div>
							<div style={{position: 'absolute', inset: 0, opacity: icon, transform: `scale(${icon})`}}>
								<Sun size={100} color={P.bg} spin={f} />
							</div>
						</div>
					);
				})()}
			</Cam>
			<Pop at={3 * BAR} y={1200} big>
				<Z size={64}>一年多出 </Z>
				<N size={170} color={P.awake}>
					122
				</N>
				<Z size={80}> 天</Z>
			</Pop>
			<Badge at={4 * BAR} y={1410} bg={P.awake} size={48}>
				相當於 4 個月
			</Badge>
		</Exit>
	);
};

// ── 4. PIVOT ─────────────────────────────────────────────────────────────────
export const Pivot: React.FC = () => {
	const f = useCurrentFrame();
	const blink = interpolate(f, [26, 30, 34], [0.25, 1, 0.25], clamp);
	const droop = interpolate(f, [34, 80], [0.25, 0.55], clamp);
	return (
		<Exit len={dur('pivot')} fade={6}>
			<div style={{position: 'absolute', left: 340, top: 520, opacity: useIn(0)}}>
				<Eye w={400} lid={f < 34 ? blink : droop} />
			</div>
			<Line at={2} y={820} size={88} weight={900}>
				聽起來很划算？
			</Line>
			<Line at={BAR} y={960} size={76} weight={900} color={P.red}>
				但人能撐多久不睡？
			</Line>
		</Exit>
	);
};

// ── 5. RECORD: 264 hours awake ───────────────────────────────────────────────
const Chip: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
	const p = useIn(at, 12);
	return (
		<span
			style={{
				display: 'inline-block',
				margin: '0 12px',
				padding: '14px 28px',
				borderRadius: 999,
				border: `4px solid ${P.red}`,
				color: P.ink,
				fontFamily: SANS,
				fontWeight: 700,
				fontSize: 42,
				opacity: p,
				transform: `scale(${0.6 + 0.4 * p})`,
			}}
		>
			{children}
		</span>
	);
};

export const Record: React.FC = () => {
	const f = useCurrentFrame();
	const END = 3 * BAR; // the count lands on bar 4 of the scene
	const h = interpolate(f, [12, END], [0, 264], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const {fps} = useVideoConfig();
	const land = spring({frame: f - END, fps, config: {damping: 10, mass: 0.6, stiffness: 200}});
	const redGlow = interpolate(f, [0, END], [0, 0.55], clamp);
	return (
		<Exit len={dur('record')}>
			<AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 55%, rgba(255,90,95,${redGlow * 0.35}) 0%, rgba(255,90,95,0) 70%)`}} />
			<Cam len={dur('record')} from={1} to={1.04} oy={700}>
				<Kicker at={0} y={210}>
					人類最長的清醒紀錄
				</Kicker>
				<Line at={4} y={280} size={50} weight={700}>
					17 歲高中生 Randy Gardner
				</Line>
				<Line at={10} y={354} size={34} weight={400} color={P.dim}>
					1963 年 12 月 – 1964 年 1 月
				</Line>
				<div style={{position: 'absolute', top: 410, left: 0, right: 0, textAlign: 'center', opacity: useIn(8), transform: `scale(${f >= END ? 1.15 - 0.15 * land : 1})`}}>
					<N size={210} color={f >= END ? P.red : P.ink}>
						{Math.round(h)}
					</N>
					<Z size={80}> 小時</Z>
				</div>
				{/* one moon per day, crossed out */}
				{Array.from({length: 11}).map((_, k) => {
					const row = k < 6 ? 0 : 1;
					const col = row === 0 ? k : k - 6;
					const x = 540 + (col - (row === 0 ? 2.5 : 2)) * 112;
					const y = 720 + row * 112;
					const p = interpolate(h, [24 * (k + 1) - 10, 24 * (k + 1)], [0, 1], clamp);
					return (
						<div key={k} style={{position: 'absolute', left: x - 46, top: y - 46, width: 92, height: 92, opacity: p, transform: `scale(${0.5 + 0.5 * p})`}}>
							<svg width={92} height={92} style={{position: 'absolute', inset: 0}}>
								<circle cx={46} cy={46} r={42} fill={P.bg2} />
							</svg>
							<div style={{position: 'absolute', left: 18, top: 18}}>
								<Moon size={56} id={`ns-rec-${k}`} color={P.sleep} />
							</div>
							<svg width={92} height={92} style={{position: 'absolute', inset: 0}}>
								<circle cx={46} cy={46} r={40} fill="none" stroke={P.red} strokeWidth={6} />
								<line x1={18} y1={74} x2={74} y2={18} stroke={P.red} strokeWidth={6} />
							</svg>
						</div>
					);
				})}
				<Line at={END} y={910} size={56} weight={900} color={P.red}>
					整整 11 天沒睡
				</Line>
				<div style={{position: 'absolute', top: 1050, left: 40, right: 40, textAlign: 'center'}}>
					<Chip at={END + 15}>情緒起伏</Chip>
					<Chip at={END + 30}>記不住事</Chip>
					<Chip at={END + 45}>出現幻覺</Chip>
				</div>
			</Cam>
			<Note at={END + 72} y={1220}>
				金氏世界紀錄後來因為太危險，不再受理
			</Note>
		</Exit>
	);
};

// ── 6. DRUNK: 24 h awake ≈ 0.10 % blood alcohol ──────────────────────────────
const TX = 450,
	TOP = 560,
	BOT = 1180;
const by = (b: number) => BOT - (b / 0.12) * (BOT - TOP);
export const Drunk: React.FC = () => {
	const f = useCurrentFrame();
	const LAND = 3 * BAR; // 24 h lands on bar 4
	const h = interpolate(f, [20, LAND], [0, 24], {...clamp, easing: Easing.inOut(Easing.quad)});
	const b = interpolate(h, [0, 8, 17, 24], [0, 0, 0.05, 0.1], clamp);
	const yb = by(b);
	const over = b > 0.03;
	const show17 = interpolate(h, [16.5, 17.5], [0, 1], clamp);
	const show24 = interpolate(f, [LAND - 2, LAND + 8], [0, 1], clamp);
	return (
		<Exit len={dur('drunk')}>
			<Line at={0} y={200} size={56} weight={700} color={P.dim}>
				其實不用撐 11 天
			</Line>
			<Pop at={8} y={280}>
				<Z size={88}>只要 </Z>
				<N size={120} color={P.red}>
					24
				</N>
				<Z size={88}> 小時不睡</Z>
			</Pop>
			<Cam len={dur('drunk')} from={1.03} to={1} oy={900}>
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: useIn(4)}}>
					<defs>
						<clipPath id="ns-tube">
							<rect x={TX - 50} y={TOP - 20} width={100} height={BOT - TOP + 60} rx={50} />
							<circle cx={TX} cy={BOT + 70} r={70} />
						</clipPath>
					</defs>
					{/* outline as one shape: stroke both, then fill both */}
					<rect x={TX - 50} y={TOP - 20} width={100} height={BOT - TOP + 60} rx={50} fill="none" stroke={P.faint} strokeWidth={12} />
					<circle cx={TX} cy={BOT + 70} r={70} fill="none" stroke={P.faint} strokeWidth={12} />
					<rect x={TX - 50} y={TOP - 20} width={100} height={BOT - TOP + 60} rx={50} fill={P.bg2} />
					<circle cx={TX} cy={BOT + 70} r={70} fill={P.bg2} />
					<g clipPath="url(#ns-tube)">
						<rect x={TX - 60} y={yb} width={120} height={BOT + 160 - yb} fill={over ? P.red : P.awake} />
					</g>
					{/* legal limit */}
					<line x1={TX - 120} x2={1000} y1={by(0.03)} y2={by(0.03)} stroke={P.red} strokeWidth={4} strokeDasharray="14 12" opacity={useIn(14)} />
					{/* reached marks */}
					<line x1={TX + 60} x2={TX + 100} y1={by(0.05)} y2={by(0.05)} stroke={P.ink} strokeWidth={5} opacity={show17} />
					<line x1={TX + 60} x2={TX + 100} y1={by(0.1)} y2={by(0.1)} stroke={P.red} strokeWidth={6} opacity={show24} />
				</svg>
				<div style={{position: 'absolute', left: TX + 116, top: by(0.03) + 10, opacity: useIn(14)}}>
					<Z size={36} weight={700} color={P.red}>
						台灣酒駕標準 0.03%
					</Z>
				</div>
				<div style={{position: 'absolute', left: TX + 116, top: by(0.05) - 44, opacity: show17}}>
					<N size={64}>0.05%</N>
					<Z size={34} weight={400} color={P.dim}>
						{'  '}← 17 小時
					</Z>
				</div>
				<div style={{position: 'absolute', left: TX + 116, top: by(0.1) - 74, opacity: show24, transform: `scale(${0.8 + 0.2 * show24})`, transformOrigin: '0% 50%'}}>
					<N size={110} color={P.red}>
						0.10%
					</N>
				</div>
				<div style={{position: 'absolute', left: TX + 120, top: by(0.1) + 50, opacity: show24}}>
					<Z size={34} weight={400} color={P.dim}>
						血液酒精濃度
					</Z>
				</div>
				{/* hour pointer rides the fill */}
				<div style={{position: 'absolute', right: 1080 - (TX - 76), top: yb - 50, textAlign: 'right', opacity: useIn(16)}}>
					<Z size={36} weight={700} color={P.dim}>
						清醒{' '}
					</Z>
					<N size={72} color={over ? P.red : P.ink}>
						{Math.floor(h)}
					</N>
					<Z size={36} weight={700} color={P.dim}>
						{' '}小時
					</Z>
				</div>
			</Cam>
			<Badge at={LAND + 45} y={1340} bg={P.red} color={P.ink} size={50}>
				是酒駕標準的 3 倍多
			</Badge>
			<Note at={LAND + 60} y={1440}>
				手眼協調測驗 · Dawson &amp; Reid 1997, Nature
			</Note>
		</Exit>
	);
};

// ── 7. WASH: the brain rinses itself during sleep ────────────────────────────
const WIN = {x: 60, y: 470, w: 960, h: 660};
const useCells = () =>
	useMemo(() => {
		const r = rng(31);
		const d = 124;
		const out: {x: number; y: number; rot: number; e: number; nx: number; ny: number}[] = [];
		for (let row = -1; row * d * 0.866 < WIN.h + d; row++) {
			for (let col = -1; col * d < WIN.w + d; col++) {
				out.push({x: col * d + (row % 2 ? d / 2 : 0) + (r() - 0.5) * 10, y: row * d * 0.866 + (r() - 0.5) * 10, rot: r() * 180, e: 0.04 + r() * 0.06, nx: (r() - 0.5) * 18, ny: (r() - 0.5) * 18});
			}
		}
		const waste: {x: number; y: number; v: number; ph: number}[] = [];
		for (let row = -1; row * d * 0.866 < WIN.h + d; row++) {
			for (let col = -1; col * d < WIN.w + d; col++) {
				if (r() < 0.55) waste.push({x: col * d + (row % 2 ? d : d / 2), y: row * d * 0.866 + d * 0.29, v: 1.6 + r() * 2, ph: r() * 6});
			}
		}
		return {cells: out, waste, d};
	}, []);

const Cells: React.FC<{sleep: number; f: number; t0: number}> = ({sleep, f, t0}) => {
	const {cells, waste, d} = useCells();
	const k = 0.97 - 0.15 * sleep; // cell radius as a fraction of half-spacing
	const flowT = Math.max(0, f - t0);
	return (
		<svg width={WIN.w} height={WIN.h} style={{display: 'block'}}>
			<rect width={WIN.w} height={WIN.h} fill="#0C2B3B" />
			{/* fluid streaks, only seen through the gaps */}
			{Array.from({length: 26}).map((_, i) => (
				<line key={i} x1={-40} x2={WIN.w + 40} y1={12 + i * 26} y2={12 + i * 26} stroke={P.fluid} strokeWidth={6} strokeDasharray="40 50" strokeDashoffset={-(f * (2 + 6 * sleep)) - i * 23} opacity={0.25 + 0.6 * sleep} />
			))}
			{cells.map((c, i) => {
				const R = (d / 2) * k;
				return (
					<g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.rot})`}>
						<ellipse rx={R * (1 + c.e)} ry={R * (1 - c.e)} fill="#3A2F7A" stroke={P.sleep} strokeWidth={3} />
						<circle cx={c.nx * k} cy={c.ny * k} r={R * 0.3} fill="#6A5BDA" />
					</g>
				);
			})}
			{/* waste sits in the gaps; once the gaps open, the flow carries it off */}
			{waste.map((w, i) => {
				const dx = flowT * w.v * sleep;
				const o = interpolate(dx, [0, 340], [1, 0], clamp);
				return <circle key={i} cx={w.x + dx} cy={w.y + Math.sin(flowT * 0.15 + w.ph) * 6 * sleep} r={9} fill={P.awake} opacity={o} />;
			})}
		</svg>
	);
};

export const Wash: React.FC = () => {
	const f = useCurrentFrame();
	const SLEEP = 2 * BAR; // the switch flips on bar 3
	const zoom = interpolate(f, [16, 70], [1, 7], {...clamp, easing: Easing.in(Easing.cubic)});
	const headO = interpolate(f, [50, 68], [1, 0], clamp);
	const cellsIn = interpolate(f, [52, 72], [0, 1], clamp);
	const cellsScale = interpolate(f, [52, 80], [1.5, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const sleep = interpolate(f, [SLEEP, SLEEP + 40], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const t1 = useOut(64, 8);
	return (
		<Exit len={dur('wash')}>
			{/* head → zoom into the brain */}
			<AbsoluteFill style={{opacity: headO, transform: `scale(${zoom})`, transformOrigin: '600px 760px'}}>
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: useIn(0)}}>
					<path
						d="M330 900 C 310 700, 430 560, 600 560 C 770 560, 860 690, 850 840 C 846 880, 870 910, 900 950 C 912 966, 900 980, 880 984 L 878 1030 C 876 1060, 856 1080, 826 1080 L 780 1080 L 776 1180 L 450 1180 L 450 1080 C 370 1040, 336 980, 330 900 Z"
						fill={P.bg2}
						stroke={P.faint}
						strokeWidth={6}
					/>
					<path d="M400 820 C 390 700, 480 620, 600 620 C 720 620, 800 700, 790 800 C 785 860, 740 900, 680 900 C 640 930, 580 930, 540 905 C 480 920, 410 890, 400 820 Z" fill={P.sleepDeep} />
					<g fill="none" stroke={P.sleep} strokeWidth={6} strokeLinecap="round">
						<path d="M470 700 C 500 680, 530 700, 520 730 C 510 760, 560 770, 580 740" />
						<path d="M620 670 C 660 660, 690 690, 670 720 C 650 750, 700 770, 730 750" />
						<path d="M450 800 C 480 780, 520 800, 540 830 C 560 860, 610 850, 620 820" />
						<path d="M650 800 C 680 790, 720 810, 740 840" />
					</g>
				</svg>
			</AbsoluteFill>
			<div style={{opacity: t1}}>
				<Line at={0} y={230} size={88} weight={900}>
					為什麼非睡不可？
				</Line>
			</div>
			<Line at={68} y={230} size={84} weight={900}>
				睡覺時，大腦在洗澡
			</Line>
			{/* state pill */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 378, textAlign: 'center', opacity: cellsIn}}>
				<span style={{display: 'inline-flex', alignItems: 'center', gap: 14, padding: '8px 30px', borderRadius: 999, background: sleep > 0.5 ? P.sleep : P.awake, color: P.bg, fontFamily: SANS, fontWeight: 900, fontSize: 40}}>
					{sleep > 0.5 ? '睡覺時' : '清醒時'}
				</span>
			</div>
			<div
				style={{
					position: 'absolute',
					left: WIN.x,
					top: WIN.y,
					width: WIN.w,
					height: WIN.h,
					borderRadius: 40,
					overflow: 'hidden',
					border: `4px solid ${P.faint}`,
					opacity: cellsIn,
					transform: `scale(${cellsScale})`,
				}}
			>
				<Cells sleep={sleep} f={f} t0={SLEEP} />
			</div>
			<Pop at={3 * BAR} y={1170} big>
				<Z size={60}>細胞間的空隙 </Z>
				<N size={130} color={P.fluid}>
					+60%
				</N>
			</Pop>
			<Line at={4 * BAR} y={1340} size={54} weight={700}>
				把白天累積的廢物沖走
			</Line>
			<Note at={4 * BAR + 20} y={1430}>
				小鼠實驗 · Xie 等 2013, Science
			</Note>
		</Exit>
	);
};

// ── 8. DOLPHIN: half a brain at a time ───────────────────────────────────────
const Hemi: React.FC<{side: -1 | 1; asleep: number}> = ({side, asleep}) => {
	const w = 150,
		h = 210;
	const cx = 540 + side * 12;
	const d =
		side < 0
			? `M${cx} ${600 - h / 2} C ${cx - w * 1.1} ${600 - h / 2}, ${cx - w * 1.1} ${600 + h / 2}, ${cx} ${600 + h / 2} Z`
			: `M${cx} ${600 - h / 2} C ${cx + w * 1.1} ${600 - h / 2}, ${cx + w * 1.1} ${600 + h / 2}, ${cx} ${600 + h / 2} Z`;
	const sx = (x: number) => cx + side * x;
	return (
		<g>
			<path d={d} fill={P.awake} />
			<path d={d} fill={P.sleep} opacity={asleep} />
			<g fill="none" stroke={P.bg} strokeOpacity={0.25} strokeWidth={5} strokeLinecap="round">
				<path d={`M${sx(20)} 530 C ${sx(60)} 510, ${sx(90)} 540, ${sx(70)} 560`} />
				<path d={`M${sx(96)} 600 C ${sx(120)} 620, ${sx(100)} 650, ${sx(70)} 640`} />
				<path d={`M${sx(24)} 672 C ${sx(50)} 690, ${sx(80)} 680, ${sx(90)} 662`} />
			</g>
		</g>
	);
};

export const DolphinScene: React.FC = () => {
	const f = useCurrentFrame();
	// from bar 2 on, the halves take turns sleeping, one bar each
	const phase = (fr: number) => (fr < BAR ? -1 : Math.floor((fr - BAR) / BAR) % 2);
	const ease = (side: 0 | 1) => {
		const cur = phase(f) === side ? 1 : 0;
		const prev = phase(f - 8) === side ? 1 : 0;
		const into = (f - BAR) % BAR;
		return f >= BAR && into < 8 ? prev + (cur - prev) * (into / 8) : cur;
	};
	const left = ease(0),
		right = ease(1);
	const bob = Math.sin(f * 0.09) * 14;
	const tilt = Math.cos(f * 0.09) * 4;
	const wave = (y: number, a: number, k: number, sp: number, bottom: number) => {
		let d = `M0 ${y}`;
		for (let x = 0; x <= 1080; x += 30) d += ` L${x} ${y + a * Math.sin(x * k + f * sp)}`;
		return d + ` L1080 ${bottom} L0 ${bottom} Z`;
	};
	return (
		<Exit len={dur('dolphin')}>
			<Line at={0} y={200} size={52} weight={700} color={P.dim}>
				一直要游、還要浮上來換氣的海豚
			</Line>
			<Line at={8} y={280} size={100} weight={900}>
				也沒辦法不睡
			</Line>
			<Cam len={dur('dolphin')} from={1} to={1.05} oy={800}>
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: useIn(4)}}>
					<defs>
						<linearGradient id="ns-sea" x1="0" y1="790" x2="0" y2="1300" gradientUnits="userSpaceOnUse">
							<stop offset="0" stopColor="#1C4A80" stopOpacity="0.95" />
							<stop offset="0.6" stopColor="#123058" stopOpacity="0.7" />
							<stop offset="1" stopColor="#0D1228" stopOpacity="0" />
						</linearGradient>
					</defs>
					<Hemi side={-1} asleep={left} />
					<Hemi side={1} asleep={right} />
					<path d={wave(790, 10, 0.012, 0.08, 840)} fill="#2A5C96" opacity={0.6} />
					<path d={wave(806, 8, 0.016, -0.06, 1320)} fill="url(#ns-sea)" />
				</svg>
				{[
					[-1, left],
					[1, right],
				].map(([side, a]) => (
					<div key={side} style={{position: 'absolute', top: 562, left: 540 + side * 92 - 60, width: 120, textAlign: 'center', opacity: useIn(10)}}>
						<Z size={56} color={P.bg}>
							{a > 0.5 ? '睡' : '醒'}
						</Z>
					</div>
				))}
				<div style={{position: 'absolute', left: 270, top: 880 + bob, transform: `rotate(${tilt}deg)`, opacity: useIn(6)}}>
					<Dolphin w={540} />
				</div>
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
					{Array.from({length: 10}).map((_, i) => {
						const ph = ((f * 0.012 + i * 0.1) % 1 + 1) % 1;
						return <circle key={i} cx={300 + ((i * 97) % 480) + Math.sin(ph * 8 + i) * 8} cy={1160 - ph * 330} r={5 + (i % 3) * 3} fill="none" stroke="#9CC3EE" strokeWidth={3} opacity={Math.sin(Math.PI * ph) * 0.7} />;
					})}
				</svg>
			</Cam>
			<Line at={BAR + 10} y={1220} size={76} weight={900}>
				牠們讓左右腦<span style={{color: P.sleep}}>輪流睡</span>
			</Line>
			<Note at={2 * BAR + 10} y={1340}>
				單半球睡眠：一次只睡半邊大腦
			</Note>
		</Exit>
	);
};

// ── 9. END ───────────────────────────────────────────────────────────────────
export const End: React.FC = () => {
	const f = useCurrentFrame();
	const D = dur('end');
	const fade = interpolate(f, [D - 18, D], [1, 0], clamp);
	return (
		<AbsoluteFill style={{opacity: fade}}>
			<Pop at={4} y={250}>
				<Z size={84}>那 </Z>
				<N size={120} color={P.sleep}>
					27
				</N>
				<Z size={84}> 年，不是浪費</Z>
			</Pop>
			<Line at={30} y={420} size={60} weight={700} color={P.dim}>
				是大腦每晚的大掃除
			</Line>
			<Cam len={D} from={1} to={1.06} oy={800}>
				<div style={{position: 'absolute', left: 760, top: 540, opacity: useIn(10, 20)}}>
					<Moon size={130} id="ns-end-moon" />
				</div>
				<div style={{position: 'absolute', left: 160, top: 660, opacity: useIn(6, 20)}}>
					<Sleeper w={760} open={0} zzz={1} f={f + 30} />
				</div>
			</Cam>
			<Line at={BAR + 20} y={1080} size={96} weight={900} color={P.moon}>
				今晚，早點睡。
			</Line>
			<div style={{position: 'absolute', left: 80, right: 140, top: 1270, textAlign: 'center', fontFamily: SANS, fontSize: 32, lineHeight: 1.55, color: P.dim, opacity: useIn(2 * BAR + 20)}}>
				Dawson &amp; Reid 1997, Nature · Xie 等 2013, Science
				<br />
				Randy Gardner、單半球睡眠：Wikipedia
				<br />
				台灣酒駕標準：道路交通安全規則 §114
				<br />
				配樂採樣 VSCO 2 CE、VCSL（CC0）
			</div>
		</AbsoluteFill>
	);
};

import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Line, useIn, useOut} from '../../engine/kit/kit';
import {FPS, NUM, SANS, s} from '../../engine/kit/theme';
import land from './land.png';
import {A, AntSpec, BigAnt, Bird, Elephant, Person, rng, Swarm, Whale} from './art';
import {dur, T} from './timeline';

const L: React.FC<{at: number; y: number; size?: number; weight?: number; color?: string; children: React.ReactNode; out?: number}> = ({at, y, size = 64, weight = 700, color = A.ink, children, out}) => (
	<Line at={at} y={y} size={size} weight={weight} color={color} out={out}>
		{children}
	</Line>
);
const Kicker: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => (
	<Line at={at} y={y} size={40} weight={700} color={A.accent} tracking={6} lift={14}>
		{children}
	</Line>
);
const Note: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => (
	<Line at={at} y={y} size={32} weight={400} color={A.dim} lift={10}>
		{children}
	</Line>
);
const Exit: React.FC<{len: number; children: React.ReactNode; fade?: number}> = ({len, children, fade = 10}) => {
	const o = useOut(len, fade);
	return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};
const N: React.FC<{size: number; color?: string; children: React.ReactNode}> = ({size, color = A.ink, children}) => (
	<span style={{fontFamily: NUM, fontWeight: 900, fontSize: size, color, letterSpacing: -size * 0.03, fontVariantNumeric: 'tabular-nums'}}>{children}</span>
);
const Z: React.FC<{size: number; color?: string; weight?: number; children: React.ReactNode}> = ({size, color = A.ink, weight = 900, children}) => (
	<span style={{fontFamily: SANS, fontWeight: weight, fontSize: size, color}}>{children}</span>
);

// ── 1. HOOK: one ant ─────────────────────────────────────────────────────────
export const Hook: React.FC = () => {
	const f = useCurrentFrame();
	const x = interpolate(f, [0, 70], [-260, 540], {...clamp, easing: Easing.out(Easing.cubic)});
	const walking = f < 70;
	const phase = walking ? f * 0.55 : 70 * 0.55 + 0.15 * Math.sin(f * 0.2);
	return (
		<Exit len={dur('hook')}>
			<L at={16} y={340} size={80} weight={900}>
				這是一隻螞蟻
			</L>
			<div style={{position: 'absolute', left: x - 260, top: 780 - 260}}>
				<BigAnt size={520} phase={phase} />
			</div>
			<L at={96} y={1150} size={64} weight={700} color={A.dim}>
				全世界，
			</L>
			<L at={108} y={1240} size={96} weight={900}>
				總共有幾隻？
			</L>
		</Exit>
	);
};

// ── 2. COUNT ─────────────────────────────────────────────────────────────────
const useAnts = (seed: number, n: number, w: number, h: number, size: [number, number], bornSpan: [number, number], speed = 26) =>
	useMemo(() => {
		const r = rng(seed);
		const out: AntSpec[] = [];
		for (let i = 0; i < n; i++) {
			// births spread exponentially so the swarm "explodes"
			const u = i / n;
			out.push({
				x: r() * w,
				y: r() * h,
				a: r() * Math.PI * 2,
				size: size[0] + r() * (size[1] - size[0]),
				speed: speed * (0.6 + r() * 0.8),
				phase: r() * 10,
				born: bornSpan[0] + (bornSpan[1] - bornSpan[0]) * Math.pow(u, 0.35),
			});
		}
		return out;
	}, [seed, n, w, h, size[0], size[1], bornSpan[0], bornSpan[1], speed]);

export const Count: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const p = interpolate(f, [12, 222], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const v = Math.round(Math.pow(10, 16.30103 * p));
	const str = (p >= 1 ? 2e16 : v).toLocaleString('en-US');
	const size = Math.min(200, 980 / (str.length * 0.6));
	const ants = useAnts(7, 5200, 1080, 1920, [4, 8], [0.4, 7.2]);
	const visible = Math.floor(interpolate(f, [12, 222], [1, ants.length], {...clamp, easing: Easing.in(Easing.cubic)}));
	const {fps} = useVideoConfig();
	const big = spring({frame: f - 226, fps, config: {damping: 12, mass: 0.6, stiffness: 180}});
	return (
		<Exit len={dur('count')}>
			<Swarm w={1080} h={1920} ants={ants} t={t} count={visible} style={{position: 'absolute', inset: 0, opacity: 0.85}} />
			<div
				style={{
					position: 'absolute',
					left: 40,
					right: 40,
					top: 600,
					height: 560,
					borderRadius: 48,
					background: 'rgba(239,230,214,0.92)',
					boxShadow: '0 30px 80px rgba(30,23,18,0.25)',
					opacity: useIn(0),
				}}
			/>
			<Kicker at={0} y={650}>
				答案是
			</Kicker>
			{f < 226 && (
				<div style={{position: 'absolute', top: 820 - size * 0.1, left: 0, right: 0, textAlign: 'center', height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<N size={size}>{str}</N>
				</div>
			)}
			{f >= 226 && (
				<>
					<div style={{position: 'absolute', top: 720, left: 0, right: 0, textAlign: 'center', transform: `scale(${1.3 - 0.3 * big})`, opacity: Math.min(1, big * 1.4)}}>
						<N size={250} color={A.accent}>
							2
						</N>
						<Z size={170}> 京</Z>
						<Z size={90}> 隻</Z>
					</div>
					<div style={{position: 'absolute', top: 1010, left: 0, right: 0, textAlign: 'center', opacity: big}}>
						<N size={54} color={A.dim}>
							20,000,000,000,000,000
						</N>
					</div>
				</>
			)}
			<Note at={250} y={1190}>
				2022 年 PNAS 研究的保守估計
			</Note>
		</Exit>
	);
};

// ── 3. PER PERSON ────────────────────────────────────────────────────────────
export const PerPerson: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const ants = useAnts(21, 1600, 1080, 420, [4, 7], [0.2, 2.6], 30);
	return (
		<Exit len={dur('person')}>
			<Kicker at={0} y={250}>
				平均分給每個人
			</Kicker>
			<div style={{position: 'absolute', left: 150, top: 470, opacity: useIn(6), transform: `translateY(${(1 - useIn(6)) * 30}px)`}}>
				<Person h={460} />
			</div>
			<div style={{position: 'absolute', left: 440, top: 560, opacity: useIn(14)}}>
				<Z size={60} weight={700}>
					每人約
				</Z>
				<div>
					<N size={200} color={A.accent}>
						250
					</N>
					<Z size={110}> 萬</Z>
				</div>
				<Z size={60} weight={700}>
					隻螞蟻
				</Z>
			</div>
			<Note at={50} y={980}>
				2 京 ÷ 80 億人 ≈ 250 萬
			</Note>
			<Swarm w={1080} h={420} ants={ants} t={t} count={Math.floor(interpolate(f, [20, 90], [0, 1600], clamp))} style={{position: 'absolute', left: 0, top: 1060, WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 25%, #000 75%, transparent 100%)', maskImage: 'linear-gradient(180deg, transparent 0%, #000 25%, #000 75%, transparent 100%)'}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 1280, textAlign: 'center', opacity: useIn(130)}}>
				<span
					style={{
						display: 'inline-block',
						padding: '18px 40px',
						borderRadius: 999,
						background: A.ink,
						color: A.bg,
						fontFamily: SANS,
						fontWeight: 700,
						fontSize: 48,
					}}
				>
					一秒數一隻，不吃不睡要數 29 天
				</span>
			</div>
		</Exit>
	);
};

// ── 4. DENSITY: one square metre ─────────────────────────────────────────────
export const Density: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const SQ = 720;
	const ants = useMemo(() => {
		const r = rng(99);
		return Array.from({length: 2000}, (_, i) => ({
			x: r() * SQ,
			y: r() * SQ,
			a: r() * Math.PI * 2,
			size: 4.2 + r() * 1.4,
			speed: 10 + r() * 14,
			phase: r() * 10,
			born: 0.5 + (i / 2000) * 3.2,
		}));
	}, []);
	const n = Math.floor(interpolate(f, [15, 111], [0, 2000], clamp));
	const shown = Math.min(2000, Math.round(interpolate(f, [15, 111], [0, 2000], clamp)));
	return (
		<Exit len={dur('density')}>
			<Kicker at={0} y={230}>
				象牙海岸的一片熱帶森林
			</Kicker>
			<div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center', opacity: useIn(4)}}>
				<Z size={64} weight={700}>
					每平方公尺約{' '}
				</Z>
				<N size={120} color={A.accent}>
					{shown.toLocaleString('en-US')}
				</N>
				<Z size={64} weight={700}>
					{' '}隻
				</Z>
			</div>
			<div style={{position: 'absolute', left: (1080 - SQ) / 2, top: 520, width: SQ, height: SQ, background: '#E2D3B8', borderRadius: 8, border: `4px solid ${A.ink}`, overflow: 'hidden', opacity: useIn(2)}}>
				<Swarm w={SQ} h={SQ} ants={ants} t={t} count={n} />
			</div>
			{/* ruler */}
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: useIn(8)}}>
				<line x1={(1080 - SQ) / 2} x2={(1080 + SQ) / 2} y1={1280} y2={1280} stroke={A.ink} strokeWidth={4} />
				<line x1={(1080 - SQ) / 2} x2={(1080 - SQ) / 2} y1={1266} y2={1294} stroke={A.ink} strokeWidth={4} />
				<line x1={(1080 + SQ) / 2} x2={(1080 + SQ) / 2} y1={1266} y2={1294} stroke={A.ink} strokeWidth={4} />
				<rect x={540 - 60} y={1258} width={120} height={44} fill={A.bg} />
				<text x={540} y={1294} textAnchor="middle" style={{fontFamily: NUM, fontWeight: 800, fontSize: 40}} fill={A.ink}>
					1 m
				</text>
			</svg>
			<Note at={60} y={1340}>
				（每公頃約 2,000 萬隻 · Schultheiss 等 2022 引用的實地調查）
			</Note>
		</Exit>
	);
};

// ── 5. PIVOT ─────────────────────────────────────────────────────────────────
export const Pivot: React.FC = () => (
	<Exit len={dur('pivot')} fade={6}>
		<L at={0} y={760} size={68} weight={700} color={A.dim}>
			這麼多螞蟻
		</L>
		<L at={8} y={860} size={100} weight={900}>
			加起來有多重？
		</L>
	</Exit>
);

// ── 6. SCALE ─────────────────────────────────────────────────────────────────
const Pile: React.FC<{fill: number; t: number}> = ({fill, t}) => {
	const ants = useMemo(() => {
		const r = rng(5);
		const out: AntSpec[] = [];
		for (let i = 0; i < 900; i++) {
			// heap profile: wider at bottom
			const u = r();
			const hgt = Math.pow(r(), 0.8);
			const halfW = 150 * (1 - hgt * 0.75);
			out.push({x: 170 + (u * 2 - 1) * halfW, y: 220 - hgt * 190, a: r() * Math.PI * 2, size: 5 + r() * 2.5, speed: 0, phase: r() * 10, born: 0});
		}
		// fill from bottom up
		return out.sort((a, b) => b.y - a.y);
	}, []);
	return <Swarm w={340} h={240} ants={ants} t={t} count={Math.floor(ants.length * fill)} wrap={false} />;
};

export const Scale: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = f / FPS;
	const PX = 540,
		PY = 640,
		ARM = 330;
	const leftIn = spring({frame: f - 24, fps, config: {damping: 14, mass: 0.9, stiffness: 90}});
	const antsIn = spring({frame: f - 120, fps, config: {damping: 9, mass: 1.1, stiffness: 70}});
	// balance: left = 9 Mt C, right = 12.3 Mt C → tips right
	const theta = (-7 * leftIn + 15 * antsIn) * (Math.PI / 180);
	const lx = PX - ARM * Math.cos(theta),
		ly = PY - ARM * Math.sin(theta);
	const rx = PX + ARM * Math.cos(theta),
		ry = PY + ARM * Math.sin(theta);
	const HANG = 230;
	const fill = interpolate(f, [104, 150], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	const Pan: React.FC<{x: number; y: number; children?: React.ReactNode}> = ({x, y, children}) => (
		<>
			<line x1={x} y1={y} x2={x - 150} y2={y + HANG} stroke={A.ink} strokeWidth={3} />
			<line x1={x} y1={y} x2={x + 150} y2={y + HANG} stroke={A.ink} strokeWidth={3} />
			<path d={`M ${x - 175} ${y + HANG} Q ${x} ${y + HANG + 70} ${x + 175} ${y + HANG} Z`} fill={A.ink} />
			{children}
		</>
	);
	return (
		<Exit len={dur('scale')}>
			<Kicker at={0} y={230}>
				放上天平（以乾重的碳計）
			</Kicker>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				{/* stand */}
				<path d={`M ${PX} ${PY} L ${PX - 70} 1180 L ${PX + 70} 1180 Z`} fill={A.faint} />
				<rect x={PX - 120} y={1176} width={240} height={22} rx={11} fill={A.ink} />
				{/* beam */}
				<line x1={lx} y1={ly} x2={rx} y2={ry} stroke={A.ink} strokeWidth={16} strokeLinecap="round" />
				<circle cx={PX} cy={PY} r={22} fill={A.accent} />
				<Pan x={lx} y={ly} />
				<Pan x={rx} y={ry} />
			</svg>
			{/* left pan contents: wild birds + wild mammals */}
			<div style={{position: 'absolute', left: lx - 175, top: ly + HANG - 150, width: 350, height: 150, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6, opacity: leftIn, transform: `translateY(${(1 - leftIn) * -200}px)`}}>
				<Bird size={78} />
				<Elephant size={140} />
				<Whale size={120} />
			</div>
			{/* right pan contents: the ant heap */}
			<div style={{position: 'absolute', left: rx - 170, top: ry + HANG - 228}}>
				<Pile fill={fill} t={t} />
			</div>
			{/* labels follow the pans */}
			<div style={{position: 'absolute', left: Math.max(20, lx - 230), width: 460, top: ly + HANG + 60, textAlign: 'center', opacity: useIn(40)}}>
				<Z size={38} weight={700} color={A.dim}>
					所有野生鳥類
					<br />＋ 野生哺乳類
				</Z>
				<div>
					<N size={84}>900</N>
					<Z size={44}> 萬噸</Z>
				</div>
			</div>
			<div style={{position: 'absolute', left: Math.min(1060 - 460, rx - 230), width: 460, top: ry + HANG + 60, textAlign: 'center', opacity: useIn(136)}}>
				<Z size={38} weight={700} color={A.dim}>
					全世界
					<br />
					的螞蟻
				</Z>
				<div>
					<N size={84} color={A.accent}>
						1,200
					</N>
					<Z size={44} color={A.accent}>
						{' '}
						萬噸
					</Z>
				</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1300, textAlign: 'center', opacity: useIn(270)}}>
				<span style={{display: 'inline-block', padding: '20px 44px', borderRadius: 999, background: A.ink, color: A.bg, fontFamily: SANS, fontWeight: 900, fontSize: 52}}>
					大約是全人類的 1/5
				</span>
			</div>
			<Note at={290} y={1420}>
				Bar-On 等 2018 · Schultheiss 等 2022（PNAS）
			</Note>
		</Exit>
	);
};

// ── 7. WHERE ─────────────────────────────────────────────────────────────────
const MAP_W = 1000,
	MAP_H = 500,
	COLS = 120,
	ROWS = 60;
let landCache: Promise<boolean[]> | null = null;
const loadLand = () => {
	if (!landCache)
		landCache = new Promise((res, rej) => {
			const img = new Image();
			img.onload = () => {
				const c = document.createElement('canvas');
				c.width = COLS;
				c.height = ROWS;
				const g = c.getContext('2d', {willReadFrequently: true})!;
				g.drawImage(img, 0, 0, COLS, ROWS);
				const d = g.getImageData(0, 0, COLS, ROWS).data;
				const out: boolean[] = [];
				for (let i = 0; i < COLS * ROWS; i++) out.push(d[i * 4] < 110); // mask: white = ocean
				res(out);
			};
			img.onerror = rej;
			img.src = land;
		});
	return landCache;
};

const WorldDots: React.FC<{f: number}> = ({f}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	const [land, setLand] = useState<boolean[] | null>(null);
	const [h] = useState(() => delayRender('land mask'));
	useEffect(() => {
		loadLand().then((x) => {
			setLand(x);
			continueRender(h);
		});
	}, [h]);
	useLayoutEffect(() => {
		const cv = ref.current;
		if (!cv || !land) return;
		const g = cv.getContext('2d')!;
		g.clearRect(0, 0, MAP_W, MAP_H);
		const dx = MAP_W / COLS,
			dy = MAP_H / ROWS;
		const hi = interpolate(f, [40, 90], [0, 1], clamp);
		for (let r = 0; r < ROWS; r++) {
			const lat = 90 - (r + 0.5) * (180 / ROWS);
			const trop = Math.abs(lat) < 23.44;
			for (let c = 0; c < COLS; c++) {
				if (!land[r * COLS + c]) continue;
				const x = (c + 0.5) * dx,
					y = (r + 0.5) * dy;
				const ripple = trop ? 0.5 + 0.5 * Math.sin(f * 0.25 - c * 0.35) : 0;
				g.fillStyle = trop && hi > 0 ? `rgba(217,72,15,${0.35 + 0.65 * hi * (0.75 + 0.25 * ripple)})` : 'rgba(30,23,18,0.32)';
				const rad = trop ? 3.1 + 0.9 * hi * ripple : 2.8;
				g.beginPath();
				g.arc(x, y, rad, 0, Math.PI * 2);
				g.fill();
			}
		}
	});
	return <canvas ref={ref} width={MAP_W} height={MAP_H} style={{display: 'block'}} />;
};

export const Where: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const st = spring({frame: f - 70, fps, config: {damping: 12, mass: 0.6, stiffness: 170}});
	const tropY = (lat: number) => 560 + ((90 - lat) / 180) * MAP_H;
	return (
		<Exit len={dur('where')}>
			<L at={0} y={250} size={88} weight={900}>
				牠們住在哪？
			</L>
			<div style={{position: 'absolute', left: 40, top: 560, opacity: useIn(6)}}>
				<WorldDots f={f} />
			</div>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: interpolate(f, [30, 50], [0, 1], clamp)}}>
				{[23.44, -23.44].map((lat) => (
					<g key={lat}>
						<line x1={40} x2={1040} y1={tropY(lat)} y2={tropY(lat)} stroke={A.accent} strokeWidth={2} strokeDasharray="10 10" opacity={0.7} />
						<text x={1036} y={tropY(lat) - 10} textAnchor="end" fill={A.accent} style={{fontFamily: SANS, fontWeight: 700, fontSize: 26}}>
							{lat > 0 ? '北回歸線' : '南回歸線'}
						</text>
					</g>
				))}
			</svg>
			<Note at={60} y={1110}>
				在地面上活動的螞蟻裡
			</Note>
			<div style={{position: 'absolute', top: 1160, left: 0, right: 0, textAlign: 'center', opacity: Math.min(1, st * 1.4), transform: `scale(${1.25 - 0.25 * st})`}}>
				<N size={170} color={A.accent}>
					61%
				</N>
			</div>
			<L at={84} y={1370} size={52} weight={700}>
				住在熱帶雨林和熱帶草原
			</L>
		</Exit>
	);
};

// ── 8. END ───────────────────────────────────────────────────────────────────
export const End: React.FC = () => {
	const f = useCurrentFrame();
	const D = dur('end');
	const x = interpolate(f, [0, 60], [1340, 540], {...clamp, easing: Easing.out(Easing.cubic)});
	const phase = f < 60 ? f * 0.55 : 33 + 0.15 * Math.sin(f * 0.2);
	const fade = interpolate(f, [D - 20, D], [1, 0], clamp);
	return (
		<AbsoluteFill style={{opacity: fade}}>
			<L at={6} y={300} size={72} weight={700}>
				下次看到一隻螞蟻
			</L>
			<div style={{position: 'absolute', left: x - 200, top: 760 - 200, transform: 'scaleX(-1)'}}>
				<BigAnt size={400} phase={phase} />
			</div>
			<L at={56} y={1060} size={60} weight={700} color={A.dim}>
				想想牠背後
			</L>
			<div style={{position: 'absolute', top: 1140, left: 0, right: 0, textAlign: 'center', opacity: useIn(68)}}>
				<Z size={70}>還有 </Z>
				<N size={150} color={A.accent}>
					2
				</N>
				<Z size={110}> 京</Z>
				<Z size={70}> 個同伴</Z>
			</div>
			<div style={{position: 'absolute', left: 60, right: 60, top: 1560, textAlign: 'center', fontFamily: SANS, fontSize: 26, lineHeight: 1.7, color: A.dim, opacity: useIn(90)}}>
				數據：Schultheiss 等 2022, PNAS · Bar-On 等 2018, PNAS
				<br />
				音樂採樣：VSCO 2 CE、VCSL（CC0）
			</div>
		</AbsoluteFill>
	);
};

export {T};

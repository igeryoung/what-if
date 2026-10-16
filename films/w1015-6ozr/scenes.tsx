import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Count, Line, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {BigFoot, Gecko, Glass, Mite, PAD, Person, rng, Shoe} from './art';
import {CLIMB, dur, END_FILL, FILL, HOOK_RUN, SCALE_GROW, SECRET_STAGE, SPECIES_BAR, STRENGTH_DROP, STRENGTH_POP} from './timeline';

const ease = {...clamp, easing: Easing.inOut(Easing.cubic)};

// Fades the whole scene out over its last `fade` frames.
const Exit: React.FC<{len: number; fade?: number; children: React.ReactNode}> = ({len, fade = 10, children}) => (
	<AbsoluteFill style={{opacity: useOut(len, fade)}}>{children}</AbsoluteFill>
);
const Kicker: React.FC<{at: number; y: number; out?: number; children: React.ReactNode}> = ({at, y, out, children}) => (
	<Line at={at} y={y} size={40} weight={700} color={C.amber} tracking={6} lift={14} out={out}>
		{children}
	</Line>
);
const Note: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => (
	<Line at={at} y={y} size={32} weight={400} color={C.dim} lift={10}>
		{children}
	</Line>
);
const N: React.FC<{size: number; color?: string; children: React.ReactNode}> = ({size, color = C.ink, children}) => (
	<span style={{fontFamily: NUM, fontWeight: 900, fontSize: size, color, letterSpacing: -size * 0.03, fontVariantNumeric: 'tabular-nums'}}>{children}</span>
);
const Z: React.FC<{size: number; color?: string; weight?: number; children: React.ReactNode}> = ({size, color = C.ink, weight = 900, children}) => (
	<span style={{fontFamily: useLang() === 'en' ? SANS_EN : SANS, fontWeight: weight, fontSize: size, color}}>{children}</span>
);
const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, ...style}}>
		{children}
	</svg>
);
// A number that pops in (overshoot spring) at local frame `at`.
const usePop = (at: number) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: f - at, fps, config: {damping: 12, mass: 0.6, stiffness: 180}});
};
const Pop: React.FC<{at: number; y: number; out?: number; children: React.ReactNode}> = ({at, y, out, children}) => {
	const p = usePop(at);
	const o = useOut(out ?? 1e9);
	return (
		<div style={{position: 'absolute', top: y, left: 40, right: 40, textAlign: 'center', lineHeight: 1.05, opacity: Math.min(1, p * 1.4) * o, transform: `scale(${1.25 - 0.25 * p})`}}>
			{children}
		</div>
	);
};

// ---------------------------------------------------------------- the opening image
// Glass wall, a gecko high up, a person at the foot of the wall with both hands on the glass.
// Frame 0 of the film shows exactly HookArt with run = 0 and fill = 0; the ending settles back into it.
export const GECKO0 = {x: 740, y: 450, rot: -8, scale: 0.95};
export const HookArt: React.FC<{run?: number; phase?: number; fill?: number}> = ({run = 0, phase = 0, fill = 0}) => (
	<AbsoluteFill>
		<Glass />
		<Svg>
			<rect x={0} y={1760} width={1080} height={160} fill="#090B0E" />
			<rect x={0} y={1758} width={1080} height={4} fill="#2A2F38" />
			<Gecko x={GECKO0.x - 40 * run} y={GECKO0.y - 150 * run} rot={GECKO0.rot - 6 * run} scale={GECKO0.scale} phase={phase} step={run > 0 && run < 1 ? 1 : 0} />
			<Person id="hook" x={540} y={1760} k={2.7} pose="up" fill={fill} view="back" />
		</Svg>
	</AbsoluteFill>
);

export const Hook: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('hook');
	const run = interpolate(f, [...HOOK_RUN], [0, 1], ease);
	const zoom = interpolate(f, [0, D], [1, 1.035], ease);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 60%'}}>
				<HookArt run={run} phase={f * 0.9} />
			</AbsoluteFill>
			<Line at={4} y={700} size={t(100, 88)} weight={900}>
				{t('如果人類能像\n壁虎一樣爬牆？', 'What if humans\ncould climb walls\nlike geckos?')}
			</Line>
			<Line at={60} y={t(980, 1060)} size={t(60, 54)} weight={700} color={C.amber}>
				{t('你會變成什麼樣子？', 'What would you look like?')}
			</Line>
		</Exit>
	);
};

// ---------------------------------------------------------------- 1. the secret: toe → hairs → split tips
const HAIRS = (() => {
	const r = rng(21);
	return Array.from({length: 7}, (_, row) =>
		Array.from({length: 24}, (_, i) => ({x: 120 + i * 37 + (r() - 0.5) * 16 + (row % 2) * 18, yb: 860 + row * 92 + (r() - 0.5) * 10, h: 120 + r() * 30, ph: r() * 6.28, row})),
	).flat();
})();
const BRANCHES = (() => {
	const r = rng(5);
	return Array.from({length: 34}, (_, i) => {
		const a = -1.25 + (i / 33) * 2.5 + (r() - 0.5) * 0.04;
		const len = 270 + r() * 40;
		return {a, len, bend: (r() - 0.5) * 40};
	});
})();

const Stage: React.FC<{from: number; to: number; zoomTo?: [number, number]; children: React.ReactNode}> = ({from, to, zoomTo = [540, 1100], children}) => {
	const f = useCurrentFrame();
	const op = interpolate(f, [from, from + 12, to - 12, to], [0, 1, 1, 0], clamp);
	const zin = interpolate(f, [from, from + 14], [0.6, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const zout = interpolate(f, [to - 14, to], [1, 2.6], {...clamp, easing: Easing.in(Easing.cubic)});
	const drift = interpolate(f, [from, to], [1, 1.06], clamp);
	return (
		<AbsoluteFill style={{opacity: op, transform: `scale(${zin * zout * drift})`, transformOrigin: `${zoomTo[0]}px ${zoomTo[1]}px`}}>
			{children}
		</AbsoluteFill>
	);
};

export const Secret: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('secret');
	const [A, B, Cc] = SECRET_STAGE;
	const stalk = interpolate(f, [Cc + 4, Cc + 24], [0, 1], ease);
	const grow = interpolate(f, [Cc + 20, Cc + 50], [0, 1], ease);
	const tips = interpolate(f, [Cc + 44, Cc + 58], [0, 1], clamp);
	return (
		<Exit len={D}>
			<Stage from={A} to={B} zoomTo={[500, 1045]}>
				<Svg>
					<BigFoot cx={570} cy={1320} />
				</Svg>
			</Stage>
			<Kicker at={A} y={250} out={B - 4}>
				{t('秘密在腳趾', 'THE SECRET IS IN THE TOES')}
			</Kicker>
			<Line at={A + 10} y={330} size={t(100, 92)} weight={900} out={B - 4}>
				{t('沒有膠水\n也沒有吸盤', 'No glue.\nNo suction cups.')}
			</Line>

			<Stage from={B} to={Cc} zoomTo={[560, 1000]}>
				<Svg>
					<defs>
						<clipPath id="lens">
							<circle cx={540} cy={1080} r={380} />
						</clipPath>
					</defs>
					<circle cx={540} cy={1080} r={380} fill="#17130B" />
					<g clipPath="url(#lens)">
						{HAIRS.map((h, i) => {
							const sw = Math.sin(f / 9 + h.ph) * 5;
							const op = 0.4 + (h.row / 6) * 0.6;
							return (
								<path key={i} d={`M ${h.x} ${h.yb} Q ${h.x + 6 + sw} ${h.yb - h.h * 0.55} ${h.x + 26 + sw * 1.6} ${h.yb - h.h}`} stroke={PAD} strokeWidth={4 + h.row * 0.6} strokeLinecap="round" fill="none" opacity={op} />
							);
						})}
					</g>
					<circle cx={540} cy={1080} r={380} fill="none" stroke="#3A3F48" strokeWidth={14} />
				</Svg>
			</Stage>
			<Line at={B + 6} y={260} size={1} out={Cc - 4}>
				<N size={200} color={C.amber}>
					<Count from={0} to={14400} at={B + 8} dur={30} decimals={0} />
				</N>
			</Line>
			<Line at={B + 18} y={500} size={t(64, 60)} weight={700} out={Cc - 4}>
				{t('根細毛／每平方毫米', 'hairs per mm²')}
			</Line>

			<Stage from={Cc} to={D + 20}>
				<Svg>
					<path d="M 540 1400 C 548 1250 532 1130 540 1010" stroke={PAD} strokeWidth={26} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={`${stalk} 1`} />
					{BRANCHES.map((b, i) => {
						const ex = 540 + Math.sin(b.a) * b.len;
						const ey = 1010 - Math.cos(b.a) * b.len * 0.95;
						const mx = 540 + Math.sin(b.a) * b.len * 0.45 + b.bend;
						const my = 1010 - Math.cos(b.a) * b.len * 0.5;
						const deg = (b.a * 180) / Math.PI;
						return (
							<g key={i}>
								<path d={`M 540 1010 Q ${mx} ${my} ${ex} ${ey}`} stroke={PAD} strokeWidth={4} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={`${grow} 1`} opacity={0.95} />
								<path d="M -9 0 L 9 0 L 0 12 Z" fill="#FFE2A0" opacity={tips} transform={`translate(${ex} ${ey}) rotate(${deg}) scale(${0.6 + 0.4 * tips})`} />
							</g>
						);
					})}
				</Svg>
				<div style={{position: 'absolute', left: 130, top: 860, opacity: tips, fontFamily: NUM, fontWeight: 700, fontSize: 32, color: '#FFE2A0'}}>≈ 200 nm</div>
			</Stage>
			<Line at={Cc + 6} y={250} size={t(80, 64)} weight={900}>
				{t('每根末端再分岔成\n數百個奈米小刷頭', 'Each hair splits into\nhundreds of nano-tips')}
			</Line>
			<Line at={Cc + 46} y={1420} size={t(46, 40)} weight={700} color={C.ink}>
				{t('抓住牆的是分子間的吸力：凡得瓦力', 'The grip: van der Waals forces')}
			</Line>
		</Exit>
	);
};

// ---------------------------------------------------------------- 2. strength: 50 g gecko, 133 kg
export const Strength: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('strength');
	const drop = spring({frame: f - STRENGTH_DROP, fps, config: {damping: 11, mass: 0.7, stiffness: 160}});
	const dy = (1 - drop) * -70;
	const ropes = interpolate(f, [STRENGTH_DROP - 30, STRENGTH_DROP - 5], [0, 1], ease);
	const zoom = interpolate(f, [0, D], [1.04, 1], ease);
	const PY = 1330 + dy;
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 55%'}}>
				<Glass opacity={0.55} />
				<Svg>
					<g opacity={ropes}>
						<line x1={540} y1={830} x2={330} y2={PY} stroke="#8C9099" strokeWidth={4} />
						<line x1={540} y1={830} x2={750} y2={PY} stroke="#8C9099" strokeWidth={4} />
						<rect x={318} y={PY} width={444} height={14} rx={4} fill="#8C9099" />
					</g>
					<g opacity={Math.min(1, drop * 1.5)}>
						<Person id="st1" x={480} y={PY} k={1.3} />
						<Person id="st2" x={600} y={PY} k={1.3} />
					</g>
					<Gecko x={540} y={820} scale={0.72} />
				</Svg>
			</AbsoluteFill>
			<Line at={0} y={210} size={t(72, 64)} weight={900}>
				{t('一隻 50 克的壁虎', 'One 50 g gecko,')}
			</Line>
			<Line at={14} y={310} size={t(50, 44)} weight={700} color={C.dim}>
				{t('細毛全部黏上，理論上能吊起', 'with every hair stuck, could in theory hold')}
			</Line>
			<Pop at={STRENGTH_POP} y={t(400, 440)}>
				<N size={190} color={C.amber}>
					133
				</N>
				<Z size={t(90, 96)}>{t(' 公斤', ' kg')}</Z>
			</Pop>
			<Line at={STRENGTH_DROP + 6} y={1366} size={t(56, 52)} weight={900}>
				{t('≈ 兩個大人', '≈ two adults')}
			</Line>
			<Note at={STRENGTH_DROP + 54} y={1452}>
				{t('理論值：真實的牆有灰塵、有凹凸', 'In theory. Real walls are dusty and bumpy.')}
			</Note>
		</Exit>
	);
};

// ---------------------------------------------------------------- 3. scale: twice the size → weight ×8, soles ×4
const IC = 0.866;
const IS = 0.5;
const Cube: React.FC<{x: number; y: number; a: number; div: number; grid: number; glow: number}> = ({x, y, a, div, grid, glow}) => {
	const P = (u: number, v: number, w: number): [number, number] => [x + (u - v) * a * IC, y - (u + v) * a * IS - w * a];
	const poly = (pts: [number, number][]) => pts.map((p) => p.join(',')).join(' ');
	const lines: [number, number][][] = [];
	for (let i = 1; i < div; i++) {
		const q = i / div;
		lines.push([P(q, 0, 0), P(q, 1, 0)], [P(0, q, 0), P(1, q, 0)]); // bottom
		lines.push([P(q, 0, 0), P(q, 0, 1)], [P(0, 0, q), P(1, 0, q)]); // right-front face (v = 0)
		lines.push([P(0, q, 0), P(0, q, 1)], [P(0, 0, q), P(0, 1, q)]); // left-front face (u = 0)
		lines.push([P(q, 0, 1), P(q, 1, 1)], [P(0, q, 1), P(1, q, 1)]); // top
	}
	return (
		<g>
			<polygon points={poly([P(0, 0, 0), P(1, 0, 0), P(1, 1, 0), P(0, 1, 0)])} fill={PAD} opacity={0.55 + 0.45 * glow} />
			<g stroke="#4A505B" strokeWidth={2.5} strokeDasharray="8 8">
				<line x1={P(1, 1, 0)[0]} y1={P(1, 1, 0)[1]} x2={P(1, 1, 1)[0]} y2={P(1, 1, 1)[1]} />
			</g>
			<polygon points={poly([P(0, 0, 0), P(0, 1, 0), P(0, 1, 1), P(0, 0, 1)])} fill="#F4F1EC" opacity={0.07} />
			<polygon points={poly([P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)])} fill="#F4F1EC" opacity={0.11} />
			<polygon points={poly([P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)])} fill="#F4F1EC" opacity={0.16} />
			<g stroke="#F4F1EC" strokeWidth={1.6} opacity={0.45 * grid}>
				{lines.map(([p, q], i) => (
					<line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} />
				))}
			</g>
			<g stroke="#F4F1EC" strokeWidth={4} fill="none" strokeLinejoin="round">
				<polygon points={poly([P(0, 1, 0), P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)])} />
				<polyline points={poly([P(0, 0, 0), P(0, 0, 1), P(1, 0, 1)])} />
				<line x1={P(0, 0, 1)[0]} y1={P(0, 0, 1)[1]} x2={P(0, 1, 1)[0]} y2={P(0, 1, 1)[1]} />
				<polyline points={poly([P(1, 0, 0), P(1, 1, 0), P(0, 1, 0)])} strokeDasharray="8 8" stroke="#6A707B" />
			</g>
		</g>
	);
};

export const Scale: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('scale');
	const small = spring({frame: f - 30, fps, config: {damping: 13, mass: 0.6, stiffness: 170}});
	const g = spring({frame: f - SCALE_GROW[0], fps, config: {damping: 14, mass: 0.8, stiffness: 120}});
	const grid = interpolate(f, [SCALE_GROW[1] - 6, SCALE_GROW[1] + 10], [0, 1], clamp);
	const glow = interpolate(f, [120, 132, 150], [0, 1, 0.4], clamp);
	const zoom = interpolate(f, [0, D], [1, 1.05], ease);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 50%'}}>
				<Svg>
					<g opacity={Math.min(1, small * 1.3)}>
						<Cube x={290} y={1000} a={130 * small} div={1} grid={0} glow={glow} />
					</g>
					{f >= SCALE_GROW[0] && (
						<g opacity={Math.min(1, g * 2)}>
							<Cube x={730} y={1050} a={130 + 130 * g} div={2} grid={grid} glow={glow} />
						</g>
					)}
				</Svg>
			</AbsoluteFill>
			<Line at={0} y={230} size={t(84, 72)} weight={900}>
				{t('那人類照抄不就好了？', 'So why not just\ncopy the gecko?')}
			</Line>
			<Line at={SCALE_GROW[0] + 4} y={1110} size={t(56, 52)} weight={700} color={C.dim}>
				{t('身體放大 2 倍', 'Make a body twice as big')}
			</Line>
			<Line at={120} y={1200} size={t(80, 72)} weight={900}>
				<span>{t('體重 ×8', 'Weight ×8')}</span>
				<span style={{color: C.amber}}>{t('　腳底 ×4', '   Soles ×4')}</span>
			</Line>
			<Line at={165} y={1340} size={t(84, 68)} weight={900}>
				{t('體重長得比腳底快', 'Weight outgrows your feet')}
			</Line>
		</Exit>
	);
};

// ---------------------------------------------------------------- 4. species: the bigger, the more pad
export const Species: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('species');
	const w = interpolate(f, [...SPECIES_BAR], [0, 700], {...clamp, easing: Easing.out(Easing.cubic)});
	const rows = useIn(40);
	const zoom = interpolate(f, [0, D], [1, 1.04], ease);
	const lab = (x: number, y: number, s: string) => (
		<div style={{position: 'absolute', left: x - 120, width: 240, top: y, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontWeight: 700, fontSize: 40, color: C.ink, opacity: rows}}>{s}</div>
	);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 50%'}}>
				<Svg>
					<g opacity={rows}>
						<Mite x={170} y={720} scale={1.15} />
						<rect x={300} y={706} width={4} height={30} fill={PAD} />
						<Gecko x={170} y={930} rot={90} scale={0.42} />
						<rect x={300} y={916} width={w} height={30} fill={PAD} />
					</g>
				</Svg>
				{lab(170, 780, t('蟎', 'Mite'))}
				{lab(170, 1000, t('壁虎', 'Gecko'))}
			</AbsoluteFill>
			<Kicker at={0} y={230}>
				{t('比較 225 種會爬牆的動物', '225 CLIMBING SPECIES COMPARED')}
			</Kicker>
			<Line at={10} y={300} size={t(76, 60)} weight={900}>
				{t('越大隻，腳墊佔身體越多', 'The bigger the animal,\nthe more of it is pad')}
			</Line>
			<Line at={30} y={t(560, 600)} size={t(42, 38)} weight={700} color={C.dim}>
				{t('腳墊佔體表的比例', 'Share of body surface that is pad')}
			</Line>
			<Pop at={SPECIES_BAR[1] + 6} y={1060}>
				<N size={190} color={C.amber}>
					200
				</N>
				{t(<Z size={90} color={C.amber}> 倍</Z>, <N size={190} color={C.amber}>×</N>)}
			</Pop>
			<Line at={150} y={1330} size={t(64, 56)} weight={900}>
				{t('壁虎可能就是尺寸極限', 'Geckos may be the size limit')}
			</Line>
		</Exit>
	);
};

// ---------------------------------------------------------------- 5. forty: 40% of your skin
export const Forty: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('forty');
	const fill = interpolate(f, [...FILL], [0, 0.4], ease);
	const zoom = interpolate(f, [0, D], [1, 1.04], ease);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 60%'}}>
				<Svg>
					<Person id="forty" x={540} y={1420} k={3.5} fill={fill} />
				</Svg>
			</AbsoluteFill>
			<Kicker at={0} y={220}>
				{t('換成人類', 'NOW, A HUMAN')}
			</Kicker>
			<Line at={6} y={270} size={1}>
				<N size={230} color={C.amber}>
					<Count from={0} to={40} at={FILL[0]} dur={FILL[1] - FILL[0]} decimals={0} />%
				</N>
			</Line>
			<Line at={40} y={570} size={t(64, 52)} weight={900}>
				{t('的皮膚都得是黏腳墊', 'of your skin would have\nto be sticky pads')}
			</Line>
			<Note at={110} y={1450}>
				{t('以 80 公斤、180 公分的成人估算', 'Estimate for an 80 kg, 180 cm adult')}
			</Note>
		</Exit>
	);
};

// ---------------------------------------------------------------- 6. shoe: EU size 145
export const ShoeScene: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('shoe');
	const g = spring({frame: f - 60, fps, config: {damping: 12, mass: 0.7, stiffness: 150}});
	const K = 3.0; // px per cm
	const zoom = interpolate(f, [0, D], [1.05, 1], ease);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 65%'}}>
				<Svg>
					<rect x={60} y={1400} width={960} height={4} fill="#2A2D34" />
					<Person id="shoe" x={330} y={1400} k={K} />
					<Shoe x={120} y={1400} len={28 * K} />
					<Shoe x={500} y={1400} len={96.7 * K * Math.max(0.29, g)} />
				</Svg>
				<div style={{position: 'absolute', left: 520, width: 260, top: 1205, textAlign: 'center', fontFamily: NUM, fontWeight: 900, fontSize: 52, color: C.amber, opacity: interpolate(f, [80, 92], [0, 1], clamp)}}>≈ 97 cm</div>
				<div style={{position: 'absolute', left: 22, width: 280, top: 1300, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontWeight: 700, fontSize: 32, color: C.dim, opacity: interpolate(f, [80, 92], [0, 1], clamp)}}>{t('42 號 ≈ 28 cm', 'EU 42 ≈ 28 cm')}</div>
			</AbsoluteFill>
			<Line at={0} y={220} size={t(64, 58)} weight={900}>
				{t('全長在腳上的話——', 'Put it all on your feet:')}
			</Line>
			<Pop at={24} y={320}>
				<Z size={t(90, 84)}>{t('歐碼 ', 'EU size ')}</Z>
				<N size={200} color={C.amber}>
					145
				</N>
				<Z size={t(90, 84)}>{t(' 號', '')}</Z>
			</Pop>
			<Line at={96} y={600} size={t(64, 56)} weight={900}>
				{t('一隻鞋將近 1 公尺長', 'Each shoe almost 1 m long')}
			</Line>
			<Note at={110} y={1450}>
				{t('歐碼 × ⅔ = 鞋長（公分）', 'EU size × ⅔ = shoe length in cm')}
			</Note>
		</Exit>
	);
};

// ---------------------------------------------------------------- 7. twist: 80% of your front, hugging the wall
export const Front: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('front');
	const fill = interpolate(f, [...FILL], [0, 0.8], ease);
	const climb = interpolate(f, [...CLIMB], [0, 1], ease);
	const shimmy = Math.sin(((f - CLIMB[0]) / 15) * Math.PI) * 3 * (climb > 0 && climb < 1 ? 1 : 0);
	const glassIn = useIn(0);
	return (
		<Exit len={D}>
			<Glass opacity={glassIn} shift={climb * 420} />
			<Svg>
				<g transform={`translate(0 ${-climb * 280}) rotate(${shimmy} 540 1200)`}>
					<Person id="front" x={540} y={1460} k={3.0} pose="up" fill={fill} />
				</g>
			</Svg>
			<Line at={0} y={220} size={t(64, 56)} weight={900} out={CLIMB[0]}>
				{t('或者，全長在身體正面：', 'Or put it all on your front:')}
			</Line>
			<Line at={6} y={300} size={1} out={CLIMB[0]}>
				<N size={230} color={C.amber}>
					<Count from={0} to={80} at={FILL[0]} dur={FILL[1] - FILL[0]} decimals={0} />%
				</N>
			</Line>
			<Line at={40} y={590} size={t(64, 56)} weight={900} out={CLIMB[0]}>
				{t('的正面都是黏墊', 'of your front, all sticky pad')}
			</Line>
			<Line at={CLIMB[0] + 8} y={260} size={t(96, 80)} weight={900}>
				{t('整個人貼在牆上爬', 'You’d climb\nhugging the wall')}
			</Line>
		</Exit>
	);
};

// ---------------------------------------------------------------- the ending: back on the opening wall
// Payoff lands on the cut (cadence hit), the 40% fill rises on the opening figure, credits at 60, then ≥ 6 s still.
// Text and fill are fully gone 6 frames before the end, so the last frames are the hook's frame 0. No fade to black.
export const End: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('end');
	const out = useOut(D - 6, 20);
	const fill = interpolate(f, [...END_FILL], [0, 0.4], ease) * out;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: useIn(0)}}>
				<HookArt fill={fill} />
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: out}}>
				<Line at={0} y={700} size={t(112, 100)} weight={900}>
					{t('你 ', '')}
					<span style={{color: C.amber}}>40%</span>
					{t(' 的皮膚\n都得是腳底', ' of your skin\nwould be feet')}
				</Line>
				<Line at={111} y={1005} size={t(68, 64)} weight={900} color={C.amber}>
					{t('爬牆這種事，\n還是交給壁虎吧。', 'Wall climbing?\nLeave it to the geckos.')}
				</Line>
				<div style={{position: 'absolute', left: 60, right: 60, top: 196, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontSize: 32, lineHeight: 1.4, color: C.dim, opacity: useIn(60)}}>
					{t('資料：Labonte 等 2016（PNAS）· Autumn & Peattie 2002', 'Data: Labonte et al. 2016 (PNAS) · Autumn & Peattie 2002')}
					<br />
					{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

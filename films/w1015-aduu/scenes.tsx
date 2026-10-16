import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Line, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, FPS, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {Angler, Bag, Car, rng, Titanic} from './art';
import {depthAt, dur, T} from './timeline';
import {PHONE_Y} from './world';

const NOTE = '#B4C3D3';

// Fades the whole scene out over its last `fade` frames.
const Exit: React.FC<{len: number; fade?: number; children: React.ReactNode}> = ({len, fade = 10, children}) => (
	<AbsoluteFill style={{opacity: useOut(len, fade)}}>{children}</AbsoluteFill>
);
// A group that fades in at `at` and out before `out` (scene-local frames).
const Group: React.FC<{at: number; out: number; children: React.ReactNode}> = ({at, out, children}) => {
	const f = useCurrentFrame();
	const o = interpolate(f, [at, at + 6, out - 8, out], [0, 1, 1, 0], clamp);
	return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};
const Kicker: React.FC<{at: number; y: number; color?: string; children: React.ReactNode}> = ({at, y, color = C.amber, children}) => (
	<Line at={at} y={y} size={40} weight={700} color={color} tracking={6} lift={14}>
		{children}
	</Line>
);
const Note: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => (
	<Line at={at} y={y} size={32} weight={400} color={NOTE} lift={10}>
		{children}
	</Line>
);
const N: React.FC<{size: number; color?: string; children: React.ReactNode}> = ({size, color = C.ink, children}) => (
	<span style={{fontFamily: NUM, fontWeight: 900, fontSize: size, color, letterSpacing: -size * 0.03, fontVariantNumeric: 'tabular-nums'}}>{children}</span>
);
const Z: React.FC<{size: number; color?: string; weight?: number; children: React.ReactNode}> = ({size, color = C.ink, weight = 900, children}) => (
	<span style={{fontFamily: useLang() === 'en' ? SANS_EN : SANS, fontWeight: weight, fontSize: size, color}}>{children}</span>
);
// A big number that pops in with a spring.
const Pop: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: f - at, fps, config: {damping: 12, mass: 0.6, stiffness: 180}});
	return (
		<div style={{position: 'absolute', top: y, left: 40, right: 40, textAlign: 'center', lineHeight: 1.1, opacity: Math.min(1, p * 1.4), transform: `scale(${1.25 - 0.25 * p})`}}>
			{children}
		</div>
	);
};
const Svg: React.FC<{children: React.ReactNode; opacity?: number}> = ({children, opacity = 1}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, opacity}}>
		{children}
	</svg>
);
const useSec = (k: keyof typeof T) => T[k][0] + useCurrentFrame() / FPS;

// ── Hook ───────────────────────────────────────────────────────────────────────────────────────────────
export const HookText: React.FC = () => {
	const t = useT();
	return (
		<Exit len={dur('hook')}>
			<Line at={6} y={t(370, 360)} size={t(110, 84)} weight={900}>
				{t('如果你的手機\n掉進馬里亞納海溝', 'What if you dropped\nyour phone into the\nMariana Trench?')}
			</Line>
			<Line at={34} y={t(680, 715)} size={t(76, 68)} weight={800} color={C.amber}>
				{t('要多久才會沉到底？', 'How long until\nit hits bottom?')}
			</Line>
		</Exit>
	);
};

// ── 6 m: the waterproof rating ─────────────────────────────────────────────────────────────────────────
export const LimitArt: React.FC = () => {
	const f = useCurrentFrame();
	const d = depthAt(useSec('limit'));
	const y = PHONE_Y + (6 - d) * 110;
	const o = interpolate(f, [0, 8, 100, 125], [0, 1, 1, 0], clamp);
	return (
		<Svg opacity={o}>
			<line x1={0} x2={1080} y1={y} y2={y} stroke={C.red} strokeWidth={5} strokeDasharray="24 14" />
			<text x={70} y={y - 18} fill={C.red} style={{fontFamily: NUM, fontWeight: 800, fontSize: 44}}>
				6 m
			</text>
		</Svg>
	);
};
export const LimitText: React.FC = () => {
	const t = useT();
	return (
		<Exit len={dur('limit')}>
			<Line at={4} y={380} size={t(56, 48)} weight={700}>
				{t('旗艦手機的防水，最深只測到', 'Top phones are only water-tested to')}
			</Line>
			<Pop at={14} y={460}>
				<N size={210} color={C.amber}>
					6
				</N>
				<Z size={t(110, 120)} color={C.amber}>
					{t(' 公尺', ' m')}
				</Z>
			</Pop>
			<Line at={75} y={730} size={t(76, 68)} weight={900}>
				{t('第 3 秒就超過了', 'Passed in just 3 seconds.')}
			</Line>
			<Note at={92} y={860}>
				{t('例：iPhone 17，IP68（水深 6 公尺、30 分鐘）', 'e.g. iPhone 17: IP68 (6 m deep for 30 min)')}
			</Note>
			<Note at={100} y={908}>
				{t('下沉速度以最快的姿勢估算：側邊朝下，每秒約 1.8 公尺', 'Sink rate: fastest case, edge-first, about 1.8 m/s')}
			</Note>
		</Exit>
	);
};

// ── 1,000 m: darkness ──────────────────────────────────────────────────────────────────────────────────
const SPECKS = (() => {
	const r = rng(77);
	return Array.from({length: 9}, () => ({x: 80 + r() * 900, y: 900 + r() * 750, ph: r() * 6, sp: 1.5 + r() * 2}));
})();
export const DarkArt: React.FC = () => {
	const f = useCurrentFrame();
	const sec = f / FPS;
	const show = interpolate(sec, [1.6, 3], [0, 1], clamp);
	const fx = interpolate(sec, [2.4, 7.5], [-260, 230], {...clamp, easing: Easing.out(Easing.quad)});
	const fy = 1290 - 30 * Math.sin(sec * 1.3);
	return (
		<Exit len={dur('dark')}>
			<Svg>
				{SPECKS.map((p, i) => (
					<circle key={i} cx={p.x} cy={p.y} r={4} fill="#7FF5FF" opacity={show * (0.25 + 0.55 * Math.max(0, Math.sin(sec * p.sp + p.ph)))} />
				))}
				<g transform={`translate(${fx}, ${fy}) rotate(${-4 + 3 * Math.sin(sec * 2)})`}>
					<Angler glow={0.5 + 0.5 * Math.sin(sec * 4)} />
				</g>
			</Svg>
		</Exit>
	);
};
export const DarkText: React.FC = () => {
	const t = useT();
	return (
		<Exit len={dur('dark')}>
			<Kicker at={48} y={380}>
				{t('9 分鐘 · 1,000 公尺', '9 MIN · 1,000 M')}
			</Kicker>
			<Line at={58} y={450} size={t(110, 92)} weight={900}>
				{t('陽光完全消失', 'Sunlight is gone.')}
			</Line>
			<Line at={105} y={610} size={t(64, 56)} weight={700}>
				{t('只剩深海生物自己發的光', 'The only light now comes\nfrom living things.')}
			</Line>
			<Note at={128} y={t(720, 770)}>
				{t('200 公尺以下幾乎沒有陽光，1,000 公尺以下全黑', 'Sunlight fades below 200 m and is gone below 1,000 m')}
			</Note>
		</Exit>
	);
};

// ── 3,800 m: the Titanic's depth ───────────────────────────────────────────────────────────────────────
export const TitanicArt: React.FC = () => {
	const sec = useCurrentFrame() / FPS;
	const rise = interpolate(sec, [0.2, 2.5], [760, 0], {...clamp, easing: Easing.out(Easing.cubic)}) - 10 * sec;
	const y = 1150 + rise;
	return (
		<Exit len={dur('titanic')}>
			<Svg>
				<line x1={60} x2={660} y1={y + 36} y2={y + 36} stroke="#5B8DB8" strokeWidth={3} strokeDasharray="16 12" opacity={0.8} />
				<text x={70} y={y + 14} fill="#7FAAD0" style={{fontFamily: NUM, fontWeight: 800, fontSize: 40}}>
					3,800 m
				</text>
				<g transform={`translate(650, ${y})`} opacity={0.9}>
					<Titanic />
				</g>
			</Svg>
		</Exit>
	);
};
export const TitanicText: React.FC = () => {
	const t = useT();
	return (
		<Exit len={dur('titanic')}>
			<Kicker at={58} y={380}>
				{t('35 分鐘 · 3,800 公尺', '35 MIN · 3,800 M')}
			</Kicker>
			<Line at={68} y={450} size={t(110, 88)} weight={900}>
				{t('鐵達尼號的深度', "The Titanic's depth")}
			</Line>
			<Line at={128} y={610} size={t(64, 56)} weight={700}>
				{t('但才走了三分之一', 'Only a third of the way down.')}
			</Line>
		</Exit>
	);
};

// ── Everest in the trench (cross-section) ──────────────────────────────────────────────────────────────
const TOP = 900;
const BOT = 1500;
const PX = (BOT - TOP) / 10935; // px per metre
const yOf = (m: number) => TOP + m * PX;
const SUMMIT = yOf(10935 - 8849);
export const EverestArt: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const sec = f / fps;
	const show = interpolate(f, [0, 12], [0, 1], clamp);
	const up = spring({frame: f - 24, fps, config: {damping: 16, mass: 1.1, stiffness: 70}});
	const lift = (1 - up) * 560;
	const gap = interpolate(f, [80, 96], [0, 1], clamp);
	const dot = yOf(depthAt(T.everest[0] + sec));
	const mx = 520;
	const peak = [
		[300, BOT],
		[372, 1330],
		[404, 1350],
		[452, 1170],
		[482, 1196],
		[mx, SUMMIT],
		[556, 1084],
		[584, 1066],
		[640, 1246],
		[676, 1226],
		[760, BOT],
	];
	const snow = [
		[mx, SUMMIT],
		[556, 1084],
		[540, 1076],
		[526, 1100],
		[508, 1072],
		[494, 1096],
	];
	const pts = (a: number[][]) => a.map(([x, y]) => `${x},${y + lift}`).join(' ');
	return (
		<Exit len={dur('everest')}>
			<Svg opacity={show}>
				<defs>
					<linearGradient id="ev-water" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#0F4672" />
						<stop offset="1" stopColor="#03101C" />
					</linearGradient>
					<clipPath id="ev-clip">
						<rect x={0} y={TOP - 400} width={1080} height={BOT - TOP + 400} />
					</clipPath>
				</defs>
				<polygon points={`60,${TOP} 1020,${TOP} 1020,1160 905,1172 850,${BOT} 214,${BOT} 170,1170 60,1160`} fill="url(#ev-water)" />
				<polygon points={`60,1160 170,1170 214,${BOT} 850,${BOT} 905,1172 1020,1160 1020,1560 60,1560`} fill="#2A2620" />
				<path d={`M60,${TOP} Q180,${TOP - 8} 300,${TOP} T540,${TOP} T780,${TOP} T1020,${TOP}`} fill="none" stroke="#9ED8FF" strokeWidth={4} />
				<g clipPath="url(#ev-clip)">
					<polygon points={pts(peak)} fill="#8F98A6" />
					<polygon points={pts([[mx, SUMMIT], [584, 1066], [640, 1246], [676, 1226], [760, BOT], [mx, BOT]])} fill="#6B7482" />
					<polygon points={pts(snow)} fill="#F4F1EC" />
				</g>
				<g opacity={gap}>
					<line x1={mx} x2={mx} y1={TOP + 10} y2={SUMMIT - 10} stroke={C.amber} strokeWidth={5} />
					<polygon points={`${mx - 12},${TOP + 22} ${mx + 12},${TOP + 22} ${mx},${TOP + 6}`} fill={C.amber} />
					<polygon points={`${mx - 12},${SUMMIT - 22} ${mx + 12},${SUMMIT - 22} ${mx},${SUMMIT - 6}`} fill={C.amber} />
					<text x={mx + 26} y={(TOP + SUMMIT) / 2 + 16} fill={C.amber} style={{fontFamily: NUM, fontWeight: 900, fontSize: 48}}>
						2 km
					</text>
				</g>
				<circle cx={800} cy={dot} r={26} fill="#FFB070" opacity={0.3} />
				<circle cx={800} cy={dot} r={10} fill="#FFC15E" />
			</Svg>
		</Exit>
	);
};
export const EverestText: React.FC = () => {
	const t = useT();
	return (
		<Exit len={dur('everest')}>
			<Line at={8} y={400} size={t(100, 88)} weight={900}>
				{t('就算把聖母峰\n整座丟進來', 'Drop Mount Everest\nin here')}
			</Line>
			<Line at={96} y={t(690, 650)} size={t(72, 60)} weight={800} color={C.amber}>
				{t('山頂離海面還有 2 公里', 'and its peak is still\n2 km underwater')}
			</Line>
		</Exit>
	);
};

// ── The bottom: pressure ───────────────────────────────────────────────────────────────────────────────
// Where the 1 cm² square sits on the phone screen once the phone has tipped 9° in the mud (pivot 540, 1330).
const TIP = 9 * (Math.PI / 180);
const SQ = {x: 540 + 230 * Math.sin(TIP), y: 1330 - 230 * Math.cos(TIP)};
const PILE = (() => {
	const rows = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 4];
	const r = rng(12);
	const cols = ['#E8E4DC', '#8C9099', '#FFB020', '#FF3B30', '#5FA8E0', '#34C77B'];
	return rows.flatMap((n, i) =>
		Array.from({length: n}, (_, j) => ({x: 560 - (n * 61) / 2 + j * 61 + 2, y: 1020 - i * 23, at: 7.6 + i * 0.13 + j * 0.012, c: cols[Math.floor(r() * cols.length)]})),
	);
})();
export const BottomArt: React.FC = () => {
	const f = useCurrentFrame();
	const sec = f / FPS;
	const b = interpolate(f, [75, 84, 214, 222], [0, 1, 1, 0], clamp);
	const press = interpolate(sec, [2.7, 3.4], [-70, 0], {...clamp, easing: Easing.out(Easing.back(1.6))});
	const arrow = interpolate(sec, [3.4, 3.9], [0, 1], clamp);
	return (
		<Exit len={dur('bottom')}>
			<Svg opacity={b}>
				<g transform={`translate(${SQ.x - 150}, ${905 + press})`}>
					<Car color="#E8E4DC" />
				</g>
				<g opacity={arrow}>
					<line x1={SQ.x} x2={SQ.x} y1={918} y2={SQ.y - 30} stroke={C.amber} strokeWidth={5} />
					<polygon points={`${SQ.x - 13},${SQ.y - 34} ${SQ.x + 13},${SQ.y - 34} ${SQ.x},${SQ.y - 16}`} fill={C.amber} />
					<rect x={-10.5} y={-10.5} width={21} height={21} fill={C.amber} fillOpacity={0.35} stroke={C.amber} strokeWidth={3} transform={`translate(${SQ.x}, ${SQ.y}) rotate(9)`} />
					<line x1={SQ.x + 14} x2={690} y1={SQ.y} y2={SQ.y} stroke={C.amber} strokeWidth={3} />
					<text x={700} y={SQ.y + 14} fill={C.amber} style={{fontFamily: NUM, fontWeight: 800, fontSize: 40}}>
						1 cm²
					</text>
				</g>
			</Svg>
			<Svg>
				{PILE.map((c, i) => {
					const p = interpolate(sec, [c.at, c.at + 0.22], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
					if (p <= 0) return null;
					return (
						<g key={i} transform={`translate(${c.x}, ${c.y - (1 - p) * 70}) scale(0.19)`} opacity={p}>
							<Car color={c.c} />
						</g>
					);
				})}
			</Svg>
		</Exit>
	);
};
export const BottomText: React.FC = () => {
	const t = useT();
	return (
		<Exit len={dur('bottom')}>
			<Group at={24} out={72}>
				<Kicker at={24} y={380}>
					{t('挑戰者深淵 · 10,935 公尺', 'CHALLENGER DEEP · 10,935 M')}
				</Kicker>
				<Line at={30} y={450} size={120} weight={900}>
					{t('到底了', 'The bottom.')}
				</Line>
			</Group>
			<Group at={75} out={222}>
				<Kicker at={75} y={380}>
					{t('每 1 平方公分', 'ON EVERY SQUARE CENTIMETRE')}
				</Kicker>
				<Pop at={82} y={440}>
					<N size={180} color={C.amber}>
						1.1
					</N>
					<Z size={t(110, 84)} color={C.amber}>
						{t(' 噸', ' tonnes')}
					</Z>
				</Pop>
				<Line at={100} y={660} size={t(64, 56)} weight={700}>
					{t('≈ 一輛小汽車的重量', '≈ the weight of a small car')}
				</Line>
				<Note at={120} y={1440}>
					{t('海溝底水壓約 1,100 bar（KAIKO 1996 年實測 1,113 bar）', 'About 1,100 bar down here (KAIKO measured 1,113 bar, 1996)')}
				</Note>
			</Group>
			<Group at={225} out={dur('bottom') + 10}>
				<Kicker at={225} y={380}>
					{t('光是手機正面', 'ON THE FRONT FACE ALONE')}
				</Kicker>
				<Pop at={230} y={430}>
					<N size={180} color={C.amber}>
						120
					</N>
					<Z size={t(110, 84)} color={C.amber}>
						{t(' 噸', ' tonnes')}
					</Z>
				</Pop>
				<Line at={250} y={622} size={t(64, 56)} weight={700}>
					{t('像 100 多輛車疊在上面', 'like 100+ cars piled on top')}
				</Line>
				<Note at={270} y={1440}>
					{t('手機正面約 107 平方公分（以 iPhone 17 計）', 'Front of the phone ≈ 107 cm² (iPhone 17)')}
				</Note>
			</Group>
		</Exit>
	);
};

// ── The twist: a plastic bag got there first ───────────────────────────────────────────────────────────
export const BagArt: React.FC = () => {
	const f = useCurrentFrame();
	const sec = f / FPS;
	const o = interpolate(sec, [1.2, 2], [0, 1], clamp);
	const drop = interpolate(sec, [1.2, 2.2], [-40, 0], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<Exit len={dur('bag')}>
			<Svg opacity={o}>
				<ellipse cx={290} cy={1352} rx={140} ry={20} fill="#000000" opacity={0.3} />
				<g transform={`translate(290, ${1300 + drop}) rotate(${-6 + 2 * Math.sin(sec * 1.4)}) skewX(${3 * Math.sin(sec * 1.1)})`}>
					<Bag />
				</g>
			</Svg>
		</Exit>
	);
};
export const BagText: React.FC = () => {
	const t = useT();
	return (
		<Exit len={dur('bag')}>
			<Line at={8} y={400} size={t(100, 84)} weight={900}>
				{t('但它不是第一個到的', "But it wouldn't\nbe the first.")}
			</Line>
			<Line at={70} y={t(580, 660)} size={t(60, 54)} weight={700}>
				{t('1998 年，無人潛艇在海溝底\n拍到一個塑膠袋', 'In 1998, a robot sub filmed\na plastic bag down here.')}
			</Line>
			<Note at={110} y={t(770, 830)}>
				{t('10,898 公尺：JAMSTEC 深海垃圾資料庫裡最深的一筆', "10,898 m: deepest item in JAMSTEC's deep-sea debris records")}
			</Note>
		</Exit>
	);
};

// ── The ending ─────────────────────────────────────────────────────────────────────────────────────────
// The world rewinds the phone back out of the water (world.tsx), then the payoff lands on bar 23 (55 s), credits at
// 5.3 s, a long still hold, and the text is gone 6 frames before the end so the last frames are frame 0.
export const EndText: React.FC = () => {
	const t = useT();
	const D = dur('end');
	return (
		<AbsoluteFill style={{opacity: useOut(D - 6, 24)}}>
			<Line at={75} y={t(410, 390)} size={t(64, 52)} weight={700}>
				{t('最快也要', 'Even at top speed, it takes')}
			</Line>
			<Pop at={78} y={t(490, 470)}>
				<N size={170} color={C.amber}>
					1
				</N>
				<Z size={t(100, 110)} color={C.amber}>
					{t(' 小時 ', ' h ')}
				</Z>
				<N size={170} color={C.amber}>
					41
				</N>
				<Z size={t(100, 110)} color={C.amber}>
					{t(' 分', ' min')}
				</Z>
			</Pop>
			<Line at={120} y={t(720, 690)} size={t(68, 60)} weight={800}>
				{t('夠你把這支片重看 90 多遍', 'Enough to rewatch\nthis video 90+ times.')}
			</Line>
			<Line at={284} y={t(840, 855)} size={t(68, 60)} weight={900} color={C.amber}>
				{t('手機，還是抓緊一點吧。', 'So hold on tight\nto your phone.')}
			</Line>
			<div
				style={{
					position: 'absolute',
					left: 60,
					right: 60,
					top: 200,
					textAlign: 'center',
					fontFamily: t(SANS, SANS_EN),
					fontSize: 32,
					lineHeight: 1.5,
					color: '#9FB3C8',
					opacity: useIn(160),
				}}
			>
				{t('資料：Greenaway 等 2021 · NOAA · JAMSTEC · Apple', 'Data: Greenaway et al. 2021 · NOAA · JAMSTEC · Apple')}
				<br />
				{t('下沉時間為估算（最快姿勢，每秒約 1.8 公尺）', 'Sink time is an estimate (fastest case, ≈1.8 m/s)')}
				<br />
				{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
			</div>
		</AbsoluteFill>
	);
};

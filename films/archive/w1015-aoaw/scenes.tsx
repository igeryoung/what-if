import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Globe} from '../../engine/kit/globe';
import {clamp, Line, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, FPS, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {botOnFront, CLEAN_HI, COAST, FLOOR_CLEAN, frontY, LAND, MapBot, Pyramid, rng, Robot, RobotSide, SEAM, SPECK, TaiwanMap} from './art';
import {TW_KM_PER_PX, TW_START} from './taiwan';
import {dur, SPEED_CM_S} from './timeline';

const io = Easing.inOut(Easing.cubic);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const logLerp = (a: number, b: number, k: number) => Math.exp(lerp(Math.log(a), Math.log(b), k));

// Fades the whole scene out over its last `fade` frames.
const Exit: React.FC<{len: number; fade?: number; children: React.ReactNode}> = ({len, fade = 10, children}) => (
	<AbsoluteFill style={{opacity: useOut(len, fade)}}>{children}</AbsoluteFill>
);
const Kicker: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => (
	<Line at={at} y={y} size={40} weight={700} color={C.amber} tracking={6} lift={14}>
		{children}
	</Line>
);
const N: React.FC<{size: number; color?: string; children: React.ReactNode}> = ({size, color = C.ink, children}) => (
	<span style={{fontFamily: NUM, fontWeight: 900, fontSize: size, color, letterSpacing: -size * 0.03, fontVariantNumeric: 'tabular-nums'}}>{children}</span>
);
const Z: React.FC<{size: number; color?: string; weight?: number; children: React.ReactNode}> = ({size, color = C.ink, weight = 900, children}) => (
	<span style={{fontFamily: useLang() === 'en' ? SANS_EN : SANS, fontWeight: weight, fontSize: size, color}}>{children}</span>
);
// Darkens the top of full-bleed floor shots so the text reads.
const TopShade: React.FC = () => (
	<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,11,13,.9) 0%, rgba(10,11,13,.75) 38%, rgba(10,11,13,0) 52%)'}} />
);
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
		{children}
	</svg>
);

// The opening image: dusty Taiwan, the robot parked at the north end. Hook shows it from frame 0; End settles back into it.
const HookArt: React.FC<{id: string; clean?: number; cleanOpacity?: number; bot?: {x: number; y: number}}> = ({id, clean = 0, cleanOpacity = 1, bot = TW_START}) => (
	<Svg>
		<TaiwanMap id={id} clean={clean} cleanOpacity={cleanOpacity} />
		<MapBot x={bot.x} y={bot.y} />
	</Svg>
);

export const Hook: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('hook');
	const z = interpolate(f, [D - 40, D], [1, 5], {...clamp, easing: Easing.in(Easing.cubic)});
	const ph = f >= 20 ? ((f - 20) % 50) / 50 : 0;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: `${TW_START.x}px ${TW_START.y}px`}}>
				<HookArt id="hk" />
				<Svg>
					<circle cx={TW_START.x} cy={TW_START.y} r={26 + 60 * ph} fill="none" stroke={C.amber} strokeWidth={3} opacity={f >= 20 ? (1 - ph) * 0.7 : 0} />
				</Svg>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: useOut(D - 26, 14)}}>
				<Line at={3} y={t(360, 330)} size={t(72, 64)} weight={700}>
					{t('如果讓一台掃地機器人', 'What if one robot vacuum')}
				</Line>
				<Line at={12} y={t(460, 420)} size={t(110, 100)} weight={900}>
					{t('掃完整個台灣？', 'cleaned all\nof Taiwan?')}
				</Line>
				<Line at={52} y={t(690, 720)} size={t(80, 64)} weight={800} color={C.amber}>
					{t('要掃多久？', 'How long would it take?')}
				</Line>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ---- close-up floor (speed, hour): world units are cm, the robot's lane is the tile row y ∈ [−15, 15] ----
const K1 = 10; // px per cm in the close-up
const KEND = 860 / 1e5; // 1 km = 860 px at the end of the hour shot
const RY = 1180;
const xrAt = (gf: number) => 60 + (SPEED_CM_S * gf) / FPS; // robot world x (cm), gf = frames since the speed scene began

const FloorShot: React.FC<{K: number; xr: number; rx: number; brush: number}> = ({K, xr, rx, brush}) => {
	const sx = (wx: number) => rx + (wx - xr) * K;
	const sy = (wy: number) => RY + wy * K;
	const tileA = Math.min(1, Math.max(0, (30 * K - 6) / 30));
	const speckA = Math.min(1, Math.max(0, (K - 1.5) / 3));
	const x0 = xr - rx / K;
	const x1 = xr + (1080 - rx) / K;
	const seams: React.ReactNode[] = [];
	if (tileA > 0) {
		for (let n = Math.floor(x0 / 30); n <= Math.ceil(x1 / 30); n++) seams.push(<line key={`v${n}`} x1={sx(n * 30)} x2={sx(n * 30)} y1={0} y2={1920} stroke={SEAM} strokeWidth={3} />);
		for (let m = Math.floor((-RY / K - 15) / 30); m <= Math.ceil(((1920 - RY) / K - 15) / 30); m++)
			seams.push(<line key={`h${m}`} x1={0} x2={1080} y1={sy(15 + m * 30)} y2={sy(15 + m * 30)} stroke={SEAM} strokeWidth={3} />);
	}
	const specks: React.ReactNode[] = [];
	if (speckA > 0) {
		for (let i = Math.floor(x0 / 30); i <= Math.ceil(x1 / 30); i++) {
			for (let j = Math.floor((-RY / K) / 30) - 1; j <= Math.ceil(((1920 - RY) / K) / 30) + 1; j++) {
				const r = rng(i * 7919 + j * 104729 + 13);
				for (let q = 0; q < 4; q++) {
					const wx = i * 30 + r() * 30;
					const wy = -15 + j * 30 + r() * 30;
					const rad = 0.25 + r() * 0.4;
					const o = 0.4 + r() * 0.5;
					if (j === 0 && wx < xr) continue; // swept
					specks.push(<circle key={`${i}_${j}_${q}`} cx={sx(wx)} cy={sy(wy)} r={rad * K} fill={SPECK} opacity={o} />);
				}
			}
		}
	}
	const th = Math.max(30 * K, 6);
	const softA = Math.min(1, Math.max(0, (th - 12) / 48));
	const r = 17 * K;
	const bigA = Math.min(1, Math.max(0, (r - 30) / 30));
	const left = Math.max(-20, sx(0));
	return (
		<Svg>
			<rect width={1080} height={1920} fill={LAND} />
			<g opacity={tileA}>{seams}</g>
			<g opacity={speckA}>{specks}</g>
			<rect x={left} y={RY - th / 2} width={Math.max(0, rx - left)} height={th} fill={FLOOR_CLEAN} opacity={softA} />
			<rect x={left} y={RY - th / 2} width={Math.max(0, rx - left)} height={th} fill={CLEAN_HI} opacity={1 - softA} />
			{bigA > 0 ? (
				<g transform={`translate(${rx} ${RY})`} opacity={bigA}>
					<Robot r={r} brush={brush} />
				</g>
			) : null}
			{bigA < 1 ? (
				<g opacity={1 - bigA}>
					<MapBot x={rx} y={RY} r={10} />
				</g>
			) : null}
		</Svg>
	);
};

export const Speed: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('speed');
	const zoom = interpolate(f, [0, D], [1.08, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `540px ${RY}px`}}>
				<FloorShot K={K1} xr={xrAt(f)} rx={540} brush={f * 24} />
			</AbsoluteFill>
			<TopShade />
			<AbsoluteFill style={{opacity: useOut(D, 10)}}>
				<Kicker at={8} y={300}>
					{t('它的速度', 'ITS SPEED')}
				</Kicker>
				<Line at={20} y={370} size={96} weight={900}>
					<Z size={96}>{t('時速約 ', 'About ')}</Z>
					<N size={200} color={C.amber}>
						1
					</N>
					<Z size={96}>{t(' 公里', ' km/h')}</Z>
				</Line>
				<Line at={56} y={650} size={t(60, 56)} weight={700}>
					{t('每秒只走 28 公分', 'Just 28 cm per second')}
				</Line>
				<Line at={90} y={740} size={t(40, 38)} weight={400} color="#B9BCC3">
					{t('比散步還慢', 'Slower than a stroll')}
				</Line>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const Hour: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('hour');
	const Z0 = 10;
	const Z1 = 110;
	const e = interpolate(f, [Z0, Z1], [0, 1], {...clamp, easing: io});
	const K = logLerp(K1, KEND, e);
	const base = xrAt(dur('speed') + Math.min(f, Z1));
	const xr = base + (1e5 - xrAt(dur('speed') + Z1)) * e;
	const rx = lerp(540, 960, e);
	const mins = Math.min(60, Math.max(0, Math.round((xr / 1e5) * 60)));
	const clock = `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`;
	const br = useIn(Z1 + 6) * useOut(D, 10);
	const sx0 = rx - xr * K;
	return (
		<AbsoluteFill>
			<FloorShot K={K} xr={xr} rx={rx} brush={(dur('speed') + f) * 24} />
			<Svg>
				<g opacity={br}>
					<line x1={sx0} x2={rx} y1={RY + 34} y2={RY + 34} stroke="#B9BCC3" strokeWidth={3} />
					<line x1={sx0} x2={sx0} y1={RY + 22} y2={RY + 46} stroke="#B9BCC3" strokeWidth={3} />
					<line x1={rx} x2={rx} y1={RY + 22} y2={RY + 46} stroke="#B9BCC3" strokeWidth={3} />
				</g>
			</Svg>
			<Line at={Z1 + 6} y={RY + 60} size={40} weight={700} color="#D4D6DB" out={D}>
				{t('1 公里', '1 km')}
			</Line>
			<TopShade />
			<AbsoluteFill style={{opacity: useOut(D, 10)}}>
				<Line at={0} y={290} size={56} weight={800} color={C.amber} lift={0}>
					<Z size={44} color={C.amber} weight={700}>
						{t('經過 ', 'Elapsed ')}
					</Z>
					<N size={64} color={C.amber}>
						{clock}
					</N>
				</Line>
				<Line at={Z1 + 2} y={380} size={96} weight={900}>
					<N size={200} color={C.amber}>
						300
					</N>
					<Z size={96}>{t(' 平方公尺', ' m²')}</Z>
				</Line>
				<Line at={Z1 + 26} y={650} size={t(60, 56)} weight={700}>
					{t('＝ 1 公里長 × 30 公分寬', '= 1 km long × 30 cm wide')}
				</Line>
				<Line at={Z1 + 52} y={745} size={32} weight={400} color="#B9BCC3">
					{t('假設：不充電、一路直線、沒有家具擋路', 'Assuming no charging, straight lines, no furniture')}
				</Line>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const Taiwan: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('taiwan');
	const e = interpolate(f, [0, 150], [0, 1], {...clamp, easing: io});
	const Lm = 1 / TW_KM_PER_PX; // 1 km in map px
	const Zs = 860 / Lm;
	const Zm = logLerp(Zs, 1, e);
	const M = {x: TW_START.x - Lm / 2, y: TW_START.y};
	const A = {x: lerp(530, M.x, e), y: lerp(RY, M.y, e)};
	const s = (x: number, y: number) => ({x: A.x + (x - M.x) * Zm, y: A.y + (y - M.y) * Zm});
	const a = s(TW_START.x - Lm, TW_START.y);
	const b = s(TW_START.x, TW_START.y);
	const speck = Math.min(1, Math.max(0, (4 - Zm) / 3));
	const mark = useIn(150);
	return (
		<Exit len={D} fade={8}>
			<Svg>
				<g transform={`translate(${A.x} ${A.y}) scale(${Zm}) translate(${-M.x} ${-M.y})`}>
					<TaiwanMap id="tw3" speck={speck} />
				</g>
				<line x1={a.x} y1={a.y} x2={Math.max(b.x, a.x + 0.01)} y2={b.y} stroke={CLEAN_HI} strokeWidth={6} strokeLinecap="round" />
				<MapBot x={b.x} y={b.y} r={10} halo={1 - mark} />
				<g opacity={mark}>
					<circle cx={b.x} cy={b.y} r={28} fill="none" stroke={C.amber} strokeWidth={3} />
					<line x1={b.x + 32} y1={b.y} x2={b.x + 60} y2={b.y} stroke={C.amber} strokeWidth={3} />
				</g>
			</Svg>
			<div style={{position: 'absolute', left: b.x + 70, top: b.y - 26, opacity: mark, fontFamily: t(SANS, SANS_EN), fontWeight: 700, fontSize: 40, color: C.amber, whiteSpace: 'nowrap'}}>
				{t('一小時的份量', 'one hour')}
			</div>
			<TopShade />
			<Kicker at={40} y={300}>
				{t('整個台灣', 'ALL OF TAIWAN')}
			</Kicker>
			<Line at={80} y={370} size={80} weight={900}>
				<N size={150} color={C.amber}>
					36,197
				</N>
				<Z size={80}>{t(' 平方公里', ' km²')}</Z>
			</Line>
			<Line at={128} y={590} size={t(56, 52)} weight={700}>
				{t('是它一小時份量的 1.2 億倍', '120 million times its hourly work')}
			</Line>
		</Exit>
	);
};

const RINGS = 44;
const RING_ANG = (() => {
	const r = rng(3);
	return Array.from({length: RINGS}, () => -38 + 76 * r());
})();

export const Earth: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('earth');
	const laps = interpolate(f, [36, 190], [0, 3000], {...clamp, easing: io});
	const n = Math.min(RINGS, Math.ceil((laps / 3000) * RINGS));
	const GS = 820;
	const R = GS * 0.42;
	const cx = 540;
	const cy = 1200;
	const zoom = interpolate(f, [0, D], [1, 1.06], {...clamp, easing: io});
	const ring = (k: number, front: boolean) => {
		const rx = R * (1.05 + 0.004 * k);
		const ry = rx * 0.3;
		const d = front ? `M${rx},0 A${rx},${ry} 0 0 1 ${-rx},0` : `M${rx},0 A${rx},${ry} 0 0 0 ${-rx},0`;
		const newest = k === n - 1 && laps < 3000;
		return <path key={`${front}${k}`} d={d} transform={`translate(${cx} ${cy}) rotate(${RING_ANG[k]})`} fill="none" stroke={newest ? CLEAN_HI : C.amber} strokeWidth={newest ? 4 : 2.2} opacity={front ? (newest ? 1 : 0.55) : 0.25} />;
	};
	const ks = Array.from({length: n}, (_, k) => k);
	return (
		<Exit len={D} fade={8}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `${cx}px ${cy}px`}}>
				<Svg>{ks.map((k) => ring(k, false))}</Svg>
				<div style={{position: 'absolute', left: cx - GS / 2, top: cy - GS / 2, width: GS, height: GS}}>
					<Globe size={GS} t={f / FPS} state={{rot: 2.1 + f * 0.006, flat: 0, drain: 0, bands: 0, clouds: 0.35, equator: 0}} />
				</div>
				<Svg>{ks.map((k) => ring(k, true))}</Svg>
			</AbsoluteFill>
			<Kicker at={0} y={300}>
				{t('總路程', 'TOTAL DISTANCE')}
			</Kicker>
			<Line at={12} y={370} size={96} weight={900}>
				<N size={150} color={C.amber}>
					{t('1.2', '120')}
				</N>
				<Z size={t(96, 80)}>{t(' 億公里', ' million km')}</Z>
			</Line>
			<Line at={36} y={590} size={t(64, 54)} weight={800}>
				{t('≈ 繞地球 ', '≈ ')}
				<N size={t(76, 64)}>{Math.round(laps).toLocaleString('en-US')}</N>
				{t(' 圈', ' laps around the Earth')}
			</Line>
			<Line at={70} y={700} size={32} weight={400} color={C.dim}>
				{t('路程 ＝ 面積 ÷ 30 公分寬', 'Distance = area ÷ 30 cm lane')}
			</Line>
		</Exit>
	);
};

// Yushan as a stack of 2 cm thresholds. World units: cm, origin = foot of the mountain.
const MTN: [number, number][] = [
	[0, 0],
	[0.16, 0.24],
	[0.22, 0.27],
	[0.34, 0.58],
	[0.41, 0.62],
	[0.5, 1],
	[0.55, 0.9],
	[0.6, 0.93],
	[0.69, 0.6],
	[0.79, 0.47],
	[0.87, 0.24],
	[1, 0],
];
const MW = 508000;
const MH = 395200;

export const Yushan: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('yushan');
	const Z0 = 60;
	const Z1 = 140;
	const e = interpolate(f, [Z0, Z1], [0, 1], {...clamp, easing: io});
	const Kf = 700 / MH;
	const K = logLerp(12, Kf, e);
	const A = {x: lerp(640, 90, e), y: lerp(1380, 1560, e)};
	const S = (x: number, y: number) => `${A.x + x * K},${A.y - y * K}`;
	const poly = MTN.map(([u, v]) => S(u * MW, v * MH)).join(' ');
	// robot drives up, bumps the foot of the mountain, wobbles back
	const drive = interpolate(f, [0, 28], [-150, 0], {...clamp, easing: Easing.in(Easing.quad)});
	const bump = f > 28 ? -9 * Math.sin(((f - 28) / 16) * Math.PI) * Math.exp(-(f - 28) / 14) : 0;
	const tilt = f > 28 ? -4 * Math.sin(((f - 28) / 16) * Math.PI) * Math.exp(-(f - 28) / 12) : 0;
	const front = Math.min(0, drive + bump) - 0.6;
	const w = 34 * K;
	const sp = 2 * K;
	const stripeA = Math.min(1, Math.max(0, (sp - 3) / 10));
	const stripes: React.ReactNode[] = [];
	if (stripeA > 0) {
		const kmax = Math.min(MH / 2, Math.floor(A.y / sp));
		for (let k = 1; k <= kmax; k++) stripes.push(<line key={k} x1={0} x2={1080} y1={A.y - k * sp} y2={A.y - k * sp} stroke="#6A6157" strokeWidth={2} />);
	}
	const first = Math.max(0, 1 - e * 6);
	const peak = useIn(Z1 - 10);
	return (
		<Exit len={D} fade={8}>
			<Svg>
				<defs>
					<clipPath id="ys-clip">
						<polygon points={poly} />
					</clipPath>
				</defs>
				<rect x={0} y={A.y} width={1080} height={1920 - A.y} fill="#1D1C1A" />
				<polygon points={poly} fill={LAND} />
				<g clipPath="url(#ys-clip)">
					<g opacity={stripeA * 0.8}>{stripes}</g>
					<rect x={0} y={A.y - sp} width={1080} height={sp} fill={C.amber} opacity={0.55 * first} />
				</g>
				<polygon points={poly} fill="none" stroke={COAST} strokeWidth={3} strokeLinejoin="round" />
				<line x1={0} x2={1080} y1={A.y} y2={A.y} stroke="#4A453D" strokeWidth={4} />
				{w > 14 ? (
					<g transform={`translate(${A.x + front * K} ${A.y}) rotate(${tilt})`}>
						<RobotSide w={w} />
					</g>
				) : (
					<MapBot x={A.x - 8} y={A.y - 8} r={7} />
				)}
				<g opacity={peak}>
					<circle cx={A.x + 0.5 * MW * K} cy={A.y - MH * K} r={7} fill={C.amber} />
				</g>
			</Svg>
			<div style={{position: 'absolute', left: A.x + 26, top: A.y - sp - 58, opacity: first, fontFamily: t(SANS, SANS_EN), fontWeight: 700, fontSize: 40, color: C.amber, whiteSpace: 'nowrap'}}>
				{t('↓ 2 公分', '↓ 2 cm')}
			</div>
			<div style={{position: 'absolute', left: A.x + 0.5 * MW * K + 24, top: A.y - MH * K - 30, opacity: peak, fontFamily: NUM, fontWeight: 800, fontSize: 40, color: C.amber, whiteSpace: 'nowrap'}}>
				3,952 m
			</div>
			<Kicker at={0} y={290}>
				{t('最大的障礙', 'THE BIGGEST OBSTACLE')}
			</Kicker>
			<Line at={12} y={370} size={t(60, 50)} weight={700}>
				{t('它只爬得過 2 公分的門檻', 'It can only climb 2 cm thresholds')}
			</Line>
			<Line at={Z1 - 6} y={480} size={t(110, 96)} weight={900}>
				{t('玉山 3,952 公尺', 'Yushan: 3,952 m')}
			</Line>
			<Line at={Z1 + 20} y={650} size={t(60, 54)} weight={700}>
				{t('≈ 20 萬個門檻疊起來', '≈ 200,000 thresholds, stacked')}
			</Line>
		</Exit>
	);
};

const yearLabel = (y: number, t: <A>(zh: A, en: A) => A) => (y < 0 ? t(`西元前 ${-y} 年`, `${-y} BC`) : t(`西元 ${Math.max(1, y)} 年`, `AD ${Math.max(1, y)}`));

export const Pyramid3: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('pyramid');
	const e = interpolate(f, [30, 150], [0, 1], {...clamp, easing: io});
	const clean = e / 3;
	const bot = botOnFront(clean, e * 7);
	const year = Math.round(lerp(-2560, 2026, e));
	const zoom = interpolate(f, [0, D], [1.05, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const fade = useOut(D, 10);
	const pyIn = useIn(4);
	const py = pyIn * fade;
	const third = useIn(152) * fade;
	const fy = frontY(1 / 3);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '540px 1290px'}}>
				<HookArt id="py" clean={clean} bot={bot} />
				<Svg>
					<g transform={`translate(190 ${1120 + (1 - pyIn) * 30})`} opacity={py}>
						<Pyramid w={170} />
					</g>
					<g opacity={third}>
						<line x1={740} x2={790} y1={fy} y2={fy} stroke={C.amber} strokeWidth={3} strokeDasharray="6 6" />
					</g>
				</Svg>
				<div style={{position: 'absolute', left: 60, width: 260, top: 1140, textAlign: 'center', opacity: py, fontFamily: t(SANS, SANS_EN), fontSize: 32, color: C.dim}}>
					{t('吉薩大金字塔', 'Great Pyramid')}
				</div>
				<div style={{position: 'absolute', left: 800, top: fy - 32, opacity: third, fontFamily: NUM, fontWeight: 900, fontSize: 52, color: C.amber}}>1/3</div>
			</AbsoluteFill>
			<Line at={0} y={t(290, 250)} size={t(64, 56)} weight={700} out={D}>
				{t('如果它在金字塔蓋好那年出發', 'If it had set off the year the\nGreat Pyramid was finished')}
			</Line>
			<Line at={26} y={t(400, 420)} size={t(64, 60)} weight={800} color={C.amber} lift={10} out={D}>
				<span style={{fontVariantNumeric: 'tabular-nums'}}>{yearLabel(year, t)}</span>
			</Line>
			<Line at={152} y={t(540, 540)} size={t(110, 92)} weight={900} out={D}>
				{t('今天，才掃完 1/3', 'today it would be\nonly 1/3 done')}
			</Line>
		</AbsoluteFill>
	);
};

// The ending: the sweep finishes, the payoff answers the hook, everything holds still, then the green fades back to dust
// and the robot returns to its start: the last frames are the hook's frame 0. No fade to black.
export const End: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('end');
	const e = interpolate(f, [0, 56], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
	const back = interpolate(f, [D - 40, D - 8], [0, 1], {...clamp, easing: io});
	const p = botOnFront(1 / 3 + (e * 2) / 3, 7 + e * 9);
	const bot = {x: lerp(p.x, TW_START.x, back), y: lerp(p.y, TW_START.y, back)};
	return (
		<AbsoluteFill>
			<HookArt id="end" clean={1 / 3 + (e * 2) / 3} cleanOpacity={1 - back} bot={bot} />
			<AbsoluteFill style={{opacity: useOut(D - 6, 24)}}>
				<Line at={56} y={t(530, 540)} size={t(72, 60)} weight={700} color="#C9CCD2">
					{t('一台掃完整個台灣', 'One robot, all of Taiwan:')}
				</Line>
				<Line at={62} y={620} size={110} weight={900}>
					{t(
						<>
							<N size={132} color={C.amber}>
								1
							</N>
							<Z size={110} color={C.amber}>
								{' 萬 '}
							</Z>
							<N size={132} color={C.amber}>
								4
							</N>
							<Z size={110} color={C.amber}>
								{' 千年'}
							</Z>
						</>,
						<>
							<N size={132} color={C.amber}>
								14,000
							</N>
							<Z size={100} color={C.amber}>
								{' years'}
							</Z>
						</>,
					)}
				</Line>
				<div style={{position: 'absolute', left: 60, right: 60, top: 808, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontSize: 32, lineHeight: 1.4, color: C.dim, opacity: useIn(100)}}>
					{t('資料：外交部、Vorwerk、Eufy、維基百科', 'Data: Taiwan MOFA, Vorwerk, Eufy, Wikipedia')}
					<br />
					{t('地圖：Natural Earth · 地球影像：NASA', 'Map: Natural Earth · Earth imagery: NASA')}
					<br />
					{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

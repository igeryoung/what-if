import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Count, Line, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {Baseball, Drop, Droplet, Hailstone, Pitch, rng, Shape, Streaks, WATER} from './art';
import {dur} from './timeline';

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
// A number that pops in (scale + fade), centered, top at y.
const Big: React.FC<{at: number; y: number; out?: number; children: React.ReactNode}> = ({at, y, out, children}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: f - at, fps, config: {damping: 12, mass: 0.6, stiffness: 180}});
	const o = useOut(out ?? 1e9);
	return (
		<div style={{position: 'absolute', top: y, left: 40, right: 40, textAlign: 'center', lineHeight: 1.1, opacity: Math.min(1, p * 1.4) * o, transform: `scale(${1.25 - 0.25 * p})`}}>
			{children}
		</div>
	);
};
// Small centered caption under an object at x.
const Tag: React.FC<{at: number; x: number; y: number; color?: string; size?: number; children: React.ReactNode}> = ({at, x, y, color = C.dim, size = 36, children}) => {
	const p = useIn(at);
	return (
		<div style={{position: 'absolute', left: x - 260, width: 520, top: y, textAlign: 'center', fontFamily: useLang() === 'en' ? SANS_EN : SANS, fontWeight: 700, fontSize: size, color, opacity: p, transform: `translateY(${(1 - p) * 12}px)`}}>
			{children}
		</div>
	);
};
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
		{children}
	</svg>
);
const ease = (f: number, a: number, b: number, from = 0, to = 1) => interpolate(f, [a, b], [from, to], {...clamp, easing: Easing.inOut(Easing.cubic)});

// Fragments of a burst bag, in units of the bag's R. Rim → a ring of bigger drops, membrane → many tiny ones.
type Frag = {ox: number; oy: number; vx: number; vy: number; r: number};
const FRAGS: Frag[] = (() => {
	const r = rng(5);
	const out: Frag[] = [];
	const push = (ox: number, oy: number, rad: number, sp: number) => {
		const a = Math.atan2(oy + 0.2, ox) + (r() - 0.5) * 1.1;
		out.push({ox, oy, vx: Math.cos(a) * sp * 1.15, vy: Math.sin(a) * sp * 0.55 + 0.2 + r() * 0.45, r: rad});
	};
	for (let i = 0; i < 16; i++) {
		const a = (i / 16) * Math.PI * 2 + r() * 0.3;
		push(Math.cos(a) * 1.45, 0.12 + Math.sin(a) * 0.2, 0.05 + r() * 0.055, 0.35 + r() * 0.6);
	}
	for (let i = 0; i < 46; i++) {
		const u = -0.95 + (1.9 * (i + r())) / 46;
		push(u * 1.4, -1.2 * Math.sqrt(1 - u * u) + (r() - 0.5) * 0.3, 0.014 + r() * 0.034, 0.15 + r() * 1.0);
	}
	return out;
})();
const Frags: React.FC<{x: number; y: number; R: number; p: number; spread?: number; drop?: number; opacity?: number}> = ({x, y, R, p, spread = 1, drop = 0, opacity = 1}) => (
	<g opacity={opacity}>
		{FRAGS.map((g, i) => (
			<Droplet key={i} x={x + (g.ox + g.vx * p * spread) * R} y={y + (g.oy + g.vy * p * spread) * R + drop * (0.6 + (i % 5) * 0.12)} r={Math.max(2.5, g.r * R)} />
		))}
	</g>
);

// The opening image: a baseball-sized raindrop next to a baseball. Hook shows it from frame 0;
// End bursts the drop and rewinds it, so the last frames are this exact picture again.
const ART = {dx: 345, bx: 735, y: 1180, R: 165};
const HookArt: React.FC<{shape?: Shape; drop?: number; dropScale?: number; frags?: React.ReactNode}> = ({shape = {tear: 1}, drop = 1, dropScale = 1, frags}) => (
	<Svg>
		<Streaks />
		{frags}
		{drop > 0 && <Drop x={ART.dx} y={ART.y + ART.R * (1 - dropScale)} R={ART.R * dropScale} shape={shape} opacity={drop} />}
		<Baseball x={ART.bx} y={ART.y} R={ART.R} />
	</Svg>
);

export const Hook: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('hook');
	const wob = 0.02 * Math.sin(f * 0.2) * interpolate(f, [0, 24], [0, 1], clamp);
	const zoom = interpolate(f, [0, D], [1, 1.06], {...clamp, easing: Easing.inOut(Easing.cubic)});
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 64%'}}>
				<HookArt shape={{tear: 1, wob}} />
				<Tag at={50} x={ART.dx} y={ART.y + ART.R + 34} color={WATER.ink}>
					{t('雨滴 7.4 公分', 'Raindrop: 7.4 cm')}
				</Tag>
				<Tag at={58} x={ART.bx} y={ART.y + ART.R + 34}>
					{t('棒球 7.4 公分', 'Baseball: 7.4 cm')}
				</Tag>
			</AbsoluteFill>
			<Line at={3} y={t(300, 280)} size={t(116, 100)} weight={900}>
				{t(
					<>
						如果雨滴{'\n'}跟<span style={{color: C.amber}}>棒球</span>一樣大？
					</>,
					<>
						What if raindrops{'\n'}were as big as{'\n'}
						<span style={{color: C.amber}}>baseballs</span>?
					</>,
				)}
			</Line>
		</Exit>
	);
};

// A real drop is ~2 mm: a dot next to the baseball-sized outline (to scale), then 50,000 of them fill it.
export const Size: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('size');
	const zoom = interpolate(f, [0, D], [1, 1.05], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const fill = ease(f, 128, 205);
	const dot = useIn(26);
	const ring = 1 + 0.12 * Math.sin(f * 0.25);
	const R = 150;
	const tiny = (2 / 74) * R; // 2 mm at the scale where 2R = 74 mm
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 55%'}}>
				<Svg>
					<Drop x={400} y={1010} R={R} outline fill={fill} />
					<g opacity={dot}>
						<circle cx={790} cy={1110} r={34 * ring} fill="none" stroke={C.amber} strokeWidth={3} opacity={0.8} />
						<Droplet x={790} y={1110} r={tiny} />
					</g>
				</Svg>
				<Tag at={36} x={790} y={1160} color={C.amber}>
					{t('實際比例', 'to scale')}
				</Tag>
			</AbsoluteFill>
			<Kicker at={0} y={250}>
				{t('真正的雨滴', 'A REAL RAINDROP')}
			</Kicker>
			<Big at={8} y={310}>
				<Z size={t(96, 84)}>{t('約 ', 'About ')}</Z>
				<N size={200} color={WATER.ink}>
					2
				</N>
				<Z size={t(96, 84)}>{t(' 毫米', ' mm')}</Z>
			</Big>
			<Big at={124} y={1230}>
				<N size={130} color={C.amber}>
					{t('5', '50,000')}
				</N>
				<Z size={t(80, 64)}>{t(' 萬顆', ' drops')}</Z>
			</Big>
			<Line at={138} y={1390} size={t(56, 50)} weight={700}>
				{t('才裝得滿一顆棒球雨滴', 'to fill one baseball-sized drop')}
			</Line>
		</Exit>
	);
};

// Balance scale: the drop (~210 g) outweighs the baseball (145 g).
const ScaleArt: React.FC<{tilt: number}> = ({tilt}) => {
	const px = 540, py = 800, L = 300, hang = 210, R = 96;
	const a = (tilt * Math.PI) / 180;
	const lx = px - L * Math.cos(a), ly = py + L * Math.sin(a);
	const rx = px + L * Math.cos(a), ry = py - L * Math.sin(a);
	const pan = (x: number, y: number) => (
		<g>
			<line x1={x} y1={y} x2={x - 110} y2={y + hang} stroke={C.dim} strokeWidth={3} />
			<line x1={x} y1={y} x2={x + 110} y2={y + hang} stroke={C.dim} strokeWidth={3} />
			<path d={`M${x - 130},${y + hang} Q${x},${y + hang + 50} ${x + 130},${y + hang} Z`} fill="#3A3F49" stroke="#5A606C" strokeWidth={3} />
		</g>
	);
	return (
		<Svg>
			<rect x={px - 9} y={py} width={18} height={480} rx={6} fill="#3A3F49" />
			<path d={`M${px - 150},${py + 500} L${px + 150},${py + 500} L${px + 90},${py + 470} L${px - 90},${py + 470} Z`} fill="#3A3F49" />
			{pan(lx, ly)}
			{pan(rx, ry)}
			<line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#5A606C" strokeWidth={14} strokeLinecap="round" />
			<circle cx={px} cy={py} r={16} fill={C.amber} />
			<Drop x={lx} y={ly + hang - R + 2} R={R} shape={{tear: 1}} />
			<Baseball x={rx} y={ry + hang - R + 2} R={R} />
		</Svg>
	);
};
export const Weight: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('weight');
	const tip = spring({frame: f - 30, fps, config: {damping: 9, mass: 0.9, stiffness: 90}});
	const tilt = 7 * tip;
	const zoom = interpolate(f, [0, D], [1.04, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const L = 300;
	const a = (tilt * Math.PI) / 180;
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 60%'}}>
				<ScaleArt tilt={tilt} />
				<Tag at={44} x={540 - L * Math.cos(a)} y={800 + L * Math.sin(a) + 262} color={WATER.ink} size={52}>
					{t('210 克', '210 g')}
				</Tag>
				<Tag at={52} x={540 + L * Math.cos(a)} y={800 - L * Math.sin(a) + 262} size={52}>
					{t('145 克', '145 g')}
				</Tag>
			</AbsoluteFill>
			<Kicker at={0} y={250}>
				{t('一顆的重量', 'ONE DROP WEIGHS')}
			</Kicker>
			<Big at={6} y={310}>
				<Z size={t(96, 84)}>{t('約 ', 'About ')}</Z>
				<N size={200} color={WATER.ink}>
					210
				</N>
				<Z size={t(96, 84)}>{t(' 克', ' g')}</Z>
			</Big>
			<Line at={84} y={1380} size={t(80, 70)} weight={900} color={C.amber}>
				{t('比一顆棒球還重', 'Heavier than a baseball')}
			</Line>
		</Exit>
	);
};

// Impact speed ≈ a pro fastball. Motion lines stream up past the falling drop.
const LINES = (() => {
	const r = rng(33);
	return Array.from({length: 24}, (_, i) => ({x: 540 + (i / 23 - 0.5) * 320 + (r() - 0.5) * 30, l: 120 + r() * 220, ph: r() * 900, w: 3 + r() * 4}));
})();
export const Speed: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('speed');
	const go = ease(f, 0, 40);
	const jit = Math.sin(f * 1.7) * 3 * go;
	const zx = interpolate(f, [92, 116], [-140, 1240], {...clamp, easing: Easing.in(Easing.quad)});
	const zoom = interpolate(f, [0, D], [1, 1.06], {...clamp, easing: Easing.inOut(Easing.cubic)});
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 50%'}}>
				<Svg>
					<defs>
						<linearGradient id="spdL" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor={WATER.ink} stopOpacity={0} />
							<stop offset="1" stopColor={WATER.ink} stopOpacity={0.55} />
						</linearGradient>
						<linearGradient id="zipL" x1="0" y1="0" x2="1" y2="0">
							<stop offset="0" stopColor={C.ink} stopOpacity={0} />
							<stop offset="1" stopColor={C.ink} stopOpacity={0.5} />
						</linearGradient>
					</defs>
					<clipPath id="spdC">
						<rect x={0} y={610} width={1080} height={420} />
					</clipPath>
					<g clipPath="url(#spdC)">
						{LINES.map((m, i) => {
							const y = 1040 - ((f * 34 * go + m.ph) % 700);
							return <rect key={i} x={m.x} y={y - m.l} width={m.w} height={m.l} rx={m.w / 2} fill="url(#spdL)" opacity={go} />;
						})}
					</g>
					<Drop x={540 + jit} y={930} R={120} shape={{tear: 1, wob: 0.03 * Math.sin(f * 0.9) * go}} />
					{f >= 92 && f <= 118 && (
						<g>
							<rect x={zx - 420} y={1268} width={400} height={8} rx={4} fill="url(#zipL)" />
							<rect x={zx - 300} y={1300} width={280} height={6} rx={3} fill="url(#zipL)" />
							<Baseball x={zx} y={1284} R={40} rot={f * 25} />
						</g>
					)}
				</Svg>
			</AbsoluteFill>
			<Kicker at={0} y={240}>
				{t('落地時速（估算）', 'IMPACT SPEED (ESTIMATE)')}
			</Kicker>
			<Big at={6} y={300}>
				<N size={210} color={C.amber}>
					<Count to={150} at={10} dur={40} decimals={0} />
				</N>
				<Z size={t(80, 72)}>{t(' 公里/時', ' km/h')}</Z>
			</Big>
			<Line at={88} y={1110} size={t(76, 64)} weight={900}>
				{t('跟職棒快速球差不多', 'As fast as a pro fastball')}
			</Line>
			<Line at={140} y={1360} size={40} weight={700} color={C.dim}>
				{t('最大的真雨滴：約 32 公里/時', 'The biggest real raindrops: ~32 km/h')}
			</Line>
		</Exit>
	);
};

// Moderate rain on a football pitch: one splash per drop, 47 a second (drawn at that exact rate).
const RATE = 47;
const SPLASH = (() => {
	const r = rng(77);
	return Array.from({length: RATE * 9}, (_, i) => ({at: (i / RATE) * 30, x: r(), y: r()}));
})();
export const PitchScene: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('pitch');
	const W = 600, X = 240, Y = 724;
	const H = (105 / 68) * W;
	const zoom = interpolate(f, [0, D], [1, 1.05], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const on = (a: number) => f - 20 - a;
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 75%'}}>
				<Svg>
					<Pitch x={X} y={Y} w={W} />
					{SPLASH.map((s, i) => {
						const k = on(s.at);
						if (k < 0 || k > 40) return null;
						const x = X + 12 + s.x * (W - 24), y = Y + 12 + s.y * (H - 24);
						const ring = interpolate(k, [0, 14], [6, 40], {...clamp, easing: Easing.out(Easing.quad)});
						return (
							<g key={i}>
								<circle cx={x} cy={y} r={9} fill="#0C3019" opacity={interpolate(k, [0, 40], [0.95, 0], clamp)} />
								<circle cx={x} cy={y} r={ring} fill="none" stroke={WATER.hi} strokeWidth={5} opacity={interpolate(k, [0, 14], [1, 0], clamp)} />
								<circle cx={x} cy={y} r={interpolate(k, [0, 5], [12, 3], clamp)} fill="#FFFFFF" opacity={interpolate(k, [0, 5], [1, 0], clamp)} />
							</g>
						);
					})}
				</Svg>
			</AbsoluteFill>
			<Kicker at={0} y={230}>
				{t('換成一場普通的中雨', 'NOW, AN ORDINARY MODERATE RAIN')}
			</Kicker>
			<Big at={20} y={285}>
				<N size={200} color={C.amber}>
					<Count to={47} at={22} dur={30} decimals={0} />
				</N>
				<Z size={t(80, 64)}>{t(' 顆/秒', ' per second')}</Z>
			</Big>
			<Line at={50} y={t(522, 526)} size={t(60, 52)} weight={700}>
				{t('砸在一座足球場上', 'hit a single football pitch')}
			</Line>
			<Line at={110} y={614} size={32} weight={400} color={C.dim}>
				{t('以每小時 5 毫米的雨量計', 'At 5 mm of rain per hour')}
			</Line>
		</Exit>
	);
};

// Twist: impossible. Real drops aren't even teardrops: round when small, then a burger bun.
export const Twist: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('twist');
	const tear = 1 - spring({frame: f - 70, fps, config: {damping: 14, mass: 0.8, stiffness: 120}});
	const flat = ease(f, 150, 192);
	const wob = 0.025 * Math.sin(f * 0.5) * interpolate(f, [70, 100, 150, 200, 230], [0, 1, 0.4, 1, 0.3], clamp);
	const R = 150 + 12 * flat;
	const zoom = interpolate(f, [0, D], [1, 1.05], {...clamp, easing: Easing.inOut(Easing.cubic)});
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 58%'}}>
				<Svg>
					<Drop x={540} y={1080} R={R} shape={{tear, flat, wob}} />
				</Svg>
			</AbsoluteFill>
			<Line at={0} y={290} size={t(120, 104)} weight={900}>
				{t(
					<>
						但這<span style={{color: C.red}}>不可能</span>。
					</>,
					<>
						But it <span style={{color: C.red}}>can't</span>
						{'\n'}happen.
					</>,
				)}
			</Line>
			<Line at={44} y={t(470, 570)} size={t(64, 56)} weight={700} color={WATER.ink}>
				{t('雨滴根本不是淚滴形', "Raindrops aren't even\nteardrop-shaped")}
			</Line>
			<Line at={96} out={150} y={1300} size={t(60, 54)} weight={700}>
				{t('不到 1 毫米：圓球', 'Under 1 mm: round')}
			</Line>
			<Line at={170} y={1300} size={t(60, 54)} weight={700}>
				{t('2–3 毫米：像漢堡麵包', '2–3 mm: a burger bun')}
			</Line>
		</Exit>
	);
};

// At ~5 mm the air blows the bun into a parachute (bag) and it bursts, on the bar line at 48 s.
const BURST = 120;
export const Burst: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('burst');
	const bag = ease(f, 18, 112);
	const R = 162 + 38 * bag;
	const shake = f > 96 && f < BURST ? 0.03 * Math.sin(f * 2.1) : 0;
	const p = interpolate(f, [BURST, BURST + 26], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const drift = interpolate(f, [BURST + 20, D], [0, 60], clamp);
	const flash = interpolate(f, [BURST, BURST + 10], [0.6, 0], clamp);
	const zoom = interpolate(f, [0, BURST, D], [1, 1.07, 1.02], {...clamp, easing: Easing.inOut(Easing.cubic)});
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 52%'}}>
				<Svg>
					{f < BURST ? (
						<Drop x={540} y={1000} R={R} shape={{flat: 1, bag, wob: shake}} />
					) : (
						<>
							<defs>
								<radialGradient id="flashG">
									<stop offset="0" stopColor={WATER.hi} stopOpacity={0.8} />
									<stop offset="0.5" stopColor={WATER.light} stopOpacity={0.25} />
									<stop offset="1" stopColor={WATER.light} stopOpacity={0} />
								</radialGradient>
							</defs>
							<circle cx={540} cy={930} r={260 + 200 * (1 - flash)} fill="url(#flashG)" opacity={flash / 0.6} />
							<Frags x={540} y={1000} R={200} p={p} drop={drift} />
						</>
					)}
				</Svg>
			</AbsoluteFill>
			<Line at={4} y={300} size={t(110, 100)} weight={900}>
				{t(
					<>
						到了約 <N size={130} color={C.amber}>5</N> 毫米
					</>,
					<>
						At about <N size={130} color={C.amber}>5</N> mm
					</>,
				)}
			</Line>
			<Line at={40} out={BURST - 2} y={480} size={t(60, 54)} weight={700} color={WATER.ink}>
				{t('空氣把它吹成一頂降落傘', 'air puffs it into a parachute')}
			</Line>
			<Line at={BURST + 4} y={470} size={t(96, 88)} weight={900} color={WATER.hi}>
				{t('然後——啪，碎了', '…and it bursts')}
			</Line>
			<Line at={BURST + 44} y={1420} size={40} weight={700} color={C.dim}>
				{t('空氣的推力，贏過了表面張力', 'Air pressure beats surface tension')}
			</Line>
		</Exit>
	);
};

// Baseball-sized things do fall from the sky: hail. Ice holds together; water can't.
export const Hail: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('hail');
	const land = spring({frame: f - 2, fps, config: {damping: 10, mass: 0.8, stiffness: 160}});
	const hy = interpolate(land, [0, 1], [-260, 1010]);
	const zoom = interpolate(f, [0, D], [1, 1.05], {...clamp, easing: Easing.inOut(Easing.cubic)});
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 58%'}}>
				<Svg>
					<Hailstone x={360} y={hy} R={142} rot={f * 0.4} />
					<Baseball x={720} y={1010} R={150} />
				</Svg>
				<Tag at={30} x={360} y={1190} color={C.ink}>
					{t('冰雹 約 7 公分', 'Hail: ~7 cm')}
				</Tag>
				<Tag at={36} x={720} y={1190}>
					{t('棒球 7.4 公分', 'Baseball: 7.4 cm')}
				</Tag>
			</AbsoluteFill>
			<Line at={0} y={300} size={t(92, 84)} weight={900}>
				{t('天上真的會掉\n棒球大的東西', 'The sky does drop\nbaseball-sized things')}
			</Line>
			<Line at={78} y={1300} size={t(80, 68)} weight={900} color={C.amber}>
				{t('冰撐得住，水撐不住', "Ice holds together.\nWater can't.")}
			</Line>
		</Exit>
	);
};

// The ending: back to the hook's picture. The drop bursts on the downbeat at 60 s and the payoff lands with the
// cadence; everything holds still; in the last second the fragments rewind into the drop, so the final frames are
// the hook's frame 0. No fade to black.
const POP = 60;
export const End: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('end');
	const tear = 1 - ease(f, 12, 30);
	const flat = ease(f, 26, 40);
	const bag = ease(f, 38, POP - 2);
		const out = interpolate(f, [POP, POP + 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const back = interpolate(f, [D - 40, D - 14], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const p = out * (1 - back);
	const regrow = interpolate(f, [D - 26, D - 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const art = interpolate(f, [0, 8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: art}}>
				{f < POP ? (
					<HookArt shape={{tear, flat, bag}} dropScale={1 + 0.145 * bag} />
				) : (
					<HookArt
						drop={regrow}
						dropScale={0.4 + 0.6 * regrow}
						frags={<Frags x={ART.dx} y={ART.y - 24} R={ART.R + 24} p={p} spread={0.7} opacity={interpolate(f, [D - 20, D - 10], [1, 0], clamp)} />}
					/>
				)}
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: useOut(D - 6, 22)}}>
				<Line at={POP + 2} y={t(380, 400)} size={t(112, 96)} weight={900}>
					{t(
						<>
							落下不到 <span style={{color: C.amber}}>1</span> 公尺{'\n'}就碎成一場小雨
						</>,
						<>
							Within <span style={{color: C.amber}}>1</span> meter,{'\n'}it bursts into rain
						</>,
					)}
				</Line>
				<Line at={168} y={t(700, 690)} size={t(68, 64)} weight={900} color={C.amber}>
					{t('所以放心，\n出門不用戴打擊頭盔。', 'So relax.\nNo batting helmet needed.')}
				</Line>
				<div style={{position: 'absolute', left: 60, right: 60, top: 1392, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontSize: 32, lineHeight: 1.6, color: C.dim, opacity: useIn(POP + 45)}}>
					{t('資料：NASA GPM · NWS · AMS · MLB Statcast', 'Data: NASA GPM · NWS · AMS · MLB Statcast')}
					<br />
					{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

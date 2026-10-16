import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Line, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {Cam, camAt, camLerp, City, Crystal, Flakes, HERO, PERSON_X, Rain, snowTop, sx, sy, TANK, WIDE} from './art';
import {BEAT, dur, END_MELT, END_PAY, END_UP, FH, from, MONTH0, MONTH_STEP, MONTHS, RISE0, RISE_TOP, SNOW_M} from './timeline';

// ---------- shared bits ----------
const Exit: React.FC<{len: number; fade?: number; children: React.ReactNode}> = ({len, fade = 10, children}) => (
	<AbsoluteFill style={{opacity: useOut(len, fade)}}>{children}</AbsoluteFill>
);
const Kicker: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => (
	<Line at={at} y={y} size={40} weight={700} color={C.amber} tracking={6} lift={14}>
		{children}
	</Line>
);
const Note: React.FC<{at: number; y: number; color?: string; children: React.ReactNode}> = ({at, y, color = C.dim, children}) => (
	<Line at={at} y={y} size={32} weight={400} color={color} lift={10}>
		{children}
	</Line>
);
const N: React.FC<{size: number; color?: string; children: React.ReactNode}> = ({size, color = C.ink, children}) => (
	<span style={{fontFamily: NUM, fontWeight: 900, fontSize: size, color, letterSpacing: -size * 0.03, fontVariantNumeric: 'tabular-nums'}}>{children}</span>
);
const Z: React.FC<{size: number; color?: string; weight?: number; children: React.ReactNode}> = ({size, color = C.ink, weight = 900, children}) => (
	<span style={{fontFamily: useLang() === 'en' ? SANS_EN : SANS, fontWeight: weight, fontSize: size, color}}>{children}</span>
);
const ICE = '#BFDBFF';
const WATER = '#5EA0FF';
const shadow = '0 4px 24px rgba(0,0,0,0.55)';

// ---------- the street camera: hook push → dive into the tank (across the cut) → slow push ----------
const ANCHOR: [number, number] = [12.4, 1];
const P_WIDE: [number, number] = [sx(WIDE, ANCHOR[0]), sy(WIDE, ANCHOR[1])];
const P_CLOSE: [number, number] = [500, 1300];
const DIVE = [from('hook') + dur('hook') - 26, from('rain') + 26];
const streetCam = (g: number): Cam => {
	if (g <= DIVE[0]) {
		const p = interpolate(g, [0, DIVE[0]], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
		return camLerp(WIDE.k, 21.8, ANCHOR, ANCHOR, P_WIDE, P_WIDE, p);
	}
	const p = interpolate(g, DIVE, [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const k1 = interpolate(g, [DIVE[1], from('rain') + dur('rain')], [170, 182], clamp);
	return camLerp(21.8, k1, ANCHOR, ANCHOR, P_WIDE, P_CLOSE, p);
};

// ---------- 1. hook ----------
export const Hook: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('hook');
	return (
		<AbsoluteFill>
			<City cam={streetCam(f)} snow={0} />
			<Rain g={f} o={1} />
			<Line at={6} y={t(400, 330)} size={t(72, 72)} weight={700} color="#C4CEDD" out={D - 14}>
				{t('如果台北一年的雨', 'What if a year of\nTaipei’s rain')}
			</Line>
			<Line at={22} y={t(500, 520)} size={t(124, 112)} weight={900} out={D - 14}>
				{t('全部變成雪？', 'fell as snow?')}
			</Line>
		</AbsoluteFill>
	);
};

// ---------- 2. a year of rain fills the tank ----------
const CUM = MONTHS.reduce<number[]>((a, v) => [...a, a[a.length - 1] + v], [0]);
const rainMM = (f: number) => {
	if (f <= MONTH0) return 0;
	const m = Math.min(11, Math.floor((f - MONTH0) / MONTH_STEP));
	const p = Math.min(1, (f - MONTH0 - m * MONTH_STEP) / MONTH_STEP);
	return CUM[m] + (CUM[m + 1] - CUM[m]) * Easing.inOut(Easing.quad)(p);
};
const MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const RainYear: React.FC = () => {
	const t = useT();
	const lang = useLang();
	const f = useCurrentFrame();
	const D = dur('rain');
	const g = from('rain') + f;
	const cam = streetCam(g);
	const mm = rainMM(f);
	const water = mm / 1000;
	const month = Math.max(1, Math.min(12, Math.floor((f - MONTH0) / MONTH_STEP) + 1));
	const numIn = useIn(MONTH0 - 14);
	const monO = interpolate(f, [MONTH0 - 4, MONTH0 + 4, 176, 186], [0, 1, 1, 0], clamp);
	const tankO = useIn(10);
	const rulerO = useIn(24);
	return (
		<Exit len={D}>
			<City cam={cam} snow={0} water={water} tankO={tankO} />
			<Rain g={g} o={1} />
			<AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(5,8,14,0) 6%, rgba(5,8,14,0.78) 11%, rgba(5,8,14,0.78) 39%, rgba(5,8,14,0) 47%)', opacity: interpolate(f, [0, 22], [0, 1], clamp)}} />
			{[1, 2].map((m) => (
				<div key={m} style={{position: 'absolute', left: sx(cam, TANK.x1) + 34, top: sy(cam, m) - 22, fontFamily: NUM, fontWeight: 800, fontSize: 34, color: '#1E3A66', opacity: rulerO}}>
					{m} m
				</div>
			))}
			<div
				style={{
					position: 'absolute',
					left: sx(cam, (TANK.x0 + TANK.x1) / 2) - 70,
					width: 140,
					top: Math.min(sy(cam, water) + 12, sy(cam, 0) - 72),
					padding: '4px 0 6px',
					borderRadius: 14,
					background: '#2463C9',
					textAlign: 'center',
					fontFamily: lang === 'en' ? SANS_EN : SANS,
					fontWeight: 900,
					fontSize: 44,
					color: '#FFFFFF',
					opacity: monO,
				}}
			>
				{lang === 'en' ? MON_EN[month - 1] : `${month} 月`}
			</div>
			<Kicker at={0} y={240}>
				{t('台北一年的雨量', 'TAIPEI’S RAIN IN ONE YEAR')}
			</Kicker>
			<div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', opacity: numIn, textShadow: shadow}}>
				<N size={180} color={WATER}>
					{Math.round(mm + 1e-6).toLocaleString('en-US')}
				</N>
				<Z size={t(80, 80)} color={WATER}>
					{t(' 毫米', ' mm')}
				</Z>
			</div>
			<Line at={170} y={540} size={t(64, 56)} weight={700}>
				{t('約 2.3 公尺深，比人還高', 'About 2.3 m deep:\ntaller than a person')}
			</Line>
			<Note at={192} y={t(640, 700)}>
				{t('中央氣象署臺北站 1991–2020 年平均', 'CWA Taipei station, 1991–2020 average')}
			</Note>
		</Exit>
	);
};

// ---------- 3. the same water, ten times taller as snow ----------
const G = {base: 1290, k: 45, w: 200, xl: 330, xr: 750};
const Gauge: React.FC<{x: number; o: number}> = ({x, o}) => (
	<g opacity={o}>
		<rect x={x - G.w / 2} y={G.base - 12 * G.k} width={G.w} height={12 * G.k} rx={10} fill="#8CB4E6" opacity={0.07} />
		<rect x={x - G.w / 2} y={G.base - 12 * G.k} width={G.w} height={12 * G.k} rx={10} fill="none" stroke="#A9C7EA" strokeWidth={4} opacity={0.75} />
		{Array.from({length: 12}, (_, i) => (
			<rect key={i} x={x - G.w / 2} y={G.base - (i + 1) * G.k - 1.5} width={i % 5 === 4 ? 34 : 18} height={3} fill="#A9C7EA" opacity={0.75} />
		))}
	</g>
);
const FLUFF = (() => {
	const out: {x: number; y: number; r: number}[] = [];
	let s = 7;
	const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
	for (let i = 0; i < 160; i++) out.push({x: r() * 184 - 92, y: r(), r: 3 + r() * 6});
	return out;
})();

export const Fluff: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('fluff');
	const gIn = useIn(0);
	const wl = interpolate(f, [16, 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const sn = interpolate(f, [48, 118], [0, 10], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const pop = spring({frame: f - 120, fps, config: {damping: 11, mass: 0.6, stiffness: 170}});
	const zoom = interpolate(f, [0, D], [1, 1.05], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const top = G.base - sn * G.k;
	let d = `M${G.xr - G.w / 2 + 3} ${G.base - 3} `;
	for (let x = -G.w / 2 + 3; x <= G.w / 2 - 3; x += 6) d += `L${G.xr + x} ${top + (sn > 0.2 ? 7 * Math.sin(x * 0.09) + 4 * Math.sin(x * 0.23 + 1) : 0)} `;
	d += `L${G.xr + G.w / 2 - 3} ${G.base - 3} Z`;
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 55%'}}>
				<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
					<defs>
						<clipPath id="hp-gr">
							<rect x={G.xr - G.w / 2} y={G.base - 12 * G.k} width={G.w} height={12 * G.k} rx={10} />
						</clipPath>
					</defs>
					<Gauge x={G.xl} o={gIn} />
					<Gauge x={G.xr} o={gIn} />
					<rect x={G.xl - G.w / 2 + 3} y={G.base - wl * G.k - 3} width={G.w - 6} height={wl * G.k} rx={6} fill="#3D8BFF" opacity={0.8} />
					<rect x={G.xl - G.w / 2 + 3} y={G.base - wl * G.k - 4} width={G.w - 6} height={4} fill="#BFDBFF" opacity={wl} />
					{sn > 0 && (
						<g clipPath="url(#hp-gr)">
							<path d={d} fill="#EEF3F9" />
							{FLUFF.map((p, i) =>
								p.y * 10 < sn - 0.3 ? <circle key={i} cx={G.xr + p.x} cy={G.base - p.y * 10 * G.k} r={p.r} fill="#C9D6E6" opacity={0.7} /> : null,
							)}
						</g>
					)}
				</svg>
				{[0, 1, 2].map((i) => {
					const y = interpolate(f, [44 + i * 18, 110 + i * 18], [560, top - 30], clamp);
					const o = interpolate(f, [44 + i * 18, 52 + i * 18, 104 + i * 18, 112 + i * 18], [0, 1, 1, 0], clamp);
					return (
						<div key={i} style={{position: 'absolute', left: G.xr - 30 + (i - 1) * 50, top: y, opacity: o, transform: `rotate(${f * 2 + i * 40}deg)`}}>
							<Crystal size={60} />
						</div>
					);
				})}
				<div style={{position: 'absolute', left: G.xl + G.w / 2 + 16, top: G.base - wl * G.k - 26, fontFamily: t(SANS, SANS_EN), fontWeight: 700, fontSize: 36, color: ICE, opacity: wl}}>
					{t('1 公分', '1 cm')}
				</div>
				<div style={{position: 'absolute', left: G.xr - G.w / 2 - 170, width: 150, textAlign: 'right', top: top - 26, fontFamily: t(SANS, SANS_EN), fontWeight: 700, fontSize: 36, color: '#FFFFFF', opacity: interpolate(sn, [1, 3], [0, 1], clamp)}}>
					{t(`${Math.round(sn)} 公分`, `${Math.round(sn)} cm`)}
				</div>
				<div style={{position: 'absolute', top: G.base + 20, left: G.xl - 220, width: 440, textAlign: 'center', opacity: gIn}}>
					<Z size={t(56, 48)} weight={700} color={ICE}>
						{t('雨', 'Rain')}
					</Z>
				</div>
				<div style={{position: 'absolute', top: G.base + 20, left: G.xr - 220, width: 440, textAlign: 'center', opacity: gIn}}>
					<Z size={t(56, 48)} weight={700}>
						{t('雪', 'Snow')}
					</Z>
				</div>
				<Kicker at={0} y={240}>
					{t('雪很蓬鬆', 'SNOW IS FLUFFY')}
				</Kicker>
				<div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center', opacity: Math.min(1, pop * 1.4), transform: `scale(${1.25 - 0.25 * pop})`}}>
					<N size={200}>× 10</N>
				</div>
				<Line at={136} y={540} size={t(60, 52)} weight={700}>
					{t('同樣的水，變成雪約高 10 倍', 'Same water, about 10×\ntaller as snow')}
				</Line>
				<Note at={156} y={1420}>
					{t('氣象經驗法則；濕雪較少，乾雪更多', 'A weather rule of thumb; wet snow less, dry snow more')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ---------- 4. the snow rises up the building ----------
const riseSnow = (f: number) => {
	if (f <= RISE0) return 0;
	const lin = RISE0 + 7 * BEAT; // 8th floor's floor level (21 m) on the 8th beat
	if (f <= lin) return ((f - RISE0) / (7 * BEAT)) * 7 * FH;
	return 7 * FH + (SNOW_M - 7 * FH) * Easing.out(Easing.quad)(Math.min(1, (f - lin) / (RISE_TOP - lin)));
};
const FloorTag: React.FC<{cam: Cam; n: number; snow: number; o: number}> = ({cam, n, snow, o}) => {
	const t = useT();
	const y = sy(cam, (n - 1) * FH + FH / 2);
	const vis = o * interpolate(y, [1480, 1510], [1, 0], clamp) * interpolate(y, [200, 240], [0, 1], clamp);
	if (vis <= 0) return null;
	const under = snow > (n - 1) * FH + 0.05;
	return (
		<div
			style={{
				position: 'absolute',
				left: sx(cam, HERO.x0) - 118,
				width: 106,
				top: y - 22,
				textAlign: 'right',
				fontFamily: t(SANS, SANS_EN),
				fontWeight: 700,
				fontSize: 32,
				lineHeight: '44px',
				color: under ? (n === 8 ? C.amber : '#5B6B84') : '#9AA3B2',
				opacity: vis,
			}}
		>
			{t(`${n} 樓`, `${n}F`)}
		</div>
	);
};

export const Rise: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('rise');
	const g = from('rise') + f;
	const snow = riseSnow(f);
	const feet = snowTop(PERSON_X, snow);
	const p = interpolate(f, [RISE0 - 12, RISE_TOP], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const end: [number, number] = [sx(WIDE, PERSON_X), sy(WIDE, snowTop(PERSON_X, SNOW_M))];
	const cam = camLerp(75, WIDE.k, [PERSON_X, feet], [PERSON_X, feet], [560, 1360], end, p);
	const floor = snow > 0 ? Math.min(8, Math.floor(snow / FH) + 1) : 1;
	const popAt = RISE0 + (floor - 1) * BEAT;
	const pop = spring({frame: f - popAt, fps, config: {damping: 12, mass: 0.5, stiffness: 200}});
	const hud = useIn(RISE0 - 6);
	const tagO = interpolate(cam.k, [32, 45], [1, 0], clamp);
	return (
		<Exit len={D}>
			<City cam={cam} snow={snow} water={2.33} tankO={1} />
			<Flakes g={g} o={1} speed={1.4} />
			{Array.from({length: HERO.n}, (_, i) => (
				<FloorTag key={i} cam={cam} n={i + 1} snow={snow} o={tagO} />
			))}
			<div style={{position: 'absolute', top: 220, left: 0, right: 0, textAlign: 'center', opacity: hud, textShadow: shadow}}>
				<N size={180}>{snow.toFixed(1)}</N>
				<Z size={t(76, 76)}>{t(' 公尺', ' m')}</Z>
			</div>
			<div style={{position: 'absolute', top: 440, left: 0, right: 0, textAlign: 'center', opacity: hud, textShadow: shadow, transform: `scale(${1.12 - 0.12 * pop})`}}>
				<Z size={t(112, 100)} color={floor === 8 ? C.amber : C.ink}>
					{t(`淹到 ${floor} 樓`, `Up to floor ${floor}`)}
				</Z>
			</div>
			<Note at={RISE_TOP + 16} y={600}>
				{t('假設雪不融化、不壓實；每層樓約 3 公尺', 'Assuming it never melts or settles; about 3 m per floor')}
			</Note>
		</Exit>
	);
};

// ---------- 5–7. the comparison chart ----------
const CH = {base: 1320, ks: 22, kw: 210, w: 180, xs: [250, 540, 830]};
const SNOW_V = [5.67, SNOW_M, 28.96]; // m of snowfall a year: Aomori (JMA), Taipei (computed), Mt. Baker 1998–99 (NOAA)
const WATER_V = [1.3507, 2.3295]; // m of precipitation a year: Aomori (JMA), Taipei (CWA)

/** One bar: snow (white, bumpy cap) cross-fading to water (blue, flat) by `wet`. */
const Bar: React.FC<{x: number; h: number; wet: number; o: number}> = ({x, h, wet, o}) => {
	if (h <= 0.5 || o <= 0) return null;
	const top = CH.base - h;
	let cap = `M${x - CH.w / 2} ${CH.base} L${x - CH.w / 2} ${top + 10} `;
	for (let i = -CH.w / 2; i <= CH.w / 2; i += 6) cap += `L${x + i} ${top + 8 - 8 * Math.abs(Math.sin((i + CH.w / 2) * 0.052))} `;
	cap += `L${x + CH.w / 2} ${CH.base} Z`;
	return (
		<g opacity={o}>
			<path d={cap} fill="url(#hp-bsnow)" opacity={1 - wet} />
			<rect x={x - CH.w / 2} y={top} width={CH.w} height={h} fill="url(#hp-bwater)" opacity={wet} />
			<rect x={x - CH.w / 2} y={top - 2} width={CH.w} height={5} fill="#BFDBFF" opacity={wet} />
		</g>
	);
};
type ChartState = {h: number[]; o: number[]; wet: number; grid: number; val: number[]; xs?: number[]};
const Chart: React.FC<{s: ChartState}> = ({s}) => {
	const t = useT();
	const lang = useLang();
	const names = [t('青森', 'Aomori'), t('台北', 'Taipei'), t('貝克山', 'Mt. Baker')];
	const labels = s.wet < 0.5 ? SNOW_V.map((v) => (lang === 'en' ? `${v.toFixed(1)} m` : `${v.toFixed(1)} 公尺`)) : [t('1,351 毫米', '1,351 mm'), t('2,330 毫米', '2,330 mm'), ''];
	const lo = s.wet < 0.5 ? 1 - s.wet * 2 : s.wet * 2 - 1;
	return (
		<AbsoluteFill>
			<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
				<defs>
					<linearGradient id="hp-bsnow" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#F7FAFD" />
						<stop offset="1" stopColor="#B9C8DB" />
					</linearGradient>
					<linearGradient id="hp-bwater" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#4C96FF" />
						<stop offset="1" stopColor="#1D4FA8" />
					</linearGradient>
				</defs>
				<g opacity={s.grid}>
					{Array.from({length: 10}, (_, i) => (
						<rect key={i} x={140} y={CH.base - (i + 1) * FH * CH.ks} width={820} height={i === 6 ? 3 : 2} fill={i === 6 ? C.amber : C.faint} opacity={i === 6 ? 0.7 : 1} />
					))}
				</g>
				<rect x={140} y={CH.base} width={820} height={3} fill="#3A3F4A" />
				{(s.xs ?? CH.xs).map((x, i) => (
					<Bar key={i} x={x} h={s.h[i]} wet={s.wet} o={s.o[i]} />
				))}
			</svg>
			{[2, 4, 6, 8, 10].map((n) => (
				<div key={n} style={{position: 'absolute', left: 40, width: 90, textAlign: 'right', top: CH.base - ((n - 1) * FH + FH / 2) * CH.ks - 20, fontFamily: t(SANS, SANS_EN), fontWeight: 700, fontSize: 32, color: n === 8 ? C.amber : C.dim, opacity: s.grid}}>
					{t(`${n} 樓`, `${n}F`)}
				</div>
			))}
			{(s.xs ?? CH.xs).map((x, i) => (
				<React.Fragment key={i}>
					<div style={{position: 'absolute', left: x - 150, width: 300, top: CH.base + 14, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontWeight: 700, fontSize: t(44, 40), color: i === 1 ? C.ink : '#B8C0CC', opacity: s.o[i]}}>
						{names[i]}
					</div>
					<div style={{position: 'absolute', left: x - 150, width: 300, top: CH.base - s.h[i] - 74, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontWeight: 900, fontSize: 52, color: s.wet > 0.5 ? '#9CC4FF' : C.ink, opacity: s.o[i] * s.val[i] * lo}}>
						{labels[i]}
					</div>
				</React.Fragment>
			))}
		</AbsoluteFill>
	);
};
const grow = (f: number, a: number, b: number, to: number) => interpolate(f, [a, b], [0, to], {...clamp, easing: Easing.out(Easing.cubic)});

export const Aomori: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('aomori');
	const zoom = interpolate(f, [0, D], [1, 1.03], clamp);
	const s: ChartState = {
		h: [grow(f, 8, 44, SNOW_V[0] * CH.ks), grow(f, 56, 128, SNOW_V[1] * CH.ks), 0],
		o: [1, 1, 0],
		wet: 0,
		grid: interpolate(f, [0, 14], [0, 1], clamp),
		val: [interpolate(f, [38, 46], [0, 1], clamp), interpolate(f, [120, 130], [0, 1], clamp), 0],
	};
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 70%'}}>
				<Chart s={s} />
			</AbsoluteFill>
			<Exit len={D}>
				<Kicker at={0} y={230}>
					{t('日本青森市', 'AOMORI, JAPAN')}
				</Kicker>
				<Line at={8} y={290} size={t(64, 56)} weight={700}>
					{t('常被評為全球最多雪的城市', 'Often ranked the world’s\nsnowiest city')}
				</Line>
				<Line at={140} y={t(400, 450)} size={t(110, 92)} weight={900} color={C.ink}>
					{t('台北是它的 4 倍', 'Taipei: 4× as much')}
				</Line>
				<Note at={60} y={1420}>
					{t('一年降雪量；青森：日本氣象廳 1991–2020 年平均', 'Snowfall per year; Aomori: JMA 1991–2020 average')}
				</Note>
			</Exit>
		</AbsoluteFill>
	);
};

const FULL2 = [SNOW_V[0] * CH.ks, SNOW_V[1] * CH.ks];
export const Record: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('record');
	const zoom = interpolate(f, [0, D], [1.03, 1.06], clamp);
	const s: ChartState = {
		h: [...FULL2, grow(f, 10, 76, SNOW_V[2] * CH.ks)],
		o: [1, 1, 1],
		wet: 0,
		grid: 1,
		val: [1, 1, interpolate(f, [70, 80], [0, 1], clamp)],
	};
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 70%'}}>
				<Chart s={s} />
			</AbsoluteFill>
			<Exit len={D}>
				<Kicker at={0} y={230}>
					{t('世界紀錄', 'WORLD RECORD')}
				</Kicker>
				<Line at={8} y={290} size={t(60, 52)} weight={700}>
					{t('美國貝克山滑雪場，1998–99 一季', 'Mt. Baker Ski Area, USA,\n1998–99 season')}
				</Line>
				<Line at={120} y={t(390, 440)} size={t(108, 92)} weight={900}>
					{t('台北達紀錄的 8 成', 'Taipei: 80% of it')}
				</Line>
				<Note at={60} y={1420}>
					{t('NOAA 認證：1,140 英吋 ≈ 29 公尺', 'Verified by NOAA: 1,140 inches ≈ 29 m')}
				</Note>
			</Exit>
		</AbsoluteFill>
	);
};

export const Twist: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('twist');
	const m = interpolate(f, [10, 56], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const zoom = interpolate(f, [0, D], [1.06, 1.0], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const s: ChartState = {
		h: [FULL2[0] + (WATER_V[0] * CH.kw - FULL2[0]) * m, FULL2[1] + (WATER_V[1] * CH.kw - FULL2[1]) * m, SNOW_V[2] * CH.ks * (1 - m)],
		o: [1, 1, 1 - m],
		wet: m,
		grid: 1 - m,
		val: [1, 1, 1],
		xs: [CH.xs[0] + 80 * m, CH.xs[1] + 210 * m, CH.xs[2] + 200 * m],
	};
	const tIn = useIn(104);
	const temps = [
		{x: s.xs![0], v: '10.7°C', c: ICE},
		{x: s.xs![1], v: '23.3°C', c: C.amber},
	];
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 70%'}}>
				<Chart s={s} />
				{temps.map((p, i) => (
					<div key={i} style={{position: 'absolute', left: p.x - 82, width: 164, top: CH.base - s.h[i] + 24, padding: '8px 0 10px', borderRadius: 16, background: 'rgba(6,10,22,0.62)', textAlign: 'center', opacity: tIn, transform: `translateY(${(1 - tIn) * 14}px)`}}>
						<div style={{fontFamily: t(SANS, SANS_EN), fontWeight: 700, fontSize: 32, color: '#DCE8FF'}}>{t('年均溫', 'Avg temp')}</div>
						<div style={{fontFamily: NUM, fontWeight: 900, fontSize: 46, color: p.c}}>{p.v}</div>
					</div>
				))}
			</AbsoluteFill>
			<Exit len={D}>
				<Kicker at={0} y={230}>
					{t('換算成一年的降水（雨＋雪）', 'A YEAR OF RAIN + SNOW, AS WATER')}
				</Kicker>
				<Line at={62} y={290} size={t(64, 56)} weight={700}>
					{t('台北其實比青森多 7 成', 'Taipei actually gets\n70% more than Aomori')}
				</Line>
				<Line at={128} y={t(400, 450)} size={t(124, 104)} weight={900} color={ICE}>
					{t('缺的只是冷', 'It just lacks cold')}
				</Line>
				<Note at={70} y={1420}>
					{t('日本氣象廳、中央氣象署 1991–2020 年平均', 'JMA and CWA, 1991–2020 averages')}
				</Note>
			</Exit>
		</AbsoluteFill>
	);
};

// ---------- 8. ending: back to the rainy street, now buried to floor 8; then it melts back into frame 0 ----------
export const End: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('end');
	const g = from('end') + f;
	const up = interpolate(f, [0, END_UP], [0, SNOW_M], {...clamp, easing: Easing.out(Easing.cubic)});
	const melt = interpolate(f, [END_MELT, D - 6], [1, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const snow = up * melt;
	const rain = interpolate(f, [END_MELT + 6, D - 6], [0, 1], clamp);
	const flakes = interpolate(f, [0, 8, END_MELT, END_MELT + 20], [0, 1, 1, 0], clamp);
	const textO = useOut(D - 6, 24);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: useIn(0, 30)}}>
				<City cam={WIDE} snow={snow} />
			</AbsoluteFill>
			<Flakes g={g} o={flakes} speed={0.8} />
			<Rain g={g} o={rain} />
			<AbsoluteFill style={{opacity: textO}}>
				<Line at={END_PAY - 4} y={590} size={t(112, 104)} weight={900} lift={24}>
					{t('23 公尺的雪', '23 m of snow')}
				</Line>
				<Line at={END_PAY + 4} y={t(735, 725)} size={t(128, 110)} weight={900} lift={24}>
					{t('淹到 ', 'up to ')}
					<span style={{color: C.amber}}>{t('8 樓', 'floor 8')}</span>
				</Line>
				<div style={{position: 'absolute', left: 60, right: 60, top: 1290, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontSize: 32, lineHeight: 1.6, color: '#3E4A5E', opacity: useIn(END_PAY + 34) * interpolate(f, [END_MELT - 4, END_MELT + 8], [1, 0], clamp)}}>
					{t('資料：中央氣象署、日本氣象廳、NOAA', 'Data: CWA (Taiwan), JMA (Japan), NOAA')}
					<br />
					{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

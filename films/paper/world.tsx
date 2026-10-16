import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Globe} from '../../engine/kit/globe';
import {clamp, Line} from '../../engine/kit/kit';
import {C, NUM, SANS} from '../../engine/kit/theme';
import {foldsAt, T, thick, THICK0} from './timeline';

export const GROUND_Y = 1500;
export const TOP_Y = 640; // where the camera keeps the top of the stack
const SX = 330; // stack centre x
const SW = 130; // stack width (stylised, not to scale)
const DEPTH = 22; // iso depth of the stack's top/side faces

const smooth = (a: number, b: number, x: number) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k);
const rgb = (c: number[]) => `rgb(${c.map((v) => Math.round(v)).join(',')})`;

// twilight sky by log10(altitude in m)
const SKY: [number, string][] = [
	[1, '#E8A070'],
	[2.4, '#A87A8C'],
	[3.4, '#4A5C94'],
	[4.3, '#1C2B5E'],
	[5.0, '#0A1028'],
	[5.6, '#04050A'],
];
const skyAt = (alt: number) => {
	const l = Math.log10(Math.max(alt, 10));
	for (let i = 0; i < SKY.length - 1; i++) {
		const [a, ca] = SKY[i];
		const [b, cb] = SKY[i + 1];
		if (l <= b) return mix(hex(ca), hex(cb), Math.max(0, (l - a) / (b - a)));
	}
	return hex(SKY[SKY.length - 1][1]);
};
const INDOOR = hex('#16181E');

/** Formats the thickness after `n` whole folds the way the HUD shows it. */
export const fmtThick = (n: number): [string, string] => {
	const m = thick(n);
	if (m < 0.01) return [(m * 1000).toFixed(1), '毫米'];
	if (m < 1) return [(m * 100).toFixed(m < 0.1 ? 2 : 1), '公分'];
	if (m < 1000) return [m < 10 ? m.toFixed(2) : Math.round(m).toLocaleString('en-US'), '公尺'];
	const km = m / 1000;
	return [km < 10 ? km.toFixed(2) : km < 100 ? km.toFixed(1) : Math.round(km).toLocaleString('en-US'), '公里'];
};

const Label: React.FC<{x: number; y: number; o: number; title: string; sub?: string; align?: 'left' | 'right'}> = ({x, y, o, title, sub, align = 'left'}) =>
	o <= 0.01 ? null : (
		<div
			style={{
				position: 'absolute',
				left: align === 'left' ? x : undefined,
				right: align === 'right' ? 1080 - x : undefined,
				top: y - 30,
				opacity: o,
				textAlign: align,
				fontFamily: SANS,
				color: '#E9EDF5',
				textShadow: '0 2px 12px rgba(0,0,0,0.6)',
				whiteSpace: 'nowrap',
			}}
		>
			<div style={{fontSize: 40, fontWeight: 700}}>{title}</div>
			{sub && <div style={{fontFamily: NUM, fontSize: 32, fontWeight: 600, color: '#AEB7C8'}}>{sub}</div>}
		</div>
	);

/** fade in/out by on-screen pixel size */
const vis = (px: number, lo: number, hi: number) => smooth(lo * 0.6, lo, px) * (1 - smooth(hi, hi * 1.6, px));

export const World: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / 30 + T.climb[0]; // global seconds
	const n = foldsAt(t);
	const nCam = foldsAt(t - 0.05);
	const scale = (GROUND_Y - TOP_Y) / thick(nCam); // px per metre
	const y = (alt: number) => GROUND_Y - alt * scale;
	const H = thick(n) * scale;
	const outdoor = smooth(14.6, 16.8, nCam);

	// sky gradient
	const stops = Array.from({length: 17}, (_, i) => {
		const yy = (1920 * i) / 16;
		const c = mix(INDOOR, skyAt(Math.abs(GROUND_Y - yy) / scale), outdoor);
		return <stop key={i} offset={i / 16} stopColor={rgb(c)} />;
	});
	const topAlt = GROUND_Y / scale;
	const stars = smooth(4.6, 5.4, Math.log10(topAlt)) * outdoor;

	// Earth
	const Rpx = Math.max(6.371e6 * scale, 95);
	const globeMix = 1 - smooth(520, 660, Rpx);
	const gSize = Math.round((2 * Rpx) / 0.84);

	// objects
	const person = 1.7 * scale;
	const t101 = 508 * scale;
	const ever = 8849 * scale;
	const plane = y(10500);
	const karman = y(1e5);
	const iss = y(4.1e5);
	const moonY = y(3.844e8);
	const moonR = Math.max(1.737e6 * scale, 40);
	const MX = SX + 290;

	// layer stripes (visible while a single sheet is ≥ 3 px)
	const L = THICK0 * scale;
	const stripeO = smooth(2.5, 7, L);
	const nLines = stripeO > 0 ? Math.min(800, Math.floor(H / L)) : 0;

	return (
		<AbsoluteFill>
			<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
				<defs>
					<linearGradient id="pp-sky" x1="0" y1="0" x2="0" y2={1920} gradientUnits="userSpaceOnUse">
						{stops}
					</linearGradient>
					<linearGradient id="pp-front" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="#F6F2EA" />
						<stop offset="1" stopColor="#E4DDCF" />
					</linearGradient>
					<radialGradient id="pp-earth" cx="0.4" cy="0.3" r="0.8">
						<stop offset="0" stopColor="#3D7BC8" />
						<stop offset="0.7" stopColor="#1B4C8C" />
						<stop offset="1" stopColor="#0C2A55" />
					</radialGradient>
					<radialGradient id="pp-moon" cx="0.38" cy="0.35" r="0.75">
						<stop offset="0" stopColor="#E6E4DE" />
						<stop offset="0.75" stopColor="#A9A69E" />
						<stop offset="1" stopColor="#6F6C66" />
					</radialGradient>
					<filter id="pp-glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="14" />
					</filter>
				</defs>
				<rect x={0} y={0} width={1080} height={1920} fill="url(#pp-sky)" />
				{stars > 0 &&
					STARS.map((s, i) => <circle key={i} cx={s[0]} cy={s[1]} r={s[2]} fill="#fff" opacity={s[3] * stars} />)}

				{/* ground: indoor floor → flat land → curved Earth */}
				{outdoor < 1 && <rect x={0} y={GROUND_Y} width={1080} height={420} fill="#24201B" opacity={1 - outdoor} />}
				{outdoor < 1 && <rect x={0} y={GROUND_Y} width={1080} height={4} fill="#4A4136" opacity={1 - outdoor} />}
				{outdoor > 0 &&
					(Rpx > 2e5 ? (
						<rect x={0} y={GROUND_Y} width={1080} height={420} fill="#121B17" opacity={outdoor} />
					) : (
						<g opacity={outdoor}>
							<circle cx={SX} cy={GROUND_Y + Rpx} r={Rpx + 10} fill="#6FA8FF" opacity={0.35} filter="url(#pp-glow)" />
							<circle cx={SX} cy={GROUND_Y + Rpx} r={Rpx} fill={Rpx > 3000 ? '#121B17' : 'url(#pp-earth)'} opacity={1 - globeMix} />
						</g>
					))}

				{/* Everest */}
				{vis(ever, 30, 1400) > 0 && (
					<g opacity={vis(ever, 30, 1400)} transform={`translate(${SX + 470} ${GROUND_Y}) scale(${ever})`}>
						<path d="M -1.25 0 L -0.7 -0.42 L -0.45 -0.55 L -0.12 -0.9 L 0 -1 L 0.14 -0.86 L 0.32 -0.68 L 0.6 -0.52 L 0.9 -0.3 L 1.4 0 Z" fill="#3A4256" />
						<path d="M -0.12 -0.9 L 0 -1 L 0.14 -0.86 L 0.22 -0.78 L 0.12 -0.8 L 0.04 -0.76 L -0.05 -0.81 L -0.2 -0.8 Z" fill="#E8ECF2" />
						<path d="M 0 -1 L 0.14 -0.86 L 0.32 -0.68 L 0.6 -0.52 L 0.9 -0.3 L 1.4 0 L 0.2 0 Z" fill="#000" opacity={0.18} />
					</g>
				)}
				{/* Taipei 101 */}
				{vis(t101, 30, 2400) > 0 && (
					<g opacity={vis(t101, 30, 2400)} transform={`translate(${SX + 250} ${GROUND_Y}) scale(${t101 / 508})`}>
						<path d={T101} fill="#2E3A55" />
						<path d={T101} fill="none" stroke="#7D8DB5" strokeWidth={508 / t101} opacity={0.6} />
					</g>
				)}
				{/* person */}
				{vis(person, 12, 2600) > 0 && (
					<g opacity={vis(person, 12, 2600)} transform={`translate(${SX + 190} ${GROUND_Y}) scale(${person / 100})`}>
						<circle cx={0} cy={-90} r={8} fill="#C9CFDA" />
						<path d={PERSON} fill="#C9CFDA" />
					</g>
				)}
				{/* airliner */}
				{plane > 560 && plane < 1460 && (
					<g opacity={vis(GROUND_Y - plane, 40, 900)} transform={`translate(${SX + 250} ${plane})`}>
						<path d="M -60 0 C -50 -9, 30 -9, 52 -4 C 60 -2, 60 2, 52 4 C 30 8, -50 8, -60 0 Z" fill="#E9EDF5" />
						<path d="M -8 0 L -30 26 L -16 26 L 14 2 Z M -50 -2 L -62 -22 L -54 -22 L -40 -4 Z" fill="#C8CFDC" />
					</g>
				)}
				{/* Kármán line */}
				{karman > 560 && karman < 1470 && (
					<line x1={0} x2={1080} y1={karman} y2={karman} stroke="#8FB4FF" strokeWidth={3} strokeDasharray="14 12" opacity={0.6 * vis(GROUND_Y - karman, 40, 1000)} />
				)}
				{/* ISS */}
				{iss > 560 && iss < 1470 && (
					<g opacity={vis(GROUND_Y - iss, 40, 1000)} transform={`translate(${SX + 400} ${iss})`}>
						<rect x={-50} y={-4} width={100} height={8} fill="#C9CFDA" />
						{[-44, -30, 30, 44].map((x) => (
							<rect key={x} x={x - 6} y={-34} width={12} height={68} fill="#3E6FB0" stroke="#9DB8E0" strokeWidth={2} />
						))}
						<rect x={-12} y={-12} width={24} height={24} rx={4} fill="#E9EDF5" />
					</g>
				)}
				{/* Moon */}
				{moonY > -200 && (
					<g>
						<circle cx={MX} cy={moonY} r={moonR * 1.5} fill="#fff" opacity={0.08} filter="url(#pp-glow)" />
						<circle cx={MX} cy={moonY} r={moonR} fill="url(#pp-moon)" />
						{[
							[-0.3, -0.2, 0.18],
							[0.25, 0.1, 0.13],
							[-0.05, 0.35, 0.1],
							[0.35, -0.35, 0.08],
						].map(([dx, dy, r], i) => (
							<circle key={i} cx={MX + dx * moonR} cy={moonY + dy * moonR} r={r * moonR} fill="#8E8B84" opacity={0.6} />
						))}
					</g>
				)}

				{/* the paper stack */}
				<g>
					<path d={`M ${SX + SW / 2} ${GROUND_Y - H} l ${DEPTH} ${-DEPTH * 0.6} l 0 ${H} l ${-DEPTH} ${DEPTH * 0.6} Z`} fill="#BDB4A3" />
					<rect x={SX - SW / 2} y={GROUND_Y - H} width={SW} height={H} fill="url(#pp-front)" />
					<path d={`M ${SX - SW / 2} ${GROUND_Y - H} l ${DEPTH} ${-DEPTH * 0.6} l ${SW} 0 l ${-DEPTH} ${DEPTH * 0.6} Z`} fill="#FFFDF8" />
					{nLines > 0 &&
						Array.from({length: nLines}, (_, i) => (
							<line key={i} x1={SX - SW / 2} x2={SX + SW / 2} y1={GROUND_Y - (i + 1) * L} y2={GROUND_Y - (i + 1) * L} stroke="#9C9486" strokeWidth={Math.min(2.5, L * 0.3)} opacity={stripeO} />
						))}
				</g>
			</svg>

			{globeMix > 0 && (
				<div style={{position: 'absolute', left: SX - gSize / 2, top: GROUND_Y + Rpx - gSize / 2, opacity: globeMix * outdoor}}>
					<Globe size={gSize} t={t} state={{rot: -0.3 + t * 0.05, tilt: 0.5, flat: 0, drain: 0, bands: 0, clouds: 1, equator: 0}} />
				</div>
			)}

			{/* labels */}
			<Label x={SX + 190 + person * 0.2 + 20} y={GROUND_Y - person * 0.75} o={vis(person, 60, 1300)} title="一個人" sub="≈ 1.7 m" />
			<Label x={SX + 250 + 40} y={GROUND_Y - t101 * 0.85} o={vis(t101, 120, 1200)} title="台北 101" sub="508 m" />
			<Label x={SX + 470 + 40} y={GROUND_Y - ever * 1.0 - 30} o={vis(ever, 140, 1100)} title="聖母峰" sub="8,849 m" />
			<Label x={SX + 190} y={plane - 105} o={plane > 560 && plane < 1460 ? vis(GROUND_Y - plane, 80, 900) : 0} title="客機" sub="≈ 10 km" />
			<Label x={1040} y={karman - 40} align="right" o={karman > 560 && karman < 1470 ? vis(GROUND_Y - karman, 80, 1000) : 0} title="太空的起點" sub="100 km" />
			<Label x={SX + 470} y={iss} o={iss > 560 && iss < 1470 ? vis(GROUND_Y - iss, 80, 1000) : 0} title="國際太空站" sub="≈ 400 km" />
			<Label x={MX + moonR + 24} y={moonY} o={moonY > 600 && moonY < 1450 ? interpolate(moonY, [600, 760], [0, 1], clamp) : 0} title="月球" sub="384,400 km" />
		</AbsoluteFill>
	);
};

// Taipei 101 silhouette in metres (x centred, y up = negative). 8 flared "pagoda" sections.
const T101 = (() => {
	const pts: string[] = [];
	const L: [number, number][] = [];
	const R: [number, number][] = [];
	const push = (y: number, w: number) => {
		L.push([-w / 2, -y]);
		R.push([w / 2, -y]);
	};
	push(0, 70);
	push(25, 70);
	push(25, 54);
	push(90, 46);
	for (let i = 0; i < 8; i++) {
		const y0 = 90 + i * 38;
		push(y0, 44);
		push(y0 + 36, 58);
		push(y0 + 38, 44);
	}
	push(394, 40);
	push(420, 30);
	push(440, 22);
	push(448, 8);
	push(505, 3);
	push(508, 0.5);
	pts.push(...L.map(([x, y]) => `${x},${y}`));
	pts.push(...R.reverse().map(([x, y]) => `${x},${y}`));
	return `M ${pts.join(' L ')} Z`;
})();

const PERSON =
	'M -14 -80 Q -17 -80 -17 -76 L -18 -48 Q -18 -45 -15 -45 L -13 -45 L -12 -4 Q -12 0 -8 0 L -3 0 L -1.5 -40 L 1.5 -40 L 3 0 L 8 0 Q 12 0 12 -4 L 13 -45 L 15 -45 Q 18 -45 18 -48 L 17 -76 Q 17 -80 14 -80 Z';

const STARS: [number, number, number, number][] = (() => {
	let x = 777;
	const rnd = () => (x = (x * 16807) % 2147483647) / 2147483647;
	return Array.from({length: 220}, () => [rnd() * 1080, rnd() * 1500, 0.6 + rnd() * rnd() * 2.2, 0.3 + rnd() * 0.6] as [number, number, number, number]);
})();

/** Top HUD: fold counter + thickness + per-milestone caption. */
export const Hud: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / 30 + T.climb[0];
	const n = foldsAt(t);
	const N = Math.floor(n + 0.5);
	const [val, unit] = fmtThick(N);
	const pulse = Math.max(0, 1 - Math.abs(n - Math.round(n)) * 6) * (n > 0.3 ? 1 : 0);
	const intro = interpolate(f, [0, 10], [0, 1], clamp);
	const fl = (t0: number) => Math.round((t0 - T.climb[0]) * 30);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,5,10,0.92) 0%, rgba(4,5,10,0.85) 22%, rgba(4,5,10,0.4) 29%, rgba(4,5,10,0) 33%)'}} />
			<div style={{position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', opacity: intro}}>
				<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 46, color: C.amber}}>第 </span>
				<span style={{fontFamily: NUM, fontWeight: 800, fontSize: 64, color: C.amber, fontVariantNumeric: 'tabular-nums'}}>{N}</span>
				<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 46, color: C.amber}}> 次對折</span>
			</div>
			<div style={{position: 'absolute', top: 278, left: 0, right: 0, textAlign: 'center', opacity: intro, transform: `scale(${1 + 0.05 * pulse})`}}>
				<span style={{fontFamily: NUM, fontWeight: 900, fontSize: 136, color: C.ink, letterSpacing: -3, fontVariantNumeric: 'tabular-nums'}}>{val}</span>
				<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.ink}}> {unit}</span>
			</div>
			<Line at={fl(12.0)} out={fl(15.0)} y={470} size={56} weight={700} color="#FFD9A8">
				差不多一個人高
			</Line>
			<Line at={fl(19.5)} out={fl(22.5)} y={470} size={56} weight={700} color="#FFD9A8">
				已經比台北 101 還高
			</Line>
			<Line at={fl(26.0)} out={fl(30.0)} y={470} size={56} weight={700} color="#FFD9A8">
				飛機和聖母峰，都在腳下
			</Line>
			<Line at={fl(33.5)} out={fl(37.5)} y={470} size={56} weight={700} color="#FFD9A8">
				穿過太空站的高度
			</Line>
			<Line at={fl(45.2)} out={fl(50.0)} y={470} size={64} weight={900} color="#FFD9A8">
				比月球還遠！
			</Line>
			<Line at={fl(46.4)} out={fl(50.0)} y={560} size={38} weight={400} color={C.dim}>
				地球到月球平均 384,400 公里
			</Line>
		</AbsoluteFill>
	);
};

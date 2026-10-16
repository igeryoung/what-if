import React from 'react';
import {Easing, interpolate} from 'remotion';
import {clamp} from '../../engine/kit/kit';
import {useT} from '../../engine/kit/lang';
import {NUM} from '../../engine/kit/theme';
import {darkAt, Phone, PhoneDefs, rng, SKY_LOW, SKY_TOP, waterAt} from './art';
import {clock, depthAt, scrollAt, SPLASH} from './timeline';

const io = Easing.inOut(Easing.cubic);
const ramp = (x: number, a: number, b: number) => interpolate(x, [a, b], [0, 1], {...clamp, easing: io});

// The hook's own clock. It plays 0→5 s in the hook, sits underwater (≥ 2.7) during the descent, and in the ending
// runs backwards 2.7→0 so the phone flies back out of the water to where frame 0 shows it.
export const hookTime = (sec: number) => {
	if (sec < 5) return sec;
	if (sec < 54.4) return 5;
	return interpolate(sec, [54.4, 55], [2.7, 0], {...clamp, easing: io});
};
const camOff = (hk: number) => interpolate(hk, [1.3, 2.7], [0, 1700], {...clamp, easing: io});
const SURFACE = 1420;
export const PHONE_Y = 1180;

const phoneHook = (hk: number) => {
	if (hk <= 0.45) return {y: PHONE_Y, rot: -18};
	if (hk <= SPLASH) {
		const p = (hk - 0.45) / (SPLASH - 0.45);
		return {y: PHONE_Y + 300 * p * p, rot: -18 + 10 * p};
	}
	return {
		y: interpolate(hk, [SPLASH, 2.7], [PHONE_Y + 300, PHONE_Y], {...clamp, easing: io}),
		rot: interpolate(hk, [SPLASH, 2.7], [-8, 0], {...clamp, easing: io}),
	};
};

const SNOW = (() => {
	const r = rng(21);
	return Array.from({length: 80}, () => {
		const k = 0.55 + 0.6 * r();
		return {x: r() * 1080, y: r() * 2200, k, rad: (1.2 + 3 * r()) * k, a: 0.12 + 0.35 * r()};
	});
})();
const DROPS = (() => {
	const r = rng(5);
	return Array.from({length: 16}, () => ({dx: (r() - 0.5) * 70, vx: (r() - 0.5) * 640, vy: 520 + r() * 520, rad: 4 + r() * 7}));
})();
const BUBBLES = (() => {
	const r = rng(9);
	return Array.from({length: 14}, (_, i) => ({born: SPLASH + i * 0.08, dx: (r() - 0.5) * 80, rise: 240 + r() * 260, rad: 5 + r() * 8, ph: r() * 6}));
})();
const STARS = (() => {
	const r = rng(61);
	return Array.from({length: 46}, () => ({x: 30 + r() * 1020, dy: 120 + r() * 1180, rad: 1.2 + r() * 2.4, a: 0.25 + r() * 0.5}));
})();
const PEBBLES = (() => {
	const r = rng(33);
	return Array.from({length: 22}, () => ({x: r() * 1080, dy: 30 + r() * 220, rx: 6 + r() * 16, ry: 3 + r() * 6}));
})();
const PUFF = (() => {
	const r = rng(44);
	return Array.from({length: 10}, () => ({dx: (r() - 0.5) * 160, sp: 90 + r() * 120, rad: 16 + r() * 22}));
})();

const floorY = (sec: number) => {
	if (sec < 40) return interpolate(sec, [32.5, 34], [2160, 1330], {...clamp, easing: Easing.out(Easing.quad)});
	return interpolate(sec, [53, 53.5], [1330, 2160], {...clamp, easing: io});
};
const tiltAt = (sec: number) => {
	if (sec < 40) return 9 * interpolate(sec, [34.05, 34.7], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
	return 9 * (1 - ramp(sec, 53, 53.3));
};

// Everything that persists across scenes, as a pure function of film time: water colour, the surface and splash,
// marine snow, the seabed, and the phone itself.
export const World: React.FC<{sec: number}> = ({sec}) => {
	const depth = depthAt(sec);
	const hk = hookTime(sec);
	const cam = camOff(hk);
	const surfaceY = SURFACE - cam;
	const under = interpolate(cam, [500, 1400], [0, 1], clamp);
	const ph = phoneHook(hk);
	const wob = ramp(sec, 2.2, 3.2) * (1 - ramp(sec, 33.4, 34));
	const rot = ph.rot + wob * (2.6 * Math.sin(sec * 1.7) + 1.3 * Math.sin(sec * 3.3));
	const dx = wob * 7 * Math.sin(sec * 1.1);
	const vis = 1 - ramp(sec, 25, 25.4) + ramp(sec, 32.1, 32.5);
	const dark = darkAt(depth);
	const signal = hk < SPLASH + 0.05 ? 1 : interpolate(hk, [SPLASH + 0.05, SPLASH + 0.3], [1, 0], clamp);
	const fy = floorY(sec);
	const tilt = tiltAt(sec);
	const scroll = scrollAt(sec);
	const tau = hk - SPLASH;
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
			<PhoneDefs />
			<defs>
				<linearGradient id="w-water" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={waterAt(depth)} />
					<stop offset="1" stopColor={waterAt(depth * 1.6 + 8)} />
				</linearGradient>
				<linearGradient id="w-sky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={SKY_TOP} />
					<stop offset="1" stopColor={SKY_LOW} />
				</linearGradient>
				<linearGradient id="w-band" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#2F8FCF" stopOpacity="0.9" />
					<stop offset="1" stopColor="#2F8FCF" stopOpacity="0" />
				</linearGradient>
				<linearGradient id="w-mud" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#3B342A" />
					<stop offset="1" stopColor="#14120E" />
				</linearGradient>
			</defs>
			<rect x={0} y={0} width={1080} height={1920} fill="url(#w-water)" />
			{surfaceY > -1000 && (
				<g>
					<rect x={0} y={surfaceY} width={1080} height={900} fill="url(#w-band)" opacity={1 - ramp(depth, 3, 40)} />
					<rect x={0} y={surfaceY - 2400} width={1080} height={2400} fill="url(#w-sky)" />
					{STARS.map((st, i) => (
						<circle key={i} cx={st.x} cy={surfaceY - st.dy} r={st.rad} fill="#F4F1EC" opacity={st.a} />
					))}
					<path
						d={`M0,${surfaceY} Q135,${surfaceY - 12} 270,${surfaceY} T540,${surfaceY} T810,${surfaceY} T1080,${surfaceY}`}
						fill="none"
						stroke="#9ED8FF"
						strokeWidth={5}
						strokeLinecap="round"
					/>
				</g>
			)}
			{SNOW.map((p, i) => {
				const y = ((((p.y - scroll * p.k + sec * 6 * p.k) % 2200) + 2200) % 2200) - 140;
				return <circle key={i} cx={p.x} cy={y} r={p.rad} fill="#DCEBF5" opacity={p.a * under} />;
			})}
			{tau > 0 &&
				tau < 1 &&
				DROPS.map((d, i) => {
					const y = surfaceY - d.vy * tau + 1100 * tau * tau;
					if (y > surfaceY + 6) return null;
					return <circle key={i} cx={540 + d.dx + d.vx * tau} cy={y} r={d.rad} fill="#CFEFFF" opacity={1 - tau} />;
				})}
			{tau > 0 &&
				tau < 1.5 &&
				[0, 1, 2].map((k) => {
					const tk = tau - k * 0.14;
					if (tk <= 0) return null;
					const rx = 70 + 520 * tk;
					return <ellipse key={k} cx={540} cy={surfaceY} rx={rx} ry={rx * 0.1} fill="none" stroke="#9ED8FF" strokeWidth={4} opacity={0.8 * Math.max(0, 1 - tk / 1.3)} />;
				})}
			{BUBBLES.map((b, i) => {
				const life = hk - b.born;
				if (life <= 0 || life > 1.8) return null;
				const wy = phoneHook(b.born).y + camOff(b.born) - 130 - life * b.rise;
				return (
					<circle key={i} cx={540 + b.dx + 8 * Math.sin(life * 6 + b.ph)} cy={wy - cam} r={b.rad} fill="none" stroke="#CFEFFF" strokeWidth={2.5} opacity={0.7 * (1 - life / 1.8)} />
				);
			})}
			{fy < 2000 && (
				<g>
					<path d={`M0,${fy + 14} Q270,${fy - 10} 540,${fy} Q810,${fy + 12} 1080,${fy - 6} L1080,1920 L0,1920 Z`} fill="url(#w-mud)" />
					{PEBBLES.map((p, i) => (
						<ellipse key={i} cx={p.x} cy={fy + p.dy} rx={p.rx} ry={p.ry} fill="#2A251E" />
					))}
					<ellipse cx={540} cy={fy + 16} rx={320} ry={56} fill="#FFB070" opacity={0.16 * dark} />
				</g>
			)}
			{sec > 34 &&
				sec < 36 &&
				PUFF.map((p, i) => {
					const tt = sec - 34;
					return <circle key={i} cx={540 + p.dx * (1 + tt)} cy={fy - 8 - p.sp * tt * 0.4} r={p.rad + p.sp * tt * 0.5} fill="#6A6052" opacity={0.4 * Math.max(0, 1 - tt / 2)} />;
				})}
			<g opacity={vis}>
				<g transform={`translate(540, ${PHONE_Y + 150}) rotate(${tilt}) translate(0, -150)`}>
					<ellipse cx={dx} cy={ph.y - PHONE_Y} rx={340} ry={470} fill="url(#ph-glow)" opacity={dark} />
					<g transform={`translate(${dx}, ${ph.y - PHONE_Y}) rotate(${rot})`}>
						<Phone signal={signal} />
					</g>
				</g>
			</g>
		</svg>
	);
};

// Depth and the time the phone has been sinking. Appears at the splash, rewinds to zero in the ending, then leaves.
export const Hud: React.FC<{sec: number}> = ({sec}) => {
	const t = useT();
	const depth = depthAt(sec);
	const o = ramp(sec, SPLASH, SPLASH + 0.3) * (1 - ramp(sec, 54.4, 54.9));
	if (o <= 0) return null;
	const col = (label: string, value: string) => (
		<div style={{width: 330, textAlign: 'center'}}>
			<div style={{fontFamily: NUM, fontWeight: 700, fontSize: 32, letterSpacing: 4, color: '#9FB3C8'}}>{label}</div>
			<div style={{fontFamily: NUM, fontWeight: 800, fontSize: 60, color: '#F4F1EC', fontVariantNumeric: 'tabular-nums', letterSpacing: -1}}>{value}</div>
		</div>
	);
	return (
		<div style={{position: 'absolute', top: 196, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 60, opacity: o}}>
			{col(t('深度', 'DEPTH'), `${Math.round(depth).toLocaleString('en-US')} m`)}
			{col(t('下沉時間', 'TIME'), clock(depth))}
		</div>
	);
};

import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Line, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {Bed, FLOOR, HookArt, PERSON_H, R, ROACH_SMALL, ROACH_X, RoachSide, RoachTop, Runner} from './art';
import {dur, K} from './timeline';

// Fades the whole scene out over its last `fade` frames.
const Exit: React.FC<{len: number; fade?: number; children: React.ReactNode}> = ({len, fade = 10, children}) => (
	<AbsoluteFill style={{opacity: useOut(len, fade)}}>{children}</AbsoluteFill>
);
const Kicker: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => (
	<Line at={at} y={y} size={40} weight={700} color={C.amber} tracking={6} lift={14}>
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
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
		{children}
	</svg>
);
// Pops a block in with a spring (scale + fade), centred at `y`.
const Pop: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: f - at, fps, config: {damping: 12, mass: 0.6, stiffness: 180}});
	return (
		<div style={{position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', lineHeight: 1, opacity: Math.min(1, p * 1.4), transform: `scale(${1.25 - 0.25 * p})`}}>
			{children}
		</div>
	);
};

// ---------- 1. Hook: the roach on the wall grows to the person's height ----------
export const Hook: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const g = spring({frame: f - 10, fps, config: {damping: 13, mass: 0.9, stiffness: 80}});
	const mark = useIn(48);
	const top = FLOOR - PERSON_H;
	return (
		<Exit len={dur('hook')}>
			<HookArt grow={g} f={f} />
			<Svg>
				<g opacity={mark}>
					<path d={`M220 ${top} H${ROACH_X + 40}`} stroke={C.amber} strokeWidth={3} strokeDasharray="12 10" />
				</g>
			</Svg>
			<Line at={52} y={top - 70} size={40} weight={700} color={C.amber} align="left" x={70} lift={12}>
				{t('1.7 公尺', '1.7 m')}
			</Line>
			<Line at={2} y={250} size={t(76, 62)} weight={700}>
				{t('如果蟑螂跟人一樣大，', 'If a cockroach were your size,')}
			</Line>
			<Line at={30} y={t(370, 356)} size={t(116, 92)} weight={900} color={C.amber}>
				{t('你跑得掉嗎？', 'could you outrun it?')}
			</Line>
		</Exit>
	);
};

// ---------- 2. The real thing: 4 cm, 1.5 m/s ----------
export const Real: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('real');
	const DASH = 90; // on the beat (9.0 s)
	const len = 560;
	const x0 = 260;
	const dash = interpolate(f, [DASH, DASH + 5], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const rx = 540 + dash * 1500;
	const streak = interpolate(f, [DASH, DASH + 3, DASH + 26], [0, 1, 0], clamp);
	const zoom = interpolate(f, [0, D], [1, 1.05], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const ticks = [];
	for (let mm = 0; mm <= 40; mm++) {
		const x = x0 + (mm / 40) * len;
		const big = mm % 10 === 0;
		ticks.push(<path key={mm} d={`M${x} 1000 V${1000 + (big ? 34 : mm % 5 === 0 ? 22 : 12)}`} stroke={big ? C.ink : C.dim} strokeWidth={big ? 3 : 2} />);
	}
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`}}>
				<Kicker at={0} y={290}>
					{t('現實中的美洲蟑螂', 'A REAL AMERICAN COCKROACH')}
				</Kicker>
				<Svg>
					<g opacity={streak} stroke={R.rim} strokeLinecap="round">
						{[650, 720, 790].map((y, i) => (
							<path key={y} d={`M${200 + i * 60} ${y} H1080`} strokeWidth={6 - i} opacity={0.7 - i * 0.15} />
						))}
					</g>
					<g opacity={0.14 * dash}>
						<RoachTop x={540} y={720} len={len} rot={90} amp={0} />
					</g>
					<RoachTop x={rx} y={720} len={len} rot={90} phase={f < DASH ? f / 26 : f / 3} amp={f < DASH ? 0.08 : 0.3} sway={5 * Math.sin(f / 7)} />
					<g opacity={useIn(14)}>
						<path d={`M${x0 - 20} 1000 H${x0 + len + 20}`} stroke={C.dim} strokeWidth={2} />
						{ticks}
						{[0, 1, 2, 3, 4].map((cm) => (
							<text key={cm} x={x0 + (cm / 4) * len} y={1074} fill={C.dim} fontFamily={NUM} fontWeight={700} fontSize={30} textAnchor="middle">
								{cm}
							</text>
						))}
						<text x={x0 + len + 34} y={1074} fill={C.dim} fontFamily={NUM} fontWeight={700} fontSize={30}>
							cm
						</text>
					</g>
				</Svg>
				<Line at={24} y={1110} size={t(56, 52)} weight={700}>
					{t('身長約 4 公分', 'About 4 cm long')}
				</Line>
				<Pop at={DASH + 14} y={1215}>
					{t(
						<>
							<Z size={64}>每秒 </Z>
							<N size={150} color={C.amber}>1.5</N>
							<Z size={64}> 公尺</Z>
						</>,
						<>
							<N size={150} color={C.amber}>1.5</N>
							<Z size={60}> m per second</Z>
						</>,
					)}
				</Pop>
				<Line at={DASH + 50} y={1400} size={t(48, 44)} weight={700} color={C.dim}>
					{t('＝時速 5.4 公里，跟人走路差不多', '= 5.4 km/h, about human walking pace')}
				</Line>
			</AbsoluteFill>
		</Exit>
	);
};

// ---------- 3. Scale it up: ×42.5 → 230 km/h ----------
const DIAL = {cx: 540, cy: 900, r: 270, max: 300, a0: 150, sweep: 240};
const ang = (v: number) => ((DIAL.a0 + (v / DIAL.max) * DIAL.sweep) * Math.PI) / 180;
const onDial = (v: number, r: number): [number, number] => [DIAL.cx + r * Math.cos(ang(v)), DIAL.cy + r * Math.sin(ang(v))];
const arc = (v0: number, v1: number, r: number) => {
	const [x0, y0] = onDial(v0, r);
	const [x1, y1] = onDial(v1, r);
	const large = ((v1 - v0) / DIAL.max) * DIAL.sweep > 180 ? 1 : 0;
	return `M${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
};

export const Scale: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('scale');
	const S0 = 90; // needle starts (17.0 s)
	const S1 = 180; // needle lands on the bar line (20.0 s)
	const v = interpolate(f, [S0, S1], [0, 229.5], {...clamp, easing: Easing.out(Easing.cubic)});
	const dialIn = useIn(70);
	const zoom = interpolate(f, [0, D], [1, 1.04], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const shake = f >= S1 && f < S1 + 10 ? Math.sin(f * 2.3) * (S1 + 10 - f) * 0.8 : 0;
	const [nx, ny] = onDial(v, DIAL.r - 40);
	const [bx, by] = onDial(44.7, DIAL.r + 20);
	const [blx, bly] = onDial(44.7, DIAL.r + 64);
	const ticks = [];
	for (let k = 0; k <= 300; k += 20) {
		const [x0, y0] = onDial(k, DIAL.r - (k % 100 === 0 ? 34 : 18));
		const [x1, y1] = onDial(k, DIAL.r);
		ticks.push(<path key={k} d={`M${x0} ${y0} L${x1} ${y1}`} stroke={k % 100 === 0 ? C.ink : C.dim} strokeWidth={k % 100 === 0 ? 5 : 3} />);
	}
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom}) translateX(${shake}px)`}}>
				<Kicker at={0} y={220}>
					{t('照比例放大', 'SCALE IT UP')}
				</Kicker>
				<Line at={10} y={290} size={t(64, 60)} weight={700}>
					{t('4 公分 → 1.7 公尺', '4 cm → 1.7 m')}
				</Line>
				<Line at={28} y={375} size={t(96, 92)} weight={900} color={C.amber}>
					{t('放大 42.5 倍', '42.5× bigger')}
				</Line>
				<Line at={60} y={505} size={t(52, 48)} weight={700} color={C.dim}>
					{t('速度也 × 42.5', 'Its speed × 42.5 too')}
				</Line>
				<Svg>
					<g opacity={dialIn}>
						<path d={arc(0, 300, DIAL.r)} stroke={C.faint} strokeWidth={22} fill="none" strokeLinecap="round" />
						{v > 0.5 && <path d={arc(0, v, DIAL.r)} stroke={C.amber} strokeWidth={22} fill="none" strokeLinecap="round" />}
						{ticks}
						{[0, 100, 200, 300].map((k) => {
							const [x, y] = onDial(k, DIAL.r - 78);
							return (
								<text key={k} x={x} y={y + 12} fill={C.dim} fontFamily={NUM} fontWeight={700} fontSize={34} textAnchor="middle">
									{k}
								</text>
							);
						})}
						<circle cx={bx} cy={by} r={9} fill={C.ink} />
						<text x={blx - 18} y={bly + 12} fill={C.ink} fontFamily={t(SANS, SANS_EN)} fontWeight={700} fontSize={32} textAnchor="end">
							{t('博爾特 44.7', 'Bolt 44.7')}
						</text>
						<path d={`M${DIAL.cx} ${DIAL.cy} L${nx} ${ny}`} stroke={C.red} strokeWidth={10} strokeLinecap="round" />
						<circle cx={DIAL.cx} cy={DIAL.cy} r={18} fill={C.red} />
					</g>
				</Svg>
				<div style={{position: 'absolute', top: DIAL.cy + 150, left: 0, right: 0, textAlign: 'center', lineHeight: 1, opacity: dialIn}}>
					<N size={170} color={C.amber}>
						{Math.round(v)}
					</N>
					<div style={{marginTop: 10}}>
						<Z size={44} weight={700} color={C.dim}>
							{t('公里／小時', 'km/h')}
						</Z>
					</div>
				</div>
				<Line at={S1 + 30} y={1330} size={t(72, 64)} weight={900}>
					{t('博爾特極速的 5 倍', "5× Usain Bolt's top speed")}
				</Line>
				<Note at={S1 + 50} y={1440}>
					{t('＊1.5 公尺/秒 × 42.5 ≈ 64 公尺/秒，純照比例換算', '*1.5 m/s × 42.5 ≈ 64 m/s, by simple scaling')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ---------- 4. The 100 m: 1.57 s vs 9.58 s ----------
const TRACK = {x0: 110, x1: 950, top: 540, sep: 700, bot: 920};
const mx = (m: number) => TRACK.x0 + (m / 100) * (TRACK.x1 - TRACK.x0);
// Bolt's distance (m) t s after the gun, up to ~2 s: 0.146 s reaction, then accelerating; ≈8 m at 1.57 s
// (official 10 m split 1.89 s; a 2023 model puts 10 m at 1.46 s after he starts moving).
const boltM = (ts: number) => (ts < 0.146 ? 0 : 8 * Math.pow((ts - 0.146) / 1.424, 1.7));

export const Race: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('race');
	const GO = 30; // the gun, on the beat (25.0 s)
	const RUN = 100 / (1.5 * K); // 1.57 s
	const ts = Math.max(0, (f - GO) / 30);
	const clock = Math.min(ts, RUN);
	const done = ts >= RUN;
	const rm = (ts / RUN) * 100;
	const bm = boltM(Math.min(ts, RUN));
	const trackIn = useIn(4);
	const tenIn = useIn(GO + 60);
	const zoom = interpolate(f, [0, D], [1, 1.04], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const streak = interpolate(f, [GO, GO + 6, GO + 60], [0, 1, 0], clamp);
	const markers = [];
	for (let m = 0; m <= 100; m += 10) {
		markers.push(<path key={m} d={`M${mx(m)} ${TRACK.bot} V${TRACK.bot + (m % 50 === 0 ? 30 : 16)}`} stroke={m % 50 === 0 ? C.ink : C.dim} strokeWidth={3} />);
	}
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`}}>
				<Kicker at={0} y={240}>
					{t('百米賽跑', '100 M DASH')}
				</Kicker>
				<Line at={8} y={310} size={t(60, 54)} weight={700}>
					{t('巨型蟑螂 vs 博爾特', 'Giant roach vs. Usain Bolt')}
				</Line>
				<Svg>
					<g opacity={trackIn}>
						<rect x={0} y={TRACK.top} width={1080} height={TRACK.bot - TRACK.top} fill="#1A1416" />
						{[TRACK.top, TRACK.sep, TRACK.bot].map((y) => (
							<path key={y} d={`M0 ${y} H1080`} stroke="#3A3036" strokeWidth={3} />
						))}
						<path d={`M${mx(0)} ${TRACK.top} V${TRACK.bot}`} stroke={C.ink} strokeWidth={5} />
						<path d={`M${mx(100)} ${TRACK.top} V${TRACK.bot}`} stroke={C.ink} strokeWidth={5} strokeDasharray="14 10" />
						{markers}
						{[0, 50, 100].map((m) => (
							<text key={m} x={mx(m)} y={TRACK.bot + 70} fill={C.dim} fontFamily={NUM} fontWeight={700} fontSize={32} textAnchor="middle">
								{m === 100 ? '100 m' : m}
							</text>
						))}
					</g>
					<g opacity={tenIn}>
						<path d={`M${mx(10)} ${TRACK.top} V${TRACK.bot}`} stroke={C.amber} strokeWidth={4} strokeDasharray="10 10" />
						<text x={mx(10) + 14} y={TRACK.top - 14} fill={C.amber} fontFamily={NUM} fontWeight={800} fontSize={34}>
							10 m
						</text>
					</g>
					<g opacity={streak} stroke={R.rim} strokeLinecap="round">
						{[-22, 0, 22].map((d, i) => (
							<path key={d} d={`M${mx(0)} ${636 + d} H${Math.min(mx(rm), 1080)}`} strokeWidth={4 - i} opacity={0.6} />
						))}
					</g>
					{rm < 115 && <RoachSide x={mx(Math.min(rm, 115)) - 55} y={TRACK.sep - 18} len={130} phase={f < GO ? 0 : f / 2.2} pitch={f < GO ? 0 : 26} sway={2 * Math.sin(f / 5)} />}
					<Runner x={mx(bm) - 10} y={TRACK.bot - 14} h={140} phase={f < GO ? 0 : ts * 2.1} />
					<text x={mx(bm) + 4} y={TRACK.bot - 172} fill={C.dim} fontFamily={t(SANS, SANS_EN)} fontWeight={700} fontSize={32} textAnchor="middle">
						{t('博爾特', 'Bolt')}
					</text>
				</Svg>
				<div style={{position: 'absolute', top: 1040, left: 0, right: 0, textAlign: 'center', lineHeight: 1, opacity: useIn(GO - 10)}}>
					<N size={170} color={done ? C.amber : C.ink}>
						{clock.toFixed(2)}
					</N>
					<Z size={t(80, 72)} color={done ? C.amber : C.ink}>
						{t(' 秒', ' s')}
					</Z>
				</div>
				<Line at={GO + 70} y={1240} size={t(52, 48)} weight={700} color={C.dim}>
					{t('博爾特的世界紀錄：9.58 秒', "Bolt's world record: 9.58 s")}
				</Line>
				<Line at={GO + 120} y={1330} size={t(60, 52)} weight={900}>
					{t('牠衝線時，博爾特\n還沒跑到 10 公尺', "When it crosses the line,\nBolt hasn't reached 10 m")}
				</Line>
			</AbsoluteFill>
		</Exit>
	);
};

// ---------- 5. Hide under the bed? 3 mm → 13 cm ----------
export const Hide: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('hide');
	const px = 612 / 170; // 1.7 m roach = 612 px
	const floor = 1220;
	const gap = 12.75 * px;
	const sq = spring({frame: f - 66, fps, config: {damping: 16, mass: 0.8, stiffness: 120}});
	const slide = interpolate(f, [96, 180], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const x = 830 - slide * 590;
	const zoom = interpolate(f, [0, D], [1.04, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const dimIn = useIn(40);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`}}>
				<Line at={0} y={240} size={t(104, 92)} weight={900}>
					{t('躲到床底下？', 'Hide under the bed?')}
				</Line>
				<Line at={26} y={t(390, 370)} size={t(52, 46)} weight={700} color={C.dim}>
					{t('真蟑螂能把身體壓扁，\n鑽過 3 毫米的縫', 'A real roach can flatten itself\nthrough a 3 mm gap')}
				</Line>
				<Svg>
					<rect x={0} y={floor} width={1080} height={300} fill="#121318" />
					<path d={`M0 ${floor} H1080`} stroke="#2A2D34" strokeWidth={3} />
					<RoachSide x={x} y={floor} len={612} phase={slide > 0 && slide < 1 ? f / 5 : f / 40} stride={slide > 0 && slide < 1 ? 7 : 1} squash={sq} sway={4 * Math.sin(f / 8)} flip />
					<Bed x={-120} y={floor} w={700} gap={gap} k={px} />
					<g opacity={dimIn}>
						<path d={`M640 ${floor - gap} V${floor}`} stroke={C.amber} strokeWidth={4} />
						<path d={`M590 ${floor - gap} H652 M628 ${floor} H652`} stroke={C.amber} strokeWidth={4} />
						<text x={668} y={floor - gap / 2 + 14} fill={C.amber} fontFamily={NUM} fontWeight={800} fontSize={40}>
							{t('13 公分', '13 cm')}
						</text>
					</g>
				</Svg>
				<Line at={150} y={1310} size={t(72, 60)} weight={900} color={C.amber}>
					{t('放大後，13 公分就鑽得進去', 'Scaled up, 13 cm is enough')}
				</Line>
				<Note at={170} y={1420}>
					{t('3 毫米 × 42.5 ≈ 13 公分', '3 mm × 42.5 ≈ 13 cm')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ---------- 6. Twist: at full speed it rears up and runs on two legs ----------
export const Twist: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('twist');
	const ground = 1150;
	const rear = spring({frame: f - 70, fps, config: {damping: 11, mass: 0.9, stiffness: 90}});
	const speed = interpolate(f, [0, 70, 110], [0.07, 0.12, 0.2], clamp);
	// integrate the gait phase so the legs speed up smoothly
	let phase = 0;
	for (let i = 0; i < f; i++) phase += interpolate(i, [0, 70, 110], [0.07, 0.12, 0.2], clamp);
	const scroll = (f * (14 + 30 * speed * 5)) % 160;
	const zoom = interpolate(f, [0, D], [1, 1.07], {...clamp, easing: Easing.inOut(Easing.cubic)});
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 60%'}}>
				<Kicker at={0} y={250}>
					{t('最可怕的是', 'THE WORST PART')}
				</Kicker>
				<Line at={10} y={320} size={t(64, 60)} weight={700}>
					{t('牠跑最快的時候……', 'At top speed…')}
				</Line>
				<Svg>
					<rect x={0} y={ground} width={1080} height={400} fill="#121318" />
					<path d={`M0 ${ground} H1080`} stroke="#2A2D34" strokeWidth={3} />
					<g stroke="#2E3139" strokeWidth={4}>
						{Array.from({length: 9}, (_, i) => {
							const xx = 1100 - ((i * 160 + scroll) % 1280);
							return <path key={i} d={`M${xx} ${ground + 30} H${xx + 70}`} />;
						})}
					</g>
					<g opacity={interpolate(f, [60, 90], [0, 0.8], clamp)} stroke={R.rim} strokeLinecap="round">
						{[560, 660, 760, 860].map((y, i) => {
							const l = 120 + ((f * 37 + i * 90) % 260);
							return <path key={y} d={`M${60 + ((f * 23 + i * 140) % 120)} ${y} h${l}`} strokeWidth={3} opacity={0.5} />;
						})}
					</g>
					<RoachSide x={520} y={ground} len={600} phase={phase} pitch={34 * rear} sway={5 * Math.sin(f / 4)} stride={10} />
				</Svg>
				<Line at={120} y={1230} size={t(104, 92)} weight={900} color={C.amber}>
					{t('牠會站起來', 'It rears up')}
				</Line>
				<Line at={150} y={1360} size={t(84, 68)} weight={900}>
					{t('用兩條後腿跑', 'and runs on two legs')}
				</Line>
				<Note at={190} y={430}>
					{t('Full & Tu, 1991：美洲蟑螂最快時改用後腿奔跑', 'Full & Tu, 1991: at top speed it switches to its hind legs')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ---------- 7. Ending: back to the wall. You can't outrun it — luckily it's 4 cm. ----------
export const End: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('end');
	const SHRINK = 66;
	const shrink = spring({frame: f - SHRINK, fps, config: {damping: 15, mass: 0.8, stiffness: 110}});
	const grow = Math.max(0, 1 - shrink);
	const textOut = useOut(D - 6, 22);
	const ring = useIn(SHRINK + 28);
	const ry = FLOOR - 4 - 0.54 * ROACH_SMALL;
	return (
		<AbsoluteFill>
			{/* hard cut back to the opening image on the cadence hit */}
			<HookArt grow={grow} f={f} />
			<AbsoluteFill style={{opacity: textOut}}>
				<Svg>
					<g opacity={ring}>
						<circle cx={ROACH_X} cy={ry} r={30 + (1 - ring) * 30} stroke={C.amber} strokeWidth={4} fill="none" />
						<path d={`M${ROACH_X} ${ry - 36} V${ry - 96}`} stroke={C.amber} strokeWidth={3} />
						<text x={ROACH_X} y={ry - 112} fill={C.amber} fontFamily={NUM} fontWeight={800} fontSize={44} textAnchor="middle">
							{t('4 公分', '4 cm')}
						</text>
					</g>
				</Svg>
				<Line at={6} y={540} size={t(120, 116)} weight={900} color={C.amber} lift={40}>
					{t('你跑不掉。', "You can't.")}
				</Line>
				<Line at={SHRINK + 40} y={700} size={t(96, 80)} weight={900}>
					{t('還好牠只有 4 公分。', "Luckily, it's only 4 cm.")}
				</Line>
				<div style={{position: 'absolute', left: 420, right: 70, top: 1010, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontSize: 32, lineHeight: 1.5, color: C.dim, opacity: useIn(SHRINK + 80)}}>
					{t('資料：Full & Tu 1991', 'Data: Full & Tu 1991;')}
					<br />
					{t('Jayaram & Full 2016', 'Jayaram & Full 2016')}
					<br />
					{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music: VSCO 2 CE, VCSL (CC0)')}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

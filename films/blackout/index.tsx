import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Line, Num, useIn, useOut} from '../../engine/kit/kit';
import {C, FPS, NUM, SANS, s} from '../../engine/kit/theme';
import {Battery, Card, Cash, Elevator, Fridge, Generator, Hospital, House, PowerBank, Tap, Torch, Tower, TrafficLight, Train, Water} from './icons';
import {NightGlobe} from './nightglobe';

// 100 BPM → bar = 2.4 s; every cut on a bar line (music/blackout.py uses the same table).
const T = {
	hook: [0, 4.8],
	zero: [4.8, 9.6],
	phone: [9.6, 14.4],
	money: [14.4, 19.2],
	fridge: [19.2, 24],
	water: [24, 28.8],
	hospital: [28.8, 33.6],
	co: [33.6, 38.4],
	restart: [38.4, 45.6],
	real: [45.6, 52.8],
	end: [52.8, 60],
} as const;
export const TOTAL = s(60);
const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);
const BLUE = '#5AB4FF';

// ── globe: lights + camera ────────────────────────────────────────────────────
const hash = (i: number, j: number) => {
	const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
	return x - Math.floor(x);
};
const smooth = (a: number, b: number, x: number) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};
const lightsAt = (t: number) => (lon: number, lat: number) => {
	if (t < 2.4) return 1;
	if (t < 4.8) {
		// a wave of darkness sweeps west → east, with flicker at the front
		const front = -180 + ((t - 2.4) / 2.0) * 400;
		const d = lon - front;
		if (d < -12) return 0;
		if (d > 0) return 1;
		return hash(Math.floor(lon / 3), Math.floor(t * 20)) > 0.5 ? 0.9 : 0.1;
	}
	if (t < 39.4) return 0;
	if (t < 46) {
		// restoration: islands come back first, then spread (black start)
		const frac = smooth(39.4, 45.4, t);
		const h = hash(Math.floor((lon + 180) / 9), Math.floor((lat + 90) / 9));
		return smooth(h - 0.08, h, frac * 1.08);
	}
	return 1;
};
const cam = (t: number) => {
	const k = [0, 4.4, 5.4, 38.0, 39.0, 45.2, 46.0, 52.4, 53.2, 60];
	const y = [1110, 1110, 1420, 1420, 1260, 1260, 1420, 1420, 1360, 1360];
	const z = [1120, 1120, 980, 980, 1120, 1120, 980, 980, 1040, 1040];
	const e = {easing: Easing.inOut(Easing.cubic), ...clamp};
	return {y: interpolate(t, k, y, e), size: Math.round(interpolate(t, k, z, e))};
};

// ── story clock (hours since the blackout) ───────────────────────────────────
const CLOCK: [number, number][] = [
	[0, 0],
	[4.8, 0],
	[9.6, 0],
	[10.4, 2],
	[19.2, 2],
	[20.0, 4],
	[24.0, 4],
	[24.8, 6],
	[28.8, 6],
	[29.6, 8],
	[33.6, 8],
	[34.4, 12],
	[38.4, 12],
	[39.4, 24],
];
const Clock: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const h = interpolate(t, CLOCK.map((c) => c[0]), CLOCK.map((c) => c[1]), {easing: Easing.inOut(Easing.quad), ...clamp});
	const mins = Math.round(h * 60);
	const txt = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
	const vis = interpolate(t, [4.8, 5.3, 45.2, 45.6], [0, 1, 1, 0], clamp);
	return (
		<div style={{position: 'absolute', top: 190, left: 0, right: 0, textAlign: 'center', opacity: vis}}>
			<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 8, color: C.dim}}>停電後</div>
			<div style={{fontFamily: NUM, fontWeight: 800, fontSize: 96, color: t > 39 ? C.green : C.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: 2}}>{txt}</div>
		</div>
	);
};

// ── shared pieces ────────────────────────────────────────────────────────────
const Exit: React.FC<{len: number; children: React.ReactNode}> = ({len, children}) => <AbsoluteFill style={{opacity: useOut(len, 10)}}>{children}</AbsoluteFill>;
const Head: React.FC<{at?: number; y?: number; size?: number; color?: string; children: React.ReactNode}> = ({at = 0, y = 380, size = 84, color, children}) => (
	<Line at={at} y={y} size={size} weight={900} color={color}>
		{children}
	</Line>
);
const Sub: React.FC<{at: number; y: number; color?: string; size?: number; children: React.ReactNode}> = ({at, y, color = C.dim, size = 44, children}) => (
	<Line at={at} y={y} size={size} weight={400} color={color} lift={16}>
		{children}
	</Line>
);
const Src: React.FC<{at: number; y?: number; children: React.ReactNode}> = ({at, y = 1010, children}) => (
	<Line at={at} y={y} size={28} weight={400} color="#9096A0" lift={8}>
		{children}
	</Line>
);
const Tile: React.FC<{at: number; x: number; y: number; w: number; label: string; children: React.ReactNode}> = ({at, x, y, w, label, children}) => {
	const p = useIn(at);
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: w,
				height: 270,
				borderRadius: 32,
				background: 'rgba(21,23,28,0.88)',
				border: `3px solid ${C.faint}`,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 14,
				opacity: p,
				transform: `translateY(${(1 - p) * 40}px)`,
			}}
		>
			{children}
			<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 42, color: C.ink}}>{label}</div>
		</div>
	);
};

// ── scenes ───────────────────────────────────────────────────────────────────
const Hook: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const hit = spring({frame: f - 74, fps, config: {damping: 12, stiffness: 200, mass: 0.6}});
	return (
		<Exit len={dur('hook')}>
			<Line at={4} y={260} size={56} weight={700} color={C.dim}>
				如果全世界
			</Line>
			<div style={{position: 'absolute', top: 340, left: 0, right: 0, textAlign: 'center', opacity: useIn(12)}}>
				<span style={{fontFamily: SANS, fontWeight: 900, fontSize: 104, color: C.ink}}>同時停電 </span>
				<span style={{display: 'inline-block', transform: `scale(${f >= 74 ? 1.25 - 0.25 * hit : 1})`}}>
					<Num size={130} color={f >= 74 ? C.amber : C.ink}>
						24
					</Num>
				</span>
				<span style={{fontFamily: SANS, fontWeight: 900, fontSize: 104, color: C.ink}}> 小時</span>
			</div>
		</Exit>
	);
};

const Zero: React.FC = () => (
	<Exit len={dur('zero')}>
		<Head at={6}>第一秒，城市就停住了</Head>
		<Tile at={14} x={60} y={540} w={300} label="紅綠燈全滅">
			<TrafficLight size={120} />
		</Tile>
		<Tile at={22} x={390} y={540} w={300} label="電梯卡住">
			<Elevator size={120} />
		</Tile>
		<Tile at={30} x={720} y={540} w={300} label="列車停在半路">
			<Train size={120} />
		</Tile>
		<Sub at={56} y={880} color={C.ink}>
			2025 西班牙大停電：救出約 35,000 名受困乘客
		</Sub>
		<Src at={60}>來源：2025 Iberian Peninsula blackout（Wikipedia）</Src>
	</Exit>
);

const Phone: React.FC = () => {
	const f = useCurrentFrame();
	const lvl = interpolate(f, [20, 110], [1, 0.04], {...clamp, easing: Easing.in(Easing.quad)});
	return (
		<Exit len={dur('phone')}>
			<Head at={4}>手機還有電，但沒訊號</Head>
			<div style={{position: 'absolute', top: 540, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 60, opacity: useIn(10)}}>
				<Tower size={170} signal={lvl > 0.3 ? 1 : lvl > 0.1 ? 0.6 : 0} />
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
					<Battery level={lvl} width={300} />
					<div style={{fontFamily: SANS, fontSize: 38, color: C.dim}}>基地台的備用電池</div>
				</div>
			</div>
			<Sub at={50} y={810} color={C.ink}>
				電池耗盡，訊號就斷
			</Sub>
			<Sub at={76} y={880}>
				西班牙停電當天，網路流量跌到平常的 17%
			</Sub>
			<Src at={80}>來源：NetBlocks 量測，見 2025 Iberian Peninsula blackout（Wikipedia）</Src>
		</Exit>
	);
};

const Money: React.FC = () => {
	const f = useCurrentFrame();
	const x = interpolate(f, [24, 40], [0, 1], clamp);
	return (
		<Exit len={dur('money')}>
			<Head at={4}>刷卡、ATM 全部失靈</Head>
			<div style={{position: 'absolute', top: 560, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 120}}>
				<div style={{opacity: useIn(10), textAlign: 'center'}}>
					<Card size={170} crossed={x} />
					<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.dim, marginTop: 12}}>刷卡・行動支付・ATM</div>
				</div>
				<div style={{opacity: useIn(44), textAlign: 'center'}}>
					<Cash size={170} />
					<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.green, marginTop: 12}}>只剩現金能用</div>
				</div>
			</div>
			<Src at={60}>來源：2025 Iberian Peninsula blackout（Wikipedia）</Src>
		</Exit>
	);
};

const FridgeScene: React.FC = () => (
	<Exit len={dur('fridge')}>
		<Head at={4}>冰箱開始倒數</Head>
		<div style={{position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 80, alignItems: 'center'}}>
			<div style={{opacity: useIn(10)}}>
				<Fridge size={220} />
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: 26}}>
				<div style={{opacity: useIn(18)}}>
					<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 42, color: C.dim}}>冷藏 </span>
					<Num size={110} color={C.amber}>
						4
					</Num>
					<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 42, color: C.ink}}> 小時</span>
				</div>
				<div style={{opacity: useIn(36)}}>
					<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 42, color: C.dim}}>冷凍（裝滿）</span>
					<Num size={110} color={BLUE}>
						48
					</Num>
					<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 42, color: C.ink}}> 小時</span>
				</div>
			</div>
		</div>
		<Sub at={60} y={880} color={C.ink}>
			前提是：門不要打開
		</Sub>
		<Src at={64}>來源：美國農業部 USDA 停電食品安全指引（WVU Extension 轉載）</Src>
	</Exit>
);

const WaterScene: React.FC = () => {
	const f = useCurrentFrame();
	const drop = ((f % 36) / 36) * (f > 30 ? 1 : 0);
	return (
		<Exit len={dur('water')}>
			<Head at={4}>水龍頭也可能沒水</Head>
			<div style={{position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: useIn(10)}}>
				<Tap size={220} drop={drop} />
			</div>
			<Sub at={30} y={790} color={C.ink}>
				自來水要靠抽水馬達加壓
			</Sub>
			<Sub at={56} y={860}>
				2003 美加大停電：底特律 400 萬用戶被要求把水煮沸再喝
			</Sub>
			<Src at={60}>來源：Northeast blackout of 2003（Wikipedia）</Src>
		</Exit>
	);
};

const HospitalScene: React.FC = () => (
	<Exit len={dur('hospital')}>
		<Head at={4}>醫院切換到發電機</Head>
		<div style={{position: 'absolute', top: 530, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 70, alignItems: 'center'}}>
			<div style={{opacity: useIn(10)}}>
				<Hospital size={200} />
			</div>
			<div style={{fontFamily: NUM, fontSize: 80, color: C.dim, opacity: useIn(18)}}>+</div>
			<div style={{opacity: useIn(24)}}>
				<Generator size={200} />
			</div>
		</div>
		<Sub at={44} y={810} color={C.ink}>
			能撐多久，看油還剩多少
		</Sub>
		<Sub at={64} y={880}>
			在家靠電的醫療設備，最危險
		</Sub>
		<Src at={68}>來源：2025 伊比利半島停電，葡萄牙一名長者因家用呼吸器停擺過世（Wikipedia）</Src>
	</Exit>
);

const CO: React.FC = () => {
	const f = useCurrentFrame();
	const x = interpolate(f, [26, 40], [0, 1], clamp);
	return (
		<Exit len={dur('co')}>
			<Head at={4} color={C.red}>
				發電機，千萬別放室內
			</Head>
			<div style={{position: 'absolute', top: 520, left: 540 - 130, width: 260, height: 260, opacity: useIn(10)}}>
				<House size={260} />
				<div style={{position: 'absolute', left: 70, top: 110}}>
					<Generator size={120} color={C.dim} />
				</div>
				<svg viewBox="0 0 100 100" width={260} height={260} style={{position: 'absolute', inset: 0}}>
					<path d="M12 12 L88 88 M88 12 L12 88" stroke={C.red} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - x} />
				</svg>
			</div>
			<Sub at={40} y={830} color={C.ink}>
				一氧化碳無色無味
			</Sub>
			<Sub at={60} y={900}>
				西班牙停電時，一家三口因此喪命
			</Sub>
			<Src at={64}>來源：2025 Iberian Peninsula blackout（Wikipedia，引西班牙媒體報導）</Src>
		</Exit>
	);
};

const Restart: React.FC = () => (
	<Exit len={dur('restart')}>
		<Head at={30} y={400} color={C.green}>
			電網不能一鍵重開
		</Head>
		<Sub at={50} y={520} color={C.ink} size={48}>
			要從能自己啟動的電廠，一區一區接回來
		</Sub>
		<div style={{position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center', opacity: useIn(110)}}>
			<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.dim}}>西班牙：中午 12:33 停電，隔天早上 </span>
			<Num size={72} color={C.green}>
				7
			</Num>
			<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.dim}}> 點才回到 99%</span>
		</div>
		<Src at={114}>來源：ENTSO-E 事故報告、2025 Iberian Peninsula blackout（Wikipedia）</Src>
	</Exit>
);

const Real: React.FC = () => {
	const rows: [string, string, string][] = [
		['2003', '美國・加拿大', '約 5,500 萬人'],
		['2017', '台灣 815 停電', '668 萬戶'],
		['2025', '西班牙・葡萄牙', '兩國幾乎全境'],
	];
	return (
		<Exit len={dur('real')}>
			<Head at={0} y={250}>
				這不是想像
			</Head>
			{rows.map(([y, place, n], i) => {
				const p = useIn(14 + i * 22);
				return (
					<div
						key={y}
						style={{
							position: 'absolute',
							left: 90,
							right: 90,
							top: 420 + i * 170,
							height: 140,
							borderRadius: 28,
							background: 'rgba(21,23,28,0.9)',
							border: `3px solid ${C.faint}`,
							display: 'flex',
							alignItems: 'center',
							padding: '0 44px',
							gap: 36,
							opacity: p,
							transform: `translateX(${(1 - p) * -60}px)`,
						}}
					>
						<span style={{fontFamily: NUM, fontWeight: 800, fontSize: 56, color: C.amber}}>{y}</span>
						<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 42, color: C.ink, flex: 1, whiteSpace: 'nowrap'}}>{place}</span>
						<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.dim}}>{n}</span>
					</div>
				);
			})}
			<Src at={80} y={950}>
				來源：Northeast blackout of 2003、2025 Iberian Peninsula blackout（Wikipedia）；中央社（815 停電）
			</Src>
		</Exit>
	);
};

const End: React.FC = () => {
	const f = useCurrentFrame();
	const D = dur('end');
	const items: [React.FC<{size?: number}>, string][] = [
		[Torch, '手電筒'],
		[PowerBank, '行動電源'],
		[Cash, '一點現金'],
		[Water, '飲用水'],
	];
	return (
		<AbsoluteFill style={{opacity: interpolate(f, [D - 24, D], [1, 0], clamp)}}>
			<Head at={4} y={240} size={80}>
				停電那一刻
			</Head>
			<Head at={16} y={350} size={80}>
				你家準備好了嗎？
			</Head>
			<div style={{position: 'absolute', top: 520, left: 60, right: 60, display: 'flex', justifyContent: 'space-between'}}>
				{items.map(([Ic, label], i) => {
					const p = useIn(34 + i * 8);
					return (
						<div key={label} style={{width: 220, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
							<div style={{display: 'flex', justifyContent: 'center'}}>
								<Ic size={130} />
							</div>
							<div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.ink, marginTop: 10}}>{label}</div>
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', left: 70, right: 70, top: 1600, textAlign: 'center', fontFamily: SANS, fontSize: 26, lineHeight: 1.7, color: C.dim, opacity: useIn(s(3.4))}}>
				夜間地球影像：NASA Earth Observatory（Black Marble 2016）
				<br />
				事件與數字：Wikipedia 彙整之官方與媒體報導、ENTSO-E、USDA、中央社
				<br />
				音樂採樣：VSCO 2 CE、VCSL（CC0）
			</div>
		</AbsoluteFill>
	);
};

const SCENES: [keyof typeof T, React.FC][] = [
	['hook', Hook],
	['zero', Zero],
	['phone', Phone],
	['money', Money],
	['fridge', FridgeScene],
	['water', WaterScene],
	['hospital', HospitalScene],
	['co', CO],
	['restart', Restart],
	['real', Real],
	['end', End],
];

const Stars: React.FC = () => {
	const st = useMemo(() => {
		let x = 777;
		const r = () => (x = (x * 16807) % 2147483647) / 2147483647;
		return Array.from({length: 220}, () => ({x: r() * 1080, y: r() * 1920, r: 0.6 + r() * r() * 2.2, a: 0.2 + r() * 0.55}));
	}, []);
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
			{st.map((p, i) => (
				<circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#fff" opacity={p.a} />
			))}
		</svg>
	);
};

export const Video: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const c = cam(t);
	const rot = ((40 + 1.2 * t) * Math.PI) / 180;
	const flick = t > 2.0 && t < 2.4 ? (Math.floor(t * 30) % 3 === 0 ? 0.5 : 1) : 1;
	return (
		<AbsoluteFill style={{background: '#03040A'}}>
			<AbsoluteFill style={{background: 'radial-gradient(90% 60% at 50% 65%, #0A1028 0%, #03040A 70%)'}} />
			<Stars />
			<div style={{position: 'absolute', left: 540 - c.size / 2, top: c.y - c.size / 2}}>
				<NightGlobe size={c.size} state={{rot, tilt: 0.42, lights: lightsAt(t), gain: flick}} />
			</div>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(3,4,10,0.92) 0%, rgba(3,4,10,0.75) 40%, rgba(3,4,10,0) 58%)'}} />
			<Clock />
			{SCENES.map(([k, Comp]) => (
				<Sequence key={k} from={s(T[k][0])} durationInFrames={dur(k)} name={k}>
					<Comp />
				</Sequence>
			))}
			<AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 10], [1, 0], {extrapolateRight: 'clamp'})}} />
		</AbsoluteFill>
	);
};

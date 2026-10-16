import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Line, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {BubbleTea, Coffee, HookArt, Hourglass, MiniReceipt, Onigiri, RECEIPT_NO, rng, Wheel} from './art';
import {BEAT, dur} from './timeline';

// Fades the whole scene out over its last `fade` frames.
const Exit: React.FC<{len: number; fade?: number; children: React.ReactNode}> = ({len, fade = 10, children}) => (
	<AbsoluteFill style={{opacity: useOut(len, fade)}}>{children}</AbsoluteFill>
);
const Kicker: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => {
	const t = useT();
	return (
		<Line at={at} y={y} size={40} weight={700} color={C.amber} tracking={t(6, 3)} lift={14}>
			{children}
		</Line>
	);
};
const Note: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => (
	<Line at={at} y={y} size={32} weight={400} color={C.dim} lift={10}>
		{children}
	</Line>
);
const N: React.FC<{size: number; color?: string; children: React.ReactNode}> = ({size, color = C.ink, children}) => (
	<span style={{fontFamily: NUM, fontWeight: 900, fontSize: size, color, letterSpacing: -size * 0.03, fontVariantNumeric: 'tabular-nums'}}>{children}</span>
);
const ease = Easing.inOut(Easing.cubic);
const push = (f: number, len: number, from = 1, to = 1.05) => interpolate(f, [0, len], [from, to], {...clamp, easing: ease});

// ① Hook: one receipt, one question. Frame 0 already shows the slip (no fade from black).
export const Hook: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	return (
		<Exit len={dur('hook')}>
			<AbsoluteFill style={{transform: `scale(${push(f, dur('hook'))})`, transformOrigin: '50% 72%'}}>
				<HookArt />
			</AbsoluteFill>
			<Line at={2} y={t(330, 320)} size={t(72, 60)} color={C.dim}>
				{t('如果你決定靠統一發票', 'What if you tried to win')}
			</Line>
			<Line at={12} y={t(426, 402)} size={t(124, 112)} weight={900}>
				{t<React.ReactNode>(
					<>
						中 <N size={124} color={C.amber}>1,000</N> 萬？
					</>,
					<span style={{color: C.amber}}>NT$10 million</span>,
				)}
			</Line>
			{t(
				null,
				<Line at={20} y={548} size={60} color={C.dim}>
					with receipts?
				</Line>,
			)}
			<Line at={46} y={t(680, 712)} size={t(42, 38)} color={C.amber}>
				{t('在台灣，每張發票都是一張彩券', 'In Taiwan, every receipt is a lottery ticket')}
			</Line>
		</Exit>
	);
};

// ② The odds: 8 wheels spin and lock onto the receipt's number one by one, on the beat.
export const Odds: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('odds');
	const W = 100;
	const G = 12;
	const left = (1080 - (8 * W + 7 * G)) / 2;
	const show = useIn(4);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${push(f, D, 1.04, 1)})`}}>
				<Kicker at={0} y={420}>
					{t('千萬特別獎', 'NT$10 MILLION SPECIAL PRIZE')}
				</Kicker>
				<Line at={8} y={490} size={t(76, 64)} weight={900}>
					{t('8 個數字，全部要對', 'All 8 digits must match')}
				</Line>
				{RECEIPT_NO.split('').map((d, i) => {
					const target = Number(d);
					const L = 30 + i * BEAT; // locks on the beat: 7.0 s, 7.5 s … 10.5 s
					const p = interpolate(f, [4, L], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
					const c = target - 10 * (2 + i) * (1 - p);
					const lock = spring({frame: f - L, fps, config: {damping: 11, mass: 0.5, stiffness: 220}});
					const locked = f >= L;
					return (
						<div
							key={i}
							style={{position: 'absolute', left: left + i * (W + G), top: 690, opacity: show, transform: `translateY(${(1 - show) * 30}px) scale(${1 + 0.12 * lock * (1 - lock) * 4})`}}
						>
							<Wheel c={c} w={W} h={150} size={104} color={locked ? C.amber : C.ink} border={locked ? C.amber : C.faint} />
						</div>
					);
				})}
				<Line at={140} y={960} size={t(56, 48)} color={C.dim}>
					{t('每張發票中獎的機率', 'The odds for each receipt')}
				</Line>
				<Line at={150} y={1040} size={t(136, 112)} weight={900} color={C.amber} lift={24}>
					{t('一億分之一', '1 in 100 million')}
				</Line>
				<Note at={172} y={1240}>
					{t('每期只開出 1 組特別獎號碼', 'Only one winning number is drawn each period')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ③ Three purchases a day → 1,095 slips a year.
export const Daily: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('daily');
	const n = Math.round(interpolate(f, [90, 120], [0, 1095], {...clamp, easing: Easing.out(Easing.cubic)}));
	const items: [React.FC<{size: number}>, number][] = [
		[Coffee, 220],
		[Onigiri, 540],
		[BubbleTea, 860],
	];
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${push(f, D, 1, 1.04)})`}}>
				<Line at={0} y={290} size={t(84, 72)} weight={900}>
					{t('每天買 3 次東西', 'You shop 3 times a day')}
				</Line>
				{items.map(([Icon, x], i) => {
					const at = 15 * (i + 1);
					const pop = spring({frame: f - at, fps, config: {damping: 10, mass: 0.5, stiffness: 200}});
					const slip = spring({frame: f - at - 6, fps, config: {damping: 14, mass: 0.6, stiffness: 160}});
					return (
						<React.Fragment key={i}>
							<div style={{position: 'absolute', left: x - 50, top: 640 + 60 * slip, opacity: Math.min(1, slip * 1.5), transform: `rotate(${(i - 1) * 6}deg)`}}>
								<MiniReceipt w={100} />
							</div>
							<div style={{position: 'absolute', left: x - 110, top: 450, opacity: Math.min(1, pop * 1.5), transform: `scale(${0.4 + 0.6 * pop})`}}>
								<Icon size={220} />
							</div>
						</React.Fragment>
					);
				})}
				<Line at={84} y={t(930, 940)} size={t(60, 52)} color={C.dim}>
					{t('一年下來', 'In one year, that’s')}
				</Line>
				<div style={{position: 'absolute', top: 1010, left: 0, right: 0, textAlign: 'center', opacity: useIn(88), lineHeight: 1}}>
					<N size={200} color={C.amber}>
						{n.toLocaleString('en-US')}
					</N>
				</div>
				<Line at={100} y={1230} size={t(72, 60)} weight={700}>
					{t('張發票', 'receipts')}
				</Line>
				<Note at={110} y={1340}>
					{t('3 張 × 365 天', '3 receipts × 365 days')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ④ 100,000,000 ÷ 1,095 = 91,324 years.
export const Wait: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('wait');
	const pop = spring({frame: f - 30, fps, config: {damping: 12, mass: 0.6, stiffness: 180}});
	const sand = interpolate(f, [0, D], [0.08, 0.5], clamp);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${push(f, D, 1, 1.05)})`}}>
				<Line at={0} y={290} size={t(60, 52)} color={C.dim}>
					{t('1 億張 ÷ 每年 1,095 張', '100 million ÷ 1,095 a year')}
				</Line>
				<div style={{position: 'absolute', top: 400, left: 0, right: 0, textAlign: 'center', lineHeight: 1, opacity: Math.min(1, pop * 1.4), transform: `scale(${1.25 - 0.25 * pop})`}}>
					<N size={240} color={C.amber}>
						91,324
					</N>
				</div>
				<Line at={40} y={660} size={t(88, 76)} weight={900}>
					{t('年', 'years')}
				</Line>
				<Line at={96} y={800} size={t(64, 56)} weight={700}>
					{t('平均才中一次', 'per win, on average')}
				</Line>
				<div style={{position: 'absolute', left: 540 - 130, top: 1010, opacity: useIn(10)}}>
					<Hourglass size={260} p={sand} flow={1} />
				</div>
			</AbsoluteFill>
		</Exit>
	);
};

// ⑤ An odometer runs from this year to the year you'd win.
export const Year: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('year');
	const LAND = 150; // 33 s, on a bar line
	const v = interpolate(f, [24, LAND], [2026, 93350], {...clamp, easing: Easing.inOut(Easing.quad)});
	const done = f >= LAND;
	const hit = spring({frame: f - LAND, fps, config: {damping: 10, mass: 0.5, stiffness: 220}});
	const W = 150;
	const G = 14;
	const COMMA = 44;
	const total = 5 * W + 4 * G + COMMA;
	const x0 = (1080 - total) / 2;
	const show = useIn(6);
	const wheels = [4, 3, 2, 1, 0].map((k) => {
		const unit = 10 ** k;
		if (k === 0) return v % 10;
		const base = Math.floor(v / unit) % 10;
		const carry = Math.max(0, Math.min(1, (v % unit) - (unit - 1)));
		return base + carry;
	});
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${push(f, D, 1, 1.04)})`}}>
				<Line at={0} y={420} size={t(72, 60)} color={C.dim}>
					{t('從 2026 年開始對獎', 'Start checking in 2026')}
				</Line>
				<Kicker at={10} y={570}>
					{t('平均中獎年份：西元', 'AVERAGE YEAR OF YOUR WIN')}
				</Kicker>
				<div style={{position: 'absolute', left: x0, top: 650, width: total, height: 220, opacity: show, transform: `scale(${1 + 0.06 * hit * (1 - hit) * 4})`}}>
					{wheels.map((c, i) => {
						const x = i * (W + G) + (i >= 2 ? COMMA : 0);
						const lead = i === 0 && v < 9999.5;
						return (
							<div key={i} style={{position: 'absolute', left: x, top: 0, opacity: lead ? 0.25 : 1}}>
								<Wheel c={c} w={W} h={220} size={156} color={done ? C.amber : C.ink} border={done ? C.amber : C.faint} />
							</div>
						);
					})}
					<div style={{position: 'absolute', left: 2 * (W + G) - 2, top: 40, width: COMMA, textAlign: 'center', fontFamily: NUM, fontWeight: 900, fontSize: 120, color: done ? C.amber : C.ink}}>,</div>
				</div>
				<Line at={LAND + 12} y={960} size={t(72, 60)} weight={900}>
					{t('那時你已經 9 萬多歲', 'You’d be 90,000+ years old')}
				</Line>
				<Note at={LAND + 24} y={1090}>
					{t('2026 + 91,324 = 93,350', '2026 + 91,324 = 93,350')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ⑥ Zoom out from one lifetime to 1,142 of them.
const CELLS = 1142;
const COLS = 34;
const PITCH = 25;
const CELL = 19;
const GX = (1080 - COLS * PITCH) / 2 + (PITCH - CELL) / 2;
const GY = 620;
const cellXY = (i: number) => [GX + (i % COLS) * PITCH, GY + Math.floor(i / COLS) * PITCH] as const;
const DELAY = (() => {
	const r = rng(23);
	return Array.from({length: CELLS}, (_, i) => {
		const [x, y] = cellXY(i);
		return Math.hypot(x - GX, y - GY) / 1200 + r() * 0.06;
	});
})();

export const Lives: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('lives');
	const p = interpolate(f, [40, 160], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const Z0 = 7;
	const z = Math.exp(Math.log(Z0) * (1 - p));
	const fx = GX + CELL / 2;
	const fy = GY + CELL / 2;
	const ax = interpolate(p, [0, 1], [540, fx]);
	const ay = interpolate(p, [0, 1], [900, fy]);
	const tx = ax - z * fx;
	const ty = ay - z * fy;
	const labelO = useIn(8) * interpolate(f, [44, 64], [1, 0], clamp);
	return (
		<Exit len={D}>
			<AbsoluteFill>
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
					<g transform={`translate(${tx} ${ty}) scale(${z})`}>
						{DELAY.map((d, i) => {
							const [x, y] = cellXY(i);
							const o = i === 0 ? 1 : interpolate(f, [50 + d * 110, 62 + d * 110], [0, 1], clamp);
							return o > 0 ? <rect key={i} x={x} y={y} width={CELL} height={CELL} rx={4} fill={i === 0 ? C.amber : C.ink} opacity={i === 0 ? 1 : 0.78 * o} /> : null;
						})}
					</g>
				</svg>
				<div style={{position: 'absolute', top: 1010, left: 60, right: 60, textAlign: 'center', opacity: labelO, fontFamily: t(SANS, SANS_EN), fontWeight: 700, fontSize: t(64, 56), color: C.ink}}>
					{t('你這一輩子', 'Your whole life')}
					<div style={{fontSize: 40, fontWeight: 400, color: C.dim, marginTop: 10}}>{t('（以 80 年計）', '(80 years)')}</div>
				</div>
				<Line at={120} y={270} size={t(60, 52)} color={C.dim}>
					{t('9 萬年，等於', '90,000 years is')}
				</Line>
				<Line at={132} y={360} size={t(110, 96)} weight={900}>
					{t<React.ReactNode>(
						<>
							<N size={120} color={C.amber}>
								1,142
							</N>{' '}
							輩子
						</>,
						<>
							<N size={104} color={C.amber}>
								1,142
							</N>{' '}
							lifetimes
						</>,
					)}
				</Line>
				<Note at={150} y={1520 - 20}>
					{t('91,324 ÷ 80 ≈ 1,142', '91,324 ÷ 80 ≈ 1,142')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ⑦ The twist: someone wins every single draw. 17 gold slips fall into place.
export const Twist: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('twist');
	const r = rng(5);
	const tilt = Array.from({length: 17}, () => (r() - 0.5) * 14);
	const MW = 110;
	const GXp = 26;
	const x0 = (1080 - (6 * MW + 5 * GXp)) / 2;
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${push(f, D, 1.03, 1)})`}}>
				<Kicker at={0} y={270}>
					{t('可是', 'AND YET')}
				</Kicker>
				<Line at={6} y={340} size={t(64, 54)} color={C.dim}>
					{t('最新一期，全台開出', 'the latest draw paid out')}
				</Line>
				<Line at={16} y={430} size={t(120, 96)} weight={900}>
					{t<React.ReactNode>(
						<>
							<N size={132} color={C.amber}>
								17
							</N>{' '}
							張千萬獎
						</>,
						<>
							<N size={110} color={C.amber}>
								17
							</N>{' '}
							NT$10M prizes
						</>,
					)}
				</Line>
				{tilt.map((rot, i) => {
					const at = 36 + i * 5;
					const drop = spring({frame: f - at, fps, config: {damping: 13, mass: 0.6, stiffness: 170}});
					const row = Math.floor(i / 6);
					const col = i % 6;
					const x = x0 + col * (MW + GXp) + (row === 2 ? (MW + GXp) / 2 : 0);
					const y = 650 + row * 205;
					return (
						<div key={i} style={{position: 'absolute', left: x, top: y - 260 * (1 - drop), opacity: Math.min(1, drop * 2), transform: `rotate(${rot * (1.6 - 0.6 * drop)}deg)`}}>
							<MiniReceipt w={MW} gold />
						</div>
					);
				})}
				<Line at={140} y={1300} size={t(46, 40)} weight={700}>
					{t('有人只花 10 元買飲料就中了', 'One winner spent just NT$10 on a drink')}
				</Line>
				<Note at={156} y={1390}>
					{t('115 年 7–8 月期 · 財政部初步統計', 'Jul–Aug 2026 draw · Ministry of Finance, preliminary')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ⑧ Why: Taiwan prints 100 million receipts in about 4 days.
export const Days: React.FC = () => {
	const t = useT();
	const lang = useLang();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('days');
	const S0 = 30;
	const S1 = 180; // counter starts on 53 s, reaches 100 million at 58 s
	const v = interpolate(f, [S0, S1], [0, 1e8], clamp);
	const day = Math.min(4, Math.max(1, Math.ceil(((f - S0) / (S1 - S0)) * 4)));
	const flipAt = S0 + ((day - 1) * (S1 - S0)) / 4;
	const first = useIn(S0 - 10);
	const flip = day === 1 ? first : spring({frame: f - flipAt, fps, config: {damping: 12, mass: 0.5, stiffness: 200}});
	const done = f >= S1;
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${push(f, D, 1, 1.05)})`}}>
				<Line at={0} y={t(320, 290)} size={t(56, 46)} color={C.dim}>
					{t('全台一年開出約 89 億張電子發票', 'Each year, Taiwan issues about\n8.9 billion e-receipts')}
				</Line>
				<div
					style={{
						position: 'absolute',
						left: 540 - 170,
						top: 490,
						width: 340,
						height: 300,
						borderRadius: 28,
						background: C.ink,
						overflow: 'hidden',
						opacity: useIn(S0 - 14),
						boxShadow: '0 16px 0 rgba(0,0,0,.4)',
					}}
				>
					<div style={{height: 76, background: C.red, color: '#fff', textAlign: 'center', lineHeight: '76px', fontFamily: lang === 'en' ? SANS_EN : SANS, fontWeight: 900, fontSize: 40, letterSpacing: 4}}>
						{t('第幾天', 'DAY')}
					</div>
					<div style={{textAlign: 'center', fontFamily: NUM, fontWeight: 900, fontSize: 190, lineHeight: '224px', color: C.bg, transform: `scale(${0.7 + 0.3 * flip})`}}>{day}</div>
				</div>
				<div style={{position: 'absolute', top: 860, left: 0, right: 0, textAlign: 'center', lineHeight: 1, opacity: useIn(S0 - 6)}}>
					<N size={150} color={done ? C.amber : C.ink}>
						{Math.floor(v).toLocaleString('en-US')}
					</N>
				</div>
				<Line at={S0} y={1040} size={t(64, 56)} weight={700}>
					{t('張發票', 'receipts')}
				</Line>
				<Line at={S1 + 4} y={1170} size={t(100, 84)} weight={900} color={C.amber}>
					{t('= 你的 9 萬年', '= your 90,000 years')}
				</Line>
				<Note at={S1 + 16} y={1350}>
					{t('約 89 億 ÷ 366 天 ≈ 每天 2,400 萬張', '~8.9 billion ÷ 366 days ≈ 24 million a day')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ⑨ The ending: the opening slip slides back to its place, the payoff answers the hook and holds,
// credits appear in the hold, and the text is gone 6 frames before the end so the last frames are frame 0.
export const End: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('end');
	const back = spring({frame: f, fps, config: {damping: 20, mass: 0.8, stiffness: 120}});
	const textO = useOut(D - 6, 20);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: Math.min(1, back * 1.6)}}>
				<HookArt dy={(1 - back) * 420} />
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: textO}}>
				<Line at={6} y={t(566, 580)} size={t(120, 100)} weight={900}>
					{t<React.ReactNode>(
						<>
							你：<N size={130}>9</N> 萬年
						</>,
						<>
							You: <N size={108}>90,000</N> years
						</>,
					)}
				</Line>
				<Line at={60} y={t(736, 730)} size={t(120, 100)} weight={900}>
					{t<React.ReactNode>(
						<>
							全台灣：<span style={{color: C.amber}}>
								<N size={130} color={C.amber}>
									4
								</N>{' '}
								天
							</span>
						</>,
						<>
							Taiwan: <span style={{color: C.amber}}>
								<N size={108} color={C.amber}>
									4
								</N>{' '}
								days
							</span>
						</>,
					)}
				</Line>
				<div style={{position: 'absolute', left: 60, right: 60, top: 902, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontSize: 32, lineHeight: 1.5, color: C.dim, opacity: useIn(100)}}>
					{t('資料：財政部、臺北市政府主計處', 'Data: Taiwan Ministry of Finance, Taipei City DBAS')}
					<br />
					{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

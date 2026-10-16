import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Line, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {Chihuahua, ChartAxes, Clock, curvePath, cx, cy, Elephant, GreatDane, Helix, human, Kid, Lab, Mouse, Party} from './art';
import {ANSWER_POP, CURVE_PTS, dur, END_PAYOFF, END_POP, END_SETTLE, FLIP_LINE, SEVEN_POP, SIZE_SWAP, start} from './timeline';

const ease = {...clamp, easing: Easing.inOut(Easing.cubic)};

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
// A pill label centred on x.
const Tag: React.FC<{x: number; y: number; o?: number; color?: string; children: React.ReactNode}> = ({x, y, o = 1, color = C.ink, children}) => (
	<div style={{position: 'absolute', left: x - 300, width: 600, top: y, textAlign: 'center', opacity: o}}>
		<span style={{display: 'inline-block', padding: '10px 30px', borderRadius: 999, background: '#22252C', color, fontFamily: useLang() === 'en' ? SANS_EN : SANS, fontWeight: 800, fontSize: 44, lineHeight: 1.1}}>
			{children}
		</span>
	</div>
);
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
		{children}
	</svg>
);
const pop = (f: number, fps: number, at: number) => spring({frame: f - at, fps, config: {damping: 11, mass: 0.6, stiffness: 170}});

// ── 0–6 s: the opening image. Frame 0 already shows it (the end settles back into exactly this). ──
export const Hook: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('hook');
	const z = interpolate(f, [0, D], [1, 1.035], {...clamp, easing: Easing.inOut(Easing.sin)});
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 75%'}}>
				<Party tick={f} n={1} />
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: useOut(D, 8)}}>
				<Line at={3} y={t(280, 250)} size={t(112, 96)} weight={900}>
					{t('如果狗用\n狗年齡過生日？', 'What if dogs\nhad birthdays\nin dog years?')}
				</Line>
				<Line at={36} y={t(600, 650)} size={t(64, 62)} weight={700} color={C.amber}>
					{t('1 歲生日，要插幾根蠟燭？', 'How many candles at age 1?')}
				</Line>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ── 6–12 s: the rule everyone knows. Candles 2..7 pop on 8th notes. ──
export const Seven: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('seven');
	const z = interpolate(f, [0, D], [1.035, 1.07], clamp);
	const n = interpolate(f, [SEVEN_POP[0], SEVEN_POP[1]], [1, 7], clamp); // candle k starts at 30 + 7.5(k-1)
	const p = pop(f, fps, 14);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 75%'}}>
				<Party tick={f + start('seven')} n={n} />
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: useOut(D, 8)}}>
				<Kicker at={0} y={250}>
					{t('常聽到的說法', 'THE USUAL RULE')}
				</Kicker>
				<Line at={4} y={320} size={t(100, 84)} weight={900}>
					{t('狗 1 歲 ＝ 人 7 歲', '1 dog year =\n7 human years')}
				</Line>
				<div style={{position: 'absolute', top: t(470, 545), left: 0, right: 0, textAlign: 'center', opacity: Math.min(1, p * 1.4), transform: `scale(${1.3 - 0.3 * p})`}}>
					<N size={t(220, 190)} color={C.red}>
						×7
					</N>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ── 12–20 s: a 1-year-old dog can already have puppies; a 7-year-old child can't. ──
export const Parent: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('parent');
	const tick = f + start('parent');
	const swap = 116;
	const pan = interpolate(f, [0, D], [18, -18], clamp);
	const kidOn = interpolate(f, [swap - 4, swap + 10], [0.25, 1], clamp);
	const dogOn = interpolate(f, [swap - 4, swap + 10], [1, 0.4], clamp);
	const pups = [150, 300, 450].map((x, k) => ({x, p: pop(f, fps, 16 + k * 8)}));
	return (
		<AbsoluteFill style={{opacity: useOut(D, 8)}}>
			<Svg>
				<rect x={60} y={1232} width={960} height={4} rx={2} fill={C.faint} />
				<g transform={`translate(${pan} 0)`}>
					<g opacity={dogOn}>
						<Lab x={300} y={1230} sc={0.72} tick={tick} />
						{pups.map((pp, k) => (
							<g key={k} transform={`translate(${pp.x} 1264) scale(${pp.p})`}>
								<Lab x={0} y={0} sc={0.3} head={1.35} collar={false} tick={tick} seed={k + 1} />
							</g>
						))}
					</g>
					<g opacity={kidOn}>
						<Kid x={790} y={1230} sc={0.95} tick={tick} font={NUM} />
					</g>
				</g>
			</Svg>
			<Tag x={300 + pan} y={1290} o={dogOn}>
				{t('1 歲', 'Age 1')}
			</Tag>
			<Tag x={790 + pan} y={1290} o={kidOn}>
				{t('7 歲', 'Age 7')}
			</Tag>
			<Line at={6} out={swap} y={290} size={t(92, 76)} weight={900}>
				{t('但 1 歲的狗，\n多半已經能當爸媽', 'But most\n1-year-old dogs can\nalready have puppies')}
			</Line>
			<Line at={swap + 4} y={290} size={t(92, 80)} weight={900}>
				{t('7 歲的小孩呢？\n還早得很', 'A 7-year-old kid?\nNot even close')}
			</Line>
			<Note at={40} y={1400}>
				{t('狗平均約 6 個月大進入青春期（VCA 動物醫院）', 'Dogs reach puberty at about 6 months on average\n(VCA Animal Hospitals)')}
			</Note>
		</AbsoluteFill>
	);
};

// ── 20–28 s: the DNA clock. Methyl tags pile up on the strand as the age bar fills. ──
export const Dna: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('dna');
	const lang = useLang();
	const z = interpolate(f, [0, D], [1, 1.06], ease);
	const age = interpolate(f, [36, 200], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
	const font = lang === 'en' ? SANS_EN : SANS;
	const barIn = useIn(24);
	return (
		<AbsoluteFill style={{opacity: useOut(D, 8)}}>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 46%'}}>
				<Svg>
					<Helix y={830} x0={90} x1={990} phase={f * 0.05} tags={age * 30} />
					<g opacity={barIn}>
						<rect x={190} y={1060} width={700} height={16} rx={8} fill={C.faint} />
						<rect x={190} y={1060} width={Math.max(16, 700 * age)} height={16} rx={8} fill={C.amber} />
						<circle cx={190 + 700 * age} cy={1068} r={20} fill={C.amber} />
						<text x={190} y={1130} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={36} fill={C.dim}>
							{t('0 歲', '0 yrs')}
						</text>
						<text x={890} y={1130} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={36} fill={C.dim}>
							{t('16 歲', '16 yrs')}
						</text>
					</g>
				</Svg>
			</AbsoluteFill>
			<Kicker at={0} y={250}>
				{t('2020 年的一項研究', 'A 2020 STUDY')}
			</Kicker>
			<Line at={6} y={t(320, 310)} size={t(84, 68)} weight={900}>
				{t('比對 104 隻拉布拉多\n和 320 個人的 DNA', 'They compared the DNA\nof 104 Labradors\nand 320 people')}
			</Line>
			<Line at={70} y={1190} size={t(64, 56)} weight={700} color={C.amber}>
				{t('DNA 會隨年齡留下記號', 'DNA picks up marks with age')}
			</Line>
			<Note at={96} y={1400}>
				{t('Wang 等，2020，《Cell Systems》', 'Wang et al., 2020, Cell Systems')}
			</Note>
		</AbsoluteFill>
	);
};

// ── 28–36 s: the answer. Candles 2..31 pop (accelerating), the count lands on the bar line. ──
export const Answer: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('answer');
	const z = interpolate(f, [0, D], [1, 1.03], clamp);
	const n = interpolate(f, [ANSWER_POP[0], ANSWER_POP[1]], [1, 31], {...clamp, easing: Easing.in(Easing.quad)});
	const land = pop(f, fps, ANSWER_POP[1]);
	const bump = f >= ANSWER_POP[1] ? 1 + 0.12 * (1 - land) : 1;
	const numIn = useIn(ANSWER_POP[0] - 6);
	return (
		<AbsoluteFill style={{opacity: useOut(D, 8)}}>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 80%'}}>
				<Party tick={f + start('answer')} n={n} mood={f > ANSWER_POP[1] - 12 ? 'wow' : 'happy'} />
			</AbsoluteFill>
			<Kicker at={0} y={240}>
				{t('結果', 'THE RESULT')}
			</Kicker>
			<Line at={4} y={305} size={t(88, 80)} weight={900}>
				{t('1 歲的狗 ≈', 'A 1-year-old dog ≈')}
			</Line>
			<div style={{position: 'absolute', top: 410, left: 0, right: 0, textAlign: 'center', opacity: numIn, transform: `scale(${bump})`, lineHeight: 1.15}}>
				<N size={250} color={C.amber}>
					{Math.round(n)}
				</N>
				<Z size={t(96, 72)}>{t(' 歲的人', ' human years')}</Z>
			</div>
			<Note at={ANSWER_POP[1] + 16} y={730}>
				{t('人的年齡 ≈ 16 × ln(狗的年齡) + 31', 'Human age ≈ 16 × ln(dog age) + 31')}
			</Note>
			<Note at={ANSWER_POP[1] + 28} y={782}>
				{t('Wang 等，2020 · 拉布拉多', 'Wang et al., 2020 · Labradors')}
			</Note>
		</AbsoluteFill>
	);
};

// The age chart shared by Curve and Flip. `reveal` = how far (dog years) the DNA curve has drawn.
const Chart: React.FC<{reveal: number; pts: {d: number; p: number; dim?: boolean; label?: boolean}[]; children?: React.ReactNode}> = ({reveal, pts, children}) => {
	const t = useT();
	const lang = useLang();
	const font = lang === 'en' ? SANS_EN : SANS;
	return (
		<Svg>
			<defs>
				<clipPath id="zwmr-curve">
					<rect x={0} y={0} width={cx(reveal) + 8} height={1920} />
				</clipPath>
			</defs>
			<ChartAxes font={font} xLabel={t('狗的年齡（歲）', 'Dog age (years)')} yLabel={t('人的年齡', 'Human age')} color={C.dim} faint="#1E2127" />
			<path d={curvePath} fill="none" stroke={C.amber} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" clipPath="url(#zwmr-curve)" />
			{children}
			{pts.map(({d, p, dim, label = true}) => {
				if (p <= 0) return null;
				const h = Math.round(human(d));
				const x = cx(d);
				const y = cy(human(d));
				// Early points sit on the steep part: label them to the right, under the curve.
				const lx = d < 3 ? x + 28 : x;
				const ly = d < 3 ? y + 32 : y - 34;
				const anchor = d < 3 ? 'start' : 'middle';
				return (
					<g key={d} opacity={dim ? 0.45 : 1}>
						<circle cx={x} cy={y} r={15 * p} fill={C.amber} stroke={C.bg} strokeWidth={5} />
						<text x={lx} y={ly} textAnchor={anchor} fontFamily={NUM} fontWeight={800} fontSize={46} fill={C.amber} opacity={label ? Math.min(1, p) : 0}>
							{`${d} → ${h}`}
						</text>
					</g>
				);
			})}
		</Svg>
	);
};

// ── 36–44 s: after year one it slows down. ──
export const Curve: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('curve');
	const z = interpolate(f, [0, D], [1.05, 1], ease);
	const reveal = interpolate(f, [6, CURVE_PTS[0], CURVE_PTS[1], CURVE_PTS[2], 160], [1, 2, 7, 12, 14], clamp);
	const pts = [
		{d: 1, p: pop(f, fps, 0)},
		{d: 2, p: pop(f, fps, CURVE_PTS[0])},
		{d: 7, p: pop(f, fps, CURVE_PTS[1])},
		{d: 12, p: pop(f, fps, CURVE_PTS[2])},
	];
	return (
		<AbsoluteFill style={{opacity: useOut(D, 6)}}>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 62%'}}>
				<Chart reveal={reveal} pts={pts} />
			</AbsoluteFill>
			<Kicker at={0} y={230}>
				{t('然後呢？', 'AND THEN?')}
			</Kicker>
			<Line at={4} y={295} size={t(88, 76)} weight={900}>
				{t('第一年狂奔，\n之後慢慢走', 'Year one is a sprint,\nthen it slows down')}
			</Line>
			<Note at={40} y={1462}>
				{t('依 Wang 等（2020）公式計算', 'Computed with the Wang et al. (2020) formula')}
			</Note>
		</AbsoluteFill>
	);
};

// ── 44–52 s: the twist: in old age ×7 overshoots (84 vs 71). ──
export const Flip: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('flip');
	const lang = useLang();
	const font = lang === 'en' ? SANS_EN : SANS;
	const z = interpolate(f, [FLIP_LINE[1], D], [1, 1.08], ease);
	const lineX = interpolate(f, [FLIP_LINE[0], FLIP_LINE[1]], [0, 14], {...clamp, easing: Easing.inOut(Easing.sin)});
	const cross = 9.6;
	const crossP = pop(f, fps, FLIP_LINE[0] + ((FLIP_LINE[1] - FLIP_LINE[0]) * cross) / 14);
	const redP = pop(f, fps, FLIP_LINE[1]);
	const gap = interpolate(f, [FLIP_LINE[1] + 24, FLIP_LINE[1] + 40], [0, 1], clamp);
	const x12 = cx(12);
	const pts = [
		{d: 1, p: 1, dim: true, label: false},
		{d: 2, p: 1, dim: true, label: false},
		{d: 7, p: 1, dim: true},
	];
	return (
		<AbsoluteFill style={{opacity: useOut(D, 8)}}>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: `${x12 - 20}px 1380px`}}>
				<Chart reveal={14} pts={pts}>
					<defs>
						<clipPath id="zwmr-seven">
							<rect x={0} y={0} width={cx(lineX)} height={1920} />
						</clipPath>
					</defs>
					<line x1={cx(0)} y1={cy(0)} x2={cx(14)} y2={cy(98)} stroke={C.red} strokeWidth={8} strokeDasharray="22 16" clipPath="url(#zwmr-seven)" />
					<text x={cx(6.4)} y={cy(44.8) + 62} textAnchor="middle" fontFamily={NUM} fontWeight={900} fontSize={54} fill={C.red} opacity={interpolate(f, [FLIP_LINE[0] + 44, FLIP_LINE[0] + 56], [0, 1], clamp)}>
						×7
					</text>
					<circle cx={cx(cross)} cy={cy(7 * cross)} r={24 * crossP} fill="none" stroke={C.ink} strokeWidth={4} />
					<g opacity={gap}>
						<line x1={x12 + 40} y1={cy(84)} x2={x12 + 40} y2={cy(human(12))} stroke={C.ink} strokeWidth={4} />
						<line x1={x12 + 28} y1={cy(84)} x2={x12 + 52} y2={cy(84)} stroke={C.ink} strokeWidth={4} />
						<line x1={x12 + 28} y1={cy(human(12))} x2={x12 + 52} y2={cy(human(12))} stroke={C.ink} strokeWidth={4} />
						<text x={x12 + 62} y={(cy(84) + cy(human(12))) / 2 + 14} textAnchor="start" fontFamily={NUM} fontWeight={900} fontSize={40} fill={C.ink}>
							+13
						</text>
					</g>
					<circle cx={x12} cy={cy(human(12))} r={15} fill={C.amber} stroke={C.bg} strokeWidth={5} />
					<text x={x12 + 10} y={cy(human(12)) + 92} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={42} fill={C.amber}>
						{t('DNA：71', 'DNA: 71')}
					</text>
					<circle cx={x12} cy={cy(84)} r={15 * redP} fill={C.red} stroke={C.bg} strokeWidth={5} />
					<text x={x12 - 28} y={cy(84) + 14} textAnchor="end" fontFamily={font} fontWeight={800} fontSize={42} fill={C.red} opacity={Math.min(1, redP)}>
						{t('×7：84', '×7: 84')}
					</text>
				</Chart>
			</AbsoluteFill>
			<Kicker at={0} y={230}>
				{t('反轉', 'THE TWIST')}
			</Kicker>
			<Line at={4} y={295} size={t(88, 76)} weight={900}>
				{t('老了以後，\n×7 反而算太老', 'Later on, ×7\nmakes dogs too old')}
			</Line>
			<Note at={FLIP_LINE[1] + 40} y={1462}>
				{t('兩條線約在 9.6 歲交會', 'The lines cross at about 9.6 years')}
			</Note>
		</AbsoluteFill>
	);
};

// ── 52–60 s: and in dogs, size flips the usual rule: big breeds age faster. ──
export const Size: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('size');
	const pan = interpolate(f, [0, D], [-14, 14], clamp);
	const aIn = pop(f, fps, 6);
	const aOut = interpolate(f, [SIZE_SWAP - 10, SIZE_SWAP], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
	const a = aIn * aOut;
	const b = pop(f, fps, SIZE_SWAP);
	const clockIn = pop(f, fps, SIZE_SWAP + 20);
	const age = Math.max(0, f - SIZE_SWAP - 20);
	const base = 1250;
	const grow = (x: number, s: number) => `translate(${x} ${base}) scale(${s}) translate(${-x} ${-base})`;
	return (
		<AbsoluteFill style={{opacity: useOut(D, 8)}}>
			<Svg>
				<rect x={60} y={base + 2} width={960} height={4} rx={2} fill={C.faint} />
				<g transform={`translate(${pan} 0)`}>
					<g transform={grow(260, a)}>
						<Mouse x={260} y={base} w={150} />
					</g>
					<g transform={grow(690, a)}>
						<Elephant x={690} y={base} w={520} />
					</g>
					<g transform={grow(260, b)}>
						<Chihuahua x={260} y={base} w={210} />
					</g>
					<g transform={grow(690, b)}>
						<GreatDane x={690} y={base} w={560} />
					</g>
					<g transform={`translate(260 940) scale(${clockIn}) translate(-260 -940)`}>
						<Clock x={260} y={940} r={56} angle={age * 4} color={C.green} />
					</g>
					<g transform={`translate(560 760) scale(${clockIn}) translate(-560 -760)`}>
						<Clock x={560} y={760} r={56} angle={age * 22} color={C.red} />
					</g>
				</g>
			</Svg>
			<Tag x={260 + pan} y={1290} o={Math.min(1, b)}>
				{t('吉娃娃', 'Chihuahua')}
			</Tag>
			<Tag x={690 + pan} y={1290} o={Math.min(1, b)}>
				{t('大丹犬', 'Great Dane')}
			</Tag>
			<Kicker at={0} y={230}>
				{t('還有一件事', 'ONE MORE THING')}
			</Kicker>
			<Line at={6} out={SIZE_SWAP - 2} y={300} size={t(88, 74)} weight={900}>
				{t('哺乳動物通常\n越大越長壽', 'In mammals, bigger\nusually means longer life')}
			</Line>
			<Line at={SIZE_SWAP + 4} y={300} size={t(88, 74)} weight={900}>
				{t('狗卻相反：\n越大隻，老得越快', 'Dogs flip it:\nbig breeds age faster')}
			</Line>
			<Note at={SIZE_SWAP + 30} y={1400}>
				{t('Kraus 等，2013：74 個犬種\n體型差近百倍，平均壽命差到 2 倍', 'Kraus et al., 2013: 74 breeds\nSize varies ~100×, life expectancy up to 2×')}
			</Note>
		</AbsoluteFill>
	);
};

// ── 60–70 s: back to the opening cake. The candles rise to 31, the payoff lands on the cadence (62 s) and holds;
// in the last second the text fades and the candles sink back to one, so the last frame is the hook's frame 0. ──
export const End: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('end');
	const tick = f - D; // continuous with the hook's tick (frame 0) when the Short replays
	const n =
		f < END_SETTLE[0]
			? interpolate(f, [END_POP[0], END_POP[1]], [1, 31], {...clamp, easing: Easing.in(Easing.quad)})
			: interpolate(f, [END_SETTLE[0], END_SETTLE[1]], [31, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const z = interpolate(f, [0, 50], [1.05, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const wow = f > END_POP[1] - 14 && f < END_PAYOFF + 4;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 75%'}}>
				<Party tick={tick} n={n} mood={wow ? 'wow' : 'happy'} />
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: useOut(D - 6, 22)}}>
				<Line at={END_PAYOFF - 6} y={t(400, 400)} size={t(124, 120)} weight={900}>
					{t('1 歲生日：', 'Age 1:')}
					{'\n'}
					<span style={{color: C.amber}}>{t('31 根蠟燭', '31 candles')}</span>
				</Line>
				<Line at={144} y={735} size={t(72, 68)} weight={900} color={C.ink}>
					{t('所以，蛋糕記得買大一點。', 'Better get a bigger cake.')}
				</Line>
				<div style={{position: 'absolute', left: 60, right: 60, top: 220, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontSize: 32, lineHeight: 1.55, color: C.dim, opacity: useIn(END_PAYOFF + 40)}}>
					{t('資料：Wang 等 2020 · VCA · Kraus 等 2013', 'Data: Wang et al. 2020 · VCA · Kraus et al. 2013')}
					<br />
					{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};



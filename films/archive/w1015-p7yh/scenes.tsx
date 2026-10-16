import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Count, Line, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, NUM, s, SANS, SANS_EN} from '../../engine/kit/theme';
import {BOOK_CM, BOOKS, Bubble, BUBBLE, OpenBook, PAPER, rng, Tome, Tower} from './art';
import {dur, T} from './timeline';

// Fades the whole scene out over its last `fade` frames.
const Exit: React.FC<{
	len: number;
	fade?: number;
	children: React.ReactNode;
}> = ({len, fade = 10, children}) => <AbsoluteFill style={{opacity: useOut(len, fade)}}>{children}</AbsoluteFill>;
const Note: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => (
	<Line at={at} y={y} size={32} weight={400} color={C.dim} lift={10}>
		{children}
	</Line>
);
const N: React.FC<{
	size: number;
	color?: string;
	children: React.ReactNode;
}> = ({size, color = C.ink, children}) => (
	<span
		style={{
			fontFamily: NUM,
			fontWeight: 900,
			fontSize: size,
			color,
			letterSpacing: -size * 0.03,
			fontVariantNumeric: 'tabular-nums',
		}}
	>
		{children}
	</span>
);
const Z: React.FC<{
	size: number;
	color?: string;
	weight?: number;
	children: React.ReactNode;
}> = ({size, color = C.ink, weight = 900, children}) => (
	<span
		style={{
			fontFamily: useLang() === 'en' ? SANS_EN : SANS,
			fontWeight: weight,
			fontSize: size,
			color,
		}}
	>
		{children}
	</span>
);
// A big number that pops in at local frame `at`.
const Big: React.FC<{
	at: number;
	y: number;
	children: React.ReactNode;
	opacity?: number;
}> = ({at, y, children, opacity = 1}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({
		frame: f - at,
		fps,
		config: {damping: 12, mass: 0.6, stiffness: 180},
	});
	return (
		<div
			style={{
				position: 'absolute',
				top: y,
				left: 0,
				right: 0,
				textAlign: 'center',
				lineHeight: 1.1,
				opacity: Math.min(1, pop * 1.4) * opacity,
				transform: `scale(${1.25 - 0.25 * pop})`,
			}}
		>
			{children}
		</div>
	);
};
const push = (f: number, d: number, to = 1.04) =>
	interpolate(f, [0, d], [1, to], {
		...clamp,
		easing: Easing.inOut(Easing.cubic),
	});

// Where the bubble sits while it "talks" in the second scene.
const SPEAKER = {y: 1395, scale: 0.46};

// ── Hook ────────────────────────────────────────────────────────────────────────────────────────
export const Hook: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('hook');
	const m = interpolate(f, [D - 26, D], [0, 1], {
		...clamp,
		easing: Easing.inOut(Easing.cubic),
	});
	return (
		<AbsoluteFill>
			<Bubble g={f} y={m * (SPEAKER.y - BUBBLE.cy)} scale={1 - m * (1 - SPEAKER.scale)} />
			<AbsoluteFill style={{opacity: useOut(D - 6, 16)}}>
				<Line at={2} y={410} size={t(72, 58)} weight={700} color={C.dim}>
					{t('如果把你一生說過的話', "If everything you've ever said")}
				</Line>
				<Line at={18} y={515} size={t(110, 104)} weight={900}>
					{t('全部印成書', 'got printed,')}
				</Line>
				<Line at={44} y={665} size={t(120, 92)} weight={900} color={C.amber}>
					{t('會有幾本？', 'how many books?')}
				</Line>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ── 16,000 words a day ──────────────────────────────────────────────────────────────────────────
const CHIPS: [string, string][] = [
	['早安', 'Morning'],
	['好啊', 'Sure'],
	['真的假的', 'No way'],
	['吃飽沒', 'Eaten yet?'],
	['我跟你說', 'Guess what'],
	['對啊', 'Yeah'],
	['哈哈哈', 'Haha'],
	['等一下', 'Wait'],
	['不是啦', 'No, no'],
	['謝謝', 'Thanks'],
	['然後呢', 'And then?'],
	['欸', 'Hey'],
	['是喔', 'Really?'],
	['好累', 'So tired'],
	['在哪', 'Where?'],
	['我也是', 'Me too'],
	['晚安', 'Night'],
];
const chipR = (() => {
	const r = rng(3);
	const lanes = [-230, 120, -60, 230, -170, 40]; // consecutive chips take different lanes so they don't pile up
	return CHIPS.map((_, i) => ({
		x: lanes[i % lanes.length] + (r() - 0.5) * 50,
		dx: (r() - 0.5) * 100,
		rot: (r() - 0.5) * 14,
	}));
})();
const Chips: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	return (
		<>
			{CHIPS.map(([zh, en], i) => {
				const u = (f - (4 + i * 4)) / 46;
				if (u <= 0 || u >= 1) return null;
				const y = 1300 - 480 * Easing.out(Easing.quad)(u);
				const o = Math.min(1, u * 6) * Math.min(1, (1 - u) * 3);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: 540 + chipR[i].x + chipR[i].dx * u,
							top: y,
							transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * Math.min(1, u * 5)}) rotate(${chipR[i].rot}deg)`,
							opacity: o,
							padding: '10px 26px',
							borderRadius: 40,
							background: '#1D2027',
							border: '2px solid #30343D',
							color: C.ink,
							fontFamily: t(SANS, SANS_EN),
							fontWeight: 700,
							fontSize: 40,
							whiteSpace: 'nowrap',
						}}
					>
						{t(zh, en)}
					</div>
				);
			})}
		</>
	);
};
const BarRow: React.FC<{
	at: number;
	y: number;
	label: string;
	v: number;
	color: string;
}> = ({at, y, label, v, color}) => {
	const t = useT();
	const p = useIn(at, 20, 0.9);
	const w = 560 * (v / 13349) * p;
	return (
		<div
			style={{
				position: 'absolute',
				top: y,
				left: 0,
				width: 1080,
				height: 76,
				opacity: Math.min(1, p * 2),
			}}
		>
			<div
				style={{
					position: 'absolute',
					right: 1080 - 250,
					top: 6,
					fontFamily: t(SANS, SANS_EN),
					fontWeight: 700,
					fontSize: 44,
					color: C.ink,
					whiteSpace: 'nowrap',
				}}
			>
				{label}
			</div>
			<div
				style={{
					position: 'absolute',
					left: 280,
					top: 0,
					width: w,
					height: 76,
					borderRadius: 14,
					background: color,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 280,
					width: 560 * (v / 13349) - 18,
					top: 10,
					textAlign: 'right',
					fontFamily: NUM,
					fontWeight: 800,
					fontSize: 44,
					color: '#0C0D10',
					opacity: p > 0.85 ? 1 : 0,
				}}
			>
				<Count from={0} to={v} at={at} dur={24} decimals={0} />
			</div>
		</div>
	);
};
export const Talk: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('talk');
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${push(f, D)})`}}>
				<Bubble g={f + s(T.talk[0])} y={SPEAKER.y - BUBBLE.cy} scale={SPEAKER.scale} />
				<Chips />
				<Line at={0} y={250} size={t(56, 50)} weight={700} color={C.amber}>
					{t('你一天大約會說', 'In one day, you say about')}
				</Line>
				<Big at={8} y={340}>
					<N size={180}>
						<Count from={0} to={12650} at={8} dur={62} decimals={0} />
					</N>
					<Z size={t(96, 72)}>{t(' 詞', ' words')}</Z>
				</Big>
				<Note at={60} y={570}>
					{t('Tidwell 等 2025 · 2,197 人錄音 · 男女平均', 'Tidwell et al. 2025 · 2,197 people · average')}
				</Note>
				<Line at={118} y={720} size={t(60, 56)} weight={700}>
					{t('「女生比較愛講話」？', '"Women talk more"?')}
				</Line>
				<BarRow at={140} y={850} label={t('女生', 'Women')} v={13349} color="#FF6B9A" />
				<BarRow at={150} y={950} label={t('男生', 'Men')} v={11950} color="#4C8DFF" />
				<Line at={196} y={1085} size={t(68, 60)} weight={900} color={C.green}>
					{t('差距其實不大！', 'The gap is small!')}
				</Line>
			</AbsoluteFill>
		</Exit>
	);
};

// ── A novel every 6.3 days ────────────────────────────────────────────────────────────────────────
export const Novel: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('novel');
	const p = interpolate(f, [30, 30 + 6.3 * 15], [0, 1], clamp);
	const day = f < 30 ? 1 : Math.min(6, Math.floor((f - 30) / 15) + 1);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${push(f, D, 1.05)})`}}>
				<Line at={0} y={250} size={t(76, 64)} weight={900}>
					{t('一本小說 ≈ 8 萬詞', 'A novel ≈ 80,000 words')}
				</Line>
				<AbsoluteFill style={{opacity: useIn(10)}}>
					<OpenBook p={p} y={420} />
					<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
						{Array.from({length: 6}, (_, i) => (
							<circle key={i} cx={540 + (i - 2.5) * 64} cy={935} r={14} fill={f >= 30 && day > i ? C.amber : '#2A2D34'} />
						))}
					</svg>
					<div
						style={{
							position: 'absolute',
							top: 968,
							left: 0,
							right: 0,
							textAlign: 'center',
							fontFamily: t(SANS, SANS_EN),
							fontWeight: 700,
							fontSize: 44,
							color: C.amber,
							opacity: f >= 30 ? 1 : 0,
						}}
					>
						{t(`第 ${day} 天`, `Day ${day}`)}
					</div>
				</AbsoluteFill>
				<Big at={122} y={1050}>
					<N size={180} color={C.amber}>
						6.3
					</N>
					<Z size={t(96, 80)} color={C.amber}>
						{t(' 天', ' days')}
					</Z>
				</Big>
				<Line at={134} y={1265} size={t(64, 52)} weight={700}>
					{t('就說完一整本小說', 'is all it takes to say a novel')}
				</Line>
				<Note at={150} y={1365}>
					{t('8 萬 ÷ 12,650 ≈ 6.3 天', '80,000 ÷ 12,650 ≈ 6.3 days')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ── Shakespeare's lifetime in 70 days ───────────────────────────────────────────────────────────
export const Bard: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('bard');
	const c = interpolate(f, [60, 135], [0, 70], {
		...clamp,
		easing: Easing.inOut(Easing.quad),
	});
	const tomeIn = useIn(6);
	const calIn = useIn(40);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${push(f, D)})`}}>
				<Line at={0} y={225} size={t(60, 50)} weight={700} color={C.amber}>
					{t('莎士比亞一輩子寫的所有作品', 'Everything Shakespeare ever wrote')}
				</Line>
				<AbsoluteFill
					style={{
						opacity: tomeIn,
						transform: `translateY(${(1 - tomeIn) * 30}px)`,
					}}
				>
					<Tome y={330} title={t('莎士比亞', 'The complete')} sub={t('全集', 'Shakespeare')} subSize={t(40, 36)} titleSize={t(80, 40)} font={t(SANS, SANS_EN)} />
					<div
						style={{
							position: 'absolute',
							top: 728,
							left: 0,
							right: 0,
							textAlign: 'center',
						}}
					>
						<span
							style={{
								display: 'inline-block',
								padding: '8px 30px',
								borderRadius: 40,
								background: '#2A2D34',
								fontFamily: t(SANS, SANS_EN),
								fontWeight: 700,
								fontSize: 44,
								color: C.ink,
							}}
						>
							{t('約 88.5 萬詞', '≈ 885,000 words')}
						</span>
					</div>
				</AbsoluteFill>
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: calIn}}>
					{Array.from({length: 70}, (_, i) => {
						const a = Math.max(0, Math.min(1, c - i));
						const x = 180 + (i % 14) * 52;
						const y = 850 + Math.floor(i / 14) * 56;
						return (
							<g key={i}>
								<rect x={x} y={y} width={44} height={46} rx={9} fill="#22252C" />
								<rect x={x} y={y} width={44} height={46} rx={9} fill={C.amber} opacity={a} transform={`translate(${x + 22} ${y + 23}) scale(${0.6 + 0.4 * a}) translate(${-x - 22} ${-y - 23})`} />
							</g>
						);
					})}
				</svg>
				<Line at={56} y={1172} size={t(60, 52)} weight={700}>
					{t('你只要', 'You say that much in')}
				</Line>
				<div
					style={{
						position: 'absolute',
						top: 1248,
						left: 0,
						right: 0,
						textAlign: 'center',
						lineHeight: 1.1,
						opacity: useIn(58),
					}}
				>
					<N size={170} color={C.amber}>
						{Math.round(c)}
					</N>
					<Z size={t(92, 76)} color={C.amber}>
						{t(' 天', ' days')}
					</Z>
				</div>
				<Note at={150} y={1450}>
					{t('88.5 萬 ÷ 12,650 ≈ 70 天', '885,000 ÷ 12,650 ≈ 70 days')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ── Age 5 → 80: the stack of books reaches a 29-storey roof ─────────────────────────────────────
export const TowerScene: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('tower');
	const u = interpolate(f, [30, 225], [0, 1], {
		...clamp,
		easing: Easing.inOut(Easing.cubic),
	});
	const FULL = BOOKS * BOOK_CM;
	const H = 30 * Math.pow(FULL / 30, u);
	const k = Math.min(3.2, 880 / H);
	const age = Math.round(5 + 75 * (H / FULL));
	const ageIn = useIn(10);
	const ageOut = interpolate(f, [226, 238], [1, 0], clamp);
	return (
		<Exit len={D}>
			<Tower books={H / BOOK_CM} k={k} showLevel={interpolate(f, [236, 252], [0, 1], clamp)} />
			<Line at={0} y={210} size={t(56, 52)} weight={700} color={C.amber}>
				{t('從 5 歲一路說到 80 歲', 'Talking from age 5 to 80')}
			</Line>
			<div
				style={{
					position: 'absolute',
					top: 300,
					left: 0,
					right: 0,
					textAlign: 'center',
					lineHeight: 1.1,
					opacity: ageIn * ageOut,
				}}
			>
				{t(
					<>
						<N size={130}>{age}</N>
						<Z size={72}> 歲</Z>
					</>,
					<>
						<Z size={72}>Age </Z>
						<N size={130}>{age}</N>
					</>,
				)}
			</div>
			<Big at={240} y={292}>
				<N size={150} color={C.amber}>
					87
				</N>
				<Z size={t(84, 84)} color={C.amber}>
					{t(' 公尺', ' m')}
				</Z>
			</Big>
			<Line at={252} y={478} size={t(64, 54)} weight={700}>
				{t('疊起來約 29 層樓高', 'Stacked up: about 29 stories tall')}
			</Line>
			<Note at={268} y={575}>
				{t('每本以 2 公分厚、每層樓 3 公尺計', 'At 2 cm per book, 3 m per floor')}
			</Note>
		</Exit>
	);
};

// ── 47 books of "um… uh…" ───────────────────────────────────────────────────────────────────────
const UM_LINES = 8;
const umText = (() => {
	const r = rng(9);
	return Array.from({length: UM_LINES * 2}, () => Array.from({length: 6}, () => Math.floor(r() * 4)));
})();
const UmBook: React.FC<{p: number; y: number}> = ({p, y}) => {
	const t = useT();
	const tok = t(['呃…', '嗯…', '呃', '嗯'], ['um…', 'uh…', 'um', 'uh']);
	const per = t(4, 4);
	const lines = umText.map((row) =>
		row
			.slice(0, per)
			.map((i) => tok[i])
			.join(' '),
	);
	const total = lines.reduce((a, l) => a + l.length, 0);
	let left = p * total;
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
			<g transform={`translate(0 ${y})`}>
				<rect x={128} y={-14} width={824} height={478} rx={22} fill="#5A5F69" />
				<path d="M 150 0 Q 345 -22 536 10 L 536 446 Q 345 418 150 440 Z" fill={PAPER} />
				<path d="M 544 10 Q 735 -22 930 0 L 930 440 Q 735 418 544 446 Z" fill={PAPER} />
				<rect x={530} y={8} width={20} height={440} fill="#000" opacity={0.12} />
				{lines.map((l, j) => {
					const n = Math.max(0, Math.min(l.length, Math.floor(left)));
					left -= l.length;
					if (n <= 0) return null;
					const leftPage = j < UM_LINES;
					return (
						<text key={j} x={leftPage ? 188 : 582} y={68 + (j % UM_LINES) * 50} fontFamily={t(SANS, SANS_EN)} fontWeight={700} fontSize={34} fill="#3A342C">
							{l.slice(0, n)}
						</text>
					);
				})}
			</g>
		</svg>
	);
};
const spineH = (() => {
	const r = rng(13);
	return Array.from({length: 47}, () => ({
		h: 74 + r() * 22,
		c: ['#5A5F69', '#70757F', '#646A75'][Math.floor(r() * 3)],
	}));
})();
export const Um: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('um');
	const p = interpolate(f, [36, 150], [0, 1], clamp);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${push(f, D)})`}}>
				<Line at={0} y={215} size={t(60, 56)} weight={700}>
					{t('這座書塔裡，有', 'In that tower,')}
				</Line>
				<Big at={14} y={292}>
					<N size={190} color={C.amber}>
						47
					</N>
					<Z size={t(96, 80)} color={C.amber}>
						{t(' 本', ' books')}
					</Z>
				</Big>
				<Line at={30} y={520} size={t(56, 56)} weight={700}>
					{t('從頭到尾只有「呃…嗯…」', 'say nothing but "um… uh…"')}
				</Line>
				<AbsoluteFill style={{opacity: useIn(30)}}>
					<UmBook p={p} y={665} />
				</AbsoluteFill>
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
					{spineH.map((sp, i) => {
						const a = interpolate(f, [128 + i * 1.2, 138 + i * 1.2], [0, 1], clamp);
						const row = i < 24 ? 0 : 1;
						const x = 156 + (row ? i - 24 + 0.5 : i) * 32;
						const base = 1252 + row * 112;
						const h = sp.h * a;
						return (
							<g key={i} opacity={Math.min(1, a * 2)}>
								<rect x={x} y={base - h} width={26} height={h} rx={4} fill={sp.c} />
								<rect x={x} y={base - h + h * 0.18} width={26} height={Math.max(0, h * 0.1)} fill="#8C9099" />
								<rect x={x} y={base - h * 0.28} width={26} height={Math.max(0, h * 0.06)} fill="#8C9099" />
							</g>
						);
					})}
					<g opacity={interpolate(f, [118, 130], [0, 1], clamp)}>
						<rect x={140} y={1252} width={800} height={8} rx={4} fill="#3A3F4A" />
						<rect x={140} y={1364} width={800} height={8} rx={4} fill="#3A3F4A" />
					</g>
				</svg>
				<Note at={150} y={1420}>
					{t('英國口語語料庫：每 100 詞約 1 個「呃 / 嗯」', 'Spoken BNC2014: about 1 in 100 words is "er" or "erm"')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ── The ending: back to the bubble; over 4,300 novels ────────────────────────────────────────────────
// Payoff lands at local 60 (= 52 s, the cadence), credits at 96, holds still until D-26, text gone 6 f before the end.
export const End: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('end');
	const n = interpolate(f, [22, 58], [0, 4300], {
		...clamp,
		easing: Easing.out(Easing.cubic),
	});
	const bump = 1 + 0.08 * Math.sin(interpolate(f, [58, 70], [0, Math.PI], clamp));
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: useIn(0)}}>
				<Bubble g={f + s(T.end[0])} />
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: useOut(D - 6, 20)}}>
				<Line at={10} y={560} size={t(72, 62)} weight={700} color={C.dim}>
					{t('你一生說過的話', 'A lifetime of your words:')}
				</Line>
				<div
					style={{
						position: 'absolute',
						top: 672,
						left: 0,
						right: 0,
						textAlign: 'center',
						lineHeight: 1.15,
						opacity: useIn(20),
						transform: `scale(${bump})`,
					}}
				>
					<N size={120} color={C.amber}>
						{Math.round(n).toLocaleString('en-US')}
					</N>
					<Z size={t(104, 100)} color={C.amber}>
						{t(' 多本小說', '+ novels')}
					</Z>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 60,
						right: 60,
						top: 1372,
						textAlign: 'center',
						fontFamily: t(SANS, SANS_EN),
						fontSize: 32,
						lineHeight: 1.55,
						color: C.dim,
						opacity: useIn(96),
					}}
				>
					{t('資料：Tidwell 等 2025 · Folger · Spoken BNC2014', 'Data: Tidwell et al. 2025 · Folger · Spoken BNC2014')}
					<br />
					{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

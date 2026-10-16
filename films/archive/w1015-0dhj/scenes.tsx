import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Line, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {Bird, Deer, Frog, GHOST, LEAF, MiniGhost, MiniTree, Person, rng, Tree} from './art';
import {CARBON_BLOCK0, CARBON_STEP, dur, HALF_VANISH, HOOK_VANISH} from './timeline';

const SKY = '#5AC8FA';

// Fades the whole scene out over its last `fade` frames.
const Exit: React.FC<{len: number; fade?: number; children: React.ReactNode}> = ({len, fade = 10, children}) => (
	<AbsoluteFill style={{opacity: useOut(len, fade)}}>{children}</AbsoluteFill>
);
const Kicker: React.FC<{at: number; y: number; out?: number; children: React.ReactNode}> = ({at, y, out, children}) => {
	const t = useT();
	return (
		<Line at={at} y={y} size={t(40, 42)} weight={700} color={C.amber} tracking={t(6, 2)} lift={14} out={out}>
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
const Z: React.FC<{size: number; color?: string; weight?: number; children: React.ReactNode}> = ({size, color = C.ink, weight = 900, children}) => (
	<span style={{fontFamily: useLang() === 'en' ? SANS_EN : SANS, fontWeight: weight, fontSize: size, color}}>{children}</span>
);

const usePop = (at: number) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: f - at, fps, config: {damping: 12, mass: 0.6, stiffness: 180}});
};

// A big number line that pops in (scale 1.25 → 1).
const Big: React.FC<{at: number; y: number; out?: number; children: React.ReactNode}> = ({at, y, out, children}) => {
	const p = usePop(at);
	const o = useOut(out ?? 1e9, 8);
	return (
		<div style={{position: 'absolute', top: y, left: 60, right: 60, textAlign: 'center', lineHeight: 1.05, opacity: Math.min(1, p * 1.4) * o, transform: `scale(${1.25 - 0.25 * p})`}}>
			{children}
		</div>
	);
};

const useZoom = (len: number, from = 1, to = 1.05) => {
	const f = useCurrentFrame();
	return interpolate(f, [0, len], [from, to], {...clamp, easing: Easing.inOut(Easing.cubic)});
};

const Svg: React.FC<{children: React.ReactNode; opacity?: number}> = ({children, opacity = 1}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, opacity}}>
		{children}
	</svg>
);

const Ground: React.FC<{y: number}> = ({y}) => (
	<>
		<rect x={0} y={y} width={1080} height={1920 - y} fill="#120F0C" />
		<rect x={0} y={y} width={1080} height={4} fill="#2B2219" />
	</>
);

// ───────────────────────── Hook: the forest vanishes ─────────────────────────
const FOREST = (() => {
	const r = rng(7);
	const rows = [
		{y: 1350, n: 12, h: [170, 240], col: [4, 0]},
		{y: 1430, n: 10, h: [220, 300], col: [2, 0]},
		{y: 1515, n: 8, h: [280, 370], col: [1, 3]},
	];
	const trees: {x: number; y: number; h: number; kind: number; color: string; seed: number; at: number}[] = [];
	rows.forEach((row, ri) => {
		for (let i = 0; i < row.n; i++) {
			const x = -30 + ((i + 0.5) / row.n) * 1140 + (r() - 0.5) * 60;
			trees.push({x, y: row.y + (r() - 0.5) * 16, h: row.h[0] + r() * (row.h[1] - row.h[0]), kind: Math.floor(r() * 3), color: LEAF[row.col[Math.floor(r() * 2)]], seed: 100 + ri * 20 + i, at: 0});
		}
	});
	// random order; sqrt spacing → the vanishing speeds up
	const order = trees.map((_, i) => ({i, k: r()})).sort((a, b) => a.k - b.k);
	order.forEach(({i}, rank) => {
		trees[i].at = HOOK_VANISH[0] + (HOOK_VANISH[1] - HOOK_VANISH[0]) * Math.sqrt(rank / (trees.length - 1));
	});
	return trees;
})();

export const Hook: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('hook');
	const zoom = useZoom(D, 1, 1.06);
	return (
		<Exit len={D} fade={8}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 70%'}}>
				<Svg>
					<Ground y={1500} />
					{FOREST.map((tr, i) => {
						const g = interpolate(f, [tr.at, tr.at + 10], [0, 1], clamp);
						return <Tree key={i} x={tr.x} y={tr.y} h={tr.h} kind={tr.kind} color={tr.color} gone={g} ghost={0.7 * g} seed={tr.seed} />;
					})}
				</Svg>
			</AbsoluteFill>
			<Line at={2} y={t(380, 360)} size={t(88, 80)} weight={700}>
				{t('如果地球上的樹', 'What if every tree\non Earth')}
			</Line>
			<Line at={12} y={t(500, 570)} size={t(136, 124)} weight={900}>
				{t('全部消失？', 'vanished?')}
			</Line>
		</Exit>
	);
};

// ───────────────────────── Count: 3 trillion, ~370 per person ─────────────────────────
const SPIRAL_N = 370;
const SPIRAL = Array.from({length: SPIRAL_N}, (_, i) => {
	const r = 15.6 * Math.sqrt(i + 18);
	const a = i * 2.39996;
	return {r, a, at: 44 + 110 * Math.pow(i / (SPIRAL_N - 1), 0.85), c: LEAF[i % 4]};
});

export const Count: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('count');
	const zoom = useZoom(D, 1, 1.05);
	const person = spring({frame: f - 34, fps, config: {damping: 12, mass: 0.6, stiffness: 160}});
	const shown = SPIRAL.filter((p) => p.at <= f).length;
	const rot = f * 0.0016;
	const cx = 540;
	const cy = 1030;
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`}}>
				<Kicker at={0} y={290}>
					{t('地球上大約有', 'Earth has about')}
				</Kicker>
				<Big at={8} y={370}>
					<N size={t(300, 260)} color={C.amber}>
						3
					</N>
					<Z size={t(140, 88)}>{t(' 兆棵樹', ' trillion trees')}</Z>
				</Big>
				<Svg>
					{SPIRAL.map((p, i) => {
						const s = spring({frame: f - p.at, fps, config: {damping: 11, mass: 0.5, stiffness: 200}});
						if (s <= 0.001) return null;
						return <MiniTree key={i} x={cx + Math.cos(p.a + rot) * p.r} y={cy + Math.sin(p.a + rot) * p.r} size={24} color={p.c} scale={s} />;
					})}
					<g transform={`translate(${cx} ${cy + 40}) scale(${person})`}>
						<Person h={86} color={C.ink} />
					</g>
				</Svg>
				<Line at={44} y={1380} size={t(64, 60)} weight={700}>
					{t('平均每人約 ', 'About ')}
					<span style={{fontFamily: NUM, fontWeight: 900, color: C.green, fontVariantNumeric: 'tabular-nums'}}>{shown}</span>
					{t(' 棵', ' per person')}
				</Line>
				<Note at={140} y={1466}>
					{t('3.04 兆棵 ÷ 82 億人', '3.04 trillion trees ÷ 8.2 billion people')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ───────────────────────── Oxygen: no, we would not suffocate ─────────────────────────
const AIR = [
	{v: 20.95, c: SKY},
	{v: 78.08, c: '#3A3F48'},
	{v: 0.97, c: '#5A5F69'},
];
const SPARKS = (() => {
	const r = rng(21);
	return Array.from({length: 46}, () => ({x: 540 + (r() - 0.5) * 620, v: 1.4 + r() * 2.2, ph: r(), sz: 2.5 + r() * 4, c: r() < 0.6 ? C.amber : '#FF6A3D', w: (r() - 0.5) * 0.08}));
})();

export const Oxygen: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('oxygen');
	const B = 108; // part B starts on the bar line after "No."
	const zoom = useZoom(D, 1, 1.04);
	const no = usePop(36);
	const noOut = useOut(B - 2, 10);
	const ring = interpolate(f, [B + 12, B + 60], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const ringIn = useIn(B + 8);
	const R = 330;
	const CIRC = 2 * Math.PI * R;
	const o2 = interpolate(f, [B + 66, B + 120], [20.95, 20.93], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const spark = interpolate(f, [B + 40, B + 60, B + 130, B + 160], [0, 1, 1, 0], clamp);
	let acc = 0;
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`}}>
				<Line at={4} y={t(560, 560)} size={t(104, 84)} weight={900} out={B - 2}>
					{t('我們會窒息嗎？', 'Would we suffocate?')}
				</Line>
				<div style={{position: 'absolute', top: 760, left: 60, right: 60, textAlign: 'center', opacity: Math.min(1, no * 1.4) * noOut, transform: `scale(${1.3 - 0.3 * no})`}}>
					<Z size={200} color={C.green}>
						{t('不會。', 'No.')}
					</Z>
				</div>

				<Line at={B + 4} y={290} size={t(60, 56)} weight={700} color={C.amber}>
					{t('就算把全世界的樹燒光', 'Even if every tree burned')}
				</Line>
				<Svg opacity={ringIn}>
					<g transform="translate(540 900) rotate(-90)">
						<circle r={R} fill="none" stroke={C.faint} strokeWidth={58} opacity={0.5} />
						{AIR.map((seg, i) => {
							const len = (seg.v / 100) * CIRC;
							const off = acc;
							acc += len;
							const vis = Math.max(0, Math.min(len, ring * CIRC - off));
							return <circle key={i} r={R} fill="none" stroke={seg.c} strokeWidth={58} strokeDasharray={`${Math.max(0.01, vis - 4)} ${CIRC}`} strokeDashoffset={-off - 2} />;
						})}
					</g>
					{SPARKS.map((p, i) => {
						const age = (f * p.v + p.ph * 300) % 300;
						const y = 1330 - age;
						const op = Math.sin((Math.PI * age) / 300) * spark;
						return op > 0.01 ? <circle key={i} cx={p.x + Math.sin(f * p.w * 3 + i) * 14} cy={y} r={p.sz} fill={p.c} opacity={op * 0.8} /> : null;
					})}
				</Svg>
				<div style={{position: 'absolute', top: 790, left: 0, right: 0, textAlign: 'center', lineHeight: 1, opacity: ringIn}}>
					<N size={150} color={SKY}>
						{o2.toFixed(2)}%
					</N>
				</div>
				<Line at={B + 20} y={960} size={t(52, 46)} weight={700} color={C.dim}>
					{t('空氣中的氧氣', 'oxygen in the air')}
				</Line>
				<Line at={B + 126} y={1300} size={t(64, 58)} weight={800}>
					{t('只少了不到千分之一', 'Down by less than 0.1%')}
				</Line>
				<Note at={B + 140} y={1410}>
					{t('本片依 FAO 森林生物量估算', 'Our estimate, from FAO forest biomass data')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ───────────────────────── Carbon: ~300 billion tonnes ≈ 29 years of fossil fuel ─────────────────────────
const BLOCKS = 29;
export const Carbon: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('carbon');
	const zoom = useZoom(D, 1, 1.05);
	const S = 62;
	const G = 12;
	const x0 = 540 - (10 * S + 9 * G) / 2;
	const y0 = t(800, 840);
	const shown = Array.from({length: BLOCKS}, (_, i) => CARBON_BLOCK0 + i * CARBON_STEP).filter((a) => a <= f).length;
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`}}>
				<Kicker at={0} y={290}>
					{t('真正的麻煩：碳', 'The real problem: carbon')}
				</Kicker>
				<Big at={8} y={370}>
					<N size={220} color={C.amber}>
						{t('3000', '300')}
					</N>
					<Z size={t(120, 100)}>{t(' 億噸', ' billion')}</Z>
				</Big>
				<Line at={24} y={630} size={t(56, 48)} weight={700} color={C.dim}>
					{t('的碳，鎖在樹木與樹根裡', 'tonnes of carbon, locked in\ntrees and their roots')}
				</Line>
				<Svg>
					{Array.from({length: BLOCKS}, (_, i) => {
						const at = CARBON_BLOCK0 + i * CARBON_STEP;
						const s = spring({frame: f - at, fps, config: {damping: 12, mass: 0.5, stiffness: 220}});
						if (s <= 0.001) return null;
						const x = x0 + (i % 10) * (S + G) + S / 2;
						const y = y0 + Math.floor(i / 10) * (S + G) + S / 2;
						return (
							<g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
								<rect x={-S / 2} y={-S / 2} width={S} height={S} rx={8} fill="#5E626B" />
								<rect x={-S / 2} y={-S / 2} width={S} height={10} rx={5} fill="#7A7F89" />
							</g>
						);
					})}
				</Svg>
				<Line at={CARBON_BLOCK0} y={t(1060, 1100)} size={t(56, 46)} weight={700} color={C.dim}>
					{t('≈ 全球燒化石燃料', '≈ global fossil-fuel emissions for')}
				</Line>
				<div style={{position: 'absolute', top: t(1140, 1170), left: 60, right: 60, textAlign: 'center', lineHeight: 1.1, opacity: useIn(CARBON_BLOCK0 + 4)}}>
					<N size={130} color={C.amber}>
						{shown}
					</N>
					<Z size={t(76, 72)}>{t(' 年的排放', ' years')}</Z>
				</div>
				<Note at={CARBON_BLOCK0 + 90} y={1380}>
					{t('■ = 1 年（2024 年約 102 億噸碳）· 以碳的質量計', '■ = 1 year (2024: ~10.2 billion t of carbon)')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ───────────────────────── Rain: Amazon trees lift 20 billion t of water a day ─────────────────────────
const RAIN_TREES = [
	{x: 150, h: 330, k: 1, c: LEAF[4]},
	{x: 930, h: 340, k: 1, c: LEAF[4]},
	{x: 360, h: 430, k: 1, c: LEAF[0]},
	{x: 740, h: 410, k: 1, c: LEAF[0]},
	{x: 550, h: 470, k: 1, c: LEAF[1]},
];
const VAPOR = (() => {
	const r = rng(33);
	return Array.from({length: 110}, () => {
		const tr = RAIN_TREES[Math.floor(r() * RAIN_TREES.length)];
		return {x: tr.x + (r() - 0.5) * tr.h * 0.7, y0: 1580 - tr.h * 0.88, v: 0.9 + r() * 1.2, ph: r(), sz: 2.5 + r() * 4.5, w: r() * 6};
	});
})();

export const Rain: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('rain');
	const zoom = useZoom(D, 1, 1.05);
	const env = interpolate(f, [8, 40], [0, 1], clamp);
	const L = 240;
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 60%'}}>
				<Svg>
					{VAPOR.map((p, i) => {
						const age = (f * p.v + p.ph * L) % L;
						const op = Math.sin((Math.PI * age) / L) * env;
						return <circle key={i} cx={p.x + Math.sin((f + i * 7) * 0.05) * p.w} cy={p.y0 - age} r={p.sz} fill="#9FD8FF" opacity={op * 0.75} />;
					})}
					{RAIN_TREES.map((tr, i) => (
						<Tree key={i} x={tr.x} y={1590} h={tr.h} kind={tr.k} color={tr.c} />
					))}
					<rect x={0} y={1588} width={1080} height={332} fill="#120F0C" />
					<path d={`M 0 1640 C 270 1610 540 1680 1080 1630 L 1080 1700 C 600 1740 300 1680 0 1710 Z`} fill="#2F6FA8" />
					{Array.from({length: 9}, (_, i) => {
						const x = ((i * 140 + f * 3) % 1260) - 90;
						return <rect key={i} x={x} y={1668 + Math.sin(i) * 8} width={60} height={4} rx={2} fill="#7FC4F5" opacity={0.6} />;
					})}
				</Svg>
				<Kicker at={0} y={290}>
					{t('亞馬遜的樹，每天', 'Every day, Amazon trees release')}
				</Kicker>
				<Big at={8} y={370}>
					<N size={240} color={SKY}>
						{t('200', '20')}
					</N>
					<Z size={t(120, 100)}>{t(' 億噸', ' billion')}</Z>
				</Big>
				<Line at={24} y={640} size={t(60, 52)} weight={700}>
					{t('的水，送上天空', 'tonnes of water into the sky')}
				</Line>
				<Line at={96} y={770} size={t(50, 44)} weight={700} color={C.dim}>
					{t('比亞馬遜河每天流進大海的水還多', 'More than the Amazon River\npours into the ocean each day')}
				</Line>
			</AbsoluteFill>
		</Exit>
	);
};

// ───────────────────────── Life: forests are home to most species ─────────────────────────
const SPECIES = [
	{pct: 80, zh: '兩棲類', en: 'amphibians', Icon: Frog},
	{pct: 75, zh: '鳥類', en: 'birds', Icon: Bird},
	{pct: 68, zh: '哺乳類', en: 'mammals', Icon: Deer},
];
const Col: React.FC<{i: number; x: number}> = ({i, x}) => {
	const t = useT();
	const f = useCurrentFrame();
	const sp = SPECIES[i];
	const at = 10 + i * 10;
	const pop = usePop(at);
	const fill = interpolate(f, [at + 10, at + 50], [0, sp.pct], {...clamp, easing: Easing.out(Easing.cubic)});
	const Icon = sp.Icon;
	return (
		<div style={{position: 'absolute', left: x - 150, width: 300, top: 430, textAlign: 'center', opacity: Math.min(1, pop * 1.4)}}>
			<svg width={170} height={170} viewBox="0 0 100 100" style={{transform: `scale(${1.3 - 0.3 * pop})`}}>
				<Icon color={C.green} eye={C.bg} />
			</svg>
			<div style={{marginTop: 30, lineHeight: 1}}>
				<N size={100} color={C.green}>
					{Math.round(fill)}%
				</N>
			</div>
			<div style={{marginTop: 22}}>
				<Z size={t(56, 46)} weight={700}>
					{t(sp.zh, sp.en)}
				</Z>
			</div>
			<svg width={220} height={16} style={{marginTop: 26}}>
				<rect x={0} y={0} width={220} height={16} rx={8} fill={C.faint} />
				<rect x={0} y={0} width={(220 * fill) / 100} height={16} rx={8} fill={C.green} />
			</svg>
		</div>
	);
};

export const Life: React.FC = () => {
	const t = useT();
	const D = dur('life');
	const zoom = useZoom(D, 1, 1.05);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`}}>
				<Kicker at={0} y={290}>
					{t('以森林為家的物種比例', 'Forests are home to')}
				</Kicker>
				{[0, 1, 2].map((i) => (
					<Col key={i} i={i} x={210 + i * 280} />
				))}
				<Line at={110} y={1060} size={t(84, 76)} weight={900}>
					{t('樹沒了，\n牠們也沒了家。', 'No trees,\nno home.')}
				</Line>
				<Note at={60} y={1420}>
					{t('FAO《世界森林狀況 2020》', 'FAO, State of the World’s Forests 2020')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ───────────────────────── Half: this isn't just a what-if ─────────────────────────
const GRID = (() => {
	const r = rng(46);
	const cells = Array.from({length: 100}, (_, i) => ({i, k: r(), at: Infinity, c: LEAF[Math.floor(r() * 4)]}));
	const gone = [...cells].sort((a, b) => a.k - b.k).slice(0, 46);
	gone.forEach((c, rank) => {
		c.at = HALF_VANISH[0] + (HALF_VANISH[1] - HALF_VANISH[0]) * (rank / 45);
	});
	return cells;
})();

export const Half: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('half');
	const zoom = useZoom(D, 1, 1.05);
	const B = 180; // second line
	const lost = GRID.filter((c) => c.at <= f).length;
	const cell = 52;
	const gx = 540 - 5 * cell + cell / 2;
	const gy = t(500, 580);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`}}>
				<Line at={2} y={290} size={t(100, 80)} weight={900}>
					{t('這不只是假設。', "This isn't just\na what-if.")}
				</Line>
				<Svg>
					{GRID.map((c) => {
						const x = gx + (c.i % 10) * cell;
						const y = gy + Math.floor(c.i / 10) * cell;
						const s = spring({frame: f - 14 - (c.i % 10) - Math.floor(c.i / 10), fps, config: {damping: 12, mass: 0.5, stiffness: 200}});
						const g = Number.isFinite(c.at) ? interpolate(f, [c.at, c.at + 8], [0, 1], clamp) : 0;
						return (
							<g key={c.i}>
								{g > 0 && <MiniGhost x={x} y={y} size={42} opacity={g * 0.9} />}
								{g < 1 && <MiniTree x={x} y={y} size={42} color={c.c} scale={s * (1 - g * 0.6)} opacity={1 - g} />}
							</g>
						);
					})}
				</Svg>
				<Line at={44} y={t(1070, 1130)} size={t(52, 46)} weight={700} color={C.dim} out={B}>
					{t('人類文明開始以來', 'Since human civilization began')}
				</Line>
				<div style={{position: 'absolute', top: t(1140, 1196), left: 60, right: 60, textAlign: 'center', lineHeight: 1.05, opacity: useIn(50) * useOut(B, 8)}}>
					<Z size={t(84, 64)}>{t('樹少了 ', 'trees down ')}</Z>
					<N size={140} color={C.red}>
						{lost}%
					</N>
				</div>
				<Line at={120} y={t(1320, 1360)} size={t(64, 54)} weight={800} out={B}>
					{t('將近一半', 'nearly half')}
				</Line>

				<Line at={B + 4} y={t(1100, 1150)} size={t(56, 48)} weight={700} color={C.dim}>
					{t('而且每年還在砍掉超過', 'and every year we still cut over')}
				</Line>
				<Big at={B + 18} y={t(1180, 1230)}>
					<N size={150} color={C.red}>
						{t('150', '15')}
					</N>
					<Z size={t(96, 72)}>{t(' 億棵', ' billion trees')}</Z>
				</Big>
				<Note at={B + 40} y={1430}>
					{t('Crowther et al. 2015,《Nature》', 'Crowther et al. 2015, Nature')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ───────────────────────── End ─────────────────────────
export const End: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('end');
	const grow = interpolate(f, [60, 150], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const leaf = interpolate(f, [110, 170], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
	const gy = 1150;
	const stem = 120 * grow;
	return (
		<AbsoluteFill style={{opacity: interpolate(f, [D - 20, D], [1, 0], clamp)}}>
			<Line at={4} y={330} size={t(76, 60)} weight={700} color={C.dim}>
				{t('地球曾經有 40 多億年\n沒有樹。', 'Earth went over 4 billion years\nwithout trees.')}
			</Line>
			<Line at={48} y={t(590, 560)} size={t(116, 104)} weight={900}>
				{t('人類？\n一天也沒有。', 'Humans?\nNot a single day.')}
			</Line>
			<Svg opacity={useIn(30)}>
				<rect x={240} y={gy} width={600} height={3} rx={1.5} fill={GHOST} />
				{stem > 0.5 && <path d={`M 540 ${gy} C 538 ${gy - stem * 0.4} 543 ${gy - stem * 0.7} 540 ${gy - stem}`} stroke={C.green} strokeWidth={6} fill="none" strokeLinecap="round" />}
				{leaf > 0 && (
					<g transform={`translate(540 ${gy - stem})`}>
						<path d="M 0 0 C -16 -26 -46 -24 -56 -6 C -38 6 -14 6 0 0 Z" fill={C.green} transform={`scale(${leaf})`} />
						<path d="M 0 0 C 14 -30 44 -30 52 -12 C 34 2 12 4 0 0 Z" fill="#3FD38A" transform={`scale(${leaf})`} />
					</g>
				)}
			</Svg>
			<div style={{position: 'absolute', left: 100, right: 100, top: 1250, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontSize: 32, lineHeight: 1.5, color: C.dim, opacity: useIn(84)}}>
				{t('資料：Crowther et al. 2015 · FAO 2020 · Nobre 2014', 'Data: Crowther et al. 2015 · FAO 2020 · Nobre 2014')}
				<br />
				{t('Global Carbon Budget 2024 · Stein et al. 2019', 'Global Carbon Budget 2024 · Stein et al. 2019')}
				<br />
				{t('氧氣變化與排放年數為本片計算', 'Oxygen and emission-years: our calculations')}
				<br />
				{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
			</div>
		</AbsoluteFill>
	);
};

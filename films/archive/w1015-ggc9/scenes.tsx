import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {clamp, Line, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {Lego101, Magnifier, Press} from './art';
import {dur, T} from './timeline';
import {BRICK_H, bricksAt, GROUND, N_MAX, T101, TOWER_M, World, worldAt} from './world';

const io = Easing.inOut(Easing.cubic);

// Fades the whole scene out over its last `fade` frames.
const Exit: React.FC<{len: number; fade?: number; children: React.ReactNode}> = ({len, fade = 10, children}) => (
	<AbsoluteFill style={{opacity: useOut(len, fade)}}>{children}</AbsoluteFill>
);
const Kicker: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => {
	const t = useT();
	return (
		<Line at={at} y={y} size={40} weight={700} color={C.amber} tracking={t(6, 1)} lift={14}>
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
const A: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: C.amber}}>{children}</span>;

/** A block that pops in at `at` (spring-free ease so numbers don't wobble), centred, absolutely positioned. */
const Block: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => {
	const f = useCurrentFrame();
	const p = interpolate(f, [at, at + 12], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<div style={{position: 'absolute', top: y, left: 60, right: 60, textAlign: 'center', lineHeight: 1.15, opacity: p, transform: `translateY(${(1 - p) * 24}px) scale(${1.08 - 0.08 * p})`}}>
			{children}
		</div>
	);
};

const fmt = (v: number) => Math.round(v).toLocaleString('en-US');

// ---------------------------------------------------------------------------------------------
// HOOK: Taipei 101 built from LEGO, the bottom 2×2 brick in red. Frame 0 already shows it.
export const Hook: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const zoom = interpolate(f, [0, dur('hook')], [1, 1.05], {...clamp, easing: Easing.inOut(Easing.sin)});
	const ring = f >= 50 ? ((f - 50) % 45) / 45 : 0;
	const glow = interpolate(f, [44, 56], [0, 1], clamp);
	return (
		<Exit len={dur('hook')}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '540px 1300px'}}>
				<Lego101 ring={ring} heroGlow={glow} />
			</AbsoluteFill>
			<Line at={4} y={t(390, 330)} size={t(96, 66)} weight={900}>
				{t('如果用樂高蓋 101', 'What if we built Taipei 101 out of LEGO?')}
			</Line>
			<Line at={26} y={t(530, 520)} size={t(84, 76)} weight={900}>
				{t(
					<>
						<A>最底下那塊</A>會被壓碎嗎？
					</>,
					<>
						Would the <A>bottom brick</A> get crushed?
					</>,
				)}
			</Line>
		</Exit>
	);
};

// TALL: 508 m = about 53,000 bricks stacked.
export const Tall: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('tall');
	const grow = interpolate(f, [70, 175], [0, 1], {...clamp, easing: io});
	const o101 = interpolate(f, [0, 12], [0, 1], clamp);
	const zoom = interpolate(f, [0, D], [1, 1.04], {...clamp, easing: Easing.inOut(Easing.sin)});
	const bricks = (T101 / BRICK_H) * grow;
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '540px 1300px'}}>
				<World mpp={0.7} towerX={680} towerH={T101 * grow} stackX={400} stack={[{alt: 0, o: o101}]} wx={1} towerO={interpolate(f, [60, 70], [0, 1], clamp)} />
			</AbsoluteFill>
			<Line at={0} y={220} size={t(84, 76)} weight={900}>
				{t(
					<>
						台北 101 高 <A>508</A> 公尺
					</>,
					<>
						Taipei 101 is <A>508 m</A> tall
					</>,
				)}
			</Line>
			<Kicker at={50} y={350}>
				{t('換成 2×2 樂高積木，一塊塊疊上去', 'Now stack 2×2 LEGO bricks to match')}
			</Kicker>
			<Block at={66} y={405}>
				{t(
					<>
						<Z size={64}>約 </Z>
						<N size={140} color={C.amber}>
							{(bricks / 1e4).toFixed(1)}
						</N>
						<Z size={64}> 萬塊</Z>
					</>,
					<>
						<Z size={60}>≈ </Z>
						<N size={130} color={C.amber}>
							{fmt(Math.round(bricks / 1000) * 1000)}
						</N>
						<Z size={60}> bricks</Z>
					</>,
				)}
			</Block>
			<Note at={168} y={610}>
				{t('每塊高 9.6 毫米：508 m ÷ 9.6 mm', 'Each brick is 9.6 mm tall: 508 m ÷ 9.6 mm')}
			</Note>
		</Exit>
	);
};

// PRESS: the Open University test. Force climbs to 4,240 N, then the brick goes soft.
export const PressTest: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('press');
	const gap = interpolate(f, [12, 52], [170, 0], {...clamp, easing: Easing.inOut(Easing.quad)});
	const load = interpolate(f, [56, 180], [0, 1], {...clamp, easing: Easing.in(Easing.sin)});
	const melt = interpolate(f, [180, 206], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const shake = load > 0.6 && melt < 1 ? Math.sin(f * 2.3) * 2.2 * (load - 0.6) * (1 - melt) : 0;
	const zoom = interpolate(f, [0, D], [1, 1.05], {...clamp, easing: Easing.inOut(Easing.sin)});
	const force = Math.round((4240 * load) / 10) * 10;
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '540px 860px'}}>
				<Press gap={gap} load={load} melt={melt} shake={shake} />
			</AbsoluteFill>
			<Kicker at={0} y={220}>
				{t('2012 · 英國開放大學實測', '2012 · Tested at the Open University')}
			</Kicker>
			<Line at={10} y={t(290, 280)} size={t(92, 60)} weight={900}>
				{t('一塊積木能扛多重？', 'How much can one brick take?')}
			</Line>
			<Block at={56} y={1090}>
				<N size={150} color={C.amber}>
					{fmt(force)}
				</N>
				<Z size={t(64, 58)}>{t(' 牛頓', ' newtons')}</Z>
			</Block>
			<Line at={190} y={1290} size={80} weight={900}>
				{t('≈ 432 公斤', '≈ 432 kg')}
			</Line>
			<Note at={214} y={1410}>
				{t('沒有爆開：它像溫熱的起司一樣軟掉了', 'No bang. It just went soft, like warm cheese.')}
			</Note>
		</Exit>
	);
};

// The world scenes share one camera (worldAt, in global seconds) so their cuts don't jump; only the text fades.
const useWorld = (k: keyof typeof T) => {
	const t = useT();
	const f = useCurrentFrame();
	return worldAt(T[k][0] + f / 30, t(SANS, SANS_EN), t('玉山 3,952 m', 'Yushan 3,952 m'));
};
const TextOut: React.FC<{len: number; children: React.ReactNode}> = ({len, children}) => <AbsoluteFill style={{opacity: useOut(len, 10)}}>{children}</AbsoluteFill>;

// STACK: 432 kg ÷ 1.152 g = 375,000 bricks. The camera follows the top of the stack.
export const Stack: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const w = useWorld('stack');
	const n = Math.min(N_MAX, Math.round(bricksAt(T.stack[0] + f / 30)));
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: interpolate(f, [0, 8], [0, 1], clamp)}}>
				<World {...w} />
			</AbsoluteFill>
			<TextOut len={dur('stack')}>
				<Kicker at={0} y={220}>
					{t('432 公斤 ÷ 每塊 1.152 克', '432 kg ÷ 1.152 g per brick')}
				</Kicker>
				<Block at={8} y={280}>
					<N size={140} color={C.amber}>
						{fmt(n)}
					</N>
					<Z size={t(64, 58)}>{t(' 塊', ' bricks')}</Z>
				</Block>
				<Line at={156} y={470} size={t(60, 54)} weight={700}>
					{t('疊到這麼多，最底下那塊才會壓壞', 'Only then would the bottom brick give way')}
				</Line>
			</TextOut>
		</AbsoluteFill>
	);
};

// SEVEN: about 3.5 km, i.e. seven Taipei 101s.
export const Seven: React.FC = () => {
	const t = useT();
	const w = useWorld('seven');
	return (
		<AbsoluteFill>
			<World {...w} />
			<TextOut len={dur('seven')}>
				<Kicker at={0} y={220}>
					{t('疊起來有多高？', 'How tall is that?')}
				</Kicker>
				<Block at={12} y={280}>
					<Z size={t(64, 60)}>{t('約 ', 'About ')}</Z>
					<N size={150}>3.5</N>
					<Z size={t(64, 60)}>{t(' 公里', ' km')}</Z>
				</Block>
				<Line at={128} y={480} size={t(92, 84)} weight={900} color={C.amber}>
					{t('≈ 7 棟台北 101', '≈ 7 Taipei 101s')}
				</Line>
			</TextOut>
		</AbsoluteFill>
	);
};

// YUSHAN: less than one 101 short of Taiwan's highest peak.
export const Yushan: React.FC = () => {
	const t = useT();
	const w = useWorld('yushan');
	return (
		<AbsoluteFill>
			<World {...w} />
			<TextOut len={dur('yushan')}>
				<Kicker at={6} y={220}>
					{t('台灣最高峰：玉山 3,952 公尺', "Taiwan's highest peak: Yushan, 3,952 m")}
				</Kicker>
				<Line at={24} y={290} size={t(92, 80)} weight={900}>
					{t('差一點就到玉山頂', 'Almost at the summit')}
				</Line>
				<Line at={52} y={410} size={t(84, 64)} weight={900} color={C.amber}>
					{t('只差不到一棟 101', 'Less than one Taipei 101 short')}
				</Line>
			</TextOut>
		</AbsoluteFill>
	);
};

// TWIST: it never gets that far. It buckles: 2 mm off-centre at the midpoint is enough.
export const Twist: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('twist');
	const w = useWorld('twist');
	const midY = GROUND - TOWER_M / 2 / w.mpp;
	const mag = interpolate(f, [58, 70, 160, 172], [0, 1, 1, 0], clamp);
	const shakeX = f > 160 && f < 168 ? Math.sin(f * 3) * 3 : 0;
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `translateX(${shakeX}px)`}}>
				<World {...w} />
			</AbsoluteFill>
			<Magnifier cx={330} cy={midY} r={150} o={mag} fromX={w.towerX} label={t('2 毫米', '2 mm')} font={NUM} />
			<Line at={24} y={220} size={t(96, 70)} weight={900}>
				{t('但它根本立不起來', 'But it could never stand')}
			</Line>
			<Line at={70} y={370} size={t(68, 60)} weight={700}>
				{t(
					<>
						塔腰歪超過 <A>2 毫米</A>
					</>,
					<>
						Lean over <A>2 mm</A> at the middle
					</>,
				)}
			</Line>
			<Line at={96} y={460} size={t(68, 60)} weight={700}>
				{t('整座塔就會彎折倒下', 'and the whole tower buckles')}
			</Line>
			<Note at={126} y={570}>
				{t('英國開放大學 Ian Johnston 的估算 · BBC 2012', 'Estimate by Ian Johnston, Open University · BBC 2012')}
			</Note>
		</Exit>
	);
};

// END: back to the LEGO 101. It won't crush; it could hold 7 of them. Holds still, then settles into frame 0.
export const End: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('end');
	const build = interpolate(f, [0, 50], [0, 1], clamp);
	const ring = f >= 60 && f < 104 ? (f - 60) / 44 : 0;
	const textO = useOut(D - 6, 24);
	const glow = interpolate(f, [56, 64], [0, 1], clamp) * textO;
	return (
		<AbsoluteFill>
			<Lego101 build={build} ring={ring} heroGlow={glow} />
			<AbsoluteFill style={{opacity: textO}}>
				<div style={{position: 'absolute', left: 60, right: 60, top: 214, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontSize: 32, lineHeight: 1.5, color: C.dim, opacity: interpolate(f, [110, 124], [0, 1], clamp)}}>
					{t('資料：BBC More or Less、英國開放大學（2012）', 'Data: BBC More or Less, The Open University (2012)')}
					<br />
					{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
				</div>
				<Line at={60} y={380} size={t(120, 110)} weight={900}>
					{t('壓不碎！', "It won't crush!")}
				</Line>
				<Line at={84} y={t(556, 548)} size={t(96, 84)} weight={900} color={C.amber}>
					{t('它撐得起 7 棟 101', 'It holds 7 Taipei 101s')}
				</Line>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

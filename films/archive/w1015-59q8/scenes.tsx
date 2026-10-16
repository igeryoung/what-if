import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Line, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {Balance, BoilArt, Cam, FULL, MOUTH, mixCam, PushArt, World} from './art';
import {dur} from './timeline';

const io = Easing.inOut(Easing.cubic);
// The home camera, anchored low so a small push-in keeps the cup in the bottom half (z = 1 is the identity).
const HOME_B: Cam = {wx: 540, wy: 1380, sx: 540, sy: 1380, z: 1};
const atZ = (z: number): Cam => ({...HOME_B, z});
const LUNG = 9.25; // tea level where full-effort lungs give up: MOUTH − 1 m
const VAC = 0.45; // tea level where a perfect vacuum gives up: about 10 m below the mouth

// Fades the text of a scene out over its last `fade` frames.
const Exit: React.FC<{len: number; fade?: number; children: React.ReactNode}> = ({len, fade = 10, children}) => (
	<AbsoluteFill style={{opacity: useOut(len, fade)}}>{children}</AbsoluteFill>
);
const Kicker: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => (
	<Line at={at} y={y} size={40} weight={700} color={C.amber} tracking={6} lift={14}>
		{children}
	</Line>
);
const N: React.FC<{size: number; color?: string; children: React.ReactNode}> = ({size, color = C.ink, children}) => (
	<span style={{fontFamily: NUM, fontWeight: 900, fontSize: size, color, letterSpacing: -size * 0.03, fontVariantNumeric: 'tabular-nums'}}>{children}</span>
);
const Z: React.FC<{size: number; color?: string; weight?: number; children: React.ReactNode}> = ({size, color = C.ink, weight = 900, children}) => (
	<span style={{fontFamily: useLang() === 'en' ? SANS_EN : SANS, fontWeight: weight, fontSize: size, color}}>{children}</span>
);
// A number that pops in (spring scale) at local frame `at`.
const Pop: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: f - at, fps, config: {damping: 12, mass: 0.6, stiffness: 180}});
	return (
		<div style={{position: 'absolute', top: y, left: 60, right: 60, textAlign: 'center', whiteSpace: 'nowrap', opacity: Math.min(1, p * 1.4), transform: `scale(${1.25 - 0.25 * p})`}}>{children}</div>
	);
};
const font = () => (useLang() === 'en' ? SANS_EN : SANS);

export const Hook: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('hook');
	const z = interpolate(f, [0, D], [1, 1.03], {...clamp, easing: Easing.inOut(Easing.sin)});
	return (
		<AbsoluteFill>
			<World cam={atZ(z)} />
			<Exit len={D}>
				<Line at={10} y={t(560, 510)} size={t(64, 60)} color={C.dim}>
					{t('如果手搖飲有 3 層樓高', 'What if your bubble tea\nwere 3 stories tall?')}
				</Line>
				<Line at={30} y={t(670, 680)} size={t(120, 96)} weight={900}>
					{t('吸得到底嗎？', 'Could you sip it\nto the bottom?')}
				</Line>
			</Exit>
		</AbsoluteFill>
	);
};

export const Tall: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('tall');
	const z = interpolate(f, [0, 50], [1.03, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const ruler = interpolate(f, [12, 70], [0, 1], {...clamp, easing: io});
	const floors = interpolate(f, [40, 60], [0, 1], clamp);
	const ring = interpolate(f, [100, 114], [0, 1], clamp) * (0.8 + 0.2 * Math.sin(f / 5));
	return (
		<Exit len={D}>
			<World cam={atZ(z)} ruler={ruler} floors={floors} ring={ring} />
			<Kicker at={0} y={270}>
				{t('3 層樓高', '3 STORIES TALL')}
			</Kicker>
			<Pop at={14} y={330}>
				<Z size={t(100, 90)} color={C.dim}>
					≈{' '}
				</Z>
				<N size={220} color={C.amber}>
					10
				</N>
				<Z size={t(100, 90)}>{t(' 公尺', ' meters')}</Z>
			</Pop>
			<Line at={100} y={650} size={t(60, 56)} weight={800}>
				{t('珍珠，全沉在最底下', 'The pearls? Way down there.')}
			</Line>
		</Exit>
	);
};

export const Push: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('push');
	const zoom = interpolate(f, [0, D], [1, 1.05], {...clamp, easing: io});
	const rise = interpolate(f, [56, 130], [0, 1], {...clamp, easing: io});
	const arrows = interpolate(f, [34, 50], [0, 1], clamp);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 70%'}}>
				<PushArt f={f} rise={rise} arrows={arrows} font={font()} air={t('空氣', 'air')} low={t('嘴裡氣壓變低', 'low pressure')} />
			</AbsoluteFill>
			<Line at={0} y={250} size={t(96, 84)} weight={900}>
				{t('吸管不是「吸」', 'A straw doesn’t pull.')}
			</Line>
			<Line at={34} y={t(375, 365)} size={t(96, 84)} weight={900} color={C.amber}>
				{t('是空氣在「推」', 'The air pushes.')}
			</Line>
			<Line at={100} y={t(520, 500)} size={44} weight={500} color={C.ink}>
				{t('大氣壓：每平方公分約 1 公斤', 'Air presses ~1 kg on every cm²')}
			</Line>
		</Exit>
	);
};

export const Lungs: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('lungs');
	const ZOOM: Cam = {wx: 430, wy: 1060, sx: 540, sy: 1240, z: 2.6};
	const back = interpolate(f, [120, 178], [0, 1], {...clamp, easing: io});
	const level = interpolate(f, [24, 100], [FULL, LUNG], {...clamp, easing: io});
	const br = interpolate(f, [96, 112], [0, 1], clamp);
	const dim = interpolate(f, [150, 176], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: useIn(0)}}>
				<World cam={mixCam(ZOOM, HOME_B, back)} level={level} dim={dim} dimH={LUNG} brackets={[{x: 340, h1: LUNG, h2: MOUTH, label: t('1 m', '1 m'), color: C.amber, o: br}]} />
			</AbsoluteFill>
			<Exit len={D}>
				<Kicker at={0} y={270}>
					{t('用肺，用盡全力吸', 'LUNGS, FULL POWER')}
				</Kicker>
				<Pop at={16} y={330}>
					<Z size={t(84, 72)}>{t('約 ', 'about ')}</Z>
					<N size={220} color={C.amber}>
						1
					</N>
					<Z size={t(100, 90)}>{t(' 公尺', ' meter')}</Z>
				</Pop>
				<Line at={50} y={610} size={32} weight={400} color={C.dim} lift={10}>
					{t('成年男性最大吸氣壓，平均約 100 cmH₂O', 'Adult men’s max inhale: ~100 cmH₂O on average')}
				</Line>
				<Line at={150} y={680} size={t(60, 56)} weight={900} color={C.red}>
					{t('剩下 9 公尺：吸不到', 'The other 9 m: out of reach')}
				</Line>
			</Exit>
		</AbsoluteFill>
	);
};

export const Vacuum: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('vacuum');
	const z = interpolate(f, [0, D], [1, 1.04], {...clamp, easing: io});
	const dim = interpolate(f, [0, 14], [1, 0], clamp);
	const level = interpolate(f, [24, 140], [LUNG, VAC], {...clamp, easing: io});
	const br = interpolate(f, [140, 156], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<World
				cam={atZ(z)}
				level={level}
				dim={dim}
				dimH={LUNG}
				brackets={[
					{x: 340, h1: LUNG, h2: MOUTH, label: '1 m', color: C.amber, o: dim},
					{x: 236, h1: VAC, h2: MOUTH, label: '≈10 m', color: C.amber, o: br},
				]}
			/>
			<Exit len={D}>
				<Line at={0} y={t(260, 250)} size={t(84, 68)} weight={900}>
					{t('就算把肺抽成真空', 'Even if your lungs\nwere a perfect vacuum')}
				</Line>
				<Pop at={140} y={t(400, 450)}>
					<Z size={t(72, 64)}>{t('最多約 ', 'at most ')}</Z>
					<N size={200} color={C.amber}>
						10
					</N>
					<Z size={t(96, 90)}>{t(' 公尺', ' m')}</Z>
				</Pop>
			</Exit>
		</AbsoluteFill>
	);
};

export const Sky: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('sky');
	const fill = interpolate(f, [24, 104], [0, 1], {...clamp, easing: io});
	const wob = f > 104 ? 2.2 * Math.sin((f - 104) / 4) * Math.exp(-(f - 104) / 16) : 0;
	const tilt = -9 * (1 - fill) + wob;
	const labels = interpolate(f, [100, 116], [0, 1], clamp);
	const zoom = interpolate(f, [0, D], [1.04, 1], {...clamp, easing: io});
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 80%'}}>
				<Balance tilt={tilt} fill={fill} font={font()} sky={t('整片天空', 'the whole sky')} water={t('10 m 的水', '10 m of water')} labels={labels} />
			</AbsoluteFill>
			<Kicker at={0} y={250}>
				{t('為什麼是 10 公尺？', 'WHY 10 METERS?')}
			</Kicker>
			<Line at={14} y={320} size={t(84, 64)} weight={900}>
				{t('頭頂整片天空的重量', 'All the air above you')}
			</Line>
			<Line at={104} y={t(440, 410)} size={t(84, 64)} weight={900} color={C.amber}>
				{t('＝ 10 公尺高的水', 'weighs as much as\n10 m of water')}
			</Line>
			<Line at={150} y={t(565, 590)} size={40} weight={500} color={C.dim}>
				{t('每平方公尺，都約 10 公噸', 'about 10 tonnes on every m²')}
			</Line>
		</Exit>
	);
};

export const Boil: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('boil');
	const boil = interpolate(f, [8, 40], [0, 1], clamp);
	const zoom = interpolate(f, [0, D], [1, 1.06], {...clamp, easing: io});
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 65%'}}>
				<BoilArt f={f} boil={boil} font={font()} vac={t('真空', 'vacuum')} />
			</AbsoluteFill>
			<Line at={0} y={250} size={t(84, 72)} weight={900}>
				{t('而且在真空裡', 'And in that vacuum,')}
			</Line>
			<Line at={24} y={t(370, 355)} size={t(84, 72)} weight={900} color={C.amber}>
				{t('奶茶會在室溫沸騰', 'milk tea boils\nat room temperature')}
			</Line>
			<Line at={80} y={t(505, 560)} size={40} weight={500} color={C.dim}>
				{t('理論值 10.3 公尺，實際還更低', 'Theory says 10.3 m. Real life: less.')}
			</Line>
		</Exit>
	);
};

export const Everest: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('everest');
	const z = interpolate(f, [0, D], [1.04, 1], {...clamp, easing: io});
	const band = interpolate(f, [24, 50], [0, 1], clamp);
	const lab = interpolate(f, [60, 76], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: useIn(0)}}>
				<World cam={atZ(z)} snow={1} band={band} bandH={MOUTH - 3} floorDim={band} label={{text: t('1 層樓', '1 story'), o: lab, font: font()}} />
			</AbsoluteFill>
			<Exit len={D}>
				<Kicker at={0} y={270}>
					{t('真空吸管搬到聖母峰頂', 'VACUUM STRAW ON EVEREST')}
				</Kicker>
				<Pop at={16} y={330}>
					<Z size={t(84, 72)}>{t('只剩約 ', 'only about ')}</Z>
					<N size={220} color={C.green}>
						3
					</N>
					<Z size={t(100, 90)}>{t(' 公尺', ' m')}</Z>
				</Pop>
				<Line at={60} y={620} size={40} weight={500} color={C.dim}>
					{t('峰頂氣壓只有平地的約 1/3', 'Summit air pressure: ~1/3 of sea level')}
				</Line>
			</Exit>
		</AbsoluteFill>
	);
};

// The ending: the snow and the reach band melt away and the hook's cup is back; the payoff answers the hook in
// headline size (lands by ~50), credits at 70, then everything holds still until the text fades out 6 frames
// before the end, leaving exactly the hook's frame 0.
export const End: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('end');
	const back = interpolate(f, [0, 24], [1, 0], {...clamp, easing: io});
	return (
		<AbsoluteFill>
			<World cam={HOME_B} snow={back} band={back} bandH={MOUTH - 3} floorDim={back} label={{text: t('1 層樓', '1 story'), o: back, font: font()}} />
			<AbsoluteFill style={{opacity: useOut(D - 6, 20)}}>
				<Line at={6} y={560} size={t(96, 84)} weight={900}>
					{t('就算把肺抽成真空', 'Even with a vacuum,')}
				</Line>
				<Line at={30} y={690} size={t(120, 104)} weight={900} color={C.amber}>
					{t('3 層樓就是極限', '3 stories, max.')}
				</Line>
				<div style={{position: 'absolute', left: 60, right: 60, top: 900, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontSize: 32, lineHeight: 1.6, color: C.dim, opacity: useIn(70)}}>
					{t('資料：Harik-Khan 等 1998 · West 1999 · Wikipedia', 'Data: Harik-Khan et al. 1998 · West 1999 · Wikipedia')}
					<br />
					{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

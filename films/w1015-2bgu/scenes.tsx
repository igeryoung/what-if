import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Count, Line, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {BloodBag, HookArt, Mosquito, P, Person, PERSON_H, PigeonShape, rng, Swatter} from './art';
import {dur} from './timeline';

const ease = Easing.inOut(Easing.cubic);

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
// A number that pops in (spring scale) at local frame `at`, centered at `y`.
const Pop: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: f - at, fps, config: {damping: 12, mass: 0.6, stiffness: 180}});
	return (
		<div style={{position: 'absolute', top: y, left: 60, right: 60, textAlign: 'center', lineHeight: 1.1, opacity: Math.min(1, p * 1.4), transform: `scale(${1.25 - 0.25 * p})`}}>
			{children}
		</div>
	);
};
const Zoom: React.FC<{len: number; to?: number; ox?: number; oy?: number; children: React.ReactNode}> = ({len, to = 1.05, ox = 540, oy = 960, children}) => {
	const f = useCurrentFrame();
	const z = interpolate(f, [0, len], [1, to], {...clamp, easing: ease});
	return <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: `${ox}px ${oy}px`}}>{children}</AbsoluteFill>;
};
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
		{children}
	</svg>
);

// ---------- 1. Hook: the pigeon-sized mosquito on the ledge (visible from frame 0) ----------
export const Hook: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('hook');
	const z = interpolate(f, [0, D], [1, 1.05], {...clamp, easing: ease});
	return (
		<Exit len={D} fade={10}>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '540px 1150px'}}>
				<HookArt t={f} />
			</AbsoluteFill>
			<Line at={8} y={t(400, 410)} size={t(112, 92)} weight={900}>
				{t('如果蚊子\n跟鴿子一樣大？', 'What if mosquitoes\nwere pigeon-sized?')}
			</Line>
			<Line at={64} y={t(720, 680)} size={t(64, 56)} weight={700} color={C.amber}>
				{t('叮一口，會吸走多少血？', 'How much blood would\none bite take?')}
			</Line>
		</Exit>
	);
};

// ---------- 2. Weight: 2 mg vs 300 g → 150,000 mosquitoes fill a pigeon ----------
const DOTS = (() => {
	const r = rng(5);
	const out: {x: number; y: number; k: number}[] = [];
	for (let y = -302; y <= 0; y += 9) for (let x = -196; x <= 166; x += 9) out.push({x: x + (r() - 0.5) * 3, y: y + (r() - 0.5) * 3, k: r()});
	return out;
})();

export const Weight: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('weight');
	const p = interpolate(f, [70, 170], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const ghost = useIn(40);
	return (
		<Exit len={D}>
			<Zoom len={D} oy={1000}>
				<Kicker at={0} y={300}>
					{t('先秤一秤', 'FIRST, WEIGH THEM')}
				</Kicker>
				<Line at={10} y={390} size={t(72, 64)} weight={700}>
					{t('一隻蚊子 ≈ 2 毫克', 'A mosquito: about 2 mg')}
				</Line>
				<Line at={42} y={490} size={t(72, 64)} weight={700}>
					{t('一隻鴿子 ≈ 300 克', 'A pigeon: about 300 g')}
				</Line>
				<Svg>
					<defs>
						<clipPath id="wt-clip">
							<PigeonShape transform="translate(560 1235) scale(1.5)" />
						</clipPath>
					</defs>
					<g transform="translate(560 1235) scale(1.5)" opacity={ghost}>
						<g fill="none" stroke={C.dim} strokeWidth={2} strokeDasharray="6 8">
							<PigeonShape />
						</g>
					</g>
					<g clipPath="url(#wt-clip)">
						{DOTS.map((d, i) =>
							d.k < p ? <circle key={i} cx={560 + d.x * 1.5} cy={1235 + d.y * 1.5} r={4.6} fill={i % 7 === 0 ? P.band : '#7D8494'} /> : null,
						)}
					</g>
				</Svg>
				<Pop at={70} y={1270}>
					<N size={t(120, 112)} color={C.amber}>
						{t(<Count to={15} at={70} dur={100} decimals={0} />, <Count to={150000} at={70} dur={100} decimals={0} />)}
					</N>
					<Z size={t(64, 52)}>{t(' 萬隻蚊子', ' mosquitoes')}</Z>
				</Pop>
				<Line at={176} y={1410} size={t(60, 52)} weight={700} color={C.ink}>
					{t('才跟一隻鴿子一樣重', 'weigh as much as one pigeon')}
				</Line>
			</Zoom>
		</Exit>
	);
};

// ---------- 3. One bite: about 3 mg of blood, more than its own weight ----------
export const Bite: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('bite');
	const blood = interpolate(f, [30, 190], [0, 1], {...clamp, easing: ease});
	const bite = interpolate(f, [6, 24], [0, 1], {...clamp, easing: ease});
	const welt = interpolate(f, [40, 200], [0, 1], clamp);
	const z = interpolate(f, [0, D], [1, 1.08], {...clamp, easing: ease});
	const SK = 1290; // skin line
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '600px 1150px'}}>
				<Svg>
					<defs>
						<linearGradient id="bt-skin" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor={P.skin} />
							<stop offset="1" stopColor="#5E3D2E" />
						</linearGradient>
					</defs>
					<Mosquito x={610} y={SK - 12} scale={1.6} id="bt-m" blood={blood} bite={bite} t={f} />
					{/* skin: the top of an arm */}
					<path d={`M -20 ${SK} C 300 ${SK - 24} 760 ${SK - 28} 1100 ${SK} L 1100 1940 L -20 1940 Z`} fill="url(#bt-skin)" />
					<path d={`M -20 ${SK} C 300 ${SK - 24} 760 ${SK - 28} 1100 ${SK}`} fill="none" stroke={P.skinHi} strokeWidth={8} />
					<ellipse cx={320} cy={SK - 14} rx={70 * welt} ry={12 * welt} fill="#D9776A" opacity={0.7 * welt} />
					{Array.from({length: 22}, (_, i) => (
						<circle key={i} cx={40 + ((i * 397) % 1000)} cy={SK + 50 + ((i * 131) % 380)} r={3} fill="#B57A5C" opacity={0.5} />
					))}
				</Svg>
			</AbsoluteFill>
			<Kicker at={0} y={290}>
				{t('叮一口，吸走', 'ONE BITE TAKES')}
			</Kicker>
			<Pop at={24} y={350}>
				<Z size={t(80, 72)} color={C.red}>
					≈{' '}
				</Z>
				<N size={170} color={C.red}>
					3
				</N>
				<Z size={t(80, 72)} color={C.red}>
					{t(' 毫克的血', ' mg of blood')}
				</Z>
			</Pop>
			<Line at={100} y={580} size={t(64, 56)} weight={700} color={C.ink}>
				{t('比牠自己（2 毫克）還重', 'More than its own weight (2 mg)')}
			</Line>
			<Note at={140} y={680}>
				{t('實測：每次吸血約 2.4–3.9 毫克（埃及斑蚊）', 'Measured: 2.4–3.9 mg per meal (Aedes aegypti)')}
			</Note>
		</Exit>
	);
};

// ---------- 4. Scale it up: ≈ 425 mL ≈ one donated bag of blood ----------
export const Bag: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('bag');
	const level = interpolate(f, [16, 110], [0, 425 / 450], {...clamp, easing: Easing.out(Easing.cubic)});
	const mark = useIn(100);
	const big = spring({frame: f - 135, fps: 30, config: {damping: 11, mass: 0.7, stiffness: 160}});
	return (
		<Exit len={D}>
			<Zoom len={D} to={1.06} oy={900}>
				<Kicker at={0} y={280}>
					{t('放大 15 萬倍', 'NOW SCALE IT UP ×150,000')}
				</Kicker>
				<Pop at={16} y={350}>
					<N size={170} color={C.red}>
						<Count to={425} at={16} dur={94} decimals={0} />
					</N>
					<Z size={t(80, 72)} color={C.red}>
						{t(' 毫升', ' mL')}
					</Z>
				</Pop>
				<Note at={40} y={555}>
					{t('3 毫克 × 15 萬 = 450 克 ≈ 425 毫升', '3 mg × 150,000 = 450 g ≈ 425 mL')}
				</Note>
				<Svg>
					<BloodBag x={330} y={640} level={level} id="bg-bag" />
					{/* the 450 mL line of a full donation */}
					<g opacity={mark}>
						<line x1={300} y1={710} x2={680} y2={710} stroke={C.amber} strokeWidth={4} strokeDasharray="14 10" />
					</g>
				</Svg>
				<div
					style={{
						position: 'absolute',
						left: 690,
						top: 664,
						width: 260,
						fontFamily: t(SANS, SANS_EN),
						fontWeight: 700,
						fontSize: t(40, 36),
						lineHeight: 1.25,
						color: C.amber,
						opacity: mark,
						transform: `translateX(${(1 - mark) * 20}px)`,
					}}
				>
					{t('捐血一袋', 'One donation')}
					<br />
					<span style={{fontFamily: NUM, fontWeight: 900, fontSize: 56}}>450 mL</span>
					<br />
					<span style={{fontSize: 32, fontWeight: 400, color: C.dim}}>WHO</span>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 60,
						right: 60,
						top: 1215,
						textAlign: 'center',
						fontFamily: t(SANS, SANS_EN),
						fontWeight: 900,
						fontSize: t(104, 84),
						lineHeight: 1.2,
						color: C.ink,
						opacity: Math.min(1, big * 1.4),
						transform: `scale(${1.2 - 0.2 * big})`,
					}}
				>
					{t('叮一口\n≈ 捐一袋血', 'One bite ≈\none blood donation')
						.split('\n')
						.map((s, i) => (
							<div key={i} style={{color: i === 1 ? C.red : C.ink}}>
								{s}
							</div>
						))}
				</div>
			</Zoom>
		</Exit>
	);
};

// ---------- 5. Your blood: about 5 L; five bites take over 40% ----------
const BITES = [75, 105, 135, 165, 195];
export const Body: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('body');
	const step = 425 / 5000;
	let lost = 0;
	BITES.forEach((b) => (lost += step * interpolate(f, [b, b + 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)})));
	const n = BITES.filter((b) => f >= b).length;
	const danger = interpolate(f, [210, 220], [0, 1], clamp);
	const flash = f >= 210 ? 0.5 + 0.5 * Math.cos(((f - 210) / 15) * Math.PI) : 0;
	const PX = 380;
	const PY = 1440;
	const PS = 0.9;
	const lineY = PY - PERSON_H * PS * 0.6;
	const lineIn = useIn(40);
	return (
		<Exit len={D}>
			<Zoom len={D} to={1.05} oy={1000}>
				<Kicker at={0} y={280}>
					{t('你全身的血', 'ALL YOUR BLOOD')}
				</Kicker>
				<Line at={10} y={340} size={t(96, 84)} weight={900}>
					{t('大約 5 公升', 'About 5 litres')}
				</Line>
				<div style={{position: 'absolute', top: 500, left: 60, right: 60, textAlign: 'center', opacity: n > 0 ? 1 : 0}}>
					<Z size={t(68, 60)} weight={700}>
						{t('被叮 ', 'Bites: ')}
					</Z>
					<N size={96} color={C.red}>
						{n}
					</N>
					<Z size={t(68, 60)} weight={700}>
						{t(' 口', '')}
					</Z>
				</div>
				<Svg>
					<Person x={PX} y={PY} level={1 - lost} scale={PS} />
					<g opacity={lineIn}>
						<line x1={PX - 190} y1={lineY} x2={PX + 190} y2={lineY} stroke={C.amber} strokeWidth={5} strokeDasharray="16 10" />
						<text x={PX + 200} y={lineY + 12} fontFamily={NUM} fontWeight={800} fontSize={36} fill={C.amber}>
							−40%
						</text>
					</g>
					{/* each bite fills one bag */}
					{BITES.map((b, i) => {
						const k = interpolate(f, [b, b + 12], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
						return (
							<g key={i} opacity={Math.min(1, k * 2)} transform={`translate(${0} ${(1 - k) * 30})`}>
								<BloodBag x={760} y={724 + i * 134} level={0.94} id={`bd-${i}`} scale={0.27} />
							</g>
						);
					})}
					<rect x={0} y={0} width={1080} height={1920} fill={C.red} opacity={0.12 * flash * danger} />
				</Svg>
				<Line at={210} y={610} size={t(60, 52)} weight={900} color={C.red}>
					{t('失血超過 40%：危及生命', 'Over 40% lost: life-threatening')}
				</Line>
				<Note at={228} y={1462}>
					{t('5 口 × 425 毫升 ≈ 2.1 公升 ≈ 42%', '5 bites × 425 mL ≈ 2.1 L ≈ 42%')}
				</Note>
			</Zoom>
		</Exit>
	);
};

// ---------- 6. Twist: one that big, you'd see it coming… SMACK ----------
export const See: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('see');
	const HIT = 120;
	const mx = interpolate(f, [0, 60], [-320, 560], {...clamp, easing: Easing.out(Easing.cubic)});
	const my = 1180 + 18 * Math.sin(f / 7);
	const swing = interpolate(f, [HIT - 16, HIT], [64, -33.1], {...clamp, easing: Easing.in(Easing.quad)});
	const shake = f >= HIT && f < HIT + 12 ? (1 - (f - HIT) / 12) * 16 * Math.sin((f - HIT) * 2.6) : 0;
	const squash = f >= HIT ? 0.3 : 1;
	const smack = spring({frame: f - HIT, fps: 30, config: {damping: 9, mass: 0.5, stiffness: 200}});
	return (
		<Exit len={D} fade={8}>
			<AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
				<Svg>
					<g transform={`translate(0 ${f >= HIT ? 1180 * (1 - squash) : 0}) scale(1 ${squash})`}>
						<Mosquito x={mx} y={f >= HIT ? 1180 : my} scale={1.4} id="se-m" t={f} buzz={f >= HIT ? 0 : 1} />
					</g>
					{f >= HIT - 16 && <Swatter x={1120} y={1840} angle={swing} scale={1.425} />}
				</Svg>
				<Line at={10} y={330} size={t(96, 80)} weight={900} out={HIT}>
					{t('不過，這麼大一隻……', 'But one this big…')}
				</Line>
				<Line at={50} y={t(470, 450)} size={t(72, 64)} weight={700} color={C.dim} out={HIT}>
					{t('你一定看得到', "you'd see it coming")}
				</Line>
				<div
					style={{
						position: 'absolute',
						top: 420,
						left: 60,
						right: 60,
						textAlign: 'center',
						fontFamily: t(SANS, SANS_EN),
						fontWeight: 900,
						fontSize: t(170, 150),
						color: C.amber,
						opacity: f >= HIT ? 1 : 0,
						transform: `scale(${0.6 + 0.4 * smack}) rotate(-6deg)`,
					}}
				>
					{t('啪！', 'SMACK!')}
				</div>
			</AbsoluteFill>
		</Exit>
	);
};

// ---------- 7. The real ones: 2 mg, unnoticed; malaria killed 610,000 people in 2024 ----------
const GRID = {cols: 25, n: 610, gap: 28, x0: 204, y0: 690};
export const Tiny: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('tiny');
	const shown = interpolate(f, [120, 210], [0, GRID.n], {...clamp, easing: Easing.out(Easing.cubic)});
	// the real-size mosquito drifts on a lazy loop, never more than a speck
	const mx = 540 + 300 * Math.sin(f / 46) + 60 * Math.sin(f / 13);
	const my = 1000 + 180 * Math.sin(f / 33 + 1) + 40 * Math.cos(f / 9);
	const trail = Array.from({length: 24}, (_, i) => {
		const g = f - i * 2;
		return {x: 540 + 300 * Math.sin(g / 46) + 60 * Math.sin(g / 13), y: 1000 + 180 * Math.sin(g / 33 + 1) + 40 * Math.cos(g / 9), o: 1 - i / 24};
	});
	const z = interpolate(f, [0, D], [1.06, 1], {...clamp, easing: ease});
	const ring = interpolate(f, [30, 45, 100, 114], [0, 1, 1, 0], clamp);
	return (
		<Exit len={D}>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '540px 1000px'}}>
				<Svg>
					{Array.from({length: GRID.n}, (_, i) => (
						<circle
							key={i}
							cx={GRID.x0 + (i % GRID.cols) * GRID.gap}
							cy={GRID.y0 + Math.floor(i / GRID.cols) * GRID.gap}
							r={9}
							fill={C.red}
							opacity={i < shown ? 0.9 : 0}
						/>
					))}
					{trail.map((p, i) => (
						<circle key={i} cx={p.x} cy={p.y} r={2} fill={C.dim} opacity={0.5 * p.o} />
					))}
					<Mosquito x={mx} y={my} scale={0.09} id="tn-m" t={f} buzz={1} />
					<circle cx={mx} cy={my - 12} r={58} fill="none" stroke={C.amber} strokeWidth={3} strokeDasharray="8 8" opacity={ring} />
				</Svg>
			</AbsoluteFill>
			<Line at={10} y={320} size={t(80, 68)} weight={900} out={114}>
				{t('真正的蚊子只有 2 毫克', 'Real ones weigh just 2 mg')}
			</Line>
			<Line at={50} y={t(440, 420)} size={t(64, 56)} weight={700} color={C.dim} out={114}>
				{t('小到你根本沒發現', 'too small to even notice')}
			</Line>
			<Pop at={120} y={300}>
				<N size={t(170, 150)} color={C.red}>
					{t(<Count to={61} at={120} dur={90} decimals={0} />, <Count to={610000} at={120} dur={90} decimals={0} />)}
				</N>
				<Z size={t(80, 64)} color={C.red}>
					{t(' 萬人', ' people')}
				</Z>
			</Pop>
			<Line at={146} y={510} size={t(56, 48)} weight={700}>
				{t('2024 年死於蚊子傳播的瘧疾', 'died of mosquito-borne malaria in 2024')}
			</Line>
			<Note at={200} y={1420}>
				{t('每一點 = 1,000 人 · WHO 世界瘧疾報告 2025', 'Each dot = 1,000 people · WHO World Malaria Report 2025')}
			</Note>
		</Exit>
	);
};

// ---------- 8. End: back on the ledge. Payoff lands at 8, credits at 60, still until the last ~26 frames ----------
export const End: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('end');
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: useIn(0, 22)}}>
				<HookArt t={f - D} />
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: useOut(D - 6, 20)}}>
				<Line at={8} y={t(380, 380)} size={t(120, 100)} weight={900}>
					{t('大蚊子要你的血', 'Big: your blood.')}
				</Line>
				<Line at={34} y={t(530, 510)} size={t(120, 100)} weight={900} color={C.red}>
					{t('小蚊子要你的命', 'Small: your life.')}
				</Line>
				<Line at={114} y={t(720, 680)} size={t(64, 60)} weight={900} color={C.amber}>
					{t('所以下次那一巴掌，別客氣。', "So next time,\ndon't hold back the slap.")}
				</Line>
				<div style={{position: 'absolute', left: 60, right: 60, top: 1392, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontSize: 32, lineHeight: 1.6, color: C.dim, opacity: useIn(60)}}>
					{t('資料：WHO、Harrington 2001、緬因州 CDC、維基百科', 'Data: WHO, Harrington 2001, Maine CDC, Wikipedia')}
					<br />
					{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

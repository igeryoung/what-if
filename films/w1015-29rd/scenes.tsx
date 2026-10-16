import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Count, Line, Pill, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {Bowl, CatFace, CatSide, Foreleg, GREY, HOOK, HookArt, Laptop, LOOK_MUG, Pouch, rng, Sideboard, TIGER, TV} from './art';
import {DNA_REVEAL, DNA_SHRINK, dur, FOOD_POUCH, HOOK_CRASH, HOOK_PUSH, LAP_LAND, LITTER_GROW, LITTER_TABLE, PUSH_SWIPES} from './timeline';

const io = Easing.inOut(Easing.cubic);

// Fades the whole scene out over its last `fade` frames.
const Exit: React.FC<{len: number; fade?: number; children: React.ReactNode}> = ({len, fade = 10, children}) => (
	<AbsoluteFill style={{opacity: useOut(len, fade)}}>{children}</AbsoluteFill>
);
const Note: React.FC<{at: number; y: number; out?: number; children: React.ReactNode}> = ({at, y, out, children}) => (
	<Line at={at} y={y} size={32} weight={400} color={C.dim} lift={10} out={out}>
		{children}
	</Line>
);
const N: React.FC<{size: number; color?: string; children: React.ReactNode}> = ({size, color = C.ink, children}) => (
	<span style={{fontFamily: NUM, fontWeight: 900, fontSize: size, color, letterSpacing: -size * 0.03, fontVariantNumeric: 'tabular-nums'}}>{children}</span>
);
const Z: React.FC<{size: number; color?: string; weight?: number; children: React.ReactNode}> = ({size, color = C.ink, weight = 900, children}) => (
	<span style={{fontFamily: useLang() === 'en' ? SANS_EN : SANS, fontWeight: weight, fontSize: size, color}}>{children}</span>
);
// A number that pops in (scale + fade), centred, top at y.
const Pop: React.FC<{at: number; y: number; out?: number; children: React.ReactNode}> = ({at, y, out, children}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: f - at, fps, config: {damping: 12, mass: 0.6, stiffness: 180}});
	const o = useOut(out ?? 1e9);
	return (
		<div style={{position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', lineHeight: 1.1, opacity: Math.min(1, p * 1.4) * o, transform: `scale(${1.25 - 0.25 * p})`}}>
			{children}
		</div>
	);
};
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
		{children}
	</svg>
);
// Deterministic shake that decays over 12 frames after each hit frame.
const shake = (f: number, hits: number[]) => {
	let dx = 0;
	let dy = 0;
	for (const h of hits) {
		const k = f - h;
		if (k >= 0 && k < 12) {
			const a = 14 * (1 - k / 12);
			dx += a * Math.sin(k * 2.7);
			dy += a * Math.cos(k * 3.3);
		}
	}
	return `translate(${dx}px, ${dy}px)`;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────────────────────────
// Paw: rest → shove → rest. The mug rides on the paw until it passes the table edge, then falls out of frame by HOOK_CRASH.
const pawX = (f: number) => interpolate(f, [HOOK_PUSH[0], HOOK_PUSH[1], 80, 120], [HOOK.pawRest, 880, 880, HOOK.pawRest], {...clamp, easing: io});
const EDGE = 1000;
const mugRide = (f: number) => Math.max(HOOK.mugRest, pawX(f) + 100 + HOOK.mugW / 2);
const TIP = (() => {
	for (let f = 0; f < HOOK_CRASH; f += 0.25) if (mugRide(f) >= EDGE) return f;
	return HOOK_CRASH - 20;
})();
const mugAt = (f: number) => {
	if (f < TIP) return {x: mugRide(f), base: HOOK.mugBase, rot: 0};
	const k = f - TIP;
	const g = (2080 - HOOK.mugBase) / Math.pow(HOOK_CRASH - TIP, 2);
	return {x: EDGE + 4.5 * k, base: HOOK.mugBase + g * k * k, rot: 1.2 * k * k};
};

export const Hook: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const zoom = interpolate(f, [0, dur('hook')], [1, 1.04], clamp);
	const lookX = interpolate(f, [0, TIP, HOOK_CRASH, 80, 100], [LOOK_MUG[0], 26, 24, 0, 0], clamp);
	const lookY = interpolate(f, [0, TIP, HOOK_CRASH, 80], [LOOK_MUG[1], 10, 38, 0], clamp);
	const blink = interpolate(f, [100, 108, 124, 134], [0, 0.85, 0.85, 0], clamp);
	return (
		<Exit len={dur('hook')}>
			<AbsoluteFill style={{transform: `scale(${zoom}) ${shake(f, [HOOK_CRASH])}`, transformOrigin: '50% 70%'}}>
				<HookArt pawX={pawX(f)} mug={f < HOOK_CRASH + 4 ? mugAt(f) : null} look={[lookX, lookY]} blink={blink} />
			</AbsoluteFill>
			<Line at={8} y={300} size={t(110, 92)} weight={900}>
				{t('如果你家的貓\n跟老虎一樣大？', 'What if your cat\nwere as big\nas a tiger?')}
			</Line>
		</Exit>
	);
};

// ─── Lap: 220 kg ──────────────────────────────────────────────────────────────────────────────────
const Person: React.FC<{squash: number}> = ({squash}) => (
	<g>
		<g transform={`translate(0 ${squash * 30})`}>
			<circle cx={560} cy={1070} r={74} fill="#E2A57E" />
			<path d="M 486 1060 C 482 990 530 976 560 976 C 600 976 642 996 636 1056 C 618 1020 560 1010 520 1030 Z" fill="#3A2A22" />
			<path d="M 528 1066 L 540 1074 M 528 1082 L 540 1074 M 594 1066 L 582 1074 M 594 1082 L 582 1074" stroke="#2A1D16" strokeWidth={6} strokeLinecap="round" />
			<ellipse cx={561} cy={1110} rx={12} ry={15} fill="#2A1D16" />
			<path d="M 650 1010 q 10 -18 0 -30 q -12 14 0 30 Z" fill="#7FD4F5" />
		</g>
		<rect x={470} y={1520} width={62} height={46} rx={18} fill="#2F5DA8" />
		<rect x={600} y={1520} width={62} height={46} rx={18} fill="#2F5DA8" />
	</g>
);

export const Lap: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const drop = interpolate(f, [10, LAP_LAND], [-900, 0], {...clamp, easing: Easing.in(Easing.quad)});
	const sq = f < LAP_LAND ? 0 : Math.max(0, 1 - spring({frame: f - LAP_LAND, fps, config: {damping: 7, mass: 0.5, stiffness: 160}}));
	const squash = f < LAP_LAND ? 0 : 0.55 + 0.45 * sq;
	const zoom = interpolate(f, [0, dur('lap')], [1, 1.05], {...clamp, easing: io});
	return (
		<Exit len={dur('lap')}>
			<AbsoluteFill style={{transform: `scale(${zoom}) ${shake(f, [LAP_LAND])}`, transformOrigin: '50% 75%'}}>
				<Svg>
					<rect x={90} y={1040} width={900} height={300} rx={60} fill="#2D4A5A" />
					<g transform={`translate(0 ${squash * 18})`}>
						<rect x={120} y={1320} width={840} height={150} rx={40} fill="#365A6C" />
					</g>
					<rect x={50} y={1180} width={140} height={330} rx={50} fill="#2A4553" />
					<rect x={890} y={1180} width={140} height={330} rx={50} fill="#2A4553" />
					<rect x={130} y={1500} width={36} height={60} fill="#1D2F38" />
					<rect x={914} y={1500} width={36} height={60} fill="#1D2F38" />
					<Person squash={squash} />
					<g transform={`translate(0 ${drop + squash * 26})`}>
						<path d="M 900 1360 C 980 1400 1000 1520 940 1590 C 900 1630 860 1600 880 1570" stroke={GREY.fur} strokeWidth={56} strokeLinecap="round" fill="none" />
						<path d="M 900 1360 C 980 1400 1000 1520 940 1590 C 900 1630 860 1600 880 1570" stroke={GREY.stripe} strokeWidth={58} strokeDasharray="14 46" fill="none" />
						<ellipse cx={590} cy={1300} rx={400} ry={175} fill={GREY.fur} />
						{[330, 420, 510, 600, 690, 780, 860].map((x, i) => (
							<path key={x} d={`M ${x} ${1140 + (i % 2) * 8} Q ${x + 24} ${1210} ${x - 6} ${1290}`} stroke={GREY.stripe} strokeWidth={16} strokeLinecap="round" fill="none" />
						))}
						<ellipse cx={440} cy={1462} rx={62} ry={30} fill={GREY.light} />
						<ellipse cx={570} cy={1468} rx={62} ry={30} fill={GREY.light} />
						<CatFace x={300} y={1200} k={0.52} look={[-6, 10]} blink={interpolate(f, [150, 158, 178, 186], [0, 0.6, 0.6, 0], clamp)} />
					</g>
				</Svg>
			</AbsoluteFill>
			<Line at={LAP_LAND - 6} y={250} size={t(96, 88)} weight={900}>
				{t('牠還是想\n坐你腿上。', 'It still wants\nyour lap.')}
			</Line>
			<Pop at={LAP_LAND + 6} y={t(520, 500)}>
				<N size={200} color={C.amber}>
					<Count from={0} to={220} at={LAP_LAND + 6} dur={30} decimals={0} />
				</N>
				<Z size={t(90, 96)} color={C.amber}>
					{t(' 公斤', ' kg')}
				</Z>
			</Pop>
			<Line at={LAP_LAND + 54} y={t(770, 750)} size={t(64, 56)} weight={700}>
				{t('約 50 隻家貓的重量', '≈ the weight of 50 house cats')}
			</Line>
			<Note at={LAP_LAND + 84} y={t(864, 836)}>
				{t('成年公孟加拉虎 200–260 公斤；家貓約 4.5 公斤', 'Adult male Bengal tiger: 200–260 kg\nHouse cat: about 4.5 kg')}
			</Note>
		</Exit>
	);
};

// ─── Food: 5–6 kg of meat a day ───────────────────────────────────────────────────────────────────
const POUCHES = (() => {
	const r = rng(21);
	return Array.from({length: 65}, (_, i) => ({col: i % 13, row: Math.floor(i / 13), at: FOOD_POUCH[0] + (i / 65) * (FOOD_POUCH[1] - FOOD_POUCH[0]), tilt: (r() - 0.5) * 14}));
})();

export const Food: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const zoom = interpolate(f, [0, dur('food')], [1.05, 1], {...clamp, easing: io});
	const look: [number, number] = [interpolate(f, [120, 180], [-10, 10], clamp), -24];
	return (
		<Exit len={dur('food')}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 60%'}}>
				<Svg>
					{POUCHES.map((p, i) => {
						const s = spring({frame: f - p.at, fps, config: {damping: 10, mass: 0.5, stiffness: 200}});
						return (
							<g key={i} opacity={Math.min(1, s * 2)} transform={`rotate(${p.tilt * s} ${120 + p.col * 70} ${900 + p.row * 76})`}>
								<Pouch x={120 + p.col * 70} y={900 + p.row * 76} k={0.9 * s} i={i} />
							</g>
						);
					})}
					<CatFace x={540} y={1640} k={0.95} look={look} blink={interpolate(f, [200, 206, 216, 222], [0, 0.9, 0.9, 0], clamp)} />
					<Bowl x={540} y={1790} />
				</Svg>
			</AbsoluteFill>
			<Line at={0} y={240} size={t(88, 88)} weight={900}>
				{t('清晨 5 點，\n牠來討早餐了。', '5 a.m.\nBreakfast time.')}
			</Line>
			<Pop at={40} y={470}>
				<N size={170} color={C.amber}>
					5–6
				</N>
				<Z size={t(76, 64)} color={C.amber}>
					{t(' 公斤肉/天', ' kg meat/day')}
				</Z>
			</Pop>
			<Line at={FOOD_POUCH[0] - 10} y={680} size={t(64, 54)} weight={700}>
				{t('≈ 65 包貓餐包', '≈ 65 cat-food pouches')}
			</Line>
			<Note at={70} y={772}>
				{t('老虎平均需求（San Diego Zoo）· 一包 85 g', 'A tiger’s average need (San Diego Zoo) · 85 g pouch')}
			</Note>
		</Exit>
	);
};

// ─── Litter box: ~3 m ─────────────────────────────────────────────────────────────────────────────
const BOX = {cx: 540, cy: 1030, w: 900, h: 560};
const LITTER = (() => {
	const r = rng(33);
	return Array.from({length: 70}, () => ({x: (r() - 0.5) * 0.92, y: (r() - 0.5) * 0.88, r: 6 + r() * 10, o: 0.25 + r() * 0.35}));
})();

export const Litter: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const g = interpolate(f, [LITTER_GROW[0], LITTER_GROW[1]], [0.23, 1], {...clamp, easing: io});
	const pp = spring({frame: f - LITTER_TABLE, fps, config: {damping: 14, mass: 0.7, stiffness: 150}});
	const zoom = interpolate(f, [0, dur('litter')], [1.04, 1], {...clamp, easing: io});
	const w = BOX.w * g;
	const h = BOX.h * g;
	const TW = 822; // 2.74 m at 300 px/m
	const TH = 457; // 1.525 m
	const dimO = interpolate(f, [LITTER_GROW[1], LITTER_GROW[1] + 12], [0, 1], clamp);
	return (
		<Exit len={dur('litter')}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 55%'}}>
				<Svg>
					<g opacity={Math.min(1, useIn(20) * 1.5)}>
						<rect x={BOX.cx - w / 2 - 14 * g} y={BOX.cy - h / 2 - 14 * g} width={w + 28 * g} height={h + 28 * g} rx={30 * g} fill="#7C8796" />
						<rect x={BOX.cx - w / 2} y={BOX.cy - h / 2} width={w} height={h} rx={18 * g} fill="#CDB892" />
						{LITTER.map((c, i) => (
							<circle key={i} cx={BOX.cx + c.x * w} cy={BOX.cy + c.y * h} r={c.r * g} fill="#A99470" opacity={c.o} />
						))}
					</g>
					<g opacity={dimO} stroke={C.amber} strokeWidth={5} fill="none">
						<line x1={BOX.cx - BOX.w / 2 - 14} y1={BOX.cy - BOX.h / 2 - 36} x2={BOX.cx + BOX.w / 2 + 14} y2={BOX.cy - BOX.h / 2 - 36} />
						<line x1={BOX.cx - BOX.w / 2 - 14} y1={BOX.cy - BOX.h / 2 - 50} x2={BOX.cx - BOX.w / 2 - 14} y2={BOX.cy - BOX.h / 2 - 22} />
						<line x1={BOX.cx + BOX.w / 2 + 14} y1={BOX.cy - BOX.h / 2 - 50} x2={BOX.cx + BOX.w / 2 + 14} y2={BOX.cy - BOX.h / 2 - 22} />
					</g>
					<g opacity={Math.min(1, pp * 1.5)} transform={`translate(0 ${(1 - pp) * 700})`}>
						<rect x={BOX.cx - TW / 2} y={BOX.cy - TH / 2} width={TW} height={TH} fill="#1F5D8C" opacity={0.95} />
						<rect x={BOX.cx - TW / 2 + 6} y={BOX.cy - TH / 2 + 6} width={TW - 12} height={TH - 12} fill="none" stroke="#F4F1EC" strokeWidth={6} />
						<line x1={BOX.cx - TW / 2 + 6} y1={BOX.cy} x2={BOX.cx + TW / 2 - 6} y2={BOX.cy} stroke="#F4F1EC" strokeWidth={3} />
						<rect x={BOX.cx - 7} y={BOX.cy - TH / 2 - 24} width={14} height={TH + 48} fill="#14181E" />
						<text x={BOX.cx - TW / 4} y={BOX.cy - TH / 4 + 16} textAnchor="middle" fontFamily={NUM} fontWeight={800} fontSize={44} fill="#F4F1EC">
							2.74 m
						</text>
					</g>
				</Svg>
			</AbsoluteFill>
			<Line at={0} y={240} size={t(96, 88)} weight={900}>
				{t('牠的貓砂盆……', 'And its litter box?')}
			</Line>
			<Pop at={LITTER_GROW[0] + 30} y={380}>
				<Z size={t(90, 84)} color={C.amber}>
					{t('約 ', 'About ')}
				</Z>
				<N size={200} color={C.amber}>
					3
				</N>
				<Z size={t(90, 84)} color={C.amber}>
					{t(' 公尺長', ' m long')}
				</Z>
			</Pop>
			<Note at={LITTER_GROW[0] + 60} y={612}>
				{t('獸醫建議：盆長 = 貓身長（不含尾）× 1.5\n老虎身長約 1.8–2.1 公尺', 'Vets: box = 1.5 × body length (tail not included)\nTiger body: about 1.8–2.1 m')}
			</Note>
			<Line at={LITTER_TABLE + 20} y={1350} size={t(80, 60)} weight={900}>
				{t('比乒乓球桌還長。', 'Longer than a ping-pong table.')}
			</Line>
		</Exit>
	);
};

// ─── Push: laptop, TV, the whole table ────────────────────────────────────────────────────────────
const TOP = 1200;
const [S1, S2, S3] = PUSH_SWIPES;
const fly = (f: number, start: number, x0: number, vx: number, lift: number, drop: number, spin: number) => {
	if (f < start) return {x: x0, dy: 0, rot: 0};
	const k = f - start;
	const g = (drop + lift * 24) / (24 * 24);
	return {x: x0 + vx * k, dy: -lift * k + g * k * k, rot: spin * k};
};

export const Push: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const paw = interpolate(f, [S1, S1 + 8, S1 + 20, S1 + 50, S2, S2 + 8, S2 + 20, S2 + 50, S3, S3 + 14], [180, 520, 520, 200, 200, 640, 640, 200, 200, 330], {...clamp, easing: Easing.inOut(Easing.quad)});
	const lap = fly(f, S1 + 6, 360, 22, 6, 900, 9);
	const tv = fly(f, S2 + 6, 760, 16, 6, 1050, 6);
	const flip = interpolate(f, [S3 + 4, S3 + 30], [0, 100], {...clamp, easing: Easing.in(Easing.quad)});
	const flipDrop = interpolate(f, [S3 + 18, S3 + 30], [0, 600], {...clamp, easing: Easing.in(Easing.quad)});
	const zoom = interpolate(f, [0, dur('push')], [1, 1.06], {...clamp, easing: io});
	return (
		<Exit len={dur('push')}>
			<AbsoluteFill style={{transform: `scale(${zoom}) ${shake(f, [S1 + 30, S2 + 30, S3 + 30])}`, transformOrigin: '50% 65%'}}>
				<Svg>
					<rect x={0} y={1556} width={1080} height={364} fill="#0A0B0D" />
					<g transform={`translate(0 ${flipDrop}) rotate(${flip} 1000 ${TOP + 356})`}>
						<Sideboard top={TOP} />
						{f < S2 + 6 + 30 ? <TV x={tv.x} y={TOP + tv.dy} rot={tv.rot} /> : null}
					</g>
					{f < S1 + 6 + 30 ? <Laptop x={lap.x} y={TOP + lap.dy} rot={lap.rot} /> : null}
					<Foreleg x={paw} y={TOP} />
					<CatFace x={-30} y={820} k={0.85} look={[26, 26]} />
				</Svg>
			</AbsoluteFill>
			<Line at={0} y={330} size={t(110, 96)} weight={900} out={S1 - 4}>
				{t('杯子\n只是開始。', 'The mug was\njust the start.')}
			</Line>
			<Line at={S1 + 2} y={330} size={t(130, 120)} weight={900} out={S2 - 4} color={C.amber}>
				{t('筆電。', 'The laptop.')}
			</Line>
			<Line at={S2 + 2} y={330} size={t(130, 120)} weight={900} out={S3 - 4} color={C.amber}>
				{t('電視。', 'The TV.')}
			</Line>
			<Line at={S3 + 2} y={330} size={t(130, 110)} weight={900} color={C.red}>
				{t('整張桌子。', 'The whole\ntable.')}
			</Line>
		</Exit>
	);
};

// ─── DNA: the twist ───────────────────────────────────────────────────────────────────────────────
export const Dna: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const shrink = spring({frame: f - DNA_SHRINK, fps, config: {damping: 14, mass: 0.8, stiffness: 120}});
	const k = 0.72 - (0.72 - 0.2) * shrink;
	const gx = 540 + 20 * shrink;
	const gy = 1600 - (1600 - 1258) * shrink;
	const zoom = interpolate(f, [0, dur('dna')], [1.04, 1], {...clamp, easing: io});
	const a1 = useIn(4);
	const a2 = useIn(14);
	return (
		<Exit len={dur('dna')}>
			<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 70%'}}>
				<Svg>
					<g opacity={a1}>
						<CatSide x={540} y={1210} k={0.72} coat={TIGER} tail="down" />
					</g>
					<g opacity={a2}>
						<CatSide x={gx} y={gy} k={k} coat={GREY} collar tail="up" />
					</g>
				</Svg>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 60, top: 780, opacity: a1 * useOut(DNA_SHRINK + 40, 12)}}>
				<Pill size={36}>{t('老虎', 'Tiger')}</Pill>
			</div>
			<div style={{position: 'absolute', left: 60, top: 1330, opacity: a2 * useOut(DNA_SHRINK - 4, 10)}}>
				<Pill size={36} bg={C.faint}>
					{t('你的巨貓', 'Your giant cat')}
				</Pill>
			</div>
			<Line at={0} y={280} size={t(100, 88)} weight={900} out={DNA_REVEAL - 4}>
				{t('等等……\n這不就是老虎嗎？', 'Wait…\nisn’t that just a tiger?')}
			</Line>
			<Pop at={DNA_REVEAL} y={250} out={DNA_SHRINK - 4}>
				<N size={230} color={C.amber}>
					95.6
				</N>
				<N size={130} color={C.amber}>
					%
				</N>
			</Pop>
			<Line at={DNA_REVEAL + 14} y={530} size={t(60, 52)} weight={700} out={DNA_SHRINK - 4}>
				{t('老虎和家貓的基因體相似度', 'Genome similarity,\ntiger vs. house cat')}
			</Line>
			<Line at={DNA_REVEAL + 50} y={t(624, 676)} size={t(44, 40)} weight={400} color={C.dim} out={DNA_SHRINK - 4}>
				{t('比你和大猩猩（94.8%）還接近', 'Closer than you and a gorilla (94.8%)')}
			</Line>
			<Line at={DNA_SHRINK + 6} y={280} size={t(100, 92)} weight={900}>
				{t('你的貓，本來就是\n一隻迷你老虎。', 'Your cat was always\na mini tiger.')}
			</Line>
		</Exit>
	);
};

// ─── Ending ───────────────────────────────────────────────────────────────────────────────────────
// The hook's table, mug and face come back; the payoff lands on the cadence and holds; credits sit at the top.
// Text is fully gone 6 frames before the end, so the last frames are the hook's frame 0 (zoom 1, mug at rest).
export const End: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const D = dur('end');
	const zoom = interpolate(f, [0, 90], [1.04, 1], {...clamp, easing: io});
	const blink = interpolate(f, [150, 158, 170, 178], [0, 0.85, 0.85, 0], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: useIn(0), transform: `scale(${zoom})`, transformOrigin: '50% 70%'}}>
				<HookArt blink={blink} />
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: useOut(D - 6, 20)}}>
				<Line at={6} y={400} size={t(120, 120)} weight={900}>
					{t('體型變了，\n牠沒變。', 'New size.\nSame cat.')}
				</Line>
				<Line at={81} y={740} size={t(68, 64)} weight={900} color={C.amber}>
					{t('所以你的杯子……\n還是保不住。', 'So your mug?\nStill doomed.')}
				</Line>
				<div style={{position: 'absolute', left: 60, right: 60, top: 220, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontSize: 32, lineHeight: 1.6, color: C.dim, whiteSpace: 'pre-wrap', opacity: useIn(60)}}>
					{t('資料：Cho 等 2013（Nature Communications）\nSan Diego Zoo · AAFP/ISFM · Wikipedia', 'Data: Cho et al. 2013 (Nature Communications)\nSan Diego Zoo · AAFP/ISFM · Wikipedia')}
					<br />
					{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Count, Line, useIn, useOut} from '../../engine/kit/kit';
import {useLang, useT} from '../../engine/kit/lang';
import {C, NUM, SANS, SANS_EN} from '../../engine/kit/theme';
import {blinkLid, Dark, Eye, Frame, HookArt, P, rng} from './art';
import {dur, HOOK_BLINKS, markFrame, SWEEP} from './timeline';

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
// Big number + unit that pops in at `at`.
const Big: React.FC<{at: number; y: number; children: React.ReactNode}> = ({at, y, children}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame: f - at, fps, config: {damping: 12, mass: 0.6, stiffness: 180}});
	return (
		<div style={{position: 'absolute', top: y, left: 0, right: 0, textAlign: 'center', lineHeight: 1.1, opacity: Math.min(1, pop * 1.4), transform: `scale(${1.25 - 0.25 * pop})`}}>
			{children}
		</div>
	);
};
const useZoom = (len: number, to = 1.06) => interpolate(useCurrentFrame(), [0, len], [1, to], {...clamp, easing: Easing.inOut(Easing.cubic)});

const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
	const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
	const [x0, y0] = p(a0);
	const [x1, y1] = p(a1);
	return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};

// ── Hook: the eye, blinking. Every blink, the whole screen goes dark. ──
export const Hook: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const lid = Math.max(...HOOK_BLINKS.map((b) => blinkLid(f, b)));
	return (
		<Exit len={dur('hook')}>
			<AbsoluteFill style={{transform: `scale(${useZoom(dur('hook'), 1.03)})`}}>
				<HookArt lid={lid} />
				<Line at={6} y={330} size={t(72, 68)} weight={700} color={C.dim}>
					{t('如果把你一輩子', 'What if you added up')}
				</Line>
				<Line at={14} y={440} size={t(116, 104)} weight={900}>
					{t('眨眼的時間\n加起來？', 'every blink\nof your life?')}
				</Line>
			</AbsoluteFill>
			<Dark v={lid} max={0.88} />
		</Exit>
	);
};

// ── One blink, in slow motion: ~0.3 s of nothing. ──
export const Blink: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const lid = interpolate(f, [40, 82, 108, 150], [0, 1, 1, 0], {...clamp, easing: Easing.inOut(Easing.sin)});
	return (
		<Exit len={dur('blink')}>
			<AbsoluteFill style={{transform: `scale(${useZoom(dur('blink'))})`}}>
				<div style={{position: 'absolute', left: 200, top: 1010 - 170, width: 680}}>
					<Eye w={680} lid={lid} id="b-eye" />
				</div>
				<Dark v={lid} max={0.72} />
				<Kicker at={0} y={290}>
					{t('一次眨眼', 'ONE BLINK')}
				</Kicker>
				<Big at={20} y={380}>
					<N size={200} color={C.amber}>
						<Count from={0} to={0.3} at={40} dur={110} decimals={2} />
					</N>
					<Z size={t(100, 90)}>{t(' 秒', ' s')}</Z>
				</Big>
				<Line at={30} y={720} size={32} weight={700} color={C.dim} tracking={4} lift={10} out={160}>
					{t('慢動作', 'SLOW MOTION')}
				</Line>
				<Line at={150} y={1250} size={t(64, 60)} weight={700}>
					{t('這段時間，你什麼也看不見', 'For that long, you see nothing')}
				</Line>
				<Note at={170} y={1400}>
					{t('每次眨眼，視覺中斷約 0.3 秒 · Pitigoi 等，eNeuro 2024', 'Each blink blacks out vision for ~0.3 s\nPitigoi et al., eNeuro 2024')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ── A minute on a stopwatch ring: 15 blinks, gathered into 4.5 s of dark. ──
const RING = {cx: 540, cy: 880, r: 290};
export const Minute: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const prog = interpolate(f, [SWEEP[0], SWEEP[1]], [0, 1], clamp);
	const hand = -90 + 360 * prog;
	const n = Array.from({length: 15}, (_, k) => k).filter((k) => f >= markFrame(k)).length;
	const lid = Math.max(...Array.from({length: 15}, (_, k) => blinkLid(f, Math.round(markFrame(k)), 2, 1, 4)));
	const gather = interpolate(f, [140, 174], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const merged = interpolate(f, [168, 182], [0, 1], clamp);
	const {cx, cy, r} = RING;
	return (
		<Exit len={dur('minute')}>
			<AbsoluteFill style={{transform: `scale(${useZoom(dur('minute'), 1.05)})`}}>
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
					<circle cx={cx} cy={cy} r={r} fill="none" stroke={C.faint} strokeWidth={18} />
					{Array.from({length: 60}, (_, i) => {
						const a = ((-90 + i * 6) * Math.PI) / 180;
						const r0 = r + (i % 5 === 0 ? 26 : 18);
						return <line key={i} x1={cx + Math.cos(a) * (r + 14)} y1={cy + Math.sin(a) * (r + 14)} x2={cx + Math.cos(a) * r0} y2={cy + Math.sin(a) * r0} stroke={C.dim} strokeWidth={i % 5 === 0 ? 5 : 2} opacity={0.6} />;
					})}
					{prog > 0.002 && prog < 0.998 && <path d={arc(cx, cy, r, -90, hand)} fill="none" stroke={C.ink} strokeOpacity={0.35 * (1 - gather)} strokeWidth={18} />}
					{prog >= 0.998 && <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.ink} strokeOpacity={0.35 * (1 - gather)} strokeWidth={18} />}
					{/* the 15 blinks, then slid together into one 27° (= 4.5 s) arc at the top */}
					{Array.from({length: 15}, (_, k) => {
						const on = interpolate(f, [markFrame(k), markFrame(k) + 6], [0, 1], clamp);
						const a0 = -90 + (k + 0.5) * 24;
						const a1 = -90 - 13.5 + (k + 0.5) * 1.8;
						const a = a0 + (a1 - a0) * gather;
						const rad = (a * Math.PI) / 180;
						return <circle key={k} cx={cx + Math.cos(rad) * r} cy={cy + Math.sin(rad) * r} r={15 * on} fill="#000" stroke={C.amber} strokeWidth={4} opacity={1 - merged} />;
					})}
					<path d={arc(cx, cy, r, -90 - 13.5, -90 + 13.5)} fill="none" stroke={C.amber} strokeWidth={46} opacity={merged} />
					<path d={arc(cx, cy, r, -90 - 12, -90 + 12)} fill="none" stroke="#000" strokeWidth={34} opacity={merged} />
					<line x1={cx} y1={cy} x2={cx + Math.cos((hand * Math.PI) / 180) * (r - 40)} y2={cy + Math.sin((hand * Math.PI) / 180) * (r - 40)} stroke={C.amber} strokeWidth={8} strokeLinecap="round" opacity={1 - gather} />
					<circle cx={cx} cy={cy} r={12} fill={C.amber} opacity={1 - gather} />
				</svg>
				<Dark v={lid} max={0.5} />
				<Kicker at={0} y={280}>
					{t('每一分鐘', 'EVERY MINUTE')}
				</Kicker>
				<div style={{position: 'absolute', left: 0, right: 0, top: cy - 150, textAlign: 'center', lineHeight: 1, opacity: useIn(8)}}>
					<N size={210}>{n}</N>
					<div style={{marginTop: 18}}>
						<Z size={t(64, 56)} weight={700} color={C.dim}>
							{t('次眨眼', 'blinks')}
						</Z>
					</div>
				</div>
				<Line at={180} y={1250} size={t(100, 84)} weight={900} color={C.amber}>
					{t('= 4.5 秒的黑暗', '= 4.5 seconds of dark')}
				</Line>
				<Note at={198} y={1410}>
					{t('成人每分鐘約眨眼 10–20 次，這裡取 15 次', 'Adults blink ~10–20 times a minute; we use 15')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ── A waking day: 14,400 slivers of dark, swept together into 72 minutes. ──
const SLIVERS = (() => {
	const r = rng(21);
	return Array.from({length: 150}, () => 0.01 + r() * 0.98).sort((a, b) => a - b);
})();
export const Day: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const BX = 90;
	const BW = 900;
	const BY = 760;
	const BH = 120;
	const cursor = interpolate(f, [20, 150], [0, 1], clamp);
	const gather = interpolate(f, [168, 202], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const solid = interpolate(f, [198, 210], [0, 1], clamp);
	const share = 0.075; // 72 min of 960
	return (
		<Exit len={dur('day')}>
			<AbsoluteFill style={{transform: `scale(${useZoom(dur('day'), 1.05)})`}}>
				<Kicker at={0} y={280}>
					{t('醒著的 16 小時', '16 WAKING HOURS')}
				</Kicker>
				<Big at={14} y={360}>
					<N size={170}>
						<Count from={0} to={14400} at={20} dur={130} decimals={0} />
					</N>
					<Z size={t(80, 64)} weight={700} color={C.dim}>
						{t(' 次', ' blinks')}
					</Z>
				</Big>
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: useIn(4)}}>
					<defs>
						<linearGradient id="day-g" x1="0" x2="1" y1="0" y2="0">
							<stop offset="0%" stopColor="#E89A3A" />
							<stop offset="45%" stopColor="#7FB8F0" />
							<stop offset="100%" stopColor="#6D55C9" />
						</linearGradient>
						<clipPath id="day-clip">
							<rect x={BX} y={BY} width={BW} height={BH} rx={22} />
						</clipPath>
					</defs>
					<rect x={BX} y={BY} width={BW} height={BH} rx={22} fill="url(#day-g)" opacity={0.85} />
					<g clipPath="url(#day-clip)">
						{SLIVERS.map((x, i) => {
							const on = cursor >= x ? 1 : 0;
							const x1 = 1 - share + ((i + 0.5) / SLIVERS.length) * share;
							const xx = x + (x1 - x) * gather;
							return <rect key={i} x={BX + xx * BW - 1.5} y={BY} width={3} height={BH} fill="#000" opacity={on * (1 - solid)} />;
						})}
						<rect x={BX + (1 - share) * BW} y={BY} width={share * BW} height={BH} fill="#000" opacity={solid} />
					</g>
					<rect x={BX + (1 - share) * BW - 3} y={BY - 6} width={share * BW + 6} height={BH + 12} rx={8} fill="none" stroke={C.amber} strokeWidth={5} opacity={solid} />
					{cursor > 0 && cursor < 1 && <rect x={BX + cursor * BW - 3} y={BY - 18} width={6} height={BH + 36} rx={3} fill={C.ink} />}
					<text x={BX} y={BY + BH + 52} fill={C.dim} fontFamily={NUM} fontWeight={600} fontSize={32}>
						7:00
					</text>
					<text x={BX + BW} y={BY + BH + 52} fill={C.dim} fontFamily={NUM} fontWeight={600} fontSize={32} textAnchor="end">
						23:00
					</text>
				</svg>
				<Line at={210} y={1020} size={t(100, 84)} weight={900} color={C.amber}>
					{t('= 72 分鐘看不見', '= 72 minutes unseen')}
				</Line>
				<Note at={226} y={1400}>
					{t('16 小時 × 60 分 × 15 次 = 14,400 次\n× 0.3 秒 = 72 分鐘', '16 h × 60 min × 15 = 14,400 blinks\n× 0.3 s = 72 minutes')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ── A year as 365 squares: 18 of them go black. ──
const COLS = 24;
export const Year: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const cell = 31;
	const pitch = 37;
	const x0 = (1080 - (COLS * pitch - 6)) / 2;
	const y0 = 700;
	const fade = interpolate(f, [144, 162], [1, 0.35], clamp); // the rest of the year steps back, the 18 dark days stay
	return (
		<Exit len={dur('year')}>
			<AbsoluteFill style={{transform: `scale(${useZoom(dur('year'), 1.05)})`}}>
				<Kicker at={0} y={280}>
					{t('一年下來', 'OVER A YEAR')}
				</Kicker>
				<Big at={72} y={360}>
					<N size={210} color={C.amber}>
						<Count from={0} to={18} at={75} dur={67} decimals={0} />
					</N>
					<Z size={t(100, 90)}>{t(' 天', ' days')}</Z>
				</Big>
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
					{Array.from({length: 365}, (_, i) => {
						const on = interpolate(f, [4 + (i / 365) * 56, 10 + (i / 365) * 56], [0, 1], clamp);
						const dark = i >= 347 ? interpolate(f, [75 + (i - 347) * 3.75, 79 + (i - 347) * 3.75], [0, 1], clamp) : 0;
						const x = x0 + (i % COLS) * pitch;
						const y = y0 + Math.floor(i / COLS) * pitch;
						return (
							<rect
								key={i}
								x={x}
								y={y}
								width={cell}
								height={cell}
								rx={6}
								fill={dark > 0.5 ? '#000' : '#8EA3BF'}
								stroke={C.amber}
								strokeWidth={dark > 0.5 ? 4 : 0}
								opacity={on * (dark > 0.5 ? 1 : (0.55 - 0.15 * dark) * fade)}
							/>
						);
					})}
				</svg>
				<Line at={150} y={1330} size={t(88, 76)} weight={900}>
					{t('眼睛是閉著的', 'with your eyes shut')}
				</Line>
				<Note at={165} y={1460}>
					{t('72 分鐘 × 365 天 = 438 小時 ≈ 18 天', '72 min × 365 days = 438 hours ≈ 18 days')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ── A life as 80 squares (years). Childhood greyed out; the blink counter runs to 370 million. ──
export const Life: React.FC = () => {
	const t = useT();
	const lang = useLang();
	const f = useCurrentFrame();
	const cell = 68;
	const pitch = 80;
	const x0 = (1080 - (10 * pitch - 12)) / 2;
	const y0 = 640;
	return (
		<Exit len={dur('life')}>
			<AbsoluteFill style={{transform: `scale(${useZoom(dur('life'), 1.06)})`}}>
				<Kicker at={0} y={280}>
					{t('如果活到 80 歲', 'IF YOU LIVE TO 80')}
				</Kicker>
				<Big at={24} y={360}>
					<N size={t(170, 150)} color={C.amber}>
						{lang === 'en' ? <Count from={0} to={370} at={30} dur={210} decimals={0} /> : <Count from={0} to={3.7} at={30} dur={210} decimals={1} />}
					</N>
					<Z size={t(84, 64)}>{t(' 億次', ' million blinks')}</Z>
				</Big>
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
					<defs>
						<pattern id="life-hatch" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
							<rect width={14} height={14} fill="#15171C" />
							<rect width={5} height={14} fill="#2A2D34" />
						</pattern>
					</defs>
					{Array.from({length: 80}, (_, i) => {
						const x = x0 + (i % 10) * pitch;
						const y = y0 + Math.floor(i / 10) * pitch;
						const kid = i < 10;
						const appear = interpolate(f, [4 + i * 0.4, 12 + i * 0.4], [0, 1], clamp);
						const lit = kid ? 0 : interpolate(f, [30 + ((i - 10) / 70) * 204, 36 + ((i - 10) / 70) * 204], [0, 1], clamp);
						return (
							<g key={i} opacity={appear}>
								<rect x={x} y={y} width={cell} height={cell} rx={10} fill={kid ? 'url(#life-hatch)' : '#232731'} />
								{!kid && <rect x={x} y={y} width={cell} height={cell} rx={10} fill={P.iris} opacity={lit * 0.85} />}
							</g>
						);
					})}
					<text x={x0} y={y0 - 18} fill={C.dim} fontFamily={NUM} fontWeight={600} fontSize={32}>
						0
					</text>
					<text x={x0 + 10 * pitch - 12} y={y0 + 8 * pitch + 36} fill={C.dim} fontFamily={NUM} fontWeight={600} fontSize={32} textAnchor="end">
						80
					</text>
				</svg>
				<Note at={40} y={1340}>
					{t('10 歲前眨得很少，先不算', 'Kids blink far less, so we skip ages 0–9')}
				</Note>
				<Note at={150} y={1400}>
					{t('14,400 次 × 365 天 × 70 年 ≈ 3.7 億次', '14,400 × 365 days × 70 years ≈ 370 million')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ── The twist: a film strip of your day with black frames in it. The brain cuts them out. ──
const FW = 150;
const FH = 200;
const GAP = 16;
export const Twist: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const close = interpolate(f, [124, 168], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const scroll = f * 5;
	const frames: {x: number; w: number; black: boolean; i: number}[] = [];
	let x = -120 - scroll;
	for (let i = 0; i < 26; i++) {
		const black = i % 4 === 3;
		const w = black ? FW * (1 - close) : FW;
		const g = black ? GAP * (1 - close) : GAP;
		frames.push({x, w, black, i});
		x += w + g;
	}
	// darkness while a black frame passes the playhead (x = 540)
	const dark = frames.filter((fr) => fr.black && fr.w > 24).reduce((m, fr) => Math.max(m, interpolate(540, [fr.x - 20, fr.x + 10, fr.x + fr.w - 10, fr.x + fr.w + 20], [0, 1, 1, 0], clamp)), 0);
	return (
		<Exit len={dur('twist')}>
			<AbsoluteFill style={{transform: `scale(${useZoom(dur('twist'), 1.05)})`}}>
				<div style={{position: 'absolute', left: 0, top: 920, width: 1080, height: FH + 80, opacity: useIn(0)}}>
					<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: FH + 80, background: '#101217'}} />
					{Array.from({length: 40}, (_, i) => (
						<React.Fragment key={i}>
							<div style={{position: 'absolute', top: 12, left: ((i * 54 - scroll) % 2160 + 2160) % 2160 - 60, width: 26, height: 16, borderRadius: 4, background: '#2A2D34'}} />
							<div style={{position: 'absolute', top: FH + 52, left: ((i * 54 - scroll) % 2160 + 2160) % 2160 - 60, width: 26, height: 16, borderRadius: 4, background: '#2A2D34'}} />
						</React.Fragment>
					))}
					{frames.map((fr) =>
						fr.w > 0.5 ? (
							<div key={fr.i} style={{position: 'absolute', top: 40, left: fr.x, width: fr.w, height: FH, overflow: 'hidden'}}>
								<Frame w={FW} h={FH} black={fr.black} seed={fr.i + 3} />
							</div>
						) : null,
					)}
				</div>
				<div style={{position: 'absolute', left: 537, top: 900, width: 6, height: FH + 120, borderRadius: 3, background: C.amber, opacity: useIn(10) * 0.9}} />
				<Dark v={dark * (1 - close)} max={0.6} />
				<Line at={8} y={t(320, 290)} size={t(110, 100)} weight={900} out={118}>
					{t('3.7 億次黑暗', '370 million\nblackouts')}
				</Line>
				<Line at={40} y={t(480, 570)} size={t(84, 72)} weight={900} color={C.amber} out={118}>
					{t('你一次都沒發現', 'and you never noticed one')}
				</Line>
				<Line at={140} y={340} size={t(96, 84)} weight={900}>
					{t('因為大腦每次\n都替你把黑暗藏起來', 'Your brain hides\nevery single one')}
				</Line>
				<Note at={168} y={1380}>
					{t('眨眼時，大腦會壓低視覺與「察覺」相關區域的活動\nBristow 等，Current Biology 2005', 'Blinks mute the brain areas for seeing and noticing\nBristow et al., Current Biology 2005')}
				</Note>
			</AbsoluteFill>
		</Exit>
	);
};

// ── The ending: the hook's eye again, and the answer. ──
// Count lands on the cadence (local 60 = 60 s), credits at 100, still until D-30, text gone 6 frames before the end.
export const End: React.FC = () => {
	const t = useT();
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const D = dur('end');
	const cam = interpolate(f, [0, 50], [1.05, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const lid = Math.max(blinkLid(f, 24), blinkLid(f, 270)); // 270 = 67 s: one last blink on the closing button
	const thump = spring({frame: f - 60, fps, config: {damping: 10, mass: 0.5, stiffness: 200}});
	const pulse = f >= 60 ? 1 + 0.08 * Math.sin(Math.min(1, thump) * Math.PI) : 1;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: useIn(0), transform: `scale(${cam})`}}>
				<HookArt lid={lid} />
			</AbsoluteFill>
			<Dark v={lid} max={0.88} />
			<AbsoluteFill style={{opacity: useOut(D - 6, 24)}}>
				<Big at={8} y={280}>
					<div style={{transform: `scale(${pulse})`}}>
						<N size={240} color={C.amber}>
							<Count from={0} to={3.5} at={10} dur={50} decimals={1} />
						</N>
						<Z size={t(120, 110)}>{t(' 年', ' years')}</Z>
					</div>
				</Big>
				<Line at={66} y={600} size={t(112, 100)} weight={900}>
					{t('醒著，卻閉著眼', 'awake, eyes shut')}
				</Line>
				<Line at={162} y={770} size={t(68, 64)} weight={900} color={C.amber}>
					{t('剛剛這一分鐘，\n你又錯過了四秒半。', 'That last minute?\nYou missed 4.5 seconds of it.')}
				</Line>
				<div style={{position: 'absolute', left: 60, right: 60, top: 1350, textAlign: 'center', fontFamily: t(SANS, SANS_EN), fontSize: 32, lineHeight: 1.5, color: C.dim, opacity: useIn(100)}}>
					{t('以每分鐘 15 次 × 0.3 秒、每天醒 16 小時、10–80 歲計', '15 blinks/min × 0.3 s, 16 waking h/day, ages 10–80')}
					<br />
					{t('資料：Pitigoi 等 2024 · Bristow 等 2005', 'Data: Pitigoi et al. 2024 · Bristow et al. 2005')}
					<br />
					{t('音樂採樣：VSCO 2 CE、VCSL（CC0）', 'Music samples: VSCO 2 CE, VCSL (CC0)')}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

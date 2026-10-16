import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, Line, Num, useIn, useOut} from '../../engine/kit/kit';
import {C, NUM, SANS, s} from '../../engine/kit/theme';
import {T} from './timeline';

const dur = (k: keyof typeof T) => s(T[k][1]) - s(T[k][0]);
const Exit: React.FC<{len: number; children: React.ReactNode; fade?: number}> = ({len, children, fade = 8}) => (
	<AbsoluteFill style={{opacity: useOut(len, fade)}}>{children}</AbsoluteFill>
);
const PAPER = '#F4F0E8';

// ── HOOK: one sheet, folded once ─────────────────────────────────────────────
export const Hook: React.FC = () => {
	const f = useCurrentFrame();
	const p = useIn(2, 20);
	const fold = interpolate(f, [s(2.5), s(3.4)], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const W = 520,
		Hh = 700;
	// after the fold the sheet slides so the folded half sits centred
	const shift = interpolate(fold, [0.5, 1], [0, W / 4], clamp);
	return (
		<Exit len={dur('hook')}>
			<Line at={4} y={250} size={60} weight={700} color={C.dim}>
				一張普通的紙
			</Line>
			<div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center', opacity: useIn(14)}}>
				<span style={{fontFamily: SANS, fontWeight: 900, fontSize: 92, color: C.ink}}>厚 </span>
				<Num size={130} color={C.amber}>
					{fold > 0.6 ? '0.2' : '0.1'}
				</Num>
				<span style={{fontFamily: SANS, fontWeight: 900, fontSize: 92, color: C.ink}}> 毫米</span>
			</div>
			<div style={{position: 'absolute', left: 540 - W / 2 + shift, top: 640, width: W, height: Hh, perspective: 2200, opacity: p, transform: `translateY(${(1 - p) * 60}px)`}}>
				{/* shadow */}
				<div style={{position: 'absolute', left: 14, right: fold > 0.5 ? W / 2 - 14 : -14, top: 24, bottom: -24, background: 'rgba(0,0,0,0.35)', borderRadius: 10}} />
				{/* left half (stays) */}
				<div style={{position: 'absolute', left: 0, top: 0, width: W / 2, height: Hh, background: `linear-gradient(90deg, ${PAPER}, #ECE6DA)`}} />
				{/* right half rotates over the centre line */}
				<div
					style={{
						position: 'absolute',
						left: W / 2,
						top: 0,
						width: W / 2,
						height: Hh,
						transformOrigin: '0% 50%',
						transform: `rotateY(${-180 * fold}deg)`,
						transformStyle: 'preserve-3d',
					}}
				>
					<div style={{position: 'absolute', inset: 0, background: `linear-gradient(90deg, #E6E0D3, ${PAPER})`, backfaceVisibility: 'hidden'}} />
					<div style={{position: 'absolute', inset: 0, background: '#E2DBCD', transform: 'rotateY(180deg)', backfaceVisibility: 'hidden'}} />
				</div>
				{/* faint ruled lines */}
				{fold < 0.05 &&
					Array.from({length: 14}).map((_, i) => (
						<div key={i} style={{position: 'absolute', left: 40, right: 40, top: 90 + i * 42, height: 2, background: 'rgba(80,110,160,0.18)'}} />
					))}
			</div>
			<Line at={s(3.4)} y={1420} size={48} weight={700} color={C.ink}>
				對折一次，厚度變兩倍
			</Line>
		</Exit>
	);
};

// ── GUESS ────────────────────────────────────────────────────────────────────
export const Guess: React.FC = () => {
	const opts = [
		['A', '一本書'],
		['B', '一棟大樓'],
		['C', '比月球還遠'],
	];
	return (
		<Exit len={dur('guess')} fade={6}>
			<Line at={0} y={330} size={60} weight={700} color={C.dim}>
				那對折 42 次呢？
			</Line>
			<Line at={6} y={420} size={100} weight={900}>
				會有多厚？
			</Line>
			{opts.map(([k, v], i) => (
				<Card key={k} at={s(0.625 * (i + 1))} y={680 + i * 190} k={k} v={v} />
			))}
		</Exit>
	);
};

const Card: React.FC<{at: number; y: number; k: string; v: string}> = ({at, y, k, v}) => {
	const p = useIn(at);
	return (
		<div
			style={{
				position: 'absolute',
				left: 170,
				right: 170,
				top: y,
				height: 150,
				borderRadius: 28,
				background: C.bg2,
				border: `3px solid ${C.faint}`,
				display: 'flex',
				alignItems: 'center',
				gap: 36,
				padding: '0 44px',
				opacity: p,
				transform: `translateX(${(1 - p) * 60}px)`,
			}}
		>
			<span style={{fontFamily: NUM, fontWeight: 900, fontSize: 64, color: C.amber}}>{k}</span>
			<span style={{fontFamily: SANS, fontWeight: 700, fontSize: 58, color: C.ink}}>{v}</span>
		</div>
	);
};

// ── TWIST: reality ───────────────────────────────────────────────────────────
export const Twist: React.FC = () => {
	const f = useCurrentFrame();
	const B = s(2.5); // second half starts on the next bar
	const a1 = interpolate(f, [B - 8, B], [1, 0], clamp);
	return (
		<Exit len={dur('twist')}>
			<AbsoluteFill style={{background: C.bg}} />
			<AbsoluteFill style={{opacity: a1}}>
				<Line at={0} y={300} size={60} weight={700} color={C.dim}>
					可惜，現實中做不到
				</Line>
				<div style={{position: 'absolute', top: 420, left: 0, right: 0, textAlign: 'center', opacity: useIn(8)}}>
					<span style={{fontFamily: SANS, fontWeight: 900, fontSize: 84, color: C.ink}}>世界紀錄只有 </span>
					<Num size={170} color={C.amber}>
						12
					</Num>
					<span style={{fontFamily: SANS, fontWeight: 900, fontSize: 84, color: C.ink}}> 次</span>
				</div>
				<Line at={24} y={700} size={42} weight={400} color={C.dim}>
					{'2002 年，美國高中生 Britney Gallivan\n用一卷 1.2 公里長的紙做到'}
				</Line>
				<Strip at={20} />
			</AbsoluteFill>
			<Line at={B} y={300} size={56} weight={700} color={C.dim}>
				因為每折一次，紙要的長度暴增
			</Line>
			<Line at={B + 10} y={400} size={64} weight={900}>
				想折 42 次，這張紙得長
			</Line>
			<div style={{position: 'absolute', top: 510, left: 0, right: 0, textAlign: 'center', opacity: useIn(B + 22)}}>
				<span style={{fontFamily: SANS, fontWeight: 900, fontSize: 86, color: C.ink}}>約 </span>
				<Num size={170} color="#B9A6FF">
					10
				</Num>
				<span style={{fontFamily: SANS, fontWeight: 900, fontSize: 86, color: C.ink}}> 萬光年</span>
			</div>
			<Line at={B + 46} y={760} size={52} weight={700} color="#B9A6FF">
				差不多是整個銀河系那麼寬
			</Line>
			<Galaxy at={B + 30} />
			<Line at={B + 60} y={1440} size={30} weight={400} color={C.dim}>
				Gallivan 公式 L = πt/6 · (2ⁿ+4)(2ⁿ−1)，t = 0.1 mm
			</Line>
		</Exit>
	);
};

/** Bars that halve in length with every fold: the paper runs out fast. */
const Strip: React.FC<{at: number}> = ({at}) => {
	const f = useCurrentFrame();
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
			{Array.from({length: 7}).map((_, i) => {
				const p = interpolate(f, [at + i * 5, at + i * 5 + 12], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
				const w = 860 / 2 ** i;
				const h = 6 * 2 ** Math.min(i, 5) * 0.5 + 4;
				const yy = 900 + i * 70;
				return (
					<g key={i} opacity={p}>
						<rect x={110} y={yy} width={Math.max(2, w * p)} height={Math.min(h, 60)} rx={2} fill={PAPER} />
						<text x={110 + Math.max(w, 10) + 18} y={yy + Math.min(h, 60) / 2 + 12} fill={C.dim} style={{fontFamily: NUM, fontSize: 30, fontWeight: 600}}>
							{i === 0 ? '原本' : `折 ${i} 次`}
						</text>
					</g>
				);
			})}
		</svg>
	);
};

const STARS: [number, number, number, number][] = (() => {
	let x = 4242;
	const rnd = () => (x = (x * 16807) % 2147483647) / 2147483647;
	const out: [number, number, number, number][] = [];
	for (let i = 0; i < 1400; i++) {
		const arm = i % 2;
		const r = Math.pow(rnd(), 0.7);
		const th = r * 7.5 + arm * Math.PI + (rnd() - 0.5) * 0.7;
		const jit = (rnd() - 0.5) * 0.08;
		out.push([Math.cos(th) * (r + jit), Math.sin(th) * (r + jit), 0.8 + rnd() * 2.2, 0.35 + rnd() * 0.65]);
	}
	return out;
})();

const Galaxy: React.FC<{at: number}> = ({at}) => {
	const f = useCurrentFrame();
	const p = interpolate(f, [at, at + 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const rot = (f - at) * 0.004;
	const cx = 540,
		cy = 1130,
		R = 330;
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: p}}>
			<defs>
				<radialGradient id="pp-core">
					<stop offset="0" stopColor="#FFF4DA" stopOpacity="0.95" />
					<stop offset="0.3" stopColor="#E8C9FF" stopOpacity="0.4" />
					<stop offset="1" stopColor="#6A4CFF" stopOpacity="0" />
				</radialGradient>
			</defs>
			<ellipse cx={cx} cy={cy} rx={R * 1.1} ry={R * 0.55} fill="url(#pp-core)" opacity={0.5} />
			<g transform={`translate(${cx} ${cy}) scale(1 0.5) rotate(${(rot * 180) / Math.PI})`}>
				{STARS.map(([x, y, r, a], i) => (
					<circle key={i} cx={x * R * p} cy={y * R * p} r={r} fill={i % 7 === 0 ? '#B9A6FF' : '#F2ECFF'} opacity={a} />
				))}
			</g>
			<circle cx={cx} cy={cy} r={40} fill="url(#pp-core)" />
		</svg>
	);
};

// ── END ──────────────────────────────────────────────────────────────────────
export const End: React.FC = () => {
	const f = useCurrentFrame();
	const D = dur('end');
	const fade = interpolate(f, [D - 20, D], [1, 0], clamp);
	return (
		<AbsoluteFill style={{background: C.bg, opacity: fade}}>
			<Line at={0} y={420} size={64} weight={700} color={C.dim}>
				每次只是「翻倍」
			</Line>
			<Line at={14} y={540} size={84} weight={900}>
				42 次之後
			</Line>
			<div style={{position: 'absolute', top: 660, left: 0, right: 0, textAlign: 'center', opacity: useIn(26)}}>
				<span style={{fontFamily: SANS, fontWeight: 900, fontSize: 84, color: C.ink}}>變成 </span>
				<Num size={180} color={C.amber}>
					4.4
				</Num>
				<span style={{fontFamily: SANS, fontWeight: 900, fontSize: 84, color: C.ink}}> 兆倍</span>
			</div>
			<Line at={44} y={930} size={60} weight={700} color="#FFD9A8">
				這就是指數成長
			</Line>
			<div style={{position: 'absolute', left: 80, right: 80, top: 1360, textAlign: 'center', fontFamily: SANS, fontSize: 26, lineHeight: 1.7, color: C.dim, opacity: useIn(60)}}>
				厚度 = 0.1 mm × 2ⁿ · 2⁴² = 4,398,046,511,104
				<br />
				紀錄：Guinness World Records、Live Science · 地球影像：NASA · 音樂採樣 VSCO 2 CE、VCSL（CC0）
			</div>
		</AbsoluteFill>
	);
};

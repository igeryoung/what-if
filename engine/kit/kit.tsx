import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {useLang} from './lang';
import {BEAT, C, NUM, SANS, SANS_EN} from './theme';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 spring that starts at local frame `at`. */
export const useIn = (at: number, damping = 18, mass = 0.7) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: frame - at, fps, config: {damping, mass, stiffness: 140}});
};

/** 1→0 over the last `len` frames before `end`. */
export const useOut = (end: number, len = 8) => {
	const frame = useCurrentFrame();
	return interpolate(frame, [end - len, end], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
};

/** Text that rises and fades in. Absolutely positioned by `y` (top), centered horizontally. Font follows the language. */
export const Line: React.FC<{
	at: number;
	y: number;
	size?: number;
	color?: string;
	weight?: number;
	font?: string;
	out?: number;
	children: React.ReactNode;
	tracking?: number;
	align?: 'center' | 'left';
	x?: number;
	lift?: number;
}> = ({at, y, size = 72, color = C.ink, weight = 700, font, out, children, tracking = 0, align = 'center', x = 0, lift = 36}) => {
	const lang = useLang();
	const p = useIn(at);
	const o = useOut(out ?? 1e9);
	return (
		<div
			style={{
				position: 'absolute',
				left: align === 'center' ? 60 : x,
				right: align === 'center' ? 60 : undefined,
				top: y,
				textAlign: align,
				fontFamily: font ?? (lang === 'en' ? SANS_EN : SANS),
				fontWeight: weight,
				fontSize: size,
				lineHeight: 1.25,
				letterSpacing: tracking,
				color,
				opacity: p * o,
				transform: `translateY(${(1 - p) * lift}px)`,
				whiteSpace: 'pre-wrap',
			}}
		>
			{children}
		</div>
	);
};

/** Count-up number with fixed decimals. */
export const Count: React.FC<{from?: number; to: number; at: number; dur: number; decimals?: number}> = ({from = 0, to, at, dur, decimals = 1}) => {
	const frame = useCurrentFrame();
	const v = interpolate(frame, [at, at + dur], [from, to], {...clamp, easing: Easing.out(Easing.cubic)});
	return <span style={{fontVariantNumeric: 'tabular-nums'}}>{v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}</span>;
};

/** Compression depth 0..1 for a frame (global frames), synced to the 120 BPM grid. */
export const press = (globalFrame: number, start: number) => {
	if (globalFrame < start) return 0;
	const phase = ((globalFrame - start) % BEAT) / BEAT;
	return 0.5 + 0.5 * Math.cos(2 * Math.PI * (phase - 0.14));
};

export const Pill: React.FC<{children: React.ReactNode; color?: string; bg?: string; size?: number}> = ({children, color = C.ink, bg = C.faint, size = 34}) => {
	const lang = useLang();
	return (
		<span
			style={{
				display: 'inline-block',
				padding: `${size * 0.28}px ${size * 0.7}px`,
				borderRadius: 999,
				background: bg,
				color,
				fontFamily: lang === 'en' ? SANS_EN : SANS,
				fontWeight: 700,
				fontSize: size,
				lineHeight: 1.1,
			}}
		>
			{children}
		</span>
	);
};

export const Num: React.FC<{children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties}> = ({children, size, color = C.ink, style}) => (
	<span style={{fontFamily: NUM, fontWeight: 900, fontSize: size, color, letterSpacing: -size * 0.03, ...style}}>{children}</span>
);

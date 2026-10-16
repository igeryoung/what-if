import React, {useMemo} from 'react';
import {NUM} from '../../engine/kit/theme';

// Night palette: violet = sleep, amber = waking hours, red = danger, cyan = brain fluid.
export const P = {
	bg: '#0A0E1F',
	bg2: '#141B36',
	ink: '#F2EFE8',
	dim: '#9AA1BC',
	faint: '#262E50',
	frame: '#2E3663',
	sleep: '#8B7BFF',
	sleepDeep: '#5442C8',
	awake: '#FFC24B',
	red: '#FF5A5F',
	fluid: '#4FD1E8',
	moon: '#FFE29A',
	skin: '#F2C29A',
	hair: '#2B2140',
};

/** Seeded PRNG (deterministic per seed). */
export const rng = (seed: number) => {
	let x = seed % 2147483647;
	if (x <= 0) x += 2147483646;
	return () => (x = (x * 16807) % 2147483647) / 2147483647;
};

/** Static star field with a slow twinkle. */
export const Stars: React.FC<{f: number; opacity?: number}> = ({f, opacity = 1}) => {
	const stars = useMemo(() => {
		const r = rng(17);
		return Array.from({length: 150}, () => [r() * 1080, r() * 1920, 0.8 + r() * 2.2, r() * 6.28, 0.15 + r() * 0.55]);
	}, []);
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity}}>
			{stars.map(([x, y, r, ph, a], i) => (
				<circle key={i} cx={x} cy={y} r={r} fill="#DCE3FF" opacity={a * (0.6 + 0.4 * Math.sin(f * 0.05 + ph))} />
			))}
		</svg>
	);
};

/** Crescent moon. `id` must be unique on screen (SVG mask). */
export const Moon: React.FC<{size: number; id: string; color?: string}> = ({size, id, color = P.moon}) => (
	<svg viewBox="0 0 100 100" width={size} height={size} style={{display: 'block'}}>
		<defs>
			<mask id={id}>
				<rect width="100" height="100" fill="#fff" />
				<circle cx="68" cy="36" r="38" fill="#000" />
			</mask>
		</defs>
		<circle cx="50" cy="50" r="44" fill={color} mask={`url(#${id})`} />
	</svg>
);

export const Sun: React.FC<{size: number; color?: string; spin?: number}> = ({size, color = P.awake, spin = 0}) => (
	<svg viewBox="-50 -50 100 100" width={size} height={size} style={{display: 'block'}}>
		<circle r="22" fill={color} />
		<g transform={`rotate(${spin})`}>
			{Array.from({length: 8}).map((_, i) => (
				<line key={i} x1="0" y1="-31" x2="0" y2="-44" stroke={color} strokeWidth="7" strokeLinecap="round" transform={`rotate(${i * 45})`} />
			))}
		</g>
	</svg>
);

/** A person in bed. `open` 0..1 opens the eyes; `zzz` 0..1 shows the floating Z's; `f` drives them. */
export const Sleeper: React.FC<{w: number; open: number; zzz: number; f: number; alarm?: number}> = ({w, open, zzz, f, alarm = 0}) => (
	<svg viewBox="0 0 640 320" width={w} height={(w * 320) / 640} style={{display: 'block', overflow: 'visible'}}>
		{/* bed */}
		<rect x={18} y={66} width={30} height={234} rx={13} fill={P.frame} />
		<rect x={594} y={150} width={28} height={150} rx={13} fill={P.frame} />
		<rect x={40} y={196} width={562} height={46} rx={14} fill="#D9D4EE" />
		<rect x={40} y={234} width={562} height={28} rx={9} fill={P.frame} />
		<rect x={58} y={256} width={20} height={44} rx={7} fill={P.frame} />
		<rect x={564} y={256} width={20} height={44} rx={7} fill={P.frame} />
		{/* pillow */}
		<ellipse cx={124} cy={190} rx={86} ry={26} fill="#FFFFFF" />
		{/* head */}
		<circle cx={128} cy={146} r={48} fill={P.skin} />
		<path d="M80 150 C 74 96, 182 96, 176 150 C 166 124, 150 114, 128 114 C 106 114, 90 124, 80 150 Z" fill={P.hair} />
		{/* closed eyes */}
		<g opacity={1 - open} stroke={P.hair} strokeWidth={5} strokeLinecap="round" fill="none">
			<path d="M104 152 Q113 160 122 152" />
			<path d="M134 152 Q143 160 152 152" />
			<path d="M120 176 Q128 180 136 176" />
		</g>
		{/* open eyes */}
		<g transform={`translate(0 150) scale(1 ${Math.max(0.001, open)}) translate(0 -150)`}>
			<circle cx={113} cy={150} r={12} fill="#fff" />
			<circle cx={143} cy={150} r={12} fill="#fff" />
			<circle cx={115} cy={150} r={6} fill={P.hair} />
			<circle cx={145} cy={150} r={6} fill={P.hair} />
		</g>
		<circle cx={128} cy={178} r={6 * open} fill={P.hair} />
		{/* blanket */}
		<path d="M164 204 C 168 152, 236 140, 304 146 C 384 152, 420 130, 482 138 C 544 146, 584 162, 598 204 Z" fill={P.sleepDeep} />
		<path d="M164 204 C 166 176, 176 160, 194 154 L 214 156 C 200 170, 196 186, 196 204 Z" fill={P.sleep} />
		{[
			[270, 176],
			[350, 166],
			[430, 168],
			[510, 178],
			[390, 190],
		].map(([x, y], i) => (
			<circle key={i} cx={x} cy={y} r={5} fill={P.moon} opacity={0.7} />
		))}
		{/* Z's */}
		{[0, 1, 2].map((i) => {
			const ph = (f / 42 + i / 3) % 1;
			return (
				<text
					key={i}
					x={190 + ph * 70}
					y={96 - ph * 110}
					fill={P.sleep}
					opacity={Math.sin(Math.PI * ph) * zzz}
					style={{fontFamily: NUM, fontWeight: 900, fontSize: 30 + ph * 26}}
				>
					Z
				</text>
			);
		})}
		{/* alarm strokes */}
		<g stroke={P.awake} strokeWidth={7} strokeLinecap="round" opacity={alarm}>
			{[-60, -30, 0].map((a, i) => (
				<line key={i} x1={0} y1={-70 - 8 * alarm} x2={0} y2={-96 - 20 * alarm} transform={`translate(128 146) rotate(${a + 30})`} />
			))}
		</g>
	</svg>
);

/** Side-view dolphin, head to the right (viewBox 420×190). */
export const Dolphin: React.FC<{w: number; color?: string}> = ({w, color = '#8FB3DD'}) => (
	<svg viewBox="0 0 420 190" width={w} height={(w * 190) / 420} style={{display: 'block', overflow: 'visible'}}>
		<path
			d="M70 98 C 130 74, 190 60, 228 62 C 238 48, 238 34, 224 16 C 252 24, 278 44, 292 64 C 320 68, 342 72, 356 80 C 374 86, 384 96, 386 104 L 406 108 C 414 112, 408 120, 398 120 C 382 122, 366 124, 350 126 C 320 136, 282 142, 250 142 C 246 154, 238 164, 224 174 C 222 162, 220 152, 216 142 C 160 138, 110 126, 76 112 L 56 108 C 44 118, 28 130, 8 140 C 14 126, 22 114, 30 104 C 22 94, 16 82, 8 66 C 28 76, 44 88, 58 98 Z"
			fill={color}
		/>
		<path d="M120 122 C 180 134, 270 138, 344 124 C 310 138, 278 142, 248 142 C 196 142, 156 134, 120 122 Z" fill="#DCE8F7" opacity={0.85} />
		<path d="M394 114 Q 376 118 360 114" stroke={P.bg} strokeWidth={3} fill="none" strokeLinecap="round" />
		<circle cx={352} cy={96} r={5} fill={P.bg} />
	</svg>
);

/** Almond eye; `lid` 0 = wide open, 1 = shut. */
export const Eye: React.FC<{w: number; lid: number; color?: string}> = ({w, lid, color = P.ink}) => {
	const top = 12 + 76 * lid;
	return (
		<svg viewBox="0 0 200 100" width={w} height={w / 2} style={{display: 'block', overflow: 'visible'}}>
			<defs>
				<clipPath id="ns-eye">
					<path d="M10 50 Q100 -20 190 50 Q100 120 10 50 Z" />
				</clipPath>
			</defs>
			<path d="M10 50 Q100 -20 190 50 Q100 120 10 50 Z" fill="#fff" />
			<g clipPath="url(#ns-eye)">
				<circle cx={100} cy={52} r={30} fill={color === P.ink ? '#2B2140' : color} />
				<circle cx={100} cy={52} r={13} fill="#000" />
				<circle cx={110} cy={42} r={6} fill="#fff" />
				<rect x={0} y={-20} width={200} height={top + 20} fill={P.skin} />
				<rect x={0} y={top - 5} width={200} height={10} fill={P.hair} />
			</g>
			<path d="M10 50 Q100 -20 190 50 Q100 120 10 50 Z" fill="none" stroke={P.hair} strokeWidth={6} />
		</svg>
	);
};

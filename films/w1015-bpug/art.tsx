import React from 'react';

export const BG = 'radial-gradient(120% 70% at 50% 40%, #131B27 0%, #0B0F16 60%, #07090D 100%)';
export const WATER = {hi: '#BFE6FF', light: '#7CC4FF', mid: '#3C9BEF', deep: '#1B5AB0', ink: '#9BD3FF'};
export const BALL = {fill: '#F3EFE6', shade: '#CFC6B4', stitch: '#E0403A'};
export const ICE = {fill: '#E6EEF4', shade: '#9FB4C4', ring: '#C3D3DE'};

export const rng = (seed: number) => {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// One shape for every stage of a falling drop, so it can morph smoothly:
// tear 1 = the teardrop icon (myth), flat 1 = burger bun, bag 1 = the parachute just before it bursts.
// Unit circle centered on (0, 0) (bottom of the circle at y = +1); scaled by R.
export type Shape = {tear?: number; flat?: number; bag?: number; wob?: number};
export const shapePts = (R: number, {tear = 0, flat = 0, bag = 0, wob = 0}: Shape, N = 180): [number, number][] => {
	const pts: [number, number][] = [];
	for (let i = 0; i < N; i++) {
		const t = (i / N) * Math.PI * 2; // 0 = top, π = bottom
		let x = Math.sin(t);
		let y = -Math.cos(t);
		if (y > 0) {
			// flatten the underside into a bun, then push it up through the drop into a bag
			y = y * (1 - flat) + flat * 0.42 * (1 - Math.pow(1 - y, 3));
			y -= bag * 1.62 * Math.pow(1 - x * x, 1.4);
		} else {
			y *= 1 + 0.32 * bag - 0.08 * flat;
		}
		x *= 1 + 0.16 * flat + 0.42 * bag;
		// teardrop icon: x = sin t · sin(t/2), pointed top at y = −1.7
		const tx = 1.3 * Math.sin(t) * Math.sin(t / 2);
		const ty = -1.35 * Math.cos(t) - 0.35;
		// wobble squashes around the bottom so the drop doesn't float
		const px = lerp(x, tx, tear) * (1 + wob);
		const py = 1 - (1 - lerp(y, ty, tear)) * (1 - wob);
		pts.push([px * R, py * R]);
	}
	return pts;
};
export const shapeD = (pts: [number, number][]) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z';

let gid = 0;
// A water drop. `outline` draws it as an empty dashed silhouette.
export const Drop: React.FC<{x: number; y: number; R: number; shape?: Shape; opacity?: number; outline?: boolean; fill?: number}> = ({x, y, R, shape = {tear: 1}, opacity = 1, outline, fill}) => {
	const id = React.useMemo(() => `dg${gid++}`, []);
	const d = shapeD(shapePts(R, shape));
	const hl = Math.max(0, 1 - (shape.bag ?? 0) * 1.6);
	return (
		<g transform={`translate(${x} ${y})`} opacity={opacity}>
			<defs>
				<radialGradient id={id} cx="0.36" cy="0.32" r="0.8">
					<stop offset="0" stopColor={WATER.hi} />
					<stop offset="0.35" stopColor={WATER.light} />
					<stop offset="0.75" stopColor={WATER.mid} />
					<stop offset="1" stopColor={WATER.deep} />
				</radialGradient>
				{fill !== undefined && (
					<clipPath id={`${id}c`}>
						<rect x={-R * 2} y={R - fill * R * 2.8} width={R * 4} height={R * 3} />
					</clipPath>
				)}
			</defs>
			{outline ? (
				<>
					{fill !== undefined && <path d={d} fill={`url(#${id})`} clipPath={`url(#${id}c)`} />}
					<path d={d} fill="none" stroke={WATER.ink} strokeWidth={4} strokeDasharray="14 12" strokeLinecap="round" opacity={0.8} />
				</>
			) : (
				<>
					<path d={d} fill={`url(#${id})`} />
					<ellipse cx={-R * 0.38} cy={-R * 0.3 - (shape.tear ?? 0) * R * 0.12} rx={R * 0.17} ry={R * 0.28} fill="#FFFFFF" opacity={0.55 * hl} transform={`rotate(24 ${-R * 0.38} ${-R * 0.3})`} />
					<circle cx={-R * 0.12} cy={-R * 0.72 - (shape.tear ?? 0) * R * 0.2} r={R * 0.07} fill="#FFFFFF" opacity={0.5 * hl} />
				</>
			)}
		</g>
	);
};

// Tiny round droplet (fragments, real-size drops).
export const Droplet: React.FC<{x: number; y: number; r: number; opacity?: number}> = ({x, y, r, opacity = 1}) => (
	<g opacity={opacity}>
		<circle cx={x} cy={y} r={r} fill={WATER.mid} />
		<circle cx={x - r * 0.15} cy={y - r * 0.15} r={r * 0.72} fill={WATER.light} />
		<circle cx={x - r * 0.35} cy={y - r * 0.38} r={r * 0.24} fill="#FFFFFF" opacity={0.7} />
	</g>
);

// Regulation baseball: cream ball, two red seams with chevron stitches.
const seam = (R: number, side: 1 | -1) => {
	const p0 = [side * 0.66 * R, -0.75 * R];
	const c = [side * 0.02 * R, 0];
	const p1 = [side * 0.66 * R, 0.75 * R];
	const at = (u: number) => [(1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0], (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1]];
	const tan = (u: number) => {
		const dx = 2 * (1 - u) * (c[0] - p0[0]) + 2 * u * (p1[0] - c[0]);
		const dy = 2 * (1 - u) * (c[1] - p0[1]) + 2 * u * (p1[1] - c[1]);
		const l = Math.hypot(dx, dy);
		return [dx / l, dy / l];
	};
	return {d: `M${p0[0]},${p0[1]} Q${c[0]},${c[1]} ${p1[0]},${p1[1]}`, at, tan};
};
export const Baseball: React.FC<{x: number; y: number; R: number; rot?: number; opacity?: number}> = ({x, y, R, rot = -18, opacity = 1}) => {
	const id = React.useMemo(() => `bb${gid++}`, []);
	const w = R * 0.075;
	return (
		<g transform={`translate(${x} ${y})`} opacity={opacity}>
			<defs>
				<radialGradient id={id} cx="0.38" cy="0.34" r="0.75">
					<stop offset="0" stopColor="#FFFFFF" />
					<stop offset="0.55" stopColor={BALL.fill} />
					<stop offset="1" stopColor={BALL.shade} />
				</radialGradient>
				<clipPath id={`${id}c`}>
					<circle r={R} />
				</clipPath>
			</defs>
			<circle r={R} fill={`url(#${id})`} />
			<g transform={`rotate(${rot})`} clipPath={`url(#${id}c)`}>
				{([-1, 1] as const).map((side) => {
					const s = seam(R, side);
					return (
						<g key={side}>
							<path d={s.d} fill="none" stroke={BALL.stitch} strokeWidth={R * 0.022} opacity={0.6} />
							{Array.from({length: 13}, (_, k) => {
								const u = 0.04 + (k / 12) * 0.92;
								const [px, py] = s.at(u);
								const [tx, ty] = s.tan(u);
								const [nx, ny] = [-ty, tx];
								return (
									<path
										key={k}
										d={`M${px + nx * w * 1.6 - tx * w},${py + ny * w * 1.6 - ty * w} L${px + tx * w * 0.4},${py + ty * w * 0.4} L${px - nx * w * 1.6 - tx * w},${py - ny * w * 1.6 - ty * w}`}
										fill="none"
										stroke={BALL.stitch}
										strokeWidth={R * 0.03}
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								);
							})}
						</g>
					);
				})}
			</g>
		</g>
	);
};

// Hailstone: lumpy ice ball with growth rings.
export const Hailstone: React.FC<{x: number; y: number; R: number; rot?: number}> = ({x, y, R, rot = 0}) => {
	const id = React.useMemo(() => `hs${gid++}`, []);
	const lump = (scale: number, seed: number) => {
		const r = rng(seed);
		const k = Array.from({length: 7}, () => r() * Math.PI * 2);
		return shapeD(
			Array.from({length: 96}, (_, i) => {
				const a = (i / 96) * Math.PI * 2;
				const n = 1 + 0.035 * Math.sin(3 * a + k[0]) + 0.025 * Math.sin(5 * a + k[1]) + 0.018 * Math.sin(11 * a + k[2]);
				return [Math.cos(a) * R * scale * n, Math.sin(a) * R * scale * n] as [number, number];
			}),
		);
	};
	return (
		<g transform={`translate(${x} ${y}) rotate(${rot})`}>
			<defs>
				<radialGradient id={id} cx="0.36" cy="0.32" r="0.8">
					<stop offset="0" stopColor="#FFFFFF" />
					<stop offset="0.6" stopColor={ICE.fill} />
					<stop offset="1" stopColor={ICE.shade} />
				</radialGradient>
			</defs>
			<path d={lump(1, 3)} fill={`url(#${id})`} />
			<path d={lump(0.74, 5)} fill="none" stroke={ICE.ring} strokeWidth={R * 0.035} opacity={0.55} />
			<path d={lump(0.46, 9)} fill="none" stroke={ICE.ring} strokeWidth={R * 0.035} opacity={0.5} />
			<circle r={R * 0.2} fill={ICE.ring} opacity={0.45} />
			{Array.from({length: 9}, (_, i) => {
				const a = i * 2.39 + 0.4;
				const d = R * (0.3 + ((i * 37) % 50) / 100);
				return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={R * (0.025 + (i % 3) * 0.012)} fill="#FFFFFF" opacity={0.5} />;
			})}
			<ellipse cx={-R * 0.4} cy={-R * 0.42} rx={R * 0.14} ry={R * 0.22} fill="#FFFFFF" opacity={0.7} transform={`rotate(40 ${-R * 0.4} ${-R * 0.42})`} />
		</g>
	);
};

// Static rain texture for the hook (no motion, so the replay cut is seamless).
const STREAKS = (() => {
	const r = rng(21);
	return Array.from({length: 70}, () => ({x: r() * 1180 - 50, y: r() * 1900, l: 40 + r() * 90, o: 0.06 + r() * 0.12}));
})();
export const Streaks: React.FC<{opacity?: number}> = ({opacity = 1}) => (
	<g opacity={opacity}>
		{STREAKS.map((s, i) => (
			<line key={i} x1={s.x} y1={s.y} x2={s.x - s.l * 0.18} y2={s.y + s.l} stroke={WATER.ink} strokeWidth={3} strokeLinecap="round" opacity={s.o} />
		))}
	</g>
);

// Football pitch seen from above, portrait (68 m × 105 m), IFAB markings.
export const Pitch: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => {
	const k = w / 68;
	const h = 105 * k;
	const L = {stroke: '#E9F2EA', strokeWidth: 4, fill: 'none', opacity: 0.85};
	const box = (bw: number, bd: number, top: boolean) => <rect x={((68 - bw) / 2) * k} y={top ? 0 : h - bd * k} width={bw * k} height={bd * k} {...L} />;
	return (
		<g transform={`translate(${x} ${y})`}>
			{Array.from({length: 10}, (_, i) => (
				<rect key={i} x={-30} y={(i * h) / 10} width={w + 60} height={h / 10 + 1} fill={i % 2 ? '#1E6B3A' : '#227A43'} />
			))}
			<rect x={0} y={0} width={w} height={h} {...L} />
			<line x1={0} y1={h / 2} x2={w} y2={h / 2} {...L} />
			<circle cx={w / 2} cy={h / 2} r={9.15 * k} {...L} />
			<circle cx={w / 2} cy={h / 2} r={5} fill="#E9F2EA" opacity={0.85} />
			{box(40.32, 16.5, true)}
			{box(40.32, 16.5, false)}
			{box(18.32, 5.5, true)}
			{box(18.32, 5.5, false)}
			<circle cx={w / 2} cy={11 * k} r={4} fill="#E9F2EA" opacity={0.85} />
			<circle cx={w / 2} cy={h - 11 * k} r={4} fill="#E9F2EA" opacity={0.85} />
			<path d={`M${(w / 2 - 7.3 * k).toFixed(1)},${16.5 * k} A${9.15 * k},${9.15 * k} 0 0 0 ${(w / 2 + 7.3 * k).toFixed(1)},${16.5 * k}`} {...L} />
			<path d={`M${(w / 2 - 7.3 * k).toFixed(1)},${h - 16.5 * k} A${9.15 * k},${9.15 * k} 0 0 1 ${(w / 2 + 7.3 * k).toFixed(1)},${h - 16.5 * k}`} {...L} />
			<rect x={w / 2 - 3.66 * k} y={-2.2 * k} width={7.32 * k} height={2.2 * k} fill="none" stroke="#E9F2EA" strokeWidth={3} opacity={0.7} />
			<rect x={w / 2 - 3.66 * k} y={h} width={7.32 * k} height={2.2 * k} fill="none" stroke="#E9F2EA" strokeWidth={3} opacity={0.7} />
		</g>
	);
};

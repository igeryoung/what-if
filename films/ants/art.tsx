import React, {useLayoutEffect, useRef} from 'react';

// Light, warm "ants on paper" palette for this film.
export const A = {
	bg: '#EFE6D6',
	bg2: '#E4D8C3',
	ink: '#1E1712',
	dim: '#7A6E60',
	faint: '#CFC1A9',
	accent: '#D9480F',
	gold: '#B7791F',
	ant: '#1E1712',
};

/** Seeded PRNG (deterministic per seed). */
export const rng = (seed: number) => {
	let x = seed % 2147483647;
	if (x <= 0) x += 2147483646;
	return () => (x = (x * 16807) % 2147483647) / 2147483647;
};

/**
 * Top-down ant, head pointing +x, body length ≈ 2 units (−1..1). `phase` drives the tripod gait.
 * Drawn into a canvas context already translated/rotated/scaled to the ant.
 */
export const drawAnt = (g: CanvasRenderingContext2D, phase: number, detail = true) => {
	const sw = Math.sin(phase);
	g.lineCap = 'round';
	if (detail) {
		g.lineWidth = 0.065;
		g.lineJoin = 'round';
		// [root, knee, foot] for the +y side; mirrored for −y. Tripod gait: front+hind of one side swing with the middle of the other.
		const legs: [number, number, number, number, number, number][] = [
			[0.3, 0.06, 0.46, 0.4, 0.86, 0.6],
			[0.18, 0.08, 0.14, 0.5, 0.22, 0.86],
			[0.06, 0.08, -0.26, 0.44, -0.74, 0.7],
		];
		for (let side = -1; side <= 1; side += 2) {
			legs.forEach(([rx, ry, kx, ky, fx, fy], i) => {
				const ph = (i === 1 ? -1 : 1) * side * sw;
				g.beginPath();
				g.moveTo(rx, side * ry);
				g.lineTo(kx + ph * 0.08, side * ky);
				g.lineTo(fx + ph * 0.2, side * (fy - Math.abs(ph) * 0.04));
				g.stroke();
			});
		}
		// elbowed antennae
		g.lineWidth = 0.05;
		for (let side = -1; side <= 1; side += 2) {
			g.beginPath();
			g.moveTo(0.8, side * 0.08);
			g.lineTo(0.98, side * (0.36 + 0.03 * sw));
			g.lineTo(1.3, side * (0.3 + 0.05 * sw));
			g.stroke();
		}
	}
	// body: gaster, petiole, thorax, head
	g.beginPath();
	g.ellipse(-0.58, 0, 0.42, 0.3, 0, 0, Math.PI * 2);
	g.fill();
	g.beginPath();
	g.ellipse(-0.12, 0, 0.09, 0.08, 0, 0, Math.PI * 2);
	g.fill();
	g.beginPath();
	g.ellipse(0.22, 0, 0.27, 0.13, 0, 0, Math.PI * 2);
	g.fill();
	g.beginPath();
	g.ellipse(0.68, 0, 0.19, 0.17, 0, 0, Math.PI * 2);
	g.fill();
};

export type AntSpec = {x: number; y: number; a: number; size: number; speed: number; phase: number; born: number};

/** A canvas of many walking ants. `t` in seconds; `count` = how many of `ants` are visible. */
export const Swarm: React.FC<{
	w: number;
	h: number;
	ants: AntSpec[];
	t: number;
	count: number;
	color?: string;
	wrap?: boolean;
	style?: React.CSSProperties;
	clip?: (x: number, y: number) => boolean;
}> = ({w, h, ants, t, count, color = A.ant, wrap = true, style, clip}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	useLayoutEffect(() => {
		const cv = ref.current;
		if (!cv) return;
		const g = cv.getContext('2d')!;
		g.setTransform(1, 0, 0, 1, 0, 0);
		g.clearRect(0, 0, w, h);
		g.fillStyle = color;
		g.strokeStyle = color;
		const n = Math.min(count, ants.length);
		for (let i = 0; i < n; i++) {
			const q = ants[i];
			const age = Math.max(0, t - q.born);
			// gentle wandering heading
			const a = q.a + 0.35 * Math.sin(age * 0.9 + q.phase);
			const dist = age * q.speed;
			let x = q.x + Math.cos(q.a) * dist + 6 * Math.sin(age * 0.9 + q.phase);
			let y = q.y + Math.sin(q.a) * dist;
			if (wrap) {
				x = ((x % (w + 40)) + w + 40) % (w + 40) - 20;
				y = ((y % (h + 40)) + h + 40) % (h + 40) - 20;
			}
			if (clip && !clip(x, y)) continue;
			const pop = Math.min(1, (t - q.born) * 4);
			if (pop <= 0) continue;
			g.setTransform(q.size * pop, 0, 0, q.size * pop, x, y);
			g.rotate(a);
			drawAnt(g, age * q.speed * 0.35 + q.phase, q.size > 3.2);
		}
		g.setTransform(1, 0, 0, 1, 0, 0);
	});
	return <canvas ref={ref} width={w} height={h} style={{display: 'block', ...style}} />;
};

/** One big SVG ant (for hero shots). Head points right. */
export const BigAnt: React.FC<{size: number; phase: number; color?: string}> = ({size, phase, color = A.ant}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	useLayoutEffect(() => {
		const cv = ref.current;
		if (!cv) return;
		const g = cv.getContext('2d')!;
		g.setTransform(1, 0, 0, 1, 0, 0);
		g.clearRect(0, 0, cv.width, cv.height);
		g.fillStyle = color;
		g.strokeStyle = color;
		g.setTransform(size / 3, 0, 0, size / 3, size / 2, size / 2);
		drawAnt(g, phase, true);
	});
	return <canvas ref={ref} width={size} height={size} style={{width: size, height: size, display: 'block'}} />;
};

export const Person: React.FC<{h: number; color?: string}> = ({h, color = A.ink}) => (
	<svg viewBox="0 0 100 240" height={h} width={(h * 100) / 240}>
		<circle cx="50" cy="28" r="24" fill={color} />
		<path d="M22 66 Q50 56 78 66 L84 140 Q84 148 76 148 L70 148 L68 232 L54 232 L50 160 L46 232 L32 232 L30 148 L24 148 Q16 148 16 140 Z" fill={color} />
	</svg>
);

export const Bird: React.FC<{size: number; color?: string}> = ({size, color = A.ink}) => (
	<svg viewBox="0 0 100 70" width={size} height={size * 0.7}>
		<path d="M8 40 Q30 18 52 34 Q62 10 92 8 Q74 26 70 40 Q66 60 40 62 Q22 62 8 40 Z" fill={color} />
		<circle cx="22" cy="38" r="3" fill="#EFE6D6" />
	</svg>
);

export const Elephant: React.FC<{size: number; color?: string}> = ({size, color = A.ink}) => (
	<svg viewBox="0 0 140 100" width={size} height={size * 0.71}>
		<path
			d="M30 30 Q34 8 66 8 L100 8 Q132 8 132 44 L132 92 L116 92 L114 66 L100 66 L98 92 L82 92 L80 66 L60 66 L58 92 L42 92 L40 60 Q32 64 28 76 Q26 90 18 92 Q8 92 10 82 Q14 80 16 74 Q20 50 30 44 Z"
			fill={color}
		/>
		<circle cx="44" cy="26" r="3.5" fill="#EFE6D6" />
	</svg>
);

export const Whale: React.FC<{size: number; color?: string}> = ({size, color = A.ink}) => (
	<svg viewBox="0 0 160 70" width={size} height={size * 0.44}>
		<path d="M6 40 Q10 14 56 14 Q104 14 126 34 Q136 22 152 12 Q148 32 154 52 Q138 46 128 44 Q108 64 60 62 Q12 62 6 40 Z" fill={color} />
		<circle cx="30" cy="34" r="3" fill="#EFE6D6" />
	</svg>
);

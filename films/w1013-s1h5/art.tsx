import React from 'react';

// Deep plum night + copper hair.
export const P = {
	bg: '#141019',
	bg2: '#1E1826',
	ink: '#F6EFE6',
	dim: '#9C93A8',
	faint: '#2E2738',
	hair: '#E8A048',
	hairDark: '#B8692A',
	skin: '#F1C6A2',
	shirt: '#5C4F86',
	pants: '#3A3150',
	accent: '#FF6B5A',
	wall: '#251E30',
	window: '#3A3048',
};

/**
 * Hair curtain path in person units (cm). Crown at y = -170; tip at y = -170 + len.
 * `t` (seconds) drives a gentle sway that grows toward the tip.
 */
export const curtainPath = (len: number, t: number, half = 15, amp = 3, cx = 0, top = -166) => {
	const bot = -170 + Math.max(len, 6);
	const L = bot - top;
	const N = 48;
	const left: string[] = [];
	const right: string[] = [];
	for (let i = 0; i <= N; i++) {
		const u = i / N;
		const y = top + L * u;
		const w = Math.min(half, Math.min(11, half) + (half - Math.min(11, half)) * Math.min(1, (y - top) / 30));
		const sway = Math.min(amp, L * 0.03) * u * Math.sin(u * 5 - t * 1.6);
		left.push(`${(cx - w + sway).toFixed(2)},${y.toFixed(2)}`);
		right.push(`${(cx + w + sway).toFixed(2)},${y.toFixed(2)}`);
	}
	const tipSway = Math.min(amp, L * 0.03) * Math.sin(5 - t * 1.6);
	return `M${left.join(' L')} Q${(cx + tipSway).toFixed(2)},${(bot + 4).toFixed(2)} ${right[N]} L${right.reverse().join(' L')} Z`;
};

/** Front-facing person drawn in cm, feet at (0,0), crown at y = -170. Use inside an SVG <g> that scales cm → px. */
export const Person: React.FC<{hair: number; t: number; strands?: boolean}> = ({hair, t, strands = true}) => (
	<g>
		<path d={curtainPath(hair, t)} fill={P.hair} />
		{strands && hair > 30 && (
			<g stroke={P.hairDark} strokeWidth={0.8} fill="none" opacity={0.6}>
				{[-8, -3, 3, 8].map((x, i) => (
					<path key={i} d={`M${x},-150 Q${x + 2 * Math.sin(t + i)},${-170 + hair * 0.5} ${x + Math.min(3, hair * 0.03) * Math.sin(5 - t * 1.6)},${-174 + hair}`} />
				))}
			</g>
		)}
		<rect x={-9} y={-80} width={7} height={80} rx={3} fill={P.pants} />
		<rect x={2} y={-80} width={7} height={80} rx={3} fill={P.pants} />
		<rect x={-21} y={-134} width={7} height={52} rx={3.5} fill={P.shirt} />
		<rect x={14} y={-134} width={7} height={52} rx={3.5} fill={P.shirt} />
		<rect x={-16} y={-138} width={32} height={62} rx={8} fill={P.shirt} />
		<rect x={-4} y={-147} width={8} height={11} fill={P.skin} />
		<ellipse cx={0} cy={-157} rx={11} ry={13} fill={P.skin} />
		<circle cx={-4} cy={-156} r={1.3} fill={P.bg} />
		<circle cx={4} cy={-156} r={1.3} fill={P.bg} />
		<path d="M-3,-149.5 Q0,-147.5 3,-149.5" stroke={P.bg} strokeWidth={0.8} fill="none" strokeLinecap="round" />
		{hair > 24 &&
			[-1, 1].map((sd) => <path key={sd} d={curtainPath(hair, t + sd * 0.4, 4.6, 3, sd * 14, -163)} fill={P.hair} stroke={P.hairDark} strokeWidth={0.5} />)}
		<path d="M-12.6,-155 Q-13.5,-172 0,-172 Q13.5,-172 12.6,-155 Q7,-164 0,-163.5 Q-7,-164 -12.6,-155 Z" fill={P.hair} />
	</g>
);

/** Seeded PRNG. */
export const rng = (seed: number) => {
	let x = seed % 2147483647;
	if (x <= 0) x += 2147483646;
	return () => (x = (x * 16807) % 2147483647) / 2147483647;
};

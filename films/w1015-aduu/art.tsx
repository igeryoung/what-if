import React from 'react';

// Seeded random numbers (frames render in parallel and must be deterministic).
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

export const SKY_TOP = '#0B1626';
export const SKY_LOW = '#1D3A5C';
export const AMBER = '#FFB020';

// Water colour by depth (m), on a log scale: bright blue at the surface, black past 1,000 m.
const STOPS: [number, number[]][] = [
	[0, [26, 105, 163]],
	[1, [21, 92, 146]],
	[2, [13, 63, 106]],
	[2.5, [8, 42, 73]],
	[3, [5, 17, 30]],
	[4.1, [2, 6, 11]],
];
export const waterAt = (d: number) => {
	const L = Math.log10(1 + Math.max(0, d));
	let i = 1;
	while (i < STOPS.length - 1 && L > STOPS[i][0]) i++;
	const [l0, c0] = STOPS[i - 1];
	const [l1, c1] = STOPS[i];
	const p = Math.min(1, Math.max(0, (L - l0) / (l1 - l0)));
	const c = c0.map((v, k) => Math.round(v + (c1[k] - v) * p));
	return `rgb(${c[0]},${c[1]},${c[2]})`;
};
// 0 at the surface → 1 in the midnight zone: how much the phone's own glow matters.
export const darkAt = (d: number) => Math.min(1, Math.max(0, (Math.log10(1 + d) - 1.2) / 1.8));

// Gradients shared by every SVG that draws the phone.
export const PhoneDefs: React.FC = () => (
	<defs>
		<linearGradient id="ph-scr" x1="0" y1="0" x2="0.35" y2="1">
			<stop offset="0" stopColor="#FFC15E" />
			<stop offset="0.5" stopColor="#FF6B5B" />
			<stop offset="1" stopColor="#8E44AD" />
		</linearGradient>
		<radialGradient id="ph-glow">
			<stop offset="0" stopColor="#FFB070" stopOpacity="0.55" />
			<stop offset="0.45" stopColor="#FF8A5B" stopOpacity="0.18" />
			<stop offset="1" stopColor="#FF8A5B" stopOpacity="0" />
		</radialGradient>
	</defs>
);

// A phone drawn around (0, 0), 150 × 314 (the shape of a 6.3-inch phone). `signal` 0–1 lights the bars.
export const Phone: React.FC<{signal?: number}> = ({signal = 1}) => (
	<g>
		<rect x={-79} y={-92} width={5} height={42} rx={2} fill="#5C6371" />
		<rect x={-79} y={-40} width={5} height={42} rx={2} fill="#5C6371" />
		<rect x={74} y={-72} width={5} height={62} rx={2} fill="#5C6371" />
		<rect x={-75} y={-157} width={150} height={314} rx={28} fill="#1E2128" stroke="#5C6371" strokeWidth={3} />
		<rect x={-68} y={-150} width={136} height={300} rx={22} fill="url(#ph-scr)" />
		<path d="M-68 40 C -30 10, 20 70, 68 30 L 68 128 Q 68 150 46 150 L -46 150 Q -68 150 -68 128 Z" fill="#FFFFFF" opacity={0.13} />
		<path d="M-68 88 C -20 64, 30 112, 68 86 L 68 128 Q 68 150 46 150 L -46 150 Q -68 150 -68 128 Z" fill="#FFFFFF" opacity={0.11} />
		<polygon points="-62,-146 -6,-146 -62,-50" fill="#FFFFFF" opacity={0.1} />
		<rect x={-24} y={-142} width={48} height={15} rx={7.5} fill="#0A0A0D" />
		{[0, 1, 2, 3].map((i) => {
			const h = (i + 1) * 3 + 3;
			return <rect key={i} x={-58 + i * 6} y={-125 - h} width={4} height={h} rx={1} fill="#FFFFFF" opacity={signal > i / 4 + 0.01 ? 0.95 : 0.3} />;
		})}
	</g>
);

// The wreck of the Titanic's bow, pointing left, drawn in a 470 × 240 box (origin top-left of the hull).
export const Titanic: React.FC = () => (
	<g>
		<path d="M0,40 L470,36 L462,70 L474,96 L458,130 L470,170 L456,232 L96,232 Q40,200 0,40 Z" fill="#0B1B2A" stroke="#5B8DB8" strokeWidth={3} strokeLinejoin="round" />
		<line x1={4} y1={30} x2={466} y2={26} stroke="#5B8DB8" strokeWidth={2} />
		{Array.from({length: 18}, (_, i) => (
			<line key={i} x1={14 + i * 25} y1={30} x2={14 + i * 25} y2={40} stroke="#5B8DB8" strokeWidth={1.5} />
		))}
		<rect x={200} y={0} width={190} height={36} fill="#0B1B2A" stroke="#5B8DB8" strokeWidth={2.5} />
		<line x1={120} y1={38} x2={112} y2={-70} stroke="#5B8DB8" strokeWidth={4} strokeLinecap="round" />
		{Array.from({length: 16}, (_, i) => (
			<circle key={i} cx={70 + i * 24} cy={80} r={4} fill="#5B8DB8" opacity={0.7} />
		))}
		{Array.from({length: 14}, (_, i) => (
			<circle key={i} cx={110 + i * 24} cy={120} r={4} fill="#5B8DB8" opacity={0.5} />
		))}
	</g>
);

// A small hatchback in side view, 300 × 120, origin at the bottom-left of the wheels' ground line.
export const Car: React.FC<{color?: string}> = ({color = '#E8E4DC'}) => (
	<g transform="translate(0,-120)">
		<path d="M0,96 L0,62 Q4,48 30,45 L82,40 L122,9 Q130,2 142,2 L220,2 Q236,2 246,14 L276,42 Q300,46 300,62 L300,96 Z" fill={color} />
		<polygon points="132,12 186,12 186,40 98,40" fill="#0C0D10" opacity={0.75} />
		<polygon points="194,12 236,12 262,40 194,40" fill="#0C0D10" opacity={0.75} />
		<circle cx={72} cy={96} r={24} fill="#111216" />
		<circle cx={72} cy={96} r={10} fill="#8C9099" />
		<circle cx={232} cy={96} r={24} fill="#111216" />
		<circle cx={232} cy={96} r={10} fill="#8C9099" />
	</g>
);

// A thin plastic shopping bag lying crumpled on the seabed, about 220 × 140 around (0, 0).
export const Bag: React.FC = () => (
	<g>
		<path d="M-70,-30 Q-90,-95 -55,-110 Q-30,-112 -38,-60" fill="none" stroke="#E9EEF2" strokeWidth={9} strokeLinecap="round" opacity={0.75} />
		<path d="M20,-40 Q30,-105 64,-98 Q88,-88 62,-36" fill="none" stroke="#E9EEF2" strokeWidth={9} strokeLinecap="round" opacity={0.75} />
		<path
			d="M-110,40 Q-118,-10 -84,-40 Q-60,-58 -20,-46 Q20,-60 70,-44 Q112,-26 116,20 Q120,56 80,66 Q20,78 -30,70 Q-96,66 -110,40 Z"
			fill="#E9EEF2"
			opacity={0.62}
		/>
		<path d="M-80,-10 Q-40,10 -10,-12 M10,30 Q50,6 90,26 M-60,40 Q-20,22 20,48" fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.65} strokeLinecap="round" />
		<path d="M-100,44 Q-20,60 100,52" fill="none" stroke="#B9C3CF" strokeWidth={3} opacity={0.6} />
	</g>
);

// A deep-sea anglerfish facing right, around (0, 0), with a glowing lure. `glow` 0–1 for the bulb's pulse.
export const Angler: React.FC<{glow: number}> = ({glow}) => (
	<g>
		<path d="M-96,0 L-150,-40 L-138,0 L-150,40 Z" fill="#17222E" stroke="#34506A" strokeWidth={2.5} strokeLinejoin="round" />
		<path d="M-100,0 Q-92,-72 0,-76 Q78,-72 102,-14 L52,4 L100,22 Q78,66 0,68 Q-92,62 -100,0 Z" fill="#17222E" stroke="#34506A" strokeWidth={2.5} strokeLinejoin="round" />
		{[0, 1, 2, 3, 4].map((i) => (
			<polygon key={`u${i}`} points={`${58 + i * 9},${-4 - i * 2.2} ${63 + i * 9},${14 - i * 2} ${68 + i * 9},${-6 - i * 2.2}`} fill="#E8E4DC" />
		))}
		{[0, 1, 2, 3].map((i) => (
			<polygon key={`d${i}`} points={`${60 + i * 9},${10 + i * 2.5} ${65 + i * 9},${-6 + i * 2.5} ${70 + i * 9},${12 + i * 2.5}`} fill="#E8E4DC" />
		))}
		<circle cx={30} cy={-34} r={9} fill="#0C0D10" stroke="#5B7A94" strokeWidth={2} />
		<path d="M14,-74 Q30,-150 112,-136" fill="none" stroke="#34506A" strokeWidth={4} strokeLinecap="round" />
		<circle cx={118} cy={-134} r={30} fill="#7FF5FF" opacity={0.12 + 0.18 * glow} />
		<circle cx={118} cy={-134} r={10} fill="#BFFBFF" opacity={0.7 + 0.3 * glow} />
	</g>
);

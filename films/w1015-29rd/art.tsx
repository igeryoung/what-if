import React, {useId} from 'react';

export const rng = (seed: number) => () => {
	seed = (seed * 16807) % 2147483647;
	return (seed - 1) / 2147483646;
};

const useSvgId = () => useId().replace(/:/g, '');

export type Coat = {fur: string; shade: string; stripe: string; light: string; nose: string; eye: string; inner: string; sw: number};
// The house cat is a grey tabby with white socks and a red collar, so it never reads as a tiger.
export const GREY: Coat = {fur: '#9BA3AF', shade: '#7D8591', stripe: '#59606C', light: '#ECE8E2', nose: '#F19AA8', eye: '#CFE04F', inner: '#E6A1AC', sw: 14};
export const TIGER: Coat = {fur: '#F2862B', shade: '#D26A18', stripe: '#1B1612', light: '#F8EEDD', nose: '#C9727A', eye: '#F4C430', inner: '#F3C6A8', sw: 22};

export const WOOD = {top: '#6E4A31', grain: '#7C553A', front: '#4E3322', leg: '#3F2A1C'};

// ─── Front-view face ──────────────────────────────────────────────────────────────────────────────
const HEAD = 'M -255 30 C -262 -130 -150 -215 0 -215 C 150 -215 262 -130 255 30 C 248 165 140 235 0 235 C -140 235 -248 165 -255 30 Z';

/** Front-view cat face, ~520 wide at k = 1, centred on (x, y). `look` moves the pupils, `blink` 0..1 closes the lids. */
export const CatFace: React.FC<{x: number; y: number; k?: number; coat?: Coat; look?: [number, number]; blink?: number}> = ({x, y, k = 1, coat = GREY, look = [0, 0], blink = 0}) => {
	const id = useSvgId();
	const st = {stroke: coat.stripe, strokeWidth: coat.sw, strokeLinecap: 'round' as const, fill: 'none'};
	return (
		<g transform={`translate(${x} ${y}) scale(${k})`}>
			{[1, -1].map((m) => (
				<g key={m} transform={`scale(${m} 1)`}>
					<path d="M -240 -60 L -205 -318 L -55 -198 Z" fill={coat.fur} stroke={coat.fur} strokeWidth={18} strokeLinejoin="round" />
					<path d="M -210 -100 L -190 -262 L -98 -192 Z" fill={coat.inner} stroke={coat.inner} strokeWidth={10} strokeLinejoin="round" />
				</g>
			))}
			<path d={HEAD} fill={coat.fur} />
			<path d="M -60 -204 Q -50 -152 -40 -112" {...st} />
			<path d="M 0 -214 L 0 -122" {...st} />
			<path d="M 60 -204 Q 50 -152 40 -112" {...st} />
			{[1, -1].map((m) => (
				<g key={m} transform={`scale(${m} 1)`}>
					<path d="M -252 -10 Q -215 -14 -182 -2" {...st} />
					<path d="M -250 40 Q -214 40 -186 50" {...st} />
					<path d="M -236 92 Q -208 96 -188 106" {...st} />
				</g>
			))}
			<ellipse cx={-50} cy={96} rx={72} ry={56} fill={coat.light} />
			<ellipse cx={50} cy={96} rx={72} ry={56} fill={coat.light} />
			<ellipse cx={0} cy={158} rx={60} ry={40} fill={coat.light} />
			<clipPath id={`${id}e`}>
				<ellipse cx={-108} cy={-28} rx={64} ry={54} />
				<ellipse cx={108} cy={-28} rx={64} ry={54} />
			</clipPath>
			<g clipPath={`url(#${id}e)`}>
				{[-108, 108].map((ex) => (
					<g key={ex}>
						<ellipse cx={ex} cy={-28} rx={64} ry={54} fill={coat.eye} />
						<ellipse cx={ex + look[0]} cy={-28 + look[1]} rx={15} ry={44} fill="#111214" />
						<circle cx={ex + look[0] - 20} cy={-50 + look[1]} r={11} fill="#fff" opacity={0.9} />
						<rect x={ex - 70} y={-90} width={140} height={4 + 124 * blink} fill={coat.fur} />
					</g>
				))}
			</g>
			<ellipse cx={-108} cy={-28} rx={64} ry={54} fill="none" stroke={coat.stripe} strokeWidth={8} />
			<ellipse cx={108} cy={-28} rx={64} ry={54} fill="none" stroke={coat.stripe} strokeWidth={8} />
			<path d="M -32 40 Q 0 30 32 40 Q 26 56 0 74 Q -26 56 -32 40 Z" fill={coat.nose} />
			<path d="M 0 74 L 0 98 M 0 98 Q -18 118 -44 104 M 0 98 Q 18 118 44 104" stroke={coat.stripe} strokeWidth={7} strokeLinecap="round" fill="none" />
			{[1, -1].map((m) => (
				<g key={m} transform={`scale(${m} 1)`} stroke="#F4F1EC" strokeWidth={4} strokeLinecap="round" opacity={0.75}>
					<line x1={-100} y1={88} x2={-335} y2={52} />
					<line x1={-102} y1={108} x2={-345} y2={108} />
					<line x1={-100} y1={128} x2={-330} y2={162} />
				</g>
			))}
		</g>
	);
};

// ─── Hook / ending: the giant face behind a table, its paw next to a mug ───────────────────────────
export const HOOK = {faceX: 330, faceY: 1215, faceK: 0.8, back: 1380, front: 1500, pawRest: 610, mugRest: 770, mugBase: 1462, mugW: 96} as const;
export const LOOK_MUG: [number, number] = [14, 6];

/** White mug standing on its base at (x, base). */
export const Mug: React.FC<{x: number; base: number; rot?: number; k?: number}> = ({x, base, rot = 0, k = 1}) => (
	<g transform={`translate(${x} ${base - 56 * k}) rotate(${rot}) scale(${k})`}>
		<path d="M 46 -34 C 92 -34 92 30 46 30" stroke="#F4F1EC" strokeWidth={15} fill="none" />
		<path d="M -48 -56 L 48 -56 L 48 40 Q 48 56 32 56 L -32 56 Q -48 56 -48 40 Z" fill="#F4F1EC" />
		<rect x={-48} y={-20} width={96} height={20} fill={'#FF3B30'} />
		<ellipse cx={0} cy={-56} rx={48} ry={11} fill="#3B2418" />
		<ellipse cx={0} cy={-56} rx={48} ry={11} fill="none" stroke="#DCD7CF" strokeWidth={4} />
	</g>
);

/** Front paw seen from the front, resting on a surface at (x, y = bottom of the paw). */
export const Paw: React.FC<{x: number; y: number; k?: number; coat?: Coat}> = ({x, y, k = 1, coat = GREY}) => (
	<g transform={`translate(${x} ${y}) scale(${k})`}>
		<path d="M -100 0 C -108 -70 -60 -104 0 -104 C 60 -104 108 -70 100 0 Z" fill={coat.light} />
		<path d="M -36 -4 L -38 -62 M 0 -4 L 0 -72 M 36 -4 L 38 -62" stroke="#B9B3AA" strokeWidth={6} strokeLinecap="round" />
	</g>
);

export const Table: React.FC<{back?: number; front?: number}> = ({back = HOOK.back, front = HOOK.front}) => (
	<g>
		<path d={`M 120 ${back} L 960 ${back} L 1040 ${front} L 40 ${front} Z`} fill={WOOD.top} />
		{[0.3, 0.55, 0.8].map((p) => {
			const y = back + (front - back) * p;
			return <line key={p} x1={120 - 80 * p + 30} y1={y} x2={960 + 80 * p - 30} y2={y} stroke={WOOD.grain} strokeWidth={3} />;
		})}
		<rect x={40} y={front} width={1000} height={44} fill={WOOD.front} />
		<rect x={80} y={front + 44} width={52} height={1920 - front} fill={WOOD.leg} />
		<rect x={948} y={front + 44} width={52} height={1920 - front} fill={WOOD.leg} />
	</g>
);

/** The opening image. `pawX` = paw centre, `mug` = null when the mug is gone. */
export const HookArt: React.FC<{pawX?: number; mug?: {x: number; base: number; rot: number} | null; look?: [number, number]; blink?: number}> = ({
	pawX = HOOK.pawRest,
	mug = {x: HOOK.mugRest, base: HOOK.mugBase, rot: 0},
	look = LOOK_MUG,
	blink = 0,
}) => {
	const pawY = HOOK.mugBase - 2;
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
			<rect x={0} y={1700} width={1080} height={220} fill="#0A0B0D" />
			<CatFace x={HOOK.faceX} y={HOOK.faceY} k={HOOK.faceK} look={look} blink={blink} />
			<Table />
			{/* the foreleg lies along the table from under the chin to the paw; stripes every 90 px */}
			<path d={`M 520 ${pawY - 66} L ${pawX} ${pawY - 52}`} stroke={GREY.fur} strokeWidth={116} strokeLinecap="round" fill="none" />
			{Array.from({length: Math.max(0, Math.floor((pawX - 640) / 90) + 1)}, (_, i) => {
				const lx = 600 + i * 90;
				const ly = pawY - 66 + ((lx - 520) / Math.max(1, pawX - 520)) * 14;
				return <path key={i} d={`M ${lx - 6} ${ly - 54} Q ${lx + 8} ${ly} ${lx - 4} ${ly + 50}`} stroke={GREY.stripe} strokeWidth={14} strokeLinecap="round" fill="none" />;
			})}
			<Paw x={pawX} y={pawY} />
			{mug ? (
				<>
					{mug.base <= HOOK.mugBase + 1 && mug.x < 1000 ? <ellipse cx={mug.x} cy={HOOK.mugBase} rx={54} ry={9} fill="#000" opacity={0.25} /> : null}
					<Mug x={mug.x} base={mug.base} rot={mug.rot} />
				</>
			) : null}
		</svg>
	);
};

// ─── Side-view cat (standing, facing right). Feet at local y = 600, nose at x ≈ 990. ─────────────
const BODY = 'M 250 260 C 240 190 330 160 450 165 C 560 170 640 150 720 160 C 790 170 820 220 815 300 C 812 380 780 420 720 425 L 380 430 C 300 432 255 390 250 330 Z';
const NECK = 'M 690 175 C 750 120 820 95 870 115 L 880 270 C 830 300 780 300 740 280 Z';

export const CatSide: React.FC<{x: number; y: number; k: number; coat: Coat; collar?: boolean; tail?: 'up' | 'down'}> = ({x, y, k, coat, collar = false, tail = 'up'}) => {
	const id = useSvgId();
	const tiger = coat === TIGER;
	const legs = (fill: string, dx: number) => (
		<g fill={fill}>
			<rect x={640 + dx} y={330} width={58} height={262} rx={28} />
			<rect x={362 + dx} y={360} width={58} height={232} rx={28} />
		</g>
	);
	const tailD = tail === 'up' ? 'M 262 268 C 160 250 120 160 168 70' : 'M 258 290 C 150 300 96 420 130 540';
	const bands: string[] = [];
	const r = rng(tiger ? 5 : 9);
	for (let i = 0; i < (tiger ? 10 : 9); i++) {
		const bx = 310 + i * 52;
		const j = (r() - 0.5) * 18;
		bands.push(`M ${bx + j} 150 Q ${bx - 16} 230 ${bx + 6 + j} ${tiger ? 330 : 290}`);
	}
	return (
		<g transform={`translate(${x - 500 * k} ${y - 600 * k}) scale(${k})`}>
			<path d={tailD} stroke={coat.fur} strokeWidth={46} strokeLinecap="round" fill="none" />
			{tiger ? <path d={tailD} stroke={coat.stripe} strokeWidth={48} strokeDasharray="18 34" fill="none" /> : <path d={tailD} stroke={coat.stripe} strokeWidth={48} strokeDasharray="12 40" fill="none" opacity={0.8} />}
			{legs(coat.shade, 0)}
			<clipPath id={`${id}b`}>
				<path d={BODY} />
				<path d={NECK} />
				<ellipse cx={320} cy={330} rx={98} ry={108} />
				<rect x={700} y={330} width={64} height={262} rx={30} />
				<rect x={290} y={360} width={62} height={232} rx={30} />
			</clipPath>
			<g fill={coat.fur}>
				<path d={BODY} />
				<path d={NECK} />
				<ellipse cx={320} cy={330} rx={98} ry={108} />
				<rect x={700} y={330} width={64} height={262} rx={30} />
				<rect x={290} y={360} width={62} height={232} rx={30} />
			</g>
			<g clipPath={`url(#${id}b)`}>
				{bands.map((d, i) => (
					<path key={i} d={d} stroke={coat.stripe} strokeWidth={tiger ? 24 : 14} strokeLinecap="round" fill="none" />
				))}
				{[420, 470, 520].map((yy) => (
					<g key={yy} stroke={coat.stripe} strokeWidth={tiger ? 14 : 9} strokeLinecap="round">
						<line x1={700} y1={yy} x2={740} y2={yy + 4} />
						<line x1={290} y1={yy} x2={330} y2={yy + 4} />
					</g>
				))}
				<path d="M 300 250 C 330 290 340 340 310 400" stroke={coat.stripe} strokeWidth={tiger ? 20 : 12} strokeLinecap="round" fill="none" />
				<ellipse cx={810} cy={330} rx={50} ry={90} fill={coat.light} />
				<rect x={290} y={560} width={62} height={40} fill={tiger ? coat.fur : coat.light} />
				<rect x={700} y={560} width={64} height={40} fill={tiger ? coat.fur : coat.light} />
				<path d="M 380 430 L 720 425 L 720 400 Q 550 420 380 410 Z" fill={coat.light} opacity={0.9} />
			</g>
			<path d="M 812 92 L 828 6 L 884 72 Z" fill={coat.shade} stroke={coat.shade} strokeWidth={10} strokeLinejoin="round" />
			<circle cx={862} cy={168} r={98} fill={coat.fur} />
			<path d="M 868 80 L 906 4 L 934 92 Z" fill={coat.fur} stroke={coat.fur} strokeWidth={10} strokeLinejoin="round" />
			<path d="M 878 72 L 902 26 L 918 82 Z" fill={coat.inner} />
			<path d="M 840 78 Q 846 110 838 140 M 880 72 Q 880 100 872 124" stroke={coat.stripe} strokeWidth={tiger ? 14 : 10} strokeLinecap="round" fill="none" />
			<path d="M 790 150 Q 820 160 836 180 M 786 196 Q 816 200 834 214" stroke={coat.stripe} strokeWidth={tiger ? 14 : 9} strokeLinecap="round" fill="none" />
			<ellipse cx={928} cy={204} rx={58} ry={44} fill={coat.light} />
			<ellipse cx={978} cy={184} rx={13} ry={10} fill={coat.nose} />
			<ellipse cx={892} cy={150} rx={20} ry={15} fill={coat.eye} stroke={coat.stripe} strokeWidth={4} />
			<ellipse cx={898} cy={150} rx={5} ry={12} fill="#111214" />
			<g stroke="#F4F1EC" strokeWidth={4} strokeLinecap="round" opacity={0.7}>
				<line x1={940} y1={206} x2={1060} y2={190} />
				<line x1={940} y1={218} x2={1058} y2={226} />
			</g>
			{collar ? (
				<g>
					<path d="M 760 170 Q 800 240 868 262" stroke="#FF3B30" strokeWidth={26} strokeLinecap="round" fill="none" />
					<circle cx={846} cy={292} r={22} fill="#FFB020" />
					<line x1={834} y1={296} x2={858} y2={296} stroke="#8A5A00" strokeWidth={4} />
				</g>
			) : null}
		</g>
	);
};

// ─── Small props ───────────────────────────────────────────────────────────────────────────────────
const POUCH_COLORS = ['#FFB020', '#FF6B4A', '#4FB3BF', '#B58CF0'];
/** Cat-food pouch, 52 × 68, centred on (x, y). */
export const Pouch: React.FC<{x: number; y: number; k?: number; i?: number}> = ({x, y, k = 1, i = 0}) => {
	const c = POUCH_COLORS[i % POUCH_COLORS.length];
	return (
		<g transform={`translate(${x} ${y}) scale(${k})`}>
			<rect x={-26} y={-34} width={52} height={68} rx={8} fill={c} />
			<rect x={-26} y={-34} width={52} height={12} rx={4} fill="#000" opacity={0.18} />
			<path d="M -14 10 Q 0 -4 14 10 Q 0 24 -14 10 Z M 14 10 L 22 2 L 22 18 Z" fill="#fff" opacity={0.85} />
		</g>
	);
};

export const Bowl: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x} ${y})`}>
		<ellipse cx={0} cy={0} rx={200} ry={34} fill="#C8CDD6" />
		<ellipse cx={0} cy={0} rx={168} ry={22} fill="#6F7682" />
		<path d="M -200 0 Q -190 90 -130 100 L 130 100 Q 190 90 200 0 Q 100 34 0 34 Q -100 34 -200 0 Z" fill="#AEB4BF" />
		<text x={0} y={78} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={40} fill="#59606C">
			CAT
		</text>
	</g>
);

export const Laptop: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = 0}) => (
	<g transform={`translate(${x} ${y}) rotate(${rot})`}>
		<rect x={-110} y={-150} width={220} height={142} rx={10} fill="#2B2F38" />
		<rect x={-98} y={-138} width={196} height={118} rx={4} fill="#4FB3BF" />
		<rect x={-80} y={-118} width={110} height={12} rx={6} fill="#E7FBFF" opacity={0.7} />
		<rect x={-80} y={-96} width={150} height={10} rx={5} fill="#E7FBFF" opacity={0.45} />
		<rect x={-80} y={-78} width={90} height={10} rx={5} fill="#E7FBFF" opacity={0.45} />
		<rect x={-128} y={-10} width={256} height={14} rx={6} fill="#A9AFBA" />
	</g>
);

export const TV: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = 0}) => (
	<g transform={`translate(${x} ${y}) rotate(${rot})`}>
		<rect x={-40} y={-30} width={80} height={30} rx={6} fill="#2B2F38" />
		<rect x={-200} y={-262} width={400} height={236} rx={12} fill="#1E2128" />
		<rect x={-186} y={-248} width={372} height={208} rx={4} fill="#233B5A" />
		<circle cx={60} cy={-170} r={40} fill="#FFB020" opacity={0.9} />
		<path d="M -186 -80 L -90 -150 L -10 -96 L 60 -130 L 186 -60 L 186 -40 L -186 -40 Z" fill="#34C77B" opacity={0.85} />
	</g>
);

/** Long side table seen from the front: top surface at y = top, x 100..1000. */
export const Sideboard: React.FC<{top: number}> = ({top}) => (
	<g>
		<rect x={100} y={top} width={900} height={36} rx={4} fill={WOOD.top} />
		<rect x={130} y={top + 36} width={840} height={250} fill={WOOD.front} />
		<rect x={150} y={top + 56} width={400} height={210} rx={6} fill="#5A3B27" />
		<rect x={570} y={top + 56} width={380} height={210} rx={6} fill="#5A3B27" />
		<circle cx={530} cy={top + 160} r={9} fill="#C9A26B" />
		<circle cx={590} cy={top + 160} r={9} fill="#C9A26B" />
		<rect x={150} y={top + 286} width={36} height={70} fill={WOOD.leg} />
		<rect x={914} y={top + 286} width={36} height={70} fill={WOOD.leg} />
	</g>
);

/** A grey tabby foreleg reaching in from the left edge, paw at (x, y). */
export const Foreleg: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g>
		<path d={`M -200 ${y - 80} L ${x - 60} ${y - 50}`} stroke={GREY.fur} strokeWidth={130} strokeLinecap="round" fill="none" />
		{[0.25, 0.5, 0.75].map((p) => {
			const lx = -200 + (x - 60 + 200) * p;
			const ly = y - 80 + 30 * p;
			return <path key={p} d={`M ${lx - 10} ${ly - 60} Q ${lx + 8} ${ly} ${lx - 6} ${ly + 60}`} stroke={GREY.stripe} strokeWidth={14} strokeLinecap="round" fill="none" />;
		})}
		<ellipse cx={x - 20} cy={y - 48} rx={80} ry={64} fill={GREY.light} />
		<path d={`M ${x + 20} ${y - 90} L ${x + 30} ${y - 70} M ${x + 34} ${y - 52} L ${x + 50} ${y - 46} M ${x + 26} ${y - 14} L ${x + 40} ${y - 6}`} stroke="#B9B3AA" strokeWidth={6} strokeLinecap="round" />
	</g>
);

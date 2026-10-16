import React from 'react';
import {C} from '../../engine/kit/theme';

export const PAPER = '#F2E8D5';
export const INK2 = '#3A342C';
export const SPINES = ['#FFB020', '#FF3B30', '#34C77B', '#4C8DFF', '#9B6BFF', '#FF6B9A', '#2EC4B6', '#E9E2D4'];

export const rng = (seed: number) => {
	let a = seed >>> 0;
	return () => {
		a = (a * 1664525 + 1013904223) >>> 0;
		return a / 4294967296;
	};
};

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
	<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
		{children}
	</svg>
);

// ── The opening image: a chat bubble with typing dots ─────────────────────────────────────────────
// `g` is the global frame: the dots loop every 30 f and TOTAL is a multiple of 30, so the replay is seamless.
export const BUBBLE = {cx: 540, cy: 1100};
export const Bubble: React.FC<{g: number; y?: number; scale?: number}> = ({g, y = 0, scale = 1}) => {
	const dots = [0, 1, 2].map((i) => {
		const p = ((((g - i * 5) % 30) + 30) % 30) / 30;
		const lift = p < 0.4 ? Math.sin((p / 0.4) * Math.PI) : 0;
		return {x: 420 + i * 120, dy: -18 * lift, o: 0.45 + 0.55 * lift};
	});
	return (
		<Svg>
			<defs>
				<radialGradient id="bb-glow" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stopColor={C.amber} stopOpacity={0.18} />
					<stop offset="100%" stopColor={C.amber} stopOpacity={0} />
				</radialGradient>
			</defs>
			<g transform={`translate(0 ${y}) translate(${BUBBLE.cx} ${BUBBLE.cy}) scale(${scale}) translate(${-BUBBLE.cx} ${-BUBBLE.cy})`}>
				<circle cx={540} cy={1110} r={420} fill="url(#bb-glow)" />
				<path d="M 372 1188 C 366 1252 336 1292 286 1322 C 372 1316 432 1284 466 1232 Z" fill={C.ink} />
				<rect x={290} y={960} width={500} height={280} rx={140} fill={C.ink} />
				{dots.map((d, i) => (
					<circle key={i} cx={d.x} cy={1100 + d.dy} r={32} fill="#23252B" opacity={d.o} />
				))}
			</g>
		</Svg>
	);
};

// ── An open book whose pages fill with lines of text (p: 0 → 1) ──────────────────────────────────
const LINES = 13;
const lineW = (() => {
	const r = rng(7);
	return Array.from({length: LINES * 2}, (_, j) => ((j + 1) % 5 === 0 || j % LINES === LINES - 1 ? 0.35 + r() * 0.3 : 0.86 + r() * 0.14));
})();
export const OpenBook: React.FC<{p: number; y: number; cover?: string}> = ({p, y, cover = C.amber}) => {
	const n = p * LINES * 2;
	return (
		<Svg>
			<g transform={`translate(0 ${y})`}>
				<rect x={128} y={-14} width={824} height={478} rx={22} fill={cover} />
				<path d="M 150 0 Q 345 -22 536 10 L 536 446 Q 345 418 150 440 Z" fill={PAPER} />
				<path d="M 544 10 Q 735 -22 930 0 L 930 440 Q 735 418 544 446 Z" fill={PAPER} />
				<rect x={530} y={8} width={20} height={440} fill="#000" opacity={0.12} />
				{lineW.map((w, j) => {
					const fill = Math.max(0, Math.min(1, n - j));
					if (fill <= 0) return null;
					const left = j < LINES;
					const k = j % LINES;
					const x0 = left ? 190 : 584;
					return <rect key={j} x={x0} y={40 + k * 29} width={306 * w * fill} height={10} rx={5} fill={INK2} opacity={0.8} />;
				})}
			</g>
		</Svg>
	);
};

// ── Shakespeare's complete works: a thick red tome and a quill ───────────────────────────────────
export const Tome: React.FC<{
	y: number;
	title: string;
	sub: string;
	titleSize: number;
	subSize: number;
	font: string;
}> = ({y, title, sub, titleSize, subSize, font}) => (
	<Svg>
		<g transform={`translate(0 ${y})`}>
			<rect x={372} y={12} width={392} height={360} rx={14} fill="#000" opacity={0.35} />
			<rect x={724} y={14} width={44} height={340} rx={6} fill={PAPER} />
			{Array.from({length: 16}, (_, i) => (
				<line key={i} x1={728} x2={764} y1={30 + i * 20} y2={30 + i * 20} stroke="#CDBFA5" strokeWidth={3} />
			))}
			<rect x={352} y={0} width={384} height={360} rx={14} fill="#8E2433" />
			<rect x={352} y={0} width={40} height={360} rx={10} fill="#6B1A26" />
			<rect x={414} y={26} width={300} height={308} rx={8} fill="none" stroke="#E8C36A" strokeWidth={4} />
			<text x={564} y={170} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={subSize} fill="#E8C36A">
				{title}
			</text>
			<text x={564} y={170 + titleSize + 10} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={titleSize} fill="#F6E3B0">
				{sub}
			</text>
			<g transform="translate(830 40) rotate(28)">
				<path d="M 0 0 C 46 40 52 150 10 270 C -26 160 -40 60 0 0 Z" fill={C.ink} />
				<path d="M 0 10 L 8 300" stroke="#9AA0A8" strokeWidth={4} />
			</g>
		</g>
	</Svg>
);

// ── Book tower vs. a 29-storey building, in world centimetres ────────────────────────────────────
export const BOOKS = 4329; // 12,650 words/day × 365 × 75 years ÷ 80,000 words
export const BOOK_CM = 2;
export const GROUND = 1560;
const TX = 650; // tower centre on screen
const BLD = {x0: -2700, x1: -700, floors: 29, floorCm: 300};
const bookCols = (() => {
	const r = rng(21);
	return Array.from({length: BOOKS}, () => ({
		c: Math.floor(r() * SPINES.length),
		w: 17 + r() * 6,
		dx: (r() - 0.5) * 3,
	}));
})();
const lit = (() => {
	const r = rng(5);
	return Array.from({length: BLD.floors * 6}, () => r() < 0.45);
})();

export const Tower: React.FC<{
	books: number;
	k: number;
	showLevel: number;
}> = ({books, k, showLevel}) => {
	const X = (cm: number) => TX + cm * k;
	const Y = (cm: number) => GROUND - cm * k;
	const bookPx = BOOK_CM * k;
	const step = bookPx >= 3 ? 1 : Math.ceil(3 / bookPx);
	const n = Math.floor(books);
	const bands: React.ReactNode[] = [];
	for (let b = 0; b < n; b += step) {
		const top = Y(Math.min(n, b + step) * BOOK_CM);
		const bot = Y(b * BOOK_CM);
		if (bot < 0) break;
		const bc = bookCols[b];
		const half = Math.max((bc.w / 2) * k, 9);
		const dx = step === 1 ? bc.dx * k : 0;
		bands.push(
			<rect key={b} x={TX - half + dx} y={top} width={half * 2} height={Math.max(0.6, bot - top - (step === 1 && bookPx > 6 ? 1 : 0))} rx={step === 1 && bookPx > 6 ? 2 : 0} fill={SPINES[bc.c]} />,
		);
	}
	const fh = BLD.floorCm * k;
	const bTop = Y(BLD.floors * BLD.floorCm);
	const pH = 170 * k;
	const px = X(-70);
	const towerTop = Y(n * BOOK_CM);
	return (
		<Svg>
			<defs>
				{/* the building fades out above the text zone while the camera pulls back */}
				<linearGradient id="bld-fade" gradientUnits="userSpaceOnUse" x1={0} y1={560} x2={0} y2={660}>
					<stop offset="0%" stopColor="#000" />
					<stop offset="100%" stopColor="#fff" />
				</linearGradient>
				<mask id="bld-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
					<rect x={0} y={0} width={1080} height={1920} fill="url(#bld-fade)" />
				</mask>
			</defs>
			<rect x={0} y={GROUND} width={1080} height={360} fill="#08090B" />
			<g mask="url(#bld-mask)">
				{/* building */}
				<rect x={X(BLD.x0)} y={bTop} width={(BLD.x1 - BLD.x0) * k} height={GROUND - bTop} fill="#1C2028" stroke="#343A46" strokeWidth={2} />
				{fh > 5 &&
					Array.from({length: BLD.floors}, (_, i) => {
						const fy = Y((i + 1) * BLD.floorCm);
						if (fy > 1920 || fy + fh < 0) return null;
						return (
							<g key={i}>
								<line x1={X(BLD.x0)} x2={X(BLD.x1)} y1={fy} y2={fy} stroke="#343A46" strokeWidth={Math.max(1, 12 * k)} />
								{Array.from({length: 6}, (__, w) => (
									<rect key={w} x={X(BLD.x0 + 120 + w * 320)} y={fy + fh * 0.28} width={200 * k} height={fh * 0.5} fill={lit[i * 6 + w] ? C.amber : '#2A303B'} opacity={lit[i * 6 + w] ? 0.75 : 1} />
								))}
							</g>
						);
					})}
			</g>
			{/* person for scale */}
			{pH > 6 && (
				<g fill="#8C9099">
					<circle cx={px} cy={GROUND - pH + pH * 0.07} r={pH * 0.07} />
					<rect x={px - pH * 0.09} y={GROUND - pH * 0.85} width={pH * 0.18} height={pH * 0.42} rx={pH * 0.06} />
					<rect x={px - pH * 0.08} y={GROUND - pH * 0.46} width={pH * 0.07} height={pH * 0.46} rx={pH * 0.03} />
					<rect x={px + pH * 0.01} y={GROUND - pH * 0.46} width={pH * 0.07} height={pH * 0.46} rx={pH * 0.03} />
				</g>
			)}
			{bands}
			<line x1={0} x2={1080} y1={GROUND} y2={GROUND} stroke="#3A3F4A" strokeWidth={3} />
			{/* level line: tower top ≈ roof */}
			<g opacity={showLevel}>
				<line x1={X(BLD.x0) - 30} x2={TX + 80} y1={towerTop} y2={towerTop} stroke={C.amber} strokeWidth={4} strokeDasharray="14 12" />
				<circle cx={TX} cy={towerTop} r={10} fill={C.amber} />
			</g>
		</Svg>
	);
};

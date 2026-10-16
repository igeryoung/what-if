import React from 'react';
import {C} from '../../engine/kit/theme';
import {TW_CUM, TW_PATH, TW_ROWS, TW_START, TW_STEP, TW_Y0} from './taiwan';

export const LAND = '#3A362F'; // dusty floor / dusty land
export const SEAM = '#2A2723';
export const SPECK = '#776E61';
export const COAST = '#7C7467';
export const CLEAN = '#2FA36B';
export const CLEAN_HI = '#5BE39A';
export const FLOOR_CLEAN = '#2D5A43';

export const rng = (seed: number) => () => {
	seed |= 0;
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const MAP_SPECKS = (() => {
	const r = rng(7);
	return Array.from({length: 650}, () => ({x: 250 + r() * 500, y: 960 + r() * 660, r: 0.8 + r() * 1.5, o: 0.35 + r() * 0.45}));
})();

/** y of the sweep front once fraction `f` of Taiwan's area is clean (north → south, by area). */
export const frontY = (f: number) => {
	if (f <= 0) return TW_Y0;
	for (let i = 0; i < TW_CUM.length; i++) {
		if (TW_CUM[i] >= f) {
			const c0 = i ? TW_CUM[i - 1] : 0;
			return TW_Y0 + (i + (f - c0) / Math.max(1e-6, TW_CUM[i] - c0)) * TW_STEP;
		}
	}
	return TW_Y0 + TW_CUM.length * TW_STEP;
};

const rowAt = (y: number): [number, number] => TW_ROWS[Math.max(0, Math.min(TW_ROWS.length - 1, Math.floor((y - TW_Y0) / TW_STEP)))];

/** Robot on the map: rides the sweep front, going back and forth across the island (`lanes` = lane phase). */
export const botOnFront = (f: number, lanes: number) => {
	if (f <= 0) return {...TW_START};
	const y = Math.min(frontY(f), TW_Y0 + TW_ROWS.length * TW_STEP - 6);
	const [xl, xr] = rowAt(y);
	const m = Math.min(10, (xr - xl) / 2);
	const p = lanes % 2;
	const tri = p < 1 ? p : 2 - p;
	const xf = xl + m + (xr - xl - 2 * m) * tri;
	// blend from the start point over the first sliver so the robot never jumps
	const k = Math.min(1, f / 0.02);
	return {x: TW_START.x + (xf - TW_START.x) * k, y: TW_START.y + (y - TW_START.y) * k};
};

/** Taiwan (Natural Earth 10m) in frame coordinates, dusty, with the part north of the sweep front cleaned. */
export const TaiwanMap: React.FC<{clean?: number; cleanOpacity?: number; speck?: number; id: string}> = ({clean = 0, cleanOpacity = 1, speck = 1, id}) => {
	const fy = frontY(clean);
	return (
		<g>
			<defs>
				<clipPath id={`${id}-clip`}>
					<path d={TW_PATH} />
				</clipPath>
			</defs>
			<path d={TW_PATH} fill={LAND} />
			{speck > 0 ? (
				<g clipPath={`url(#${id}-clip)`} opacity={speck}>
					{MAP_SPECKS.map((p, i) => (
						<circle key={i} cx={p.x} cy={p.y} r={p.r} fill={SPECK} opacity={p.o} />
					))}
				</g>
			) : null}
			{clean > 0 && cleanOpacity > 0 ? (
				<g clipPath={`url(#${id}-clip)`} opacity={cleanOpacity}>
					<rect x={200} y={TW_Y0 - 10} width={620} height={fy - TW_Y0 + 10} fill={CLEAN} />
					<rect x={200} y={fy - 4} width={620} height={4} fill={CLEAN_HI} />
				</g>
			) : null}
			<path d={TW_PATH} fill="none" stroke={COAST} strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
		</g>
	);
};

/** The robot at map scale: a small disc with an amber halo so it reads at any size. */
export const MapBot: React.FC<{x: number; y: number; r?: number; halo?: number}> = ({x, y, r = 12, halo = 1}) => (
	<g transform={`translate(${x} ${y})`}>
		<circle r={r * 2.1} fill="none" stroke={C.amber} strokeWidth={2.5} opacity={0.6 * halo} />
		<circle r={r} fill={C.ink} stroke="#15171C" strokeWidth={2} />
		<circle cx={-r * 0.15} r={r * 0.42} fill="#2B2E35" />
		<circle cx={r * 0.62} r={r * 0.16} fill={C.amber} />
	</g>
);

const SideBrush: React.FC<{x: number; y: number; len: number; rot: number}> = ({x, y, len, rot}) => (
	<g transform={`translate(${x} ${y}) rotate(${rot})`}>
		{[0, 120, 240].map((a) => (
			<line key={a} x1={0} y1={0} x2={len * Math.cos((a * Math.PI) / 180)} y2={len * Math.sin((a * Math.PI) / 180)} stroke="#9AA0AA" strokeWidth={len * 0.06} strokeLinecap="round" />
		))}
		<circle r={len * 0.16} fill="#5A5F69" />
	</g>
);

/** Top view of a robot vacuum, facing +x, centred on the origin. `brush` = side-brush angle in degrees. */
export const Robot: React.FC<{r: number; brush: number}> = ({r, brush}) => {
	const a0 = (-70 * Math.PI) / 180;
	const a1 = (70 * Math.PI) / 180;
	const br = r * 0.965;
	return (
		<g>
			<circle cx={r * 0.05} cy={r * 0.12} r={r * 1.03} fill="#000" opacity={0.35} />
			<SideBrush x={r * 0.62} y={-r * 0.66} len={r * 0.42} rot={-brush} />
			<SideBrush x={r * 0.62} y={r * 0.66} len={r * 0.42} rot={brush} />
			<circle r={r} fill="#ECE9E3" />
			<path d={`M${br * Math.cos(a0)},${br * Math.sin(a0)} A${br},${br} 0 0 1 ${br * Math.cos(a1)},${br * Math.sin(a1)}`} fill="none" stroke="#BDB8AF" strokeWidth={r * 0.07} strokeLinecap="round" />
			<circle r={r * 0.86} fill="none" stroke="#D8D4CC" strokeWidth={r * 0.015} />
			<circle cx={-r * 0.2} r={r * 0.3} fill="#2A2D34" />
			<circle cx={-r * 0.2} r={r * 0.2} fill="#17191E" stroke="#3B3F48" strokeWidth={r * 0.03} />
			<rect x={r * 0.24} y={-r * 0.07} width={r * 0.3} height={r * 0.14} rx={r * 0.07} fill="#C9C5BE" />
			<circle cx={r * 0.66} r={r * 0.045} fill={C.amber} />
			<circle r={r} fill="none" stroke="#15171C" strokeWidth={r * 0.025} />
		</g>
	);
};

/** Side view, facing +x; origin = front-bottom point on the ground. `w` = body length in px (34 cm × 9 cm body). */
export const RobotSide: React.FC<{w: number}> = ({w}) => {
	const h = (w * 9) / 34;
	return (
		<g transform={`translate(${-w} 0)`}>
			<ellipse cx={w * 0.5} cy={0} rx={w * 0.5} ry={h * 0.08} fill="#000" opacity={0.4} />
			<rect x={w * 0.3} y={-h * 1.2} width={w * 0.26} height={h * 0.34} rx={h * 0.1} fill="#2A2D34" />
			<rect x={0} y={-h * 0.98} width={w} height={h * 0.78} rx={h * 0.32} fill="#ECE9E3" stroke="#15171C" strokeWidth={Math.max(1, w * 0.006)} />
			<rect x={w * 0.93} y={-h * 0.86} width={w * 0.07} height={h * 0.54} rx={h * 0.06} fill="#BDB8AF" />
			<circle cx={w * 0.5} cy={-h * 0.18} r={h * 0.18} fill="#15171C" />
			<circle cx={w * 0.8} cy={-h * 0.62} r={h * 0.06} fill={C.amber} />
		</g>
	);
};

/** Step pyramid icon; origin = base centre. */
export const Pyramid: React.FC<{w: number}> = ({w}) => {
	const h = w * 0.62;
	return (
		<g>
			<polygon points={`${-w / 2},0 0,${-h} ${w * 0.08},0`} fill="#D8B878" />
			<polygon points={`0,${-h} ${w / 2},0 ${w * 0.08},0`} fill="#9E7F4A" />
			{[0.2, 0.4, 0.6, 0.8].map((k) => (
				<line key={k} x1={-w / 2 + (w / 2) * k} y1={-h * k} x2={(w / 2) * (1 - k)} y2={-h * k} stroke="#6E5733" strokeWidth={2} opacity={0.5} />
			))}
			<line x1={-w * 0.62} y1={0} x2={w * 0.62} y2={0} stroke="#6E5733" strokeWidth={3} />
		</g>
	);
};

import React from 'react';
import {C} from '../../engine/kit/theme';

const S: React.FC<{size?: number; children: React.ReactNode}> = ({size = 120, children}) => (
	<svg viewBox="0 0 100 100" width={size} height={size} style={{overflow: 'visible'}}>
		{children}
	</svg>
);
const stroke = {fill: 'none', stroke: C.ink, strokeWidth: 6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};

export const TrafficLight: React.FC<{size?: number; on?: number}> = ({size, on = 0}) => (
	<S size={size}>
		<rect x="32" y="8" width="36" height="84" rx="12" {...stroke} />
		{[24, 50, 76].map((cy, i) => (
			<circle key={i} cx="50" cy={cy} r="9" fill={[C.red, C.amber, C.green][i]} opacity={0.12 + 0.88 * on} />
		))}
	</S>
);

export const Elevator: React.FC<{size?: number}> = ({size}) => (
	<S size={size}>
		<rect x="18" y="10" width="64" height="80" rx="6" {...stroke} />
		<line x1="50" y1="10" x2="50" y2="90" {...stroke} />
		<path d="M30 36 L36 28 L42 36" {...stroke} strokeWidth={5} />
		<path d="M58 28 L64 36 L70 28" {...stroke} strokeWidth={5} />
	</S>
);

export const Train: React.FC<{size?: number}> = ({size}) => (
	<S size={size}>
		<rect x="22" y="10" width="56" height="64" rx="14" {...stroke} />
		<line x1="22" y1="44" x2="78" y2="44" {...stroke} />
		<circle cx="36" cy="58" r="4" fill={C.ink} />
		<circle cx="64" cy="58" r="4" fill={C.ink} />
		<path d="M32 74 L22 92 M68 74 L78 92" {...stroke} />
	</S>
);

export const Tower: React.FC<{size?: number; signal?: number}> = ({size, signal = 1}) => (
	<S size={size}>
		<path d="M50 30 L34 92 M50 30 L66 92 M40 70 L60 70 M37 82 L63 82" {...stroke} />
		<circle cx="50" cy="26" r="6" fill={C.ink} />
		{[16, 28].map((r, i) => (
			<g key={i} opacity={signal > i * 0.5 ? 1 : 0.15}>
				<path d={`M${50 - r} ${26 - r * 0.6} A ${r} ${r} 0 0 0 ${50 - r} ${26 + r * 0.6}`} {...stroke} strokeWidth={5} transform={`translate(${r * 0.3} 0)`} />
				<path d={`M${50 + r} ${26 - r * 0.6} A ${r} ${r} 0 0 1 ${50 + r} ${26 + r * 0.6}`} {...stroke} strokeWidth={5} transform={`translate(${-r * 0.3} 0)`} />
			</g>
		))}
	</S>
);

export const Battery: React.FC<{level: number; width?: number}> = ({level, width = 260}) => {
	const col = level > 0.5 ? C.green : level > 0.2 ? C.amber : C.red;
	return (
		<svg viewBox="0 0 120 50" width={width} height={(width * 50) / 120}>
			<rect x="3" y="3" width="104" height="44" rx="9" fill="none" stroke={C.ink} strokeWidth="5" />
			<rect x="109" y="16" width="8" height="18" rx="3" fill={C.ink} />
			<rect x="10" y="10" width={Math.max(0, 90 * level)} height="30" rx="5" fill={col} />
		</svg>
	);
};

export const Card: React.FC<{size?: number; crossed?: number}> = ({size, crossed = 0}) => (
	<S size={size}>
		<rect x="10" y="24" width="80" height="54" rx="8" {...stroke} />
		<line x1="10" y1="40" x2="90" y2="40" {...stroke} strokeWidth={9} />
		<line x1="22" y1="62" x2="44" y2="62" {...stroke} />
		<path d="M8 92 L92 10" stroke={C.red} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crossed} />
	</S>
);

export const Cash: React.FC<{size?: number}> = ({size}) => (
	<S size={size}>
		<rect x="8" y="26" width="84" height="48" rx="6" fill="none" stroke={C.green} strokeWidth={6} />
		<circle cx="50" cy="50" r="12" fill="none" stroke={C.green} strokeWidth={6} />
	</S>
);

export const Fridge: React.FC<{size?: number}> = ({size}) => (
	<S size={size}>
		<rect x="24" y="6" width="52" height="88" rx="8" {...stroke} />
		<line x1="24" y1="38" x2="76" y2="38" {...stroke} />
		<line x1="34" y1="18" x2="34" y2="28" {...stroke} />
		<line x1="34" y1="48" x2="34" y2="62" {...stroke} />
	</S>
);

export const Tap: React.FC<{size?: number; drop?: number}> = ({size, drop = 0}) => (
	<S size={size}>
		<path d="M14 30 L62 30 C 72 30, 78 36, 78 46 L78 52 M14 22 L14 38 M38 30 L38 18 M28 16 L48 16" {...stroke} />
		<path d={`M78 ${62 + drop * 20} C 72 ${72 + drop * 20}, 72 ${78 + drop * 20}, 78 ${80 + drop * 20} C 84 ${78 + drop * 20}, 84 ${72 + drop * 20}, 78 ${62 + drop * 20} Z`} fill="#5AB4FF" opacity={1 - drop} />
	</S>
);

export const Hospital: React.FC<{size?: number}> = ({size}) => (
	<S size={size}>
		<rect x="12" y="20" width="76" height="72" rx="6" {...stroke} />
		<rect x="42" y="34" width="16" height="40" rx="2" fill={C.red} />
		<rect x="30" y="46" width="40" height="16" rx="2" fill={C.red} />
	</S>
);

export const Generator: React.FC<{size?: number; color?: string}> = ({size, color = C.ink}) => (
	<S size={size}>
		<rect x="10" y="30" width="80" height="52" rx="8" fill="none" stroke={color} strokeWidth={6} />
		<path d="M54 40 L40 58 L52 58 L46 74 L62 54 L50 54 Z" fill={C.amber} />
		<path d="M22 30 L22 18 L40 18" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
	</S>
);

export const House: React.FC<{size?: number}> = ({size}) => (
	<S size={size}>
		<path d="M8 48 L50 12 L92 48 M18 40 L18 90 L82 90 L82 40" {...stroke} />
	</S>
);

export const Torch: React.FC<{size?: number}> = ({size}) => (
	<S size={size}>
		<path d="M30 40 L70 40 L62 60 L62 92 L38 92 L38 60 Z" {...stroke} />
		<path d="M40 30 L34 14 M50 28 L50 8 M60 30 L66 14" stroke={C.amber} strokeWidth={6} strokeLinecap="round" />
	</S>
);

export const PowerBank: React.FC<{size?: number}> = ({size}) => (
	<S size={size}>
		<rect x="28" y="10" width="44" height="80" rx="10" {...stroke} />
		<path d="M54 26 L40 52 L52 52 L46 74 L62 46 L50 46 Z" fill={C.green} />
	</S>
);

export const Water: React.FC<{size?: number}> = ({size}) => (
	<S size={size}>
		<path d="M38 8 L62 8 L62 20 C 74 26, 76 34, 76 44 L76 88 C 76 92, 72 94, 68 94 L32 94 C 28 94, 24 92, 24 88 L24 44 C 24 34, 26 26, 38 20 Z" {...stroke} />
		<path d="M28 58 L72 58" stroke="#5AB4FF" strokeWidth={6} />
	</S>
);

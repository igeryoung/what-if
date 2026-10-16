import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {s} from '../../engine/kit/theme';
import {A} from './art';
import {Count, Density, End, Hook, PerPerson, Pivot, Scale, Where} from './scenes';
import {T, TOTAL} from './timeline';

export {TOTAL};

const SCENES: [keyof typeof T, React.FC][] = [
	['hook', Hook],
	['count', Count],
	['person', PerPerson],
	['density', Density],
	['pivot', Pivot],
	['scale', Scale],
	['where', Where],
	['end', End],
];

export const Video: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: A.bg}}>
			{/* paper texture: soft vignette + faint grain dots (static) */}
			<AbsoluteFill style={{background: 'radial-gradient(120% 80% at 50% 45%, #F4ECDF 0%, #EFE6D6 55%, #E2D5BF 100%)'}} />
			{SCENES.map(([k, Comp]) => (
				<Sequence key={k} from={s(T[k][0])} durationInFrames={s(T[k][1]) - s(T[k][0])} name={k}>
					<Comp />
				</Sequence>
			))}
			<AbsoluteFill style={{background: A.bg, opacity: interpolate(f, [0, 8], [1, 0], {extrapolateRight: 'clamp'})}} />
		</AbsoluteFill>
	);
};

import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {s} from '../../engine/kit/theme';
import {P} from './art';
import {End, Hook, Life, Limit, Naive, Record, Speed, Sum, Twist} from './scenes';
import {T, TOTAL} from './timeline';

export {TOTAL};

const SCENES: [keyof typeof T, React.FC][] = [
	['hook', Hook],
	['speed', Speed],
	['naive', Naive],
	['twist', Twist],
	['limit', Limit],
	['record', Record],
	['sum', Sum],
	['life', Life],
	['end', End],
];

export const Video: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: P.bg}}>
			<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #221A2C 0%, #141019 60%, #0C0910 100%)'}} />
			{SCENES.map(([k, Comp]) => (
				<Sequence key={k} from={s(T[k][0])} durationInFrames={s(T[k][1]) - s(T[k][0])} name={k}>
					<Comp />
				</Sequence>
			))}
			<AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 8], [1, 0], {extrapolateRight: 'clamp'})}} />
		</AbsoluteFill>
	);
};

import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {C, s} from '../../engine/kit/theme';
import {End, Guess, Hook, Twist} from './scenes';
import {T, TOTAL_SEC} from './timeline';
import {Hud, World} from './world';

export const TOTAL = s(TOTAL_SEC);

const Climb: React.FC = () => {
	const f = useCurrentFrame();
	const D = s(T.climb[1]) - s(T.climb[0]);
	const o = interpolate(f, [0, 8, D - 6, D], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{opacity: o}}>
			<World />
			<Hud />
		</AbsoluteFill>
	);
};

const SCENES: [keyof typeof T, React.FC][] = [
	['hook', Hook],
	['guess', Guess],
	['climb', Climb],
	['twist', Twist],
	['end', End],
];

export const Video: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #171A20 0%, #0C0D10 60%, #08090B 100%)'}} />
			{SCENES.map(([k, Comp]) => (
				<Sequence key={k} from={s(T[k][0])} durationInFrames={s(T[k][1]) - s(T[k][0])} name={k}>
					<Comp />
				</Sequence>
			))}
			<AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 8], [1, 0], {extrapolateRight: 'clamp'})}} />
		</AbsoluteFill>
	);
};

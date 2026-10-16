import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {s} from '../../engine/kit/theme';
import {P, Stars} from './art';
import {DolphinScene, Drunk, End, Gain, Hook, Life, Pivot, Record, Wash} from './scenes';
import {T, TOTAL} from './timeline';

export {TOTAL};

const SCENES: [keyof typeof T, React.FC][] = [
	['hook', Hook],
	['life', Life],
	['gain', Gain],
	['pivot', Pivot],
	['record', Record],
	['drunk', Drunk],
	['wash', Wash],
	['dolphin', DolphinScene],
	['end', End],
];

export const Video: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: P.bg}}>
			<AbsoluteFill style={{background: 'radial-gradient(120% 75% at 50% 40%, #18204A 0%, #0D1228 55%, #070A16 100%)'}} />
			<Stars f={f} opacity={0.8} />
			{SCENES.map(([k, Comp]) => (
				<Sequence key={k} from={s(T[k][0])} durationInFrames={s(T[k][1]) - s(T[k][0])} name={k}>
					<Comp />
				</Sequence>
			))}
			<AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 6], [1, 0], {extrapolateRight: 'clamp'})}} />
		</AbsoluteFill>
	);
};

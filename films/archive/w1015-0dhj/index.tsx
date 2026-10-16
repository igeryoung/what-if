import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import type {Lang} from '../../engine/kit/lang';
import {C, s} from '../../engine/kit/theme';
import {Carbon, Count, End, Half, Hook, Life, Oxygen, Rain} from './scenes';
import {T, TOTAL} from './timeline';

export {TOTAL};
export const LANGS: Lang[] = ['zh', 'en'];

const SCENES: [keyof typeof T, React.FC][] = [
	['hook', Hook],
	['count', Count],
	['oxygen', Oxygen],
	['carbon', Carbon],
	['rain', Rain],
	['life', Life],
	['half', Half],
	['end', End],
];

export const Video: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #141A17 0%, #0C0D10 60%, #08090B 100%)'}} />
			{SCENES.map(([k, Comp]) => (
				<Sequence key={k} from={s(T[k][0])} durationInFrames={s(T[k][1]) - s(T[k][0])} name={k}>
					<Comp />
				</Sequence>
			))}
			<AbsoluteFill style={{background: '#000', opacity: interpolate(f, [0, 8], [1, 0], {extrapolateRight: 'clamp'})}} />
		</AbsoluteFill>
	);
};

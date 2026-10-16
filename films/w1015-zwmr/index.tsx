import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {Lang} from '../../engine/kit/lang';
import {C, s} from '../../engine/kit/theme';
import {Answer, Curve, Dna, End, Flip, Hook, Parent, Seven, Size} from './scenes';
import {T, TOTAL} from './timeline';

export {TOTAL};
export const LANGS: Lang[] = ['zh', 'en'];

const SCENES: [keyof typeof T, React.FC][] = [
	['hook', Hook],
	['seven', Seven],
	['parent', Parent],
	['dna', Dna],
	['answer', Answer],
	['curve', Curve],
	['flip', Flip],
	['size', Size],
	['end', End],
];

// No fade from black: frame 0 already shows the birthday Lab, and the ending settles back into it.
export const Video: React.FC = () => (
	<AbsoluteFill style={{background: C.bg}}>
		<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 45%, #1D1813 0%, #0E0D0E 60%, #09090A 100%)'}} />
		{SCENES.map(([k, Comp]) => (
			<Sequence key={k} from={s(T[k][0])} durationInFrames={s(T[k][1]) - s(T[k][0])} name={k}>
				<Comp />
			</Sequence>
		))}
	</AbsoluteFill>
);

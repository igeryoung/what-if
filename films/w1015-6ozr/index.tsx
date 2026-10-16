import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {Lang} from '../../engine/kit/lang';
import {C, s} from '../../engine/kit/theme';
import {End, Forty, Front, Hook, Scale, Secret, ShoeScene, Species, Strength} from './scenes';
import {T, TOTAL} from './timeline';

export {TOTAL};
export const LANGS: Lang[] = ['zh', 'en'];

const SCENES: [keyof typeof T, React.FC][] = [
	['hook', Hook],
	['secret', Secret],
	['strength', Strength],
	['scale', Scale],
	['species', Species],
	['forty', Forty],
	['shoe', ShoeScene],
	['front', Front],
	['end', End],
];

// No fade from black: frame 0 already shows the opening wall, and the ending settles back into it.
export const Video: React.FC = () => (
	<AbsoluteFill style={{background: C.bg}}>
		<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 40%, #171A20 0%, #0C0D10 60%, #08090B 100%)'}} />
		{SCENES.map(([k, Comp]) => (
			<Sequence key={k} from={s(T[k][0])} durationInFrames={s(T[k][1]) - s(T[k][0])} name={k}>
				<Comp />
			</Sequence>
		))}
	</AbsoluteFill>
);

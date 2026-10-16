import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {Lang} from '../../engine/kit/lang';
import {C, s} from '../../engine/kit/theme';
import {BG} from './art';
import {Burst, End, Hail, Hook, PitchScene, Size, Speed, Twist, Weight} from './scenes';
import {T, TOTAL} from './timeline';

export {TOTAL};
export const LANGS: Lang[] = ['zh', 'en'];

const SCENES: [keyof typeof T, React.FC][] = [
	['hook', Hook],
	['size', Size],
	['weight', Weight],
	['speed', Speed],
	['pitch', PitchScene],
	['twist', Twist],
	['burst', Burst],
	['hail', Hail],
	['end', End],
];

// No fade from black: frame 0 already shows the opening image, and the ending settles back into it.
export const Video: React.FC = () => (
	<AbsoluteFill style={{background: C.bg}}>
		<AbsoluteFill style={{background: BG}} />
		{SCENES.map(([k, Comp]) => (
			<Sequence key={k} from={s(T[k][0])} durationInFrames={s(T[k][1]) - s(T[k][0])} name={k}>
				<Comp />
			</Sequence>
		))}
	</AbsoluteFill>
);
